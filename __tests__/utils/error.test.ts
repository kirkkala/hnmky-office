import {
  API_CONVERSION_FAILED,
  API_FILE_MISSING,
  API_YEAR_INVALID,
  EXCEL_DATE_FORMAT_ERROR,
  EXCEL_VALIDATION_ERROR,
  formatErrorMessage,
  logError,
} from "@/utils/error"

const originalConsoleError = console.error
const mockConsoleError = vi.fn()

describe("Error utilities", () => {
  beforeAll(() => {
    console.error = mockConsoleError
  })

  afterAll(() => {
    console.error = originalConsoleError
  })

  beforeEach(() => mockConsoleError.mockClear())

  it("exports correct constants", () => {
    expect(EXCEL_VALIDATION_ERROR).toContain("Excelistä ei löytynyt rivejä")
    expect(API_CONVERSION_FAILED).toBe("Tiedoston muunnos epäonnistui")
    expect(API_FILE_MISSING).toBe("Tiedosto puuttuu")
    expect(API_YEAR_INVALID).toBe("Vuosi puuttuu tai on virheellinen")
    expect(EXCEL_DATE_FORMAT_ERROR("test")).toBe("Odottamaton päivämäärämuoto: test")
  })

  it("formats error messages", () => {
    expect(formatErrorMessage(new Error("Test"))).toBe("Tiedoston prosessointi epäonnistui. Test")
    expect(formatErrorMessage("String")).toBe("Tiedoston prosessointi epäonnistui. String")
  })

  it("logs errors", () => {
    const error = new Error("Test")
    logError(error)
    expect(mockConsoleError).toHaveBeenCalledWith("Detailed error:", error)
  })
})
