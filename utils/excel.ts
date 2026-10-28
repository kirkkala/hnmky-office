import type { Buffer } from "buffer"

import * as XLSX from "xlsx"

import { formatDateValue } from "./date"
import { API_YEAR_INVALID, EXCEL_DATE_FORMAT_ERROR, EXCEL_VALIDATION_ERROR } from "./error"

export interface ExcelSheet {
  sheetName: string
  rows: Record<string, unknown>[]
}

// Year-less values (14.12) are dates only in columns whose header looks like a date.
// Real Excel dates and full date strings are formatted in every column.
const DATE_COLUMN = /pvm|päiv|paiv|date/i

const DROPPED_COLUMNS = new Set(["#", "livestats", "tulos"])

function isDroppedColumn(column: string): boolean {
  return DROPPED_COLUMNS.has(column.trim().toLowerCase())
}

export function parseYear(value: string | undefined): number {
  const year = Number.parseInt(value ?? "", 10)
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(API_YEAR_INVALID)
  }
  return year
}

function formatCell(value: unknown, year: number, column: string): unknown {
  if (value == null || value === "") return value

  try {
    const formatted = formatDateValue(value, year, { allowShort: DATE_COLUMN.test(column) })
    return formatted ?? value
  } catch (error) {
    const message = error instanceof Error ? error.message : EXCEL_DATE_FORMAT_ERROR(String(value))
    throw new Error(`Sarake "${column}": ${message}`)
  }
}

/**
 * Reads the first worksheet, drops columns the target file does not use,
 * and rewrites date cells. Other cells stay as they are.
 */
export function transformBuffer(buffer: Buffer, year: number): ExcelSheet {
  const workbook = XLSX.read(buffer, { cellDates: true, type: "buffer" })
  const sheetName = workbook.SheetNames[0]

  if (!sheetName) throw new Error(EXCEL_VALIDATION_ERROR)

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: "",
    raw: true,
  })

  if (rows.length === 0) throw new Error(EXCEL_VALIDATION_ERROR)

  const transformed = rows.map((row, index) => {
    try {
      return Object.fromEntries(
        Object.entries(row).flatMap(([column, value]) =>
          isDroppedColumn(column) ? [] : [[column, formatCell(value, year, column)]]
        )
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Rivi ${String(index + 2)}: ${message}`)
    }
  })

  return { sheetName, rows: transformed }
}

export function workbookFromSheet(sheet: ExcelSheet): Buffer {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet(sheet.rows)
  XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName.slice(0, 31))
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}
