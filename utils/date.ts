import { EXCEL_DATE_FORMAT_ERROR } from "./error"

interface DateParts {
  day: number
  month: number
  year: number
  hours?: number
  minutes?: number
  seconds?: number
}

// eLSA often exports a day and month without a year: "14.12", "14,12", "4.3".
const SHORT_DATE = /^(\d{1,2})[.,](\d{1,2})\.?$/
// A full Finnish date, optionally with a time: "14.12.2026" or "14.12.2026 18:30".
const FINNISH_DATE =
  /^(\d{1,2})[./](\d{1,2})[./](\d{2}|\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/

export interface FormatDateOptions {
  // Year-less values such as "14.12" are only dates when the caller says so.
  // Other columns may contain scores and decimals that look similar.
  allowShort: boolean
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function expandYear(year: number): number {
  return year < 100 ? 2000 + year : year
}

function isRealDate(day: number, month: number, year: number): boolean {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

function formatParts(parts: DateParts, original: string | number): string {
  const { day, month, year, hours = 0, minutes = 0, seconds = 0 } = parts

  if (
    !isRealDate(day, month, year) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    throw new Error(EXCEL_DATE_FORMAT_ERROR(original))
  }

  const date = `${pad(day)}.${pad(month)}.${year}`
  if (hours === 0 && minutes === 0 && seconds === 0) return date

  const time = `${pad(hours)}:${pad(minutes)}`
  return seconds === 0 ? `${date} ${time}` : `${date} ${time}:${pad(seconds)}`
}

function parseFinnish(text: string): string | null {
  const match = text.match(FINNISH_DATE)
  if (!match) return null

  return formatParts(
    {
      day: Number(match[1]),
      month: Number(match[2]),
      year: expandYear(Number(match[3])),
      hours: match[4] === undefined ? 0 : Number(match[4]),
      minutes: match[5] === undefined ? 0 : Number(match[5]),
      seconds: match[6] === undefined ? 0 : Number(match[6]),
    },
    text
  )
}

function parseIso(text: string): string | null {
  const match = text.match(ISO_DATE)
  if (!match) return null

  return formatParts(
    {
      day: Number(match[3]),
      month: Number(match[2]),
      year: Number(match[1]),
      hours: match[4] === undefined ? 0 : Number(match[4]),
      minutes: match[5] === undefined ? 0 : Number(match[5]),
      seconds: match[6] === undefined ? 0 : Number(match[6]),
    },
    text
  )
}

function parseShort(text: string, year: number): string | null {
  const match = text.match(SHORT_DATE)
  if (!match) return null

  return formatParts({ day: Number(match[1]), month: Number(match[2]), year }, text)
}

function parseNumber(value: number, year: number): string {
  const [day, month] = value.toFixed(2).split(".")
  return formatParts({ day: Number(day), month: Number(month), year }, value)
}

function formatDateObject(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new Error(EXCEL_DATE_FORMAT_ERROR(String(value)))
  }

  return formatParts(
    {
      day: value.getDate(),
      month: value.getMonth() + 1,
      year: value.getFullYear(),
      hours: value.getHours(),
      minutes: value.getMinutes(),
      seconds: value.getSeconds(),
    },
    value.toISOString()
  )
}

/**
 * Returns a date as `dd.mm.yyyy`, or `dd.mm.yyyy HH:mm` when a time is present.
 * Returns null when the value is not a date and should be left unchanged.
 */
export function formatDateValue(
  value: unknown,
  year: number,
  options: FormatDateOptions
): string | null {
  if (value instanceof Date) return formatDateObject(value)
  if (value == null) return null

  if (typeof value === "number") {
    if (!options.allowShort || !Number.isFinite(value)) return null
    return parseNumber(value, year)
  }

  if (typeof value !== "string") return null

  const text = value.trim()
  if (!text) return null

  const formatted = parseFinnish(text) ?? parseIso(text)
  if (formatted) return formatted
  if (!options.allowShort) return null

  const short = parseShort(text, year)
  if (short) return short

  throw new Error(EXCEL_DATE_FORMAT_ERROR(text))
}
