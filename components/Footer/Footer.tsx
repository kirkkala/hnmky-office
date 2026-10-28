import FavoriteIcon from "@mui/icons-material/Favorite"
import Box from "@mui/material/Box"
import MuiLink from "@mui/material/Link"
import Typography from "@mui/material/Typography"

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 4,
        pt: 3,
        borderTop: 1,
        borderColor: "divider",
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <Typography sx={{ mb: 0.5 }}>
        Made with{" "}
        <FavoriteIcon
          sx={{
            fontSize: "1rem",
            transform: "translateY(2px)",
            color: "primary.main",
          }}
        />{" "}
        by{" "}
        <MuiLink href="https://kirkkala.com" target="_blank" rel="noopener">
          kirkkala
        </MuiLink>
      </Typography>
      <Typography sx={{ mb: 0 }}>Helsingin NMKY</Typography>
    </Box>
  )
}
