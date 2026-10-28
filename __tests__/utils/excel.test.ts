import * as XLSX from "xlsx"

import { transformBuffer } from "@/utils/excel"

function toBuffer(rows: unknown[][], sheetName = "Ottelut"): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName)
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer
}

describe("transformBuffer", () => {
  it("formats dates and leaves the other cells as they are", () => {
    const buffer = toBuffer([
      ["Pvm", "Klo", "Koti", "Pisteet", "Huomio"],
      ["14.12", "18:30", "HNMKY", 12.5, "14.12.2025"],
      [4.03, "09:00", "HNMKY", 2, "14.12"],
    ])

    expect(transformBuffer(buffer, 2026)).toEqual({
      sheetName: "Ottelut",
      rows: [
        {
          Pvm: "14.12.2026",
          Klo: "18:30",
          Koti: "HNMKY",
          Pisteet: 12.5,
          Huomio: "14.12.2025",
        },
        {
          Pvm: "04.03.2026",
          Klo: "09:00",
          Koti: "HNMKY",
          Pisteet: 2,
          Huomio: "14.12",
        },
      ],
    })
  })

  it("drops the index, LiveStats and result columns", () => {
    const buffer = toBuffer([
      ["#", "Pvm", "Klo", "Koti", "Tulos", "LiveStats"],
      [1, "14.12", "18:30", "HNMKY", "33-50", "yes"],
      [2, "4.3", "09:00", "HNMKY", "", ""],
    ])

    expect(transformBuffer(buffer, 2026).rows).toEqual([
      { Pvm: "14.12.2026", Klo: "18:30", Koti: "HNMKY" },
      { Pvm: "04.03.2026", Klo: "09:00", Koti: "HNMKY" },
    ])
  })

  it("formats a real Excel date cell", () => {
    const buffer = toBuffer([["Pvm"], [new Date(2026, 9, 28, 18, 30)]])
    const result = transformBuffer(buffer, 2026)

    expect(result.rows[0].Pvm).toBe("28.10.2026 18:30")
  })

  it("names the row when a date cell cannot be read", () => {
    const buffer = toBuffer([["Pvm"], ["ei päivää"]])

    expect(() => transformBuffer(buffer, 2026)).toThrow('Rivi 2: Sarake "Pvm"')
  })

  it("rejects an empty sheet", () => {
    const buffer = toBuffer([["Pvm", "Klo"]])

    expect(() => transformBuffer(buffer, 2026)).toThrow("Excelistä ei löytynyt rivejä")
  })
})
