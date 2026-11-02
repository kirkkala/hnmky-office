import { formatDateValue } from "@/utils/date"

describe("formatDateValue", () => {
  test.each([
    ["14.12.2026", "14.12.2026"],
    ["4.3.2026", "04.03.2026"],
  ])("full date %s → %s", (input, expected) => {
    expect(formatDateValue(input, 2026)).toBe(expected)
  })

  it("keeps a year that is already present", () => {
    expect(formatDateValue("14.12.2025", 2026)).toBe("14.12.2025")
  })

  test.each([
    ["14.12", "14.12.2026"],
    ["14,12", "14.12.2026"],
    ["14.12.", "14.12.2026"],
    ["4,3", "04.03.2026"],
    [14.12, "14.12.2026"],
    [4.03, "04.03.2026"],
  ])("short date %s → %s", (input, expected) => {
    expect(formatDateValue(input, 2026)).toBe(expected)
  })

  it("formats Date objects and omits midnight", () => {
    expect(formatDateValue(new Date(2026, 9, 28), 2026)).toBe("28.10.2026")
    expect(formatDateValue(new Date(2026, 9, 28, 18, 30), 2026)).toBe("28.10.2026 18:30")
  })

  it("rejects an impossible date", () => {
    expect(() => formatDateValue("32.01.2026", 2026)).toThrow("Odottamaton päivämäärämuoto")
    expect(() => formatDateValue("14.13", 2026)).toThrow("Odottamaton päivämäärämuoto")
  })

  it("rejects other text in a date column", () => {
    expect(() => formatDateValue("ei päivää", 2026)).toThrow(
      "Odottamaton päivämäärämuoto: ei päivää"
    )
  })

  it("leaves empty values unchanged", () => {
    expect(formatDateValue("", 2026)).toBeNull()
    expect(formatDateValue("  ", 2026)).toBeNull()
    expect(formatDateValue(null, 2026)).toBeNull()
  })
})
