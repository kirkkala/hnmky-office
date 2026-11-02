import type { Buffer } from "buffer"

import * as XLSX from "xlsx"

import { formatDateValue } from "./date"
import {
  API_YEAR_INVALID,
  EXCEL_COLUMNS_ERROR,
  EXCEL_DATE_FORMAT_ERROR,
  EXCEL_VALIDATION_ERROR,
} from "./error"

export interface ExcelSheet {
  sheetName: string
  rows: Record<string, unknown>[]
}

// Office file. JOJO and HUOM stay empty; they are filled in after download.
export const OUTPUT_COLUMNS = [
  "Sarja",
  "Pvm",
  "Kello",
  "eLSA Pvm",
  "eLSA Kello",
  "Kenttä",
  "Koti",
  "Vieras",
  "JOJO",
  "HUOM",
] as const

type OutputColumn = (typeof OUTPUT_COLUMNS)[number]
type DataColumn = Exclude<OutputColumn, "JOJO" | "HUOM" | "eLSA Pvm" | "eLSA Kello">

// Common eLSA header names. Tightened once the real export is available.
const SOURCE_ALIASES: Record<DataColumn, readonly string[]> = {
  Sarja: ["sarja"],
  Pvm: ["pvm", "päivä", "paiva", "päivämäärä", "paivamaara"],
  Kello: ["kello", "klo", "aika"],
  Kenttä: ["kenttä", "kentta", "halli", "pelipaikka"],
  Koti: ["koti", "kotijoukkue", "koti joukkue"],
  Vieras: ["vieras", "vierasjoukkue", "vieras joukkue"],
}

const DATA_COLUMNS: readonly DataColumn[] = ["Sarja", "Pvm", "Kello", "Kenttä", "Koti", "Vieras"]

const CLOCK = /^(\d{1,2})[:.](\d{2})(?::(\d{2}))?$/

export function parseYear(value: string | undefined): number {
  const year = Number.parseInt(value ?? "", 10)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(API_YEAR_INVALID)
  }
  return year
}

function normalizeHeader(header: string): string {
  return header
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[:.]+$/g, "")
}

function headerIndex(row: Record<string, unknown>): Map<string, string> {
  const index = new Map<string, string>()
  for (const header of Object.keys(row)) {
    const key = normalizeHeader(header)
    if (key && !index.has(key)) index.set(key, header)
  }
  return index
}

function findHeader(index: Map<string, string>, aliases: readonly string[]): string | undefined {
  for (const alias of aliases) {
    const header = index.get(alias)
    if (header !== undefined) return header
  }
  return undefined
}

function sourceColumns(headers: Map<string, string>): Record<DataColumn, string | undefined> {
  return {
    Sarja: findHeader(headers, SOURCE_ALIASES.Sarja),
    Pvm: findHeader(headers, SOURCE_ALIASES.Pvm),
    Kello: findHeader(headers, SOURCE_ALIASES.Kello),
    Kenttä: findHeader(headers, SOURCE_ALIASES.Kenttä),
    Koti: findHeader(headers, SOURCE_ALIASES.Koti),
    Vieras: findHeader(headers, SOURCE_ALIASES.Vieras),
  }
}

function isEmpty(value: unknown): boolean {
  return value == null || (typeof value === "string" && value.trim() === "")
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function readPvm(value: unknown, year: number, column: string): string {
  try {
    const formatted = formatDateValue(value, year, { allowShort: true })
    if (!formatted) throw new Error(EXCEL_DATE_FORMAT_ERROR(String(value)))
    return formatted
  } catch (error) {
    const message = error instanceof Error ? error.message : EXCEL_DATE_FORMAT_ERROR(String(value))
    throw new Error(`Sarake "${column}": ${message}`)
  }
}

function readKello(value: unknown): string {
  if (isEmpty(value)) return ""

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ""
    const clock = `${pad(value.getHours())}:${pad(value.getMinutes())}`
    return value.getSeconds() === 0 ? clock : `${clock}:${pad(value.getSeconds())}`
  }

  const text = String(value).trim()
  const match = text.match(CLOCK)
  if (!match) return text

  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = match[3] === undefined ? 0 : Number(match[3])
  if (hours > 23 || minutes > 59 || seconds > 59) return text

  const clock = `${pad(hours)}:${pad(minutes)}`
  return seconds === 0 ? clock : `${clock}:${pad(seconds)}`
}

