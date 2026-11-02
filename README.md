# hnmky-office

Helper tools for the HNMKY office. The home page lists the tools. The only tool so far is Otteluuiden siirtohässäkkä at `/games`.

## Games

`/games` reads the first worksheet of an eLSA Excel export (`.xlsx` or `.xls`) and builds a sheet for the office.

The form asks for a year — the previous, current, or next year — because eLSA dates are often only a day and a month, such as `14.12` or `4.3`. The preview updates when the file or the year changes. It shows the first 100 rows. Download saves every row as `hnmky-office.xlsx`.

Output columns, in order:

| Column | What is written |
| --- | --- |
| Sarja | Series |
| Pvm | Date as `dd.mm.yyyy`. A yearless date uses the year from the form. A date that already has a year keeps it. |
| Kello | Time as `HH:mm`. `18.30` and `9:00` become `18:30` and `09:00`. A time attached to the date is moved here when the time cell is empty. |
| eLSA Pvm | The source date cell, unchanged |
| eLSA Kello | The source time cell, unchanged |
| Kenttä | Court |
| Koti | Home team |
| Vieras | Away team |
| JOJO | Empty, filled in after download |
| HUOM | Empty, filled in after download |

`eLSA Pvm` and `eLSA Kello` are a check against the formatted date and time. Other source columns are left out.

Source headers are matched by these names until the real eLSA export is available:

- Sarja: Sarja
- Pvm: Pvm, Päivä, Päivämäärä
- Kello: Kello, Klo, Aika
- Kenttä: Kenttä, Halli, Pelipaikka
- Koti: Koti, Kotijoukkue
- Vieras: Vieras, Vierasjoukkue

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
