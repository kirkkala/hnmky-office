import { type NextRequest, NextResponse } from "next/server"

import { API_FILE_MISSING, formatErrorMessage, logError } from "@/utils/error"
import { parseYear, transformBuffer, workbookFromSheet } from "@/utils/excel"
import { parseFormData } from "@/utils/formData"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { fields, fileBuffers } = await parseFormData(formData)

    if (fileBuffers.length === 0) {
      return NextResponse.json({ message: API_FILE_MISSING }, { status: 400 })
    }

    const sheet = transformBuffer(fileBuffers[0], parseYear(fields.year))
    const buffer = workbookFromSheet(sheet)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Disposition": 'attachment; filename="hnmky-office.xlsx"',
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    })
  } catch (error) {
    logError(error)
    return NextResponse.json({ message: formatErrorMessage(error) }, { status: 500 })
  }
}
