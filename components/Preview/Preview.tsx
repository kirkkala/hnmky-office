import PreviewIcon from "@mui/icons-material/RemoveRedEyeSharp"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import ToggleButton from "@mui/material/ToggleButton"
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup"
import Typography from "@mui/material/Typography"
import { useState } from "react"

import { ELSA_PVM } from "@/utils/columns"

const PREVIEW_LIMITS = [10, 25, 100] as const
type PreviewLimit = (typeof PREVIEW_LIMITS)[number] | "all"

interface PreviewProps {
  rows: Record<string, unknown>[]
  total: number
  showElsa: boolean
}

function cellText(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return JSON.stringify(value)
}

export default function Preview({ rows, total, showElsa }: PreviewProps) {
  const [limit, setLimit] = useState<PreviewLimit>(10)

  if (!rows.length) return null

  const columns = Object.keys(rows[0]).filter((column) => showElsa || column !== ELSA_PVM)
  const choices = PREVIEW_LIMITS.filter((option) => option < rows.length)
  const active = choices.some((option) => option === limit) ? limit : "all"
  const visibleRows = active === "all" ? rows : rows.slice(0, active)

  return (
    <Box
      sx={{
        mt: 3,
        width: "100vw",
        maxWidth: 1600,
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
        px: { xs: 1, sm: 2 },
      }}
    >
      <Typography variant="h2" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <PreviewIcon /> Esikatselu, {visibleRows.length}/{total} riviä
      </Typography>
      {choices.length > 0 && (
        <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography component="span" sx={{ mb: 0, lineHeight: 1.2 }}>
            Näytä
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={active}
            sx={{ "& .MuiToggleButton-root": { textTransform: "none" } }}
            onChange={(_, next: PreviewLimit | null) => {
              if (next !== null) setLimit(next)
            }}
            aria-label="Esikatselun rivimäärä"
          >
            {choices.map((option) => (
              <ToggleButton key={option} value={option}>
                {option}
              </ToggleButton>
            ))}
            <ToggleButton value="all">Kaikki</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 480 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column}>{column}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: sheet rows have no stable id
              <TableRow key={index} hover>
                {columns.map((column) => (
                  <TableCell key={column}>{cellText(row[column])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
