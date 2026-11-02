# hnmky-office

Helper tools for the HNMKY office. The home page lists the tools. The only tool so far is Otteluuiden siirtohässäkkä at `/games`.

## Games

`/games` reads the first worksheet of an eLSA Excel export (`.xlsx` or `.xls`) and builds a sheet for the office.

When the uploaded dates have no year, the form asks for this year or the next one before showing a preview. Changing that year updates the preview and the download. The preview can show 10, 25, or 100 rows when the sheet is larger than that, or every row. Download always saves every row as `hnmky-office.xlsx`.

Output columns, in order:

| Column | What is written |
| --- | --- |
| Sarja | Series |
| eLSA-pvm | The source date as shown. `20,09` stays `20,09` and `03.10` stays `03.10`. |
| Pvm | Date as `dd.mm.yyyy`. A yearless date uses the year from the form. A date that already has a year keeps it. |
| Kello | Time as in the eLSA sheet. A value such as `15:00` is already `HH:mm` and is left as it is. |
| Kenttä | Court |
| Koti | Home team |
| Vieras | Away team |
| JOJO | Empty, filled in after download |
| HUOM | Empty, filled in after download |

`eLSA-pvm` is a check against the formatted date. A switch above the preview includes it in the preview and the download. It is left out unless that switch is on. Other source columns are left out.

Source headers from the eLSA sheet:

- Sarja: Sarja
- Pvm: Pvm
- Kello: Klo or Kello
- Kenttä: Kenttä
- Koti: Koti
- Vieras: Vieras

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
