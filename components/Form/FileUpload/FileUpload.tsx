"use client"

import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloseIcon from "@mui/icons-material/Close"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import FormControl from "@mui/material/FormControl"
import FormHelperText from "@mui/material/FormHelperText"
import Typography from "@mui/material/Typography"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  label?: string
  description?: string
  files: File[]
  onFilesChange: (files: File[]) => void
  disabled?: boolean
  multiple?: boolean
}

export default function FileUpload({
  files,
  onFilesChange,
  label,
  description,
  disabled = false,
  multiple = true,
}: FileUploadProps): React.ReactElement {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!multiple) {
        onFilesChange(acceptedFiles.slice(0, 1))
        return
      }

      const existingNames = new Set(files.map((file) => file.name))
      const newFiles = acceptedFiles.filter((file) => !existingNames.has(file.name))
      onFilesChange([...files, ...newFiles])
    },
    [files, multiple, onFilesChange]
  )

  const removeFile = (fileName: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onFilesChange(files.filter((file) => file.name !== fileName))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    disabled,
    multiple,
  })

  const hasFiles = files.length > 0

  return (
    <FormControl fullWidth>
      {description && <FormHelperText sx={{ mx: 0, mb: 1 }}>{description}</FormHelperText>}

      <Box
        {...getRootProps()}
        data-testid="dropzone"
        sx={{
          py: 3,
          px: 2,
          mb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          border: "2px dashed",
          borderRadius: 1,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s ease",
          borderColor: isDragActive ? "primary.main" : hasFiles ? "success.main" : "divider",
          bgcolor: isDragActive ? "action.hover" : "transparent",
          opacity: disabled ? 0.5 : 1,
          "&:hover": disabled
            ? {}
            : {
                bgcolor: "action.hover",
              },
        }}
      >
        <input {...getInputProps({ id: "file" })} data-testid="file-input" aria-label={label} />

        {hasFiles ? (
          <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
        ) : (
          <CloudUploadIcon
            sx={{ fontSize: 40, color: isDragActive ? "primary.main" : "text.secondary" }}
          />
        )}

        <Typography
          variant="body1"
          sx={{
            color: isDragActive ? "primary.main" : hasFiles ? "success.main" : "text.secondary",
            textAlign: "center",
            mb: 0,
          }}
        >
          {isDragActive
            ? "Pudota tiedosto tähän..."
            : hasFiles
              ? `${String(files.length)} tiedosto${files.length > 1 ? "a" : ""} lisätty`
              : "Pudota eLSA-Excel tai klikkaa valitaksesi"}
        </Typography>

        {hasFiles ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
            {files.map((file) => (
              <Chip
                key={file.name}
                label={file.name}
                size="small"
                color="success"
                onDelete={
                  disabled
                    ? undefined
                    : (event) => {
                        removeFile(file.name, event as React.MouseEvent)
                      }
                }
                deleteIcon={<CloseIcon fontSize="small" />}
                aria-label={`Poista ${file.name}`}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0 }}>
            Tuetut tiedostomuodot: .xlsx
          </Typography>
        )}
      </Box>
    </FormControl>
  )
}
