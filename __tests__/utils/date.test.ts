import { formatDateValue } from "@/utils/date"

const full = (value: unknown, year = 2026) => formatDateValue(value, year, { allowShort: false })
const short = (value: unknown, year = 2026) => formatDateValue(value, year, { allowShort: true })

describe("formatDateValue", () => {
  test.each([
    ["14.12.2026", "14.12.2026"],
    ["4.3.2026", "04.03.2026"],
    ["14/12/2026", "14.12.2026"],
    ["14.12.26", "14.12.2026"],
    ["14.12.2026 18:30", "14.12.2026 18:30"],
    ["14.12.2026 18:30:05", "14.12.2026 18:30:05"],
    ["2026-10-28", "28.10.2026"],
    ["2026-10-28T18:30:00", "28.10.2026 18:30"],
    ["2026-10-28 09:05", "28.10.2026 09:05"],
  ])("full date %s → %s", (input, expected) => {
    expect(full(input)).toBe(expected)
  })

  it("keeps a year that is already present", () => {
    expect(full("14.12.2025", 2026)).toBe("14.12.2025")
  })

  test.each([
    ["14.12", "14.12.2026"],
    ["14,12", "14.12.2026"],
    ["14.12.", "14.12.2026"],
    ["4,3", "04.03.2026"],
    [14.12, "14.12.2026"],
    [4.03, "04.03.2026"],
  ])("short date %s → %s", (input, expected) => {
    expect(short(input)).toBe(expected)
  })

  it("leaves year-less text alone outside a date column", () => {
    expect(full("14.12")).toBeNull()
    expect(full(14.12)).toBeNull()
    expect(full("18:30")).toBeNull()
  })

  it("formats Date objects and omits midnight", () => {
    expect(full(new Date(2026, 9, 28))).toBe("28.10.2026")
    expect(full(new Date(2026, 9, 28, 18, 30))).toBe("28.10.2026 18:30")
  })

  it("rejects an impossible date", () => {
    expect(() => full("32.01.2026")).toThrow("Odottamaton päivämäärämuoto")
    expect(() => short("14.13")).toThrow("Odottamaton päivämäärämuoto")
  })

  it("rejects other text in a date column", () => {
    expect(() => short("ei päivää")).toThrow("Odottamaton päivämäärämuoto: ei päivää")
  })

  it("leaves empty values unchanged", () => {
    expect(short("")).toBeNull()
    expect(short("  ")).toBeNull()
    expect(full(null)).toBeNull()
  })
})
