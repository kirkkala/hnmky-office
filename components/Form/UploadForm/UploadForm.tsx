"use client"

import DownloadIcon from "@mui/icons-material/Download"
import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import Box from "@mui/material/Box"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useState } from "react"

import { API_CONVERSION_FAILED, API_FILE_MISSING } from "@/utils/error"

import Preview from "../../Preview/Preview"
import Button from "../Button/Button"
import FileUpload from "../FileUpload/FileUpload"

interface PreviewResponse {
  sheetName: string
  total: number
  data: Record<string, unknown>[]
  message?: string
}

export default function UploadForm() {
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const [year, setYear] = useState(String(currentYear))
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<PreviewResponse | null>(null)

  const fetchPreview = async (nextFiles: File[], nextYear: string): Promise<void> => {
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
      formData.append("year", nextYear)

      const response = await fetch("/api/preview", { method: "POST", body: formData })
      const data = (await response.json()) as PreviewResponse

      if (!response.ok) {
        throw new Error(data.message || "Excelin lukeminen epäonnistui")
      }

      setPreview(data)
    } catch (err) {
      setPreview(null)
      setError(err instanceof Error ? err.message : "Excelin lukeminen epäonnistui")
    }
  }

  const handleFilesChange = (nextFiles: File[]): void => {
    setFiles(nextFiles)
    void fetchPreview(nextFiles, year)
  }

  const handleYearChange = (nextYear: string): void => {
    setYear(nextYear)
    if (files.length > 0) void fetchPreview(files, nextYear)
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
      formData.append("year", year)

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
        Lisää eLSA-Excel ja saat vähän paremman pelien asettelua varten.
      </Typography>

      <FileUpload
        files={files}
        onFilesChange={handleFilesChange}
        label="eLSA Excel-tiedosto"
        multiple={false}
      />

      <TextField
        select
        id="year"
        label="Vuosi"
        value={year}
        onChange={(event) => handleYearChange(event.target.value)}
        helperText="eLSA:n excelissä ei ole päivämääriä, valitse oikea vuosi."
        fullWidth
        sx={{ mb: 3 }}
      >
        {years.map((option) => (
          <MenuItem key={option} value={String(option)}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Tiedoston käsittely epäonnistui</AlertTitle>
          {error}
        </Alert>
      )}

      {preview && !error && (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            Luettu {preview.total} riviä välilehdeltä {preview.sheetName}.
          </Alert>
          <Preview rows={preview.data} total={preview.total} sheetName={preview.sheetName} />
          <Box component="form" onSubmit={(event) => void handleDownload(event)} sx={{ mt: 3 }}>
            <Button
              type="submit"
              disabled={loading}
              Icon={DownloadIcon}
              label="Lataa Excel"
              description="Tallenna muunnettu tiedosto omalle tietokoneelle."
            >
              {loading ? "Käsitellään..." : "Lataa Excel"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
