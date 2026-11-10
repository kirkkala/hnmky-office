import { type NextRequest, NextResponse } from "next/server"

import { API_FILE_MISSING, formatErrorMessage } from "@/utils/error"
import { transformBuffer } from "@/utils/excel"
import { parseFormData } from "@/utils/formData"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const { fileBuffers } = await parseFormData(formData)

    if (fileBuffers.length === 0) {
      return NextResponse.json({ message: API_FILE_MISSING }, { status: 400 })
    }

    const sheet = transformBuffer(fileBuffers[0])

    return NextResponse.json({
      total: sheet.rows.length,
      data: sheet.rows,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: formatErrorMessage(error) }, { status: 500 })
  }
}
