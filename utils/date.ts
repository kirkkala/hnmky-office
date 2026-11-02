import { EXCEL_DATE_FORMAT_ERROR } from "./error"

interface DateParts {
  day: number
  month: number
  year: number
  hours?: number
  minutes?: number
  seconds?: number
}

// eLSA dates are a day and month, "20,09" or "03.10", or a full "14.12.2026".
const SHORT_DATE = /^(\d{1,2})[.,](\d{1,2})\.?$/
const FINNISH_DATE = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/

function pad(value: number): string {
  return String(value).padStart(2, "0")
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
    { day: Number(match[1]), month: Number(match[2]), year: Number(match[3]) },
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

/** A day and month with no year, such as `20,09`, `03.10`, or the number `24.1`. */
export function isYearlessDate(value: unknown): boolean {
  if (value == null || value === "" || value instanceof Date) return false
  if (typeof value === "number") return Number.isFinite(value)
  if (typeof value !== "string") return false

  const text = value.trim()
  if (!text || FINNISH_DATE.test(text)) return false
  return SHORT_DATE.test(text)
}

/**
 * Returns a date as `dd.mm.yyyy`, or `dd.mm.yyyy HH:mm` when a time is present.
 * Returns null when the value is not a date and should be left unchanged.
 */
export function formatDateValue(value: unknown, year: number): string | null {
  if (value instanceof Date) return formatDateObject(value)
  if (value == null) return null

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null
    return parseNumber(value, year)
  }

  if (typeof value !== "string") return null

  const text = value.trim()
  if (!text) return null

  const formatted = parseFinnish(text) ?? parseShort(text, year)
  if (formatted) return formatted

  throw new Error(EXCEL_DATE_FORMAT_ERROR(text))
}
