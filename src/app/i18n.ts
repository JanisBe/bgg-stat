export interface TranslationKeys {
  title: string;
  displayedGames: string;
  or: string;
  useMyCsv: string;
  filter: string;
  baseGames: string;
  expansions: string;
  options: string;
  resetPreferences: string;
  hideColumn: string;
  columnsMenu: string;
  loadCsvTooltip: string;
  tooltipOptionsTitle: string;
  tooltipOptionsHint: string;
  infoTitle: string;
  infoTextPart1: string;
  infoTextClickHere: string;
  infoTextPart2: string;
  howToUseTitle: string;
  howToUseText: string;
  switchToDark: string;
  switchToLight: string;

  // Script-based translations
  chartTitle: string;
  chartXAxis: string;
  chartYAxis: string;
  chartSeriesGames: string;
  chartSeriesExpansions: string;
  enterNamePrompt: string;
  csvErrorAlert: string;

  // Mobile & Cards additions
  viewAll: string;
  viewChart: string;
  viewCards: string;
  viewTable: string;
  viewInfo: string;
  openInBgg: string;
  weight: string;
  rating: string;
  players: string;
  playTime: string;
  searchPlaceholder: string;
  selectedGame: string;
  close: string;
  chooseFile: string;
  sortBy: string;
  sortRating: string;
  sortWeight: string;
  sortName: string;
  sortRank: string;
  minutes: string;
  showMore: string;
  tapToHighlight: string;

  // BGG API & Token
  bggApiSettings: string;
  bggApiToken: string;
  bggTokenConfigured: string;
  bggTokenNotConfigured: string;
  saveToken: string;
  clearToken: string;
  tokenSaved: string;
  tokenCleared: string;
  tokenPlaceholder: string;
  bggDetails: string;
  categories: string;
  mechanics: string;
  designers: string;
  publishers: string;
  versions: string;
  description: string;
  loadingBggData: string;
  fetchBggError: string;
  showMoreDescription: string;
  showLessDescription: string;

  // Polls
  communityPolls: string;
  playerCountPoll: string;
  playerAgePoll: string;
  pollBest: string;
  pollRecommended: string;
  pollNotRecommended: string;
  votes: string;
  communitySuggested: string;

  // Zooming hints & actions
  zoomHintDesktop: string;
  zoomHintMobile: string;
  resetZoom: string;
  resetZoomTitle: string;
}