function readText(value: unknown): string {
  if (isEmpty(value)) return ""
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return ""
    const formatted = formatDateValue(value, value.getFullYear(), { allowShort: false })
    return formatted?.split(" ")[0] ?? ""
  }
  return String(value).trim()
}

function originalCell(row: Record<string, unknown>, header: string | undefined): unknown {
  if (header === undefined) return ""
  const value = row[header]
  return value == null ? "" : value
}

function projectRow(
  row: Record<string, unknown>,
  rawRow: Record<string, unknown>,
  sourceOf: Record<DataColumn, string | undefined>,
  year: number
): Record<OutputColumn, unknown> {
  const pvmSource = sourceOf.Pvm
  const kelloSource = sourceOf.Kello
  let pvm =
    pvmSource === undefined || isEmpty(row[pvmSource])
      ? ""
      : readPvm(row[pvmSource], year, pvmSource)
  let kello = kelloSource === undefined ? "" : readKello(row[kelloSource])

  const splitAt = pvm.indexOf(" ")
  if (splitAt !== -1) {
    if (kello === "") kello = pvm.slice(splitAt + 1)
    pvm = pvm.slice(0, splitAt)
  }

  return {
    Sarja: readText(sourceOf.Sarja === undefined ? "" : row[sourceOf.Sarja]),
    Pvm: pvm,
    Kello: kello,
    "eLSA Pvm": originalCell(rawRow, pvmSource),
    "eLSA Kello": originalCell(rawRow, kelloSource),
    Kenttä: readText(sourceOf.Kenttä === undefined ? "" : row[sourceOf.Kenttä]),
    Koti: readText(sourceOf.Koti === undefined ? "" : row[sourceOf.Koti]),
    Vieras: readText(sourceOf.Vieras === undefined ? "" : row[sourceOf.Vieras]),
    JOJO: "",
    HUOM: "",
  }
}

function readSheet(
  buffer: Buffer,
  cellDates: boolean
): { sheetName: string; rows: Record<string, unknown>[] } {
  const workbook = XLSX.read(buffer, { cellDates, type: "buffer" })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error(EXCEL_VALIDATION_ERROR)

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
    raw: true,
  })

  return { sheetName, rows }
}

/**
 * Reads the first worksheet and projects each game onto the office columns.
 * eLSA Pvm and eLSA Kello keep the source cells unchanged.
 * JOJO and HUOM are always empty.
 */
export function transformBuffer(buffer: Buffer, year: number): ExcelSheet {
  const dated = readSheet(buffer, true)
  const raw = readSheet(buffer, false)

  if (dated.rows.length === 0 || dated.rows.length !== raw.rows.length) {
    throw new Error(EXCEL_VALIDATION_ERROR)
  }

  const sourceOf = sourceColumns(headerIndex(dated.rows[0]))
  if (DATA_COLUMNS.every((column) => sourceOf[column] === undefined)) {
    throw new Error(EXCEL_COLUMNS_ERROR(Object.keys(dated.rows[0]).join(", ")))
  }

  const transformed = dated.rows.map((row, index) => {
    try {
      return projectRow(row, raw.rows[index], sourceOf, year)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Rivi ${String(index + 2)}: ${message}`)
    }
  })

  return { sheetName: dated.sheetName, rows: transformed }
}

export function workbookFromSheet(sheet: ExcelSheet): Buffer {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(sheet.rows, {
    header: [...OUTPUT_COLUMNS],
  })
  XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName.slice(0, 31))
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}
