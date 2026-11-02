import { type NextRequest, NextResponse } from "next/server"

import { API_FILE_MISSING, formatErrorMessage, logError } from "@/utils/error"
import { parseYear, transformBuffer } from "@/utils/excel"
import { parseFormData } from "@/utils/formData"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { fields, fileBuffers } = await parseFormData(formData)

    if (fileBuffers.length === 0) {
      return NextResponse.json({ message: API_FILE_MISSING }, { status: 400 })
    }

    const sheet = transformBuffer(fileBuffers[0], parseYear(fields.year))

    return NextResponse.json({
      sheetName: sheet.sheetName,
      total: sheet.rows.length,
      data: sheet.rows,
    })
  } catch (error) {
    logError(error)
    return NextResponse.json({ message: formatErrorMessage(error) }, { status: 500 })
  }
}