export const translationsPl: TranslationKeys = {
  title: "Kolekcja BGG",
  displayedGames: "Wyświetlono {counter} gier",
  or: " lub ",
  useMyCsv: "użyj mojego CSV",
  filter: "Filtruj:",
  baseGames: "Gry podstawowe",
  expansions: "Dodatki",
  options: "Opcje",
  resetPreferences: "Przywróć domyślne ustawienia",
  hideColumn: "Ukryj kolumnę",
  columnsMenu: "Kolumny",
  loadCsvTooltip: "Najpierw załaduj plik CSV",
  tooltipOptionsTitle: "Dymek na wykresie (tooltip)",
  tooltipOptionsHint: "Wybierz dane widoczne w dymku po najechaniu na grę na wykresie.",
  infoTitle: "Info:",
  infoTextPart1: "Ściągnij swoją kolekcję z bgg jako csv, a następnie wczytaj ja tu. Można to zrobić stąd, klikając ",
  infoTextClickHere: "tutaj",
  infoTextPart2: " i wpisując nazwę użytkownika.",
  howToUseTitle: "Sposób obsługi:",
  howToUseText: `<div class="help-section">
  <h3>Wczytywanie kolekcji</h3>
  <p>
    Aplikacja umożliwia wizualizację i analizę kolekcji gier planszowych wyeksportowanej z serwisu BoardGameGeek (BGG).
    Możesz wczytać własny plik CSV za pomocą przycisku <strong>Wybierz plik CSV</strong>, wyeksportować go bezpośrednio podając swój login w sekcji powyżej, albo kliknąć <strong>użyj mojego CSV</strong>, aby sprawdzić działanie na przykładowych danych.
  </p>
</div>

<div class="help-section">
  <h3>Wykres (ocena vs trudność)</h3>
  <p>
    Wykres punktowy przedstawia relację pomiędzy złożonością gry (oś X: ciężar od 1 do 5) a oceną społeczności BGG (oś Y: ocena od 1 do 10).
    Gry podstawowe oznaczone są kolorem różowym (koła), a dodatki kolorem niebieskim (kwadraty).
  </p>
  <ul>
    <li><strong>Powiększanie i przesuwanie:</strong> Użyj kółka myszy lub zaznacz obszar prostokątem, aby przybliżyć wybrany fragment wykresu. Przytrzymaj klawisz <em>Shift</em> i przeciągnij kursor, aby przesuwać widok. Na ekranach dotykowych użyj gestu zsunięcia/rozsunięcia palców.</li>
    <li><strong>Podświetlanie:</strong> Kliknięcie punktu na wykresie zaznacza grę i otwiera panel szczegółów, a także synchronizuje zaznaczenie w tabeli i widoku kart.</li>
  </ul>
</div>

<div class="help-section">
  <h3>Dymek informacyjny na wykresie (Tooltip) i menu „Opcje”</h3>
  <p>
    Po najechaniu kursorem na dowolny punkt wykresu pojawia się dymek ze szczegółowymi danymi o grze.
  </p>
  <p>
    <strong>Ważne:</strong> Menu <strong>Opcje</strong> (w prawym górnym rogu paska) służy <strong>wyłącznie do konfiguracji pól wyświetlanych w dymku na wykresie</strong>.
    Zaznaczenie lub odznaczenie pozycji w tym menu decyduje tylko o tym, jakie parametry zobaczysz po najechaniu na punkt na wykresie. Nie zmienia to widoczności kolumn w tabeli.
  </p>
</div>

<div class="help-section">
  <h3>Tabela gier i widoczność kolumn (AG-Grid)</h3>
  <p>
    Tabela pozwala na szczegółowe przeglądanie, wyszukiwanie i sortowanie danych.
  </p>
  <ul>
    <li><strong>Widoczność kolumn tabeli:</strong> Kolumny tabeli wybiera się <strong>wyłącznie z poziomu tabeli AG-Grid</strong>:
      poprzez menu kolumny (ikona trzech kropek ⋮ w nagłówku kolumny lub kliknięcie nagłówka prawym przyciskiem myszy) albo w bocznym panelu kolumn po prawej stronie siatki (na większych ekranach).
      Zmiana widoczności kolumn w tabeli nie wpływa na dymek wykresu.
    </li>
    <li><strong>Sortowanie i filtrowanie:</strong> Kliknij nagłówek kolumny, aby posortować dane. Pod nagłówkami dostępne są filtry tekstowe i liczbowe.</li>
    <li><strong>Interakcja:</strong> Kliknięcie wiersza zaznacza grę na wykresie, a dwuklik (lub opcja z menu pod prawym przyciskiem myszy) otwiera stronę gry na BGG.</li>
  </ul>
</div>

<div class="help-section">
  <h3>Widok kart i urządzenia mobilne</h3>
  <p>
    Zakładka <strong>Karty</strong> oferuje przejrzysty, kafelkowy układ gier z szybkim wyszukiwaniem i sortowaniem według oceny, trudności, nazwy lub rankingu BGG. Jest to szczególnie wygodny sposób przeglądania kolekcji na smartfonach.
  </p>
</div>

<div class="help-section">
  <h3>Filtrowanie typów gier i zapamiętywanie ustawień</h3>
  <p>
    Przełączniki <strong>Gry podstawowe</strong> i <strong>Dodatki</strong> na górnym pasku pozwalają natychmiast ograniczyć widok do wybranej grupy tytułów.
    Wszystkie Twoje preferencje — widoczność kolumn tabeli, pola dymka wykresu, filtry oraz tryb ciemny — są automatycznie zapisywane w pamięci przeglądarki. W każdej chwili możesz je przywrócić do stanu początkowego przyciskiem w menu Opcje.
  </p>
</div>`,
  switchToDark: "Przełącz na tryb ciemny",
  switchToLight: "Przełącz na tryb jasny",

  chartTitle: "Ocena na BGG vs Trudność",
  chartXAxis: "Ciężar (trudność)",
  chartYAxis: "Ocena BGG",
  chartSeriesGames: "Gry",
  chartSeriesExpansions: "Dodatki",
  enterNamePrompt: "Wpisz swoją nazwę użytkownika BGG:",
  csvErrorAlert: "Problem z plikiem CSV, czy na pewno pochodzi z BGG?",

  viewAll: "Wszystko",
  viewChart: "Wykres",
  viewCards: "Karty",
  viewTable: "Tabela",
  viewInfo: "Pomoc",
  openInBgg: "Otwórz na BGG",
  weight: "Ciężar",
  rating: "Ocena",
  players: "Gracze",
  playTime: "Czas",
  searchPlaceholder: "Szukaj gry...",
  selectedGame: "Wybrana gra",
  close: "Zamknij",
  chooseFile: "Wybierz plik CSV",
  sortBy: "Sortuj wg",
  sortRating: "Oceny (najwyższa)",
  sortWeight: "Trudności (najwyższa)",
  sortName: "Nazwy (A-Z)",
  sortRank: "Rankingu BGG",
  minutes: "min",
  showMore: "Pokaż więcej",
  tapToHighlight: "Dotknij punktu na wykresie, aby zobaczyć szczegóły gry.",
  zoomHintDesktop: "Zaznacz prostokąt lub użyj kółka myszy, aby przybliżyć. Przytrzymaj Shift i przeciągnij, aby przesuwać.",
  zoomHintMobile: "Zsuń/rozsuń palce (pinch), aby przybliżyć. Przeciągnij, aby przesuwać po powiększeniu.",
  resetZoom: "Resetuj powiększenie",
  resetZoomTitle: "Przywróć powiększenie 1:1",

  bggApiSettings: "Ustawienia BGG API",
  bggApiToken: "Token BGG API",
  bggTokenConfigured: "Token aktywny",
  bggTokenNotConfigured: "Brak tokenu",
  saveToken: "Zapisz",
  clearToken: "Usuń",
  tokenSaved: "Zapisano token BGG",
  tokenCleared: "Usunięto token BGG",
  tokenPlaceholder: "Wklej swój token z BGG...",
  bggDetails: "Szczegóły z BGG",
  categories: "Kategorie",
  mechanics: "Mechaniki",
  designers: "Twórcy",
  publishers: "Wydawcy",
  versions: "Wydania / Wersje",
  description: "Opis",
  loadingBggData: "Pobieranie danych z BGG...",
  fetchBggError: "Nie udało się pobrać danych z BGG",
  showMoreDescription: "Rozwiń opis",
  showLessDescription: "Zwiń opis",

  communityPolls: "Opinie społeczności BGG",
  playerCountPoll: "Liczba graczy",
  playerAgePoll: "Sugerowany wiek",
  pollBest: "Najlepsza",
  pollRecommended: "Polecana",
  pollNotRecommended: "Niepolecana",
  votes: "głosów",
  communitySuggested: "Społeczność",
};

