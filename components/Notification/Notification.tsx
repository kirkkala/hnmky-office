import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"

import { NOTIFICATION } from "../../config"

const SEVERITY_MAP = {
  alert: "error",
  warning: "warning",
} as const

export default function Notification() {
  if (!NOTIFICATION.enabled || !NOTIFICATION.message) {
    return null
  }

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", width: "100%", px: 3, pt: 2 }}>
      <Alert severity={SEVERITY_MAP[NOTIFICATION.severity]}>{NOTIFICATION.message}</Alert>
    </Box>
  )
}
