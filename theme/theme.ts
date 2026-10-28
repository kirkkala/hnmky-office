"use client"

import { alpha, createTheme } from "@mui/material/styles"

// Brand colors
const hnmkyRed = "#ff4238"
// The brand red is slightly too bright for links, darkening it slightly improves readability.
const linkRed = "#d1362e"

// Grays
const darkGray = "#1f2937"
const mediumGray = "#374151"
const gray = "#6b7280"
const lightGray = "#e5e7eb"
const paleGray = "#f9fafb"
const white = "#ffffff"

// Semantic colors
const errorRed = "#dc2626"
const errorRedLight = "#f4bdbd"
const successGreen = "#16a34a"
const successGreenLight = "#a1dab6"

const theme = createTheme({
  palette: {
    primary: {
      main: hnmkyRed,
    },
    secondary: {
      main: darkGray,
    },
    error: {
      main: errorRed,
      light: errorRedLight,
    },
    success: {
      main: successGreen,
      light: successGreenLight,
    },
    text: {
      primary: darkGray,
      secondary: gray,
    },
    background: {
      default: white,
      paper: paleGray,
    },
    divider: lightGray,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    h1: {
      fontSize: "1.75rem",
      fontWeight: 700,
    },
    h2: {
      fontSize: "1.4em",
      fontWeight: 700,
    },
    h3: {
      fontSize: "1rem",
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          // Use `clip` (not `hidden`/`scroll`) so the viewport stays the scroll
          // container and `position: sticky` on the AppBar works. This still
          // clips the horizontal overflow from the full-bleed Preview table.
          overflowX: "clip",
        },
        a: {
          color: linkRed,
          fontWeight: 700,
          textDecorationColor: alpha(linkRed, 0.4),
          "&:hover": {
            textDecorationColor: linkRed,
          },
        },
        ul: {
          paddingLeft: "1.25rem",
          marginLeft: 0,
          marginTop: ".25rem",
        },
        h3: {
          marginBottom: 0,
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        sx: { marginBottom: "1.25rem" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: linkRed,
          fontWeight: 700,
          textDecorationColor: alpha(linkRed, 0.4),
          "&:hover": {
            textDecorationColor: linkRed,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "0.2rem 0.75rem",
          borderColor: lightGray,
          whiteSpace: "nowrap",
          fontFamily: '"Courier New", Courier, monospace',
          fontSize: "0.8rem",
        },
        head: {
          backgroundColor: paleGray,
          fontWeight: 700,
          color: mediumGray,
        },
      },
    },
  },
})

export default theme
