import { Buffer } from "buffer"

export interface ParsedFormData {
  fields: Record<string, string>
  fileBuffers: Buffer[]
}

export async function parseFormData(formData: FormData): Promise<ParsedFormData> {
  const fields: Record<string, string> = {}
  const fileBuffers: Buffer[] = []

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      fileBuffers.push(Buffer.from(await value.arrayBuffer()))
    } else {
      fields[key] = value
    }
  }

  return { fields, fileBuffers }
}
