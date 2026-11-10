const SITE_CONFIG = {
  name: "HNMKY Toimisto",
} as const

// Paths stay stable when a tool's display name changes.
const TOOLS = [
  {
    path: "/games",
    title: "Otteluiden siirtohässäkkä",
    description:
      "Muunna sarjojen aikataulutus eLSA:n .csv -tiedostosta exceliin pelien asettelua varten.",
    action: "Avaa työkalu",
  },
] as const

const PAGES = [{ path: "/", label: "Etusivu" }] as const

export { SITE_CONFIG, TOOLS, PAGES }
