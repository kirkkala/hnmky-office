export const EXCEL_VALIDATION_ERROR =
  "Tiedostosta ei löytynyt rivejä. Tarkista, että siinä on otsikkorivi ja tietoja."

export const EXCEL_COLUMNS_ERROR = (columns: string) =>
  `Tiedoston sarakkeita ei tunnistettu (${columns}). Odotetaan sarakkeita sarjanimi, pvm, klo, kenttanimi, kotisiisti ja vierassiisti.`

export const API_CONVERSION_FAILED = "Tiedoston muunnos epäonnistui"
export const API_FILE_MISSING = "Tiedosto puuttuu"

export const formatErrorMessage = (error: unknown): string => {
  return `Tiedoston prosessointi epäonnistui. ${error instanceof Error ? error.message : String(error)}`
}
