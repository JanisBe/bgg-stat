# BGG Stat – Application Description

## Overview

**BGG Stat** is a single-page Angular application for visualizing a board game collection exported from [BoardGameGeek (BGG)](https://boardgamegeek.com). It presents the collection data in two complementary views:

1. **Scatter chart** – BGG community rating vs. game weight (complexity), built with **Highcharts**.
2. **Data table** – a filterable, sortable grid with key game attributes, built with **AG-Grid**.

A live deployment is hosted on GitHub Pages at: `https://janisbe.github.io/bgg-stat/`

---

## Technology Stack

| Layer       | Technology                           | Version  |
|-------------|--------------------------------------|----------|
| Framework   | Angular (standalone components)      | ~21      |
| Chart       | Highcharts + highcharts-angular      | ~12 / ~4 |
| Grid        | AG-Grid Community + ag-grid-angular  | ~33      |
| CSV parsing | PapaParse                            | ~5.5     |
| HTTP        | Angular `HttpClient`                 | built-in |
| Styling     | SCSS                                 | —        |
| Deployment  | GitHub Pages (`angular-cli-ghpages`) | ~2       |

---

## Data Source

The application consumes a BGG collection CSV file (`src/assets/collection.csv`). It can be loaded in two ways:

- **File upload** – the user selects a CSV file downloaded manually from BGG.
- **Load from assets** – a pre-bundled example file is fetched via HTTP (path configured in `environment.filePath`).
- **Download from BGG** – a helper button opens the BGG export URL for a given username.

The CSV is validated on load: the parser checks that the file has exactly **58 columns** and that the first four column names match the expected BGG header (`objectname`, `objectid`, `rating`, `numplays`).

### CSV Columns used by the app

| CSV field                                     | Role                                               |
|-----------------------------------------------|----------------------------------------------------|
| `objectname`                                  | Polish/localized game name (pinned table column)   |
| `originalname`                                | English game title                                 |
| `objectid`                                    | BGG game ID (used to build the BGG link)           |
| `average`                                     | Y-axis of the chart (BGG community average rating) |
| `avgweight`                                   | X-axis of the chart (BGG community complexity)     |
| `baverage`                                    | Bayesian average rating                            |
| `rating`                                      | User's personal rating                             |
| `rank`                                        | BGG overall rank                                   |
| `itemtype`                                    | `standalone` or `expansion`                        |
| `minplayers` / `maxplayers`                   | Player count range                                 |
| `playingtime` / `minplaytime` / `maxplaytime` | Duration                                           |
| `yearpublished`                               | Publication year                                   |
| `bggrecplayers`                               | BGG recommended player counts                      |
| `bggbestplayers`                              | BGG best player counts                             |
| `bggrecagerange`                              | Minimum recommended age                            |
| `comment`                                     | User's personal note                               |
| … many others                                 | Hidden by default, can be shown via column toggle  |

---

## Application Structure

```
src/
├── app/
│   ├── app.component.ts         # Main orchestrator component (Single File Component: Signals & OnPush)
│   ├── chart.component.ts       # Scatter chart component (Highcharts)
│   ├── controls.component.ts    # Filter bar, file upload & options dropdown
│   ├── column-menu.component.ts # Column visibility popup context menu
│   ├── info-section.component.ts# Information & how-to guide section
│   ├── models.ts                # Shared models (DataPoint, CheckboxOption, etc.)
│   ├── tableConfig.ts           # Column definitions & AG-Grid options
│   ├── inner-header.component.ts# Custom header with column menu trigger
│   └── header-tooltip.component # Custom header tooltip component
├── assets/
│   └── collection.csv           # Bundled example collection (the owner's BGG collection)
└── environments/
    ├── environment.ts           # Dev config (filePath for local CSV)
    └── environment.prod.ts      # Prod config (filePath for GitHub Pages)
```

### Key component – `AppComponent`

Responsibilities:

- **CSV loading & validation** – via PapaParse; checks header signature before processing.
- **Chart data preparation** – maps CSV rows to `{x, y, name, url, …}` Highcharts point objects. Standalone games and expansions are rendered as separate series (different colors/markers).
- **Table data preparation** – passes all rows to AG-Grid; column visibility is driven by `tableConfig`.
- **Cross-view interaction** – clicking a table row selects and highlights the corresponding chart point.
- **Filter synchronization** – AG-Grid filter changes recalculate chart data so only visible rows appear on the chart.
- **Expansion toggle** – a checkbox lets the user include/exclude expansions from the chart.
- **Column visibility** – a panel of checkboxes mirrors `tableConfig` visibility flags and drives both the tooltip content and table column visibility simultaneously.
- **Locale-aware labels** – column headers and tooltips are shown in Polish when the browser language is `pl-*`, English otherwise.

### `tableConfig.ts`

Defines every CSV field the app knows about:

- `visible` – whether the column is shown by default in the table and tooltip.
- `type` – `"n"` (numeric) or `"b"` (boolean), used for AG-Grid cell data types and filtering.
- `translationPl` / `translationEn` – localized column header labels.

---

## Chart Details

- **Type**: Scatter plot (Highcharts `scatter` series).
- **X-axis**: `avgweight` – BGG community complexity score (1 = very light, 5 = very heavy).
- **Y-axis**: `average` – BGG community average rating.
- **Series 1 – Games** (standalone): orange markers (circles).
- **Series 2 – Expansions**: blue markers (squares), hidden when "Exclude expansions" is on.
- **Tooltip**: shows the game name, rating, weight, and any additional visible columns.
- **Click on point**: opens the game's BGG page in a new tab.
- **Row → point link**: clicking a table row selects the corresponding chart point (highlighted in red).

---

## Table Details

- **Library**: AG-Grid Community (v33), legacy theme.
- **Default visible columns**: Name, Average rating, Average weight, Rank, Best players (BGG), Personal rating, Bayesian average, Original name, Min/Max players, Playing time, Year published, Recommended players, Age (BGG), Item type, BGG ID, Comment.
- **Filtering**: each visible column has a floating text/number filter.
- **Sorting**: all columns sortable.
- **Row styling**: expansions are rendered with a slightly darker background (`#c8c8c8`).
- **Name column**: pinned to the left.
- **Auto-sizing**: columns are auto-sized to fit the grid width, with a minimum of 100 px (350 px for the name column).

---

## Deployment

The app is deployed to GitHub Pages using `angular-cli-ghpages`. The production build sets `filePath` to point to the bundled `collection.csv` so the example collection loads automatically on the live site.
