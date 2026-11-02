import * as XLSX from "xlsx"

import { ELSA_PVM } from "@/utils/columns"
import { OUTPUT_COLUMNS, datesNeedYear, transformBuffer, workbookFromSheet } from "@/utils/excel"

function toBuffer(rows: unknown[][], sheetName = "Ottelut"): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}

const emptyOffice = {
  Sarja: "",
  [ELSA_PVM]: "",
  Pvm: "",
  Kello: "",
  Kenttä: "",
  Koti: "",
  Vieras: "",
  JOJO: "",
  HUOM: "",
}

describe("transformBuffer", () => {
  it("projects games onto the office columns and formats dates", () => {
    const buffer = toBuffer([
      ["Sarja", "Pvm", "Klo", "Kenttä", "Koti", "Vieras", "Pisteet", "Huomio"],
      ["M1D", "14.12", "18:30", "Monnari", "HNMKY", "BC Nokia", 12.5, "14.12.2025"],
      ["", 4.03, "9:00", "", "HNMKY", "Pyrintö", 2, "14.12"],
    ])

    expect(transformBuffer(buffer, 2026)).toEqual({
      sheetName: "Ottelut",
      rows: [
        {
          ...emptyOffice,
          Sarja: "M1D",
          Pvm: "14.12.2026",
          Kello: "18:30",
          [ELSA_PVM]: "14.12",
          Kenttä: "Monnari",
          Koti: "HNMKY",
          Vieras: "BC Nokia",
        },
        {
          ...emptyOffice,
          Pvm: "04.03.2026",
          Kello: "09:00",
          [ELSA_PVM]: "4,03",
          Koti: "HNMKY",
          Vieras: "Pyrintö",
        },
      ],
    })
  })

  it("accepts common eLSA header names and leaves JOJO and HUOM empty", () => {
    const buffer = toBuffer([
      ["#", "Päivä", "Aika", "Halli", "Kotijoukkue", "Vierasjoukkue", "Tulos", "JOJO", "Huom"],
      [1, "14.12", "18.30", "Monnari", "HNMKY", "BC Nokia", "33-50", "täytetty", "muistiinpano"],
    ])

    const row = transformBuffer(buffer, 2026).rows[0]

    expect(Object.keys(row)).toEqual([...OUTPUT_COLUMNS])
    expect(row).toEqual({
      ...emptyOffice,
      Pvm: "14.12.2026",
      Kello: "18:30",
      [ELSA_PVM]: "14.12",
      Kenttä: "Monnari",
      Koti: "HNMKY",
      Vieras: "BC Nokia",
    })
  })

  it("keeps the original date text, including a decimal comma", () => {
    const buffer = toBuffer([
      ["Pvm", "Klo"],
      ["20,09", "15:00"],
      ["03.10", "09:00"],
      [24.1, "10:45"],
      [20.09, "12:30"],
    ])

    const rows = transformBuffer(buffer, 2026).rows

    expect(rows.map((row) => row[ELSA_PVM])).toEqual(["20,09", "03.10", "24,1", "20,09"])
    expect(rows.map((row) => row.Kello)).toEqual(["15:00", "09:00", "10:45", "12:30"])
    expect(rows.map((row) => row.Pvm)).toEqual([
      "20.09.2026",
      "03.10.2026",
      "24.10.2026",
      "20.09.2026",
    ])
  })

  it("moves a time stuck on the date into Kello", () => {
    const buffer = toBuffer([["Pvm"], [new Date(2026, 9, 28, 18, 30)]])
    const row = transformBuffer(buffer, 2026).rows[0]

    expect(row.Pvm).toBe("28.10.2026")
    expect(row.Kello).toBe("18:30")
    expect(row[ELSA_PVM]).not.toBe("28.10.2026")
  })

  it("keeps a separate time when the date also has one", () => {
    const buffer = toBuffer([
      ["Pvm", "Klo"],
      [new Date(2026, 9, 28, 18, 30), "19:00"],
    ])

    const row = transformBuffer(buffer, 2026).rows[0]

    expect(row.Pvm).toBe("28.10.2026")
    expect(row.Kello).toBe("19:00")
  })

  it("names the row when a date cell cannot be read", () => {
    const buffer = toBuffer([["Pvm"], ["ei päivää"]])

    expect(() => transformBuffer(buffer, 2026)).toThrow('Rivi 2: Sarake "Pvm"')
  })

  it("needs a year when dates have only a day and month", () => {
    const buffer = toBuffer([["Pvm"], ["20,09"], ["03.10"], [24.1]])

    expect(datesNeedYear(buffer)).toBe(true)
  })

  it("does not need a year when every date already has one", () => {
    const buffer = toBuffer([["Pvm"], ["14.12.2026"], ["3.10.2026"]])

    expect(datesNeedYear(buffer)).toBe(false)
  })

  it("rejects an empty sheet", () => {
    const buffer = toBuffer([["Pvm", "Klo"]])

    expect(() => transformBuffer(buffer, 2026)).toThrow("Excelistä ei löytynyt rivejä")
  })

  it("names the headers it could not match", () => {
    const buffer = toBuffer([
      ["Foo", "Bar"],
      ["a", "b"],
    ])

    expect(() => transformBuffer(buffer, 2026)).toThrow(
      "Excelin sarakkeita ei tunnistettu (Foo, Bar)"
    )
  })

  it("writes the office header row", () => {
    const buffer = toBuffer([
      ["Sarja", "Pvm", "Kello", "Kenttä", "Koti", "Vieras"],
      ["M1D", "14.12", "18:30", "Monnari", "HNMKY", "BC Nokia"],
    ])

    const written = workbookFromSheet(transformBuffer(buffer, 2026), true)
    const workbook = XLSX.read(written, { type: "buffer" })
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
      defval: "",
    })

    expect(rows).toEqual([
      [...OUTPUT_COLUMNS],
      ["M1D", "14.12", "14.12.2026", "18:30", "Monnari", "HNMKY", "BC Nokia", "", ""],
    ])
  })

  it("leaves the eLSA reference columns out of the download unless asked", () => {
    const buffer = toBuffer([
      ["Sarja", "Pvm", "Kello", "Kenttä", "Koti", "Vieras"],
      ["M1D", "14.12", "18:30", "Monnari", "HNMKY", "BC Nokia"],
    ])

    const written = workbookFromSheet(transformBuffer(buffer, 2026))
    const workbook = XLSX.read(written, { type: "buffer" })
    const rows = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[workbook.SheetNames[0]], {
      header: 1,
      defval: "",
    })

    expect(rows[0]).toEqual(["Sarja", "Pvm", "Kello", "Kenttä", "Koti", "Vieras", "JOJO", "HUOM"])
  })
})
