"use client"

import DownloadIcon from "@mui/icons-material/Download"
import Alert from "@mui/material/Alert"
import AlertTitle from "@mui/material/AlertTitle"
import Box from "@mui/material/Box"
import FormControlLabel from "@mui/material/FormControlLabel"
import MenuItem from "@mui/material/MenuItem"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"
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
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const [year, setYear] = useState(String(currentYear))
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<PreviewResponse | null>(null)
  const [includeElsa, setIncludeElsa] = useState(false)

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
      formData.append("elsa", includeElsa ? "1" : "0")

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
            Luettu {preview.total} {preview.total === 1 ? "rivi" : "riviä"}.
          </Alert>
          <FormControlLabel
            sx={{
              alignItems: "center",
              ml: 0,
              "& .MuiFormControlLabel-label": { mb: 0, lineHeight: 1.2 },
            }}
            control={
              <Switch
                checked={includeElsa}
                onChange={(event) => setIncludeElsa(event.target.checked)}
              />
            }
            label="Näytä alkuperäinen eLSA-Excelin päivämäärä muunnoksen tarkistusta varten"
          />
          <Preview
            rows={preview.data}
            total={preview.total}
            showElsa={includeElsa}
          />
          <Box component="form" onSubmit={(event) => void handleDownload(event)} sx={{ mt: 3 }}>
            <Button
              type="submit"
              disabled={loading}
              description='Paina "Lataa muunnettu Excel" tallentaaksesi muunnetun tiedosto omalle tietokoneellesi.'
            >
              {loading ? "Käsitellään..." : "Lataa muunnettu Excel"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
