import * as XLSX from "xlsx"

import { OUTPUT_COLUMNS, transformBuffer, workbookFromSheet } from "@/utils/excel"

function toBuffer(csv: string): Buffer {
  return Buffer.from(csv, "latin1")
}

const header = "otteluid;sarjanimi;pvm;klo;kentta;kenttanimi;kotisiisti;vierassiisti;kotiseuranimi"

describe("transformBuffer", () => {
  it("copies the eLSA columns and keeps the date range and team names", () => {
    const buffer = toBuffer(
      [
        header,
        "1006914;19-vuotiaat pojat, SM-sarja;9.11-15.11.2026;;135809;;HNMKY/ Black;BC Nokia;Helsingin NMKY",
        "1005050;Miesten II divisioona Eteläinen alue;9.11-15.11.2026;;462;;HNMKY ;Yökoris Knights;Helsingin NMKY",
      ].join("\n")
    )

    expect(transformBuffer(buffer)).toEqual({
      sheetName: "Sheet1",
      rows: [
        {
          Sarja: "19-vuotiaat pojat, SM-sarja",
          Pvm: "9.11-15.11.2026",
          Kello: "",
          Kenttä: "",
          Koti: "HNMKY/ Black",
          Vieras: "BC Nokia",
          JOJO: "",
          HUOM: "",
        },
        {
          Sarja: "Miesten II divisioona Eteläinen alue",
          Pvm: "9.11-15.11.2026",
          Kello: "",
          Kenttä: "",
          Koti: "HNMKY ",
          Vieras: "Yökoris Knights",
          JOJO: "",
          HUOM: "",
        },
      ],
    })
  })

  it("rejects an empty file", () => {
    expect(() => transformBuffer(toBuffer(`${header}\n`))).toThrow("Tiedostosta ei löytynyt rivejä")
  })

  it("names the headers it could not match", () => {
    const buffer = toBuffer("Foo;Bar\na;b\n")

    expect(() => transformBuffer(buffer)).toThrow("Tiedoston sarakkeita ei tunnistettu (Foo, Bar)")
  })

  it("writes the office header row", () => {
    const buffer = toBuffer(
      `${header}\n1;19-vuotiaat pojat, SM-sarja;9.11-15.11.2026;;;;HNMKY;BC Nokia;Helsingin NMKY\n`
    )

    const written = workbookFromSheet(transformBuffer(buffer))
    const workbook = XLSX.read(written, { type: "buffer" })
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
      defval: "",
    })

    expect(rows).toEqual([
      [...OUTPUT_COLUMNS],
      ["19-vuotiaat pojat, SM-sarja", "9.11-15.11.2026", "", "", "HNMKY", "BC Nokia", "", ""],
    ])
  })
})
