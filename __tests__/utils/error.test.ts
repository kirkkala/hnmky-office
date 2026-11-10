import {
  API_CONVERSION_FAILED,
  API_FILE_MISSING,
  EXCEL_VALIDATION_ERROR,
  formatErrorMessage,
} from "@/utils/error"

describe("Error utilities", () => {
  it("exports correct constants", () => {
    expect(EXCEL_VALIDATION_ERROR).toContain("Tiedostosta ei löytynyt rivejä")
    expect(API_CONVERSION_FAILED).toBe("Tiedoston muunnos epäonnistui")
    expect(API_FILE_MISSING).toBe("Tiedosto puuttuu")
  })

  it("formats error messages", () => {
    expect(formatErrorMessage(new Error("Test"))).toBe("Tiedoston prosessointi epäonnistui. Test")
    expect(formatErrorMessage("String")).toBe("Tiedoston prosessointi epäonnistui. String")
  })
})
