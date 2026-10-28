import Box from "@mui/material/Box"
import Container from "@mui/material/Container"

import Header from "../Header/Header"
import Notification from "../Notification/Notification"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Notification />
      <Box component="main" sx={{ display: "flex", flexDirection: "column" }}>
        <Container maxWidth={false} sx={{ maxWidth: 780, py: 3 }}>
          {children}
        </Container>
      </Box>
    </>
  )
}
