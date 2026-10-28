import type { Metadata } from "next"

import { SITE_CONFIG } from "../config"
import { ThemeRegistry } from "../theme"

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: "Työkaluja HNMKY:n toimistolle.",
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
