"use client"

import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloseIcon from "@mui/icons-material/Close"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import FormControl from "@mui/material/FormControl"
import Typography from "@mui/material/Typography"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface FileUploadProps {
  label?: string
  files: File[]
  onFilesChange: (files: File[]) => void
}

export default function FileUpload({
  files,
  onFilesChange,
  label,
}: FileUploadProps): React.ReactElement {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      onFilesChange(file ? [file] : [])
    },
    [onFilesChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "text/plain": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    multiple: false,
  })

  const hasFile = files.length > 0

  return (
    <FormControl fullWidth>
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
          cursor: "pointer",
          transition: "all 0.2s ease",
          borderColor: isDragActive ? "primary.main" : hasFile ? "success.main" : "divider",
          bgcolor: isDragActive ? "action.hover" : "transparent",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <input {...getInputProps({ id: "file" })} data-testid="file-input" aria-label={label} />

        {hasFile ? (
          <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />
        ) : (
          <CloudUploadIcon
            sx={{ fontSize: 40, color: isDragActive ? "primary.main" : "text.secondary" }}
          />
        )}

        <Typography
          variant="body1"
          sx={{
            color: isDragActive ? "primary.main" : hasFile ? "success.main" : "text.secondary",
            textAlign: "center",
            mb: 0,
          }}
        >
          {isDragActive
            ? "Pudota tiedosto tähän..."
            : hasFile
              ? "Tiedosto lisätty"
              : "Pudota eLSA-tiedosto tai klikkaa valitaksesi"}
        </Typography>

        {hasFile ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
            {files.map((file) => (
              <Chip
                key={file.name}
                label={file.name}
                size="small"
                color="success"
                onDelete={(event) => {
                  event.stopPropagation()
                  onFilesChange(files.filter((item) => item.name !== file.name))
                }}
                deleteIcon={<CloseIcon fontSize="small" />}
                aria-label={`Poista ${file.name}`}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0 }}>
            Tuetut tiedostomuodot: .csv
          </Typography>
        )}
      </Box>
    </FormControl>
  )
}