export const translationsEn: TranslationKeys = {
  title: "BGG Collection Visualizer",
  displayedGames: "Displayed {counter} games",
  or: " or ",
  useMyCsv: "use my CSV",
  filter: "Filter:",
  baseGames: "Base games",
  expansions: "Expansions",
  options: "Options",
  resetPreferences: "Reset to default settings",
  hideColumn: "Hide column",
  columnsMenu: "Columns",
  loadCsvTooltip: "First load CSV file",
  tooltipOptionsTitle: "Chart tooltip content",
  tooltipOptionsHint: "Select data displayed in the tooltip when hovering over a game.",
  infoTitle: "Info:",
  infoTextPart1: "Download your collection from bgg as csv, then upload it here. It can be done from here, click ",
  infoTextClickHere: "here",
  infoTextPart2: " and input your user name.",
  howToUseTitle: "How to use:",
  howToUseText: `<div class="help-section">
  <h3>Loading your collection</h3>
  <p>
    This application visualizes and analyzes your board game collection exported from BoardGameGeek (BGG).
    You can load your own CSV file using the <strong>Choose CSV file</strong> button, export it directly by entering your BGG username in the prompt above, or click <strong>use my CSV</strong> to explore sample data.
  </p>
</div>

<div class="help-section">
  <h3>Scatter chart (Rating vs Complexity)</h3>
  <p>
    The scatter plot illustrates the relationship between game complexity (X-axis: weight from 1 to 5) and community rating (Y-axis: score from 1 to 10).
    Base games are displayed as magenta circles and expansions as blue squares.
  </p>
  <ul>
    <li><strong>Zooming and panning:</strong> Use the mouse wheel or click and drag a rectangle to zoom in. Hold the <em>Shift</em> key and drag to pan across the chart. On touch devices, pinch to zoom.</li>
    <li><strong>Selection:</strong> Clicking any point highlights the game, opens the detail preview pane, and syncs the selection across the table and cards view.</li>
  </ul>
</div>

<div class="help-section">
  <h3>Chart tooltip and the "Options" menu</h3>
  <p>
    Hovering over any point on the chart displays a tooltip with details about the game.
  </p>
  <p>
    <strong>Important:</strong> The <strong>Options</strong> menu (on the upper controls bar) is used <strong>strictly to configure fields displayed in the chart tooltip</strong>.
    Toggling options here decides only what information appears in the chart tooltip. It does not affect column visibility in the table.
  </p>
</div>

<div class="help-section">
  <h3>Game table and column visibility (AG-Grid)</h3>
  <p>
    The table provides comprehensive browsing, sorting, and filtering capabilities.
  </p>
  <ul>
    <li><strong>Table column visibility:</strong> Columns are configured <strong>only from within the AG-Grid table</strong>:
      either through the column menu (the three dots ⋮ icon on any column header or by right-clicking the header) or via the side tool panel on larger screens.
      Changing columns in the table does not affect the chart tooltip.
    </li>
    <li><strong>Sorting and filtering:</strong> Click any column header to sort. Use the filter row below the headers for quick filtering by text or numeric ranges.</li>
    <li><strong>Interaction:</strong> Clicking a row highlights the game on the chart; double-clicking (or using the right-click menu) opens the game's page on BGG.</li>
  </ul>
</div>

<div class="help-section">
  <h3>Cards view and mobile layout</h3>
  <p>
    The <strong>Cards</strong> tab provides an intuitive card-based layout featuring instant search and sorting by rating, complexity, title, or BGG rank. It is especially convenient on smartphones and smaller screens.
  </p>
</div>

<div class="help-section">
  <h3>Filters and saved preferences</h3>
  <p>
    Use the <strong>Base games</strong> and <strong>Expansions</strong> checkboxes to instantly include or exclude expansions.
    Your preferences — including table column visibility, chart tooltip fields, active filters, and dark mode — are automatically persisted in your browser. You can revert to defaults at any time using the reset button in the Options menu.
  </p>
</div>`,
  switchToDark: "Switch to dark mode",
  switchToLight: "Switch to light mode",

  chartTitle: "BGG Rating vs Complexity",
  chartXAxis: "Weight (complexity)",
  chartYAxis: "BGG Rating",
  chartSeriesGames: "Games",
  chartSeriesExpansions: "Expansions",
  enterNamePrompt: "Enter your BGG username:",
  csvErrorAlert: "Problem with CSV file, is it for sure from BGG?",

  viewAll: "All",
  viewChart: "Chart",
  viewCards: "Cards",
  viewTable: "Table",
  viewInfo: "Info",
  openInBgg: "Open on BGG",
  weight: "Weight",
  rating: "Rating",
  players: "Players",
  playTime: "Time",
  searchPlaceholder: "Search game...",
  selectedGame: "Selected game",
  close: "Close",
  chooseFile: "Choose CSV file",
  sortBy: "Sort by",
  sortRating: "Rating (highest)",
  sortWeight: "Weight (highest)",
  sortName: "Name (A-Z)",
  sortRank: "BGG Rank",
  minutes: "min",
  showMore: "Show more",
  tapToHighlight: "Tap a point on the chart to view game details.",
  zoomHintDesktop: "Drag to select an area or use mouse wheel to zoom. Hold Shift and drag to pan.",
  zoomHintMobile: "Pinch with two fingers to zoom. Drag to pan when zoomed.",
  resetZoom: "Reset zoom",
  resetZoomTitle: "Reset zoom level 1:1",

  bggApiSettings: "BGG API Settings",
  bggApiToken: "BGG API Token",
  bggTokenConfigured: "Token active",
  bggTokenNotConfigured: "No token",
  saveToken: "Save",
  clearToken: "Remove",
  tokenSaved: "BGG token saved",
  tokenCleared: "BGG token removed",
  tokenPlaceholder: "Paste your BGG token...",
  bggDetails: "BGG Details",
  categories: "Categories",
  mechanics: "Mechanics",
  designers: "Designers",
  publishers: "Publishers",
  versions: "Versions / Editions",
  description: "Description",
  loadingBggData: "Loading data from BGG...",
  fetchBggError: "Failed to fetch data from BGG",
  showMoreDescription: "Show more description",
  showLessDescription: "Show less description",

  communityPolls: "BGG Community Polls",
  playerCountPoll: "Player Count",
  playerAgePoll: "Suggested Age",
  pollBest: "Best",
  pollRecommended: "Recommended",
  pollNotRecommended: "Not recommended",
  votes: "votes",
  communitySuggested: "Community",
};

