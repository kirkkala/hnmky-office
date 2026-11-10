# hnmky-office

Helper tools for the HNMKY office. The home page lists the tools. The only tool so far is Otteluuiden siirtohässäkkä at `/games`.

## Games

`/games` reads an eLSA CSV (semicolon-separated) and builds a sheet for the office. The preview can show 10, 25, or 100 rows when the file is larger than that, or every row. Download always saves every row as `hnmky-office.xlsx`.

Output columns, in order:

| Column | eLSA column | What is written |
| --- | --- | --- |
| Sarja | sarjanimi | Series, as stored |
| Pvm | pvm | The date range, as stored, such as `9.11-15.11.2026` |
| Kello | klo | Time, as stored |
| Kenttä | kenttanimi | Court name, as stored |
| Koti | kotisiisti | Home team, as stored |
| Vieras | vierassiisti | Away team, as stored |
| JOJO | | Empty, filled in after download |
| HUOM | | Empty, filled in after download |

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Material UI
- SheetJS (`xlsx`) for Excel
- Vitest and Biome

## Development

```bash
nvm use
pnpm install
pnpm dev
```

The app runs at http://localhost:3000.

```bash
pnpm lint
pnpm test
pnpm build
```
