"use client"

import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import { useState } from "react"

import { API_CONVERSION_FAILED, API_FILE_MISSING } from "@/utils/error"

import Preview from "../../Preview/Preview"
import Button from "../Button/Button"
import FileUpload from "../FileUpload/FileUpload"

interface PreviewResponse {
  total: number
  data: Record<string, unknown>[]
  message?: string
}

export default function UploadForm() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<PreviewResponse | null>(null)

  const fetchPreview = async (nextFiles: File[]): Promise<void> => {
    const file = nextFiles[0]
    if (!file) {
      setPreview(null)
      setError("")
      return
    }

    setError("")

    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/api/preview", { method: "POST", body: formData })
      const data = (await response.json()) as PreviewResponse

      if (!response.ok) {
        throw new Error(data.message || "Tiedoston lukeminen epäonnistui")
      }

      setPreview(data)
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : "Tiedoston lukeminen epäonnistui")
    }
  }

  const handleDownload = async (event: React.SyntheticEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const file = files[0]
      if (!file) throw new Error(API_FILE_MISSING)

      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/api/upload", { method: "POST", body: formData })

      if (!response.ok) {
        const errorData = (await response.json()) as { message?: string }
        throw new Error(errorData.message || API_CONVERSION_FAILED)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "hnmky-office.xlsx"
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      link.remove()
    } catch (err) {
      setError(err instanceof Error ? err.message : API_CONVERSION_FAILED)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ mb: 3 }}>
        Lisää eLSA:n .csv -tiedosto, esikatsele ja lataa excel tiedosto pelien asettelua varten.
      </Typography>

      <FileUpload
        files={files}
        onFilesChange={(nextFiles) => {
          setFiles(nextFiles)
          void fetchPreview(nextFiles)
        }}
        label="eLSA-tiedosto"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Tiedoston käsittely epäonnistui</AlertTitle>
          {error}
        </Alert>
      )}

      {preview?.data && !error && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            Luettu {preview.total} {preview.total === 1 ? "rivi" : "riviä"}.
          </Alert>
          <Preview rows={preview.data} total={preview.total} />
          <Box component="form" onSubmit={(event) => void handleDownload(event)} sx={{ mt: 3 }}>
            <Button type="submit" disabled={loading}>
              {loading ? "Käsitellään..." : "Lataa muunnettu Excel"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
