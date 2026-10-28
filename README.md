# hnmky-office

Helper tools for the HNMKY office. The games tool at `/games` reads an eLSA Excel export of all teams' games, formats dates, and downloads the sheet again. Further column changes will be added when the target layout is known.

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
