"use client"

import CloseIcon from "@mui/icons-material/Close"
import HomeIcon from "@mui/icons-material/Home"
import MenuIcon from "@mui/icons-material/Menu"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { PAGES, SITE_CONFIG } from "../../config"

const PAGE_ICONS: Record<string, typeof HomeIcon> = {
  "/": HomeIcon,
}

const navTabsSx = {
  alignSelf: "flex-end",
  display: { xs: "none", md: "flex" },
  "& .MuiTabs-indicator": {
    display: "none",
  },
  "& .MuiTab-root": {
    textTransform: "none",
    minWidth: "auto",
    px: { xs: 1, sm: 2 },
    fontSize: { xs: "0.75rem", sm: "0.875rem" },
    position: "relative",
    color: "text.primary",
    "&.Mui-selected": {
      color: "primary.main",
    },
    "& .MuiSvgIcon-root": {
      fontSize: { xs: "1.1rem", sm: "1.3rem" },
    },
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: { xs: 8, sm: 12 },
      right: { xs: 8, sm: 12 },
      height: 2,
      bgcolor: "text.secondary",
      borderRadius: 1,
      transform: "scaleX(0)",
      transition: "transform 0.2s ease, background-color 0.2s ease",
      transformOrigin: "center",
    },
    "&:hover:not(.Mui-selected)::after": {
      transform: "scaleX(1)",
    },
    "&.Mui-selected::after": {
      bgcolor: "primary.main",
      transform: "scaleX(1)",
    },
  },
}

export default function Header() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  const activeTab = PAGES.some((page) => page.path === pathname) ? pathname : false
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <AppBar position="sticky" color="default" elevation={1} sx={{ top: 0 }}>
        <Box sx={{ maxWidth: 780, mx: "auto", width: "100%", px: { xs: 1, sm: 2 } }}>
          <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 72 }, gap: { xs: 1, sm: 2 } }}>
            <Box
              component={Link}
              href="/"
              aria-label={SITE_CONFIG.name}
              sx={{ display: "inline-flex", flexShrink: 0 }}
            >
              <Image src="/images/hnmky.png" alt="" width={48} height={48} priority />
            </Box>
            <Typography
              variant="h1"
              component={isHomePage ? "h1" : "div"}
              noWrap
              sx={{ m: 0, fontSize: { xs: "1rem", sm: "1.4rem" }, flexGrow: 1 }}
            >
              {SITE_CONFIG.name}
            </Typography>

            <Tabs value={activeTab} component="nav" sx={navTabsSx}>
              {PAGES.map((page) => {
                const Icon = PAGE_ICONS[page.path]
                return (
                  <Tab
                    key={page.path}
                    label={page.label}
                    value={page.path}
                    href={page.path}
                    component={Link}
                    icon={Icon ? <Icon /> : undefined}
                    iconPosition="start"
                    aria-label={page.label}
                    sx={{ fontWeight: pathname === page.path ? 700 : 400 }}
                  />
                )
              })}
            </Tabs>

            <IconButton
              aria-label="Avaa valikko"
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Box>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            <Typography variant="h3" component="span" sx={{ m: 0, fontWeight: 700 }}>
              Valikko
            </Typography>
            <IconButton
              aria-label="Sulje valikko"
              onClick={() => setDrawerOpen(false)}
              sx={{ color: "inherit" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {PAGES.map((page) => {
              const Icon = PAGE_ICONS[page.path]
              const isActive = pathname === page.path
              return (
                <ListItem key={page.path} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={page.path}
                    selected={isActive}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <ListItemIcon
                      sx={{ minWidth: 40, color: isActive ? "primary.main" : "inherit" }}
                    >
                      {Icon ? <Icon /> : null}
                    </ListItemIcon>
                    <ListItemText
                      primary={page.label}
                      slotProps={{ primary: { sx: { mb: 0, fontWeight: isActive ? 700 : 400 } } }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
