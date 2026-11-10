import type { Buffer } from "buffer"

import * as XLSX from "xlsx"

import { EXCEL_COLUMNS_ERROR, EXCEL_VALIDATION_ERROR } from "./error"

export interface ExcelSheet {
  sheetName: string
  rows: Record<string, unknown>[]
}

// Office file. JOJO and HUOM stay empty; they are filled in after download.
export const OUTPUT_COLUMNS = [
  "Sarja",
  "Pvm",
  "Kello",
  "Kenttä",
  "Koti",
  "Vieras",
  "JOJO",
  "HUOM",
] as const

type OutputColumn = (typeof OUTPUT_COLUMNS)[number]

// eLSA CSV headers. Team names and the date range are copied as stored.
const SOURCE_HEADERS: Record<Exclude<OutputColumn, "JOJO" | "HUOM">, string> = {
  Sarja: "sarjanimi",
  Pvm: "pvm",
  Kello: "klo",
  Kenttä: "kenttanimi",
  Koti: "kotisiisti",
  Vieras: "vierassiisti",
}

function cell(value: unknown): string {
  if (value == null) return ""
  return String(value)
}

function readSheet(buffer: Buffer): { sheetName: string; rows: Record<string, unknown>[] } {
  const workbook = XLSX.read(buffer, { type: "buffer", FS: ";" })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) throw new Error(EXCEL_VALIDATION_ERROR)

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
    raw: true,
  })

  return { sheetName, rows }
}

function headerMap(row: Record<string, unknown>): Map<string, string> {
  const index = new Map<string, string>()
  for (const header of Object.keys(row)) {
    const key = header.trim().toLowerCase()
    if (key && !index.has(key)) index.set(key, header)
  }
  return index
}

/**
 * Reads an eLSA CSV and copies each game onto the office columns.
 * The date range and the team names are kept as they are.
 * JOJO and HUOM are always empty.
 */
export function transformBuffer(buffer: Buffer): ExcelSheet {
  const sheet = readSheet(buffer)
  if (sheet.rows.length === 0) throw new Error(EXCEL_VALIDATION_ERROR)

  const headers = headerMap(sheet.rows[0])
  const sourceOf = {} as Record<keyof typeof SOURCE_HEADERS, string>
  for (const [column, name] of Object.entries(SOURCE_HEADERS) as [
    keyof typeof SOURCE_HEADERS,
    string,
  ][]) {
    const header = headers.get(name)
    if (!header) throw new Error(EXCEL_COLUMNS_ERROR(Object.keys(sheet.rows[0]).join(", ")))
    sourceOf[column] = header
  }

  const rows = sheet.rows.map((row) => {
    const projected = {
      Sarja: cell(row[sourceOf.Sarja]),
      Pvm: cell(row[sourceOf.Pvm]),
      Kello: cell(row[sourceOf.Kello]),
      Kenttä: cell(row[sourceOf.Kenttä]),
      Koti: cell(row[sourceOf.Koti]),
      Vieras: cell(row[sourceOf.Vieras]),
      JOJO: "",
      HUOM: "",
    } satisfies Record<OutputColumn, string>
    return projected
  })

  return { sheetName: sheet.sheetName, rows }
}

export function workbookFromSheet(sheet: ExcelSheet): Buffer {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(sheet.rows, { header: [...OUTPUT_COLUMNS] })
  XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName.slice(0, 31))
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}
