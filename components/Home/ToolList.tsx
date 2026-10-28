"use client"

import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import Link from "next/link"

import { TOOLS } from "@/config"

export default function ToolList() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 4 }}>
      {TOOLS.map((tool) => (
        <Paper key={tool.path} variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h2" component="h2" sx={{ mb: 1 }}>
            {tool.title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {tool.description}
          </Typography>
          <Button
            component={Link}
            href={tool.path}
            variant="contained"
            endIcon={<ArrowForwardIcon />}
          >
            {tool.action}
          </Button>
        </Paper>
      ))}
    </Box>
  )
}
