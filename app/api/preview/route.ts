import { type NextRequest, NextResponse } from "next/server"

import { API_FILE_MISSING, formatErrorMessage } from "@/utils/error"
import { datesNeedYear, parseYear, transformBuffer } from "@/utils/excel"
import { parseFormData } from "@/utils/formData"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { fields, fileBuffers } = await parseFormData(formData)

    if (fileBuffers.length === 0) {
      return NextResponse.json({ message: API_FILE_MISSING }, { status: 400 })
    }

    const buffer = fileBuffers[0]
    const needsYear = datesNeedYear(buffer)
    if (needsYear && !fields.year) {
      return NextResponse.json({ needsYear: true })
    }

    const year = fields.year ? parseYear(fields.year) : new Date().getFullYear()
    const sheet = transformBuffer(buffer, year)

    return NextResponse.json({
      needsYear,
      total: sheet.rows.length,
      data: sheet.rows,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: formatErrorMessage(error) }, { status: 500 })
  }
}
