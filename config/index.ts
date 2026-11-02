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
    title: "Otteluiden siirtohässäkkä",
    description:
      "Muunna joukkueiden ottelut eLSA-Excelistä muotoon, jolla otteluita voi organisoida.",
    action: "Avaa työkalu",
  },
] as const

const PAGES = [{ path: "/", label: "Etusivu" }] as const

export { SITE_CONFIG, NOTIFICATION, TOOLS, PAGES }