import { Injectable, computed, signal } from '@angular/core';

export type AppLanguage = 'pl' | 'en';
export const BGG_APP_LANG_STORAGE_KEY = 'bgg_app_lang';

export function getInitialLanguage(): AppLanguage {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(BGG_APP_LANG_STORAGE_KEY);
      if (saved === 'pl' || saved === 'en') {
        return saved;
      }
    }
    const browserLang = (typeof navigator !== 'undefined' ? navigator.language : 'en-US') || 'en-US';
    return browserLang.toLowerCase().startsWith('pl') ? 'pl' : 'en';
  } catch {
    return 'en';
  }
}

@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly langSignal = signal<AppLanguage>(getInitialLanguage());

  readonly currentLang = this.langSignal.asReadonly();
  readonly t = computed(() => (this.langSignal() === 'pl' ? translationsPl : translationsEn));

  setLanguage(lang: AppLanguage): void {
    if (this.langSignal() === lang) return;
    this.langSignal.set(lang);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(BGG_APP_LANG_STORAGE_KEY, lang);
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }
}

export function getActiveTranslations(lang?: AppLanguage): TranslationKeys {
  const selected = lang || getInitialLanguage();
  return selected === 'pl' ? translationsPl : translationsEn;
}

export const AG_GRID_LOCALE_PL: Record<string, string> = {
  selectAll: '(Zaznacz wszystko)',
  selectAllSearchResults: '(Zaznacz wszystkie wyniki wyszukiwania)',
  searchOoo: 'Szukaj...',
  blanks: '(Puste)',
  noMatches: 'Brak pasujących pozycji',
  filterOoo: 'Filtruj...',
  applyFilter: 'Zastosuj',
  resetFilter: 'Wyczyść',
  clearFilter: 'Wyczyść',
  cancelFilter: 'Anuluj',
  textFilter: 'Filtr tekstowy',
  numberFilter: 'Filtr liczbowy',
  setFilter: 'Lista wartości',
  contains: 'Zawiera',
  notContains: 'Nie zawiera',
  startsWith: 'Zaczyna się od',
  endsWith: 'Kończy się na',
  equals: 'Równe',
  notEqual: 'Różne od',
  lessThan: 'Mniejsze niż',
  lessThanOrEqual: 'Mniejsze lub równe',
  greaterThan: 'Większe niż',
  greaterThanOrEqual: 'Większe lub równe',
  inRange: 'W przedziale',
  inRangeStart: 'Od',
  inRangeEnd: 'Do',
  andCondition: 'ORAZ',
  orCondition: 'LUB',

  // Row grouping & Aggregations
  rowGroupColumnsEmptyMessage: 'Przeciągnij tutaj nagłówek kolumny, aby pogrupować wiersze',
  groups: 'Grupy',
  group: 'Grupa',
  values: 'Wartości',
  pivots: 'Etykiety kolumn',
  pivotMode: 'Tryb przestawny',
  avg: 'Średnia',
  sum: 'Suma',
  min: 'Min',
  max: 'Maks',
  count: 'Liczba',
  totalRows: 'Wszystkie wiersze',
  totalAndFilteredRows: 'Wiersze',
  grandTotal: 'Łącznie',

  // SideBar & Tool Panels
  columns: 'Kolumny',
  filters: 'Filtry',
  pinColumn: 'Przypnij kolumnę',
  valueAggregation: 'Agregacja wartości',
  autosizeThiscolumn: 'Dopasuj tę kolumnę',
  autosizeAllColumns: 'Dopasuj wszystkie kolumny',
  resetColumns: 'Resetuj kolumny',
  expandAll: 'Rozwiń wszystko',
  collapseAll: 'Zwiń wszystko',
  toolPanels: 'Panele boczne',

  // Context Menu
  copy: 'Kopiuj',
  copyWithHeaders: 'Kopiuj z nagłówkami',
  ctrlC: 'Ctrl+C',
  ctrlV: 'Ctrl+V',
};

