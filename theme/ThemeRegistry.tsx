"use client"

import createCache from "@emotion/cache"
import { CacheProvider } from "@emotion/react"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { useServerInsertedHTML } from "next/navigation"
import { useState } from "react"

import theme from "./theme"

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [emotionCache] = useState(() => {
    const cache = createCache({ key: "mui" })
    cache.compat = true
    return cache
  })

  useServerInsertedHTML(() => (
    <style
      key={emotionCache.key}
      data-emotion={emotionCache.key}
      dangerouslySetInnerHTML={{
        __html: (emotionCache.sheet as { tags: HTMLStyleElement[] }).tags
          .map((tag) => tag.innerHTML)
          .join(""),
      }}
    />
  ))

  return (
    <CacheProvider value={emotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  )
}
