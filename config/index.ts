import packageJson from "../package.json"

const SITE_CONFIG = {
  name: "HNMKY Toimisto",
  version: `v${packageJson.version}`,
  author: {
    name: packageJson.author.name,
    email: packageJson.author.email,
    url: packageJson.author.url,
  },
} as const

// How many transformed rows the preview table renders. The download still
// contains every row.
const PREVIEW_ROW_LIMIT = 100

// Site-wide banner. Set `enabled: true` to show it on the page.
const NOTIFICATION: {
  enabled: boolean
  severity: "alert" | "warning"
  message: string
} = {
  enabled: false,
  severity: "warning",
  message: "",
}

// Paths stay stable when a tool's display name changes.
const TOOLS = [
  {
    path: "/games",
    title: "Otteluuiden siirtohässäkkä",
    description:
      "Siirrä kaikkien joukkueiden ottelut yhdestä eLSA-Excelistä järjestelmään, jolla ottelut organisoidaan.",
    action: "Avaa työkalu",
  },
] as const

const PAGES = [{ path: "/", label: "Etusivu" }] as const

export { SITE_CONFIG, PREVIEW_ROW_LIMIT, NOTIFICATION, TOOLS, PAGES }
