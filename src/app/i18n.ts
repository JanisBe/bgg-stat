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
  infoTitle: "Info:",
  infoTextPart1: "Ściągnij swoją kolekcję z bgg jako csv, a następnie wczytaj ja tu. Można to zrobić stąd, klikając ",
  infoTextClickHere: "tutaj",
  infoTextPart2: " i wpisując nazwę użytkownika.",
  howToUseTitle: "Sposób obsługi:",
  howToUseText: `Gdy wgrasz plik csv, wyświetli się wykres ciężar (weight) vs średnia ocena z BGG oraz tabelka z wczytanymi grami.<br>Tabelkę można sortować oraz filtrować.<br>Gdy klikniesz w wiersz zawierający jakąś grę, podświetli się ona na wykresie.<br>Kolumny można ukrywać i pokazywać przez ikonę ⋮ lub PPM na nagłówku kolumny, albo w opcjach (po prawej).<br>W filtrze można odhaczyć pokazywanie gier podstawowych i dodatków.`,
  switchToDark: "Przełącz na tryb ciemny",
  switchToLight: "Przełącz na tryb jasny",

  chartTitle: "Ocena na BGG vs Trudność",
  chartXAxis: "Ciężar (trudność)",
  chartYAxis: "Ocena BGG",
  chartSeriesGames: "Gry",
  chartSeriesExpansions: "Dodatki",
  enterNamePrompt: "Wpisz swoją nazwę użytkownika BGG:",
  csvErrorAlert: "Problem z plikiem CSV, czy na pewno pochodzi z BGG?",

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
};

export const translationsEn: TranslationKeys = {
  title: "BGG Collection",
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
  infoTitle: "Info:",
  infoTextPart1: "Download your collection from bgg as csv, then upload it here. It can be done from here, click ",
  infoTextClickHere: "here",
  infoTextPart2: " and input your user name.",
  howToUseTitle: "How to use:",
  howToUseText: `When you upload csv file, you'll see a graph of weight vs average score from BGG and a table containing uploaded games.<br>The table can be sorted and filtered.<br>When you click on a row containing a game, it'll be highlighted on a graph.<br>Columns can be shown or hidden via the ⋮ icon or right-click on a column header, or from the options panel (on the right).<br>Use the filter bar to include or exclude base games and expansions.`,
  switchToDark: "Switch to dark mode",
  switchToLight: "Switch to light mode",

  chartTitle: "BGG Rating vs Complexity",
  chartXAxis: "Weight (complexity)",
  chartYAxis: "BGG Rating",
  chartSeriesGames: "Games",
  chartSeriesExpansions: "Expansions",
  enterNamePrompt: "Enter your BGG username:",
  csvErrorAlert: "Problem with CSV file, is it for sure from BGG?",

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
};

export function getActiveTranslations(): TranslationKeys {
  const browserLang = (navigator.language || 'en-US').toLowerCase();
  // Poland uses pl-PL. Any other browser language is defaulted to en-US.
  if (browserLang.startsWith('pl')) {
    return translationsPl;
  }
  return translationsEn;
}
