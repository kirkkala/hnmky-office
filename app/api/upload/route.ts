import { type NextRequest, NextResponse } from "next/server"

import { API_FILE_MISSING, formatErrorMessage } from "@/utils/error"
import { datesNeedYear, parseYear, transformBuffer, workbookFromSheet } from "@/utils/excel"
import { parseFormData } from "@/utils/formData"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { fields, fileBuffers } = await parseFormData(formData)

    if (fileBuffers.length === 0) {
      return NextResponse.json({ message: API_FILE_MISSING }, { status: 400 })
    }

    const source = fileBuffers[0]
    const year = datesNeedYear(source) ? parseYear(fields.year) : new Date().getFullYear()
    const sheet = transformBuffer(source, year)
    const buffer = workbookFromSheet(sheet, fields.elsa === "1")

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Disposition": 'attachment; filename="hnmky-office.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: formatErrorMessage(error) }, { status: 500 })
  }
}
