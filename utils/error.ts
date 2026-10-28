export const EXCEL_VALIDATION_ERROR =
  "Excelistä ei löytynyt rivejä. Tarkista, että ensimmäisellä välilehdellä on otsikkorivi ja tietoja."

export const EXCEL_DATE_FORMAT_ERROR = (date: string | number) =>
  `Odottamaton päivämäärämuoto: ${String(date)}`

export const API_CONVERSION_FAILED = "Tiedoston muunnos epäonnistui"
export const API_FILE_MISSING = "Tiedosto puuttuu"
export const API_YEAR_INVALID = "Vuosi puuttuu tai on virheellinen"

export const formatErrorMessage = (error: unknown): string => {
  return `Tiedoston prosessointi epäonnistui. ${error instanceof Error ? error.message : String(error)}`
}

export const logError = (error: unknown): void => {
  console.error("Detailed error:", error)
}
