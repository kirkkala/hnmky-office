import PreviewIcon from "@mui/icons-material/RemoveRedEyeSharp"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Typography from "@mui/material/Typography"

interface PreviewProps {
  rows: Record<string, unknown>[]
  total: number
  sheetName: string
}

function cellText(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }
  return JSON.stringify(value)
}

export default function Preview({ rows, total, sheetName }: PreviewProps) {
  if (!rows.length) return null

  const columns = Object.keys(rows[0])
  const hiddenCount = total - rows.length

  return (
    <Box
      sx={{
        mt: 3,
        width: "100vw",
        position: "relative",
        left: "50%",
        transform: "translateX(-50%)",
        px: { xs: 1, sm: 2 },
      }}
    >
      <Typography variant="h2" sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        <PreviewIcon /> Esikatselu, {sheetName}
      </Typography>
      {hiddenCount > 0 && (
        <Typography color="text.secondary" sx={{ mb: 1.5 }}>
          Näytetään {rows.length} / {total} riviä. Ladattava tiedosto sisältää kaikki rivit.
        </Typography>
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
            {rows.map((row, index) => (
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
