import { GridOptions, ITooltipParams } from 'ag-grid-community';
import { AppLanguage } from './i18n';

export type ColumnDataType = 'number' | 'boolean' | 'text';

export type ColumnFilterType =
  | 'agSetColumnFilter'
  | 'agNumberColumnFilter'
  | 'agTextColumnFilter'
  | 'agMultiColumnFilter';

export interface ColumnDefinition {
  visible: boolean;
  type?: ColumnDataType;
  filter?: ColumnFilterType;
  filterParams?: Record<string, any>;
  enableRowGroup?: boolean;
  enableValue?: boolean;
  aggFunc?: string;
  label: {
    pl: string;
    en: string;
  };
}

export type TableConfig = Record<string, ColumnDefinition>;
/** Legacy alias for TableConfig */
export type TooltipName = TableConfig;

export const tableConfig: TableConfig = {
  objectname: {
    visible: true,
    type: 'text',
    filter: 'agTextColumnFilter',
    label: { pl: 'Nazwa', en: 'Name' },
  },
  average: {
    visible: true,
    type: 'number',
    filter: 'agNumberColumnFilter',
    enableValue: true,
    aggFunc: 'avg',
    label: { pl: 'Średnia', en: 'Average rating' },
  },
  avgweight: {
    visible: true,
    type: 'number',
    filter: 'agNumberColumnFilter',
    enableValue: true,
    aggFunc: 'avg',
    label: { pl: 'Średnia waga', en: 'Average weight' },
  },
  rank: {
    visible: true,
    type: 'number',
    filter: 'agNumberColumnFilter',
    enableValue: true,
    aggFunc: 'min',
    label: { pl: 'Miejsce w rankingu', en: 'Rank' },
  },
  objecttype: {
    visible: false,
    type: 'text',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Typ obiektu', en: 'Object type' },
  },
  bggbestplayers: {
    visible: true,
    type: 'text',
    filter: 'agMultiColumnFilter',
    filterParams: {
      filters: [
        { filter: 'agTextColumnFilter', filterParams: { defaultOption: 'contains' } },
        { filter: 'agSetColumnFilter' },
      ],
    },
    enableRowGroup: true,
    label: { pl: 'Najlepiej dla (BGG)', en: 'Best for (BGG)' },
  },
  rating: {
    visible: true,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    enableValue: true,
    aggFunc: 'avg',
    label: { pl: 'Ocena', en: 'Rating' },
  },
  weight: {
    visible: false,
    type: 'number',
    filter: 'agNumberColumnFilter',
    enableValue: true,
    aggFunc: 'avg',
    label: { pl: 'Waga', en: 'Weight' },
  },
  baverage: {
    visible: true,
    type: 'number',
    filter: 'agNumberColumnFilter',
    enableValue: true,
    aggFunc: 'avg',
    label: { pl: 'Średnia (BGG)', en: 'Average (BGG)' },
  },
  originalname: {
    visible: false,
    type: 'text',
    filter: 'agTextColumnFilter',
    label: { pl: 'Nazwa oryginalna', en: 'Original name' },
  },
  minplayers: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Min. graczy', en: 'Min players' },
  },
  maxplayers: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Maks. graczy', en: 'Max players' },
  },
  playingtime: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Czas gry', en: 'Playing time' },
  },
  maxplaytime: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Maks. czas gry', en: 'Max play time' },
  },
  minplaytime: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Min. czas gry', en: 'Min play time' },
  },
  yearpublished: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Rok wydania', en: 'Year published' },
  },
  bggrecplayers: {
    visible: false,
    type: 'text',
    filter: 'agMultiColumnFilter',
    filterParams: {
      filters: [
        { filter: 'agTextColumnFilter', filterParams: { defaultOption: 'contains' } },
        { filter: 'agSetColumnFilter' },
      ],
    },
    enableRowGroup: true,
    label: { pl: 'Liczba graczy (rekomendacja)', en: 'Recommended players' },
  },
  bggrecagerange: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Wiek (BGG)', en: 'Age (BGG)' },
  },
  bgglanguagedependence: {
    visible: false,
    type: 'text',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Zależności językowe', en: 'Language dependence' },
  },
  itemtype: {
    visible: false,
    type: 'text',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Rodzaj gry', en: 'Item type' },
  },
  objectid: {
    visible: false,
    type: 'number',
    filter: 'agNumberColumnFilter',
    label: { pl: 'BGG ID', en: 'BGG ID' },
  },
  comment: {
    visible: false,
    type: 'text',
    filter: 'agTextColumnFilter',
    label: { pl: 'Komentarz', en: 'Comment' },
  },
  year: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Rok', en: 'Year' },
  },
  numplays: {
    visible: false,
    type: 'number',
    filter: 'agNumberColumnFilter',
    enableValue: true,
    aggFunc: 'sum',
    label: { pl: 'Liczba partii', en: 'Number of plays' },
  },
  own: {
    visible: false,
    type: 'boolean',
    label: { pl: 'Posiadane', en: 'Owned' },
  },
  fortrade: {
    visible: false,
    type: 'boolean',
    label: { pl: 'Na wymianę', en: 'For trade' },
  },
  want: {
    visible: false,
    type: 'boolean',
    label: { pl: 'Poszukiwane', en: 'Want in trade' },
  },
  wanttobuy: {
    visible: false,
    type: 'boolean',
    label: { pl: 'Chcę kupić', en: 'Want to buy' },
  },
  wanttoplay: {
    visible: false,
    type: 'boolean',
    label: { pl: 'Chcę zagrać', en: 'Want to play' },
  },
  prevowned: {
    visible: false,
    type: 'boolean',
    label: { pl: 'Wcześniej posiadane', en: 'Previously owned' },
  },
  preordered: {
    visible: false,
    type: 'boolean',
    label: { pl: 'W przedsprzedaży', en: 'Preordered' },
  },
  wishlist: {
    visible: false,
    type: 'boolean',
    label: { pl: 'Lista życzeń', en: 'Wishlist' },
  },
  wishlistpriority: {
    visible: false,
    type: 'number',
    label: { pl: 'Priorytet listy życzeń', en: 'Wishlist priority' },
  },
  wishlistcomment: {
    visible: false,
    type: 'text',
    label: { pl: 'Komentarz listy życzeń', en: 'Wishlist comment' },
  },
  conditiontext: {
    visible: false,
    type: 'text',
    label: { pl: 'Stan egzemplarza', en: 'Condition' },
  },
  haspartslist: {
    visible: false,
    type: 'text',
    label: { pl: 'Lista części (posiada)', en: 'Has parts list' },
  },
  wantpartslist: {
    visible: false,
    type: 'text',
    label: { pl: 'Lista części (chcę)', en: 'Want parts list' },
  },
  collid: {
    visible: false,
    type: 'number',
    label: { pl: 'ID kolekcji', en: 'Collection ID' },
  },
  numowned: {
    visible: false,
    type: 'number',
    label: { pl: 'Liczba posiadaczy', en: 'Number owned' },
  },
  publisherid: {
    visible: false,
    type: 'text',
    label: { pl: 'ID wydawcy', en: 'Publisher ID' },
  },
  imageid: {
    visible: false,
    type: 'text',
    label: { pl: 'ID obrazka', en: 'Image ID' },
  },
  language: {
    visible: false,
    type: 'text',
    label: { pl: 'Język', en: 'Language' },
  },
  other: {
    visible: false,
    type: 'text',
    label: { pl: 'Inne', en: 'Other' },
  },
  barcode: {
    visible: false,
    type: 'text',
    label: { pl: 'Kod kreskowy', en: 'Barcode' },
  },
  pricepaid: {
    visible: false,
    type: 'number',
    label: { pl: 'Zapłacona cena', en: 'Price paid' },
  },
  pp_currency: {
    visible: false,
    type: 'text',
    label: { pl: 'Waluta zakupu', en: 'Price currency' },
  },
  currvalue: {
    visible: false,
    type: 'number',
    label: { pl: 'Aktualna wartość', en: 'Current value' },
  },
  cv_currency: {
    visible: false,
    type: 'text',
    label: { pl: 'Waluta wartości', en: 'Value currency' },
  },
  acquisitiondate: {
    visible: false,
    type: 'text',
    label: { pl: 'Data nabycia', en: 'Acquisition date' },
  },
  acquiredfrom: {
    visible: false,
    type: 'text',
    label: { pl: 'Źródło nabycia', en: 'Acquired from' },
  },
  quantity: {
    visible: false,
    type: 'number',
    label: { pl: 'Liczba sztuk', en: 'Quantity' },
  },
  privatecomment: {
    visible: false,
    type: 'text',
    label: { pl: 'Prywatny komentarz', en: 'Private comment' },
  },
  invlocation: {
    visible: false,
    type: 'text',
    label: { pl: 'Lokalizacja', en: 'Inventory location' },
  },
  invdate: {
    visible: false,
    type: 'text',
    label: { pl: 'Data inwentaryzacji', en: 'Inventory date' },
  },
  version_publishers: {
    visible: false,
    type: 'text',
    label: { pl: 'Wydawcy wydania', en: 'Version publishers' },
  },
  version_languages: {
    visible: false,
    type: 'text',
    label: { pl: 'Języki wydania', en: 'Version languages' },
  },
  version_yearpublished: {
    visible: false,
    type: 'number',
    filter: 'agSetColumnFilter',
    enableRowGroup: true,
    label: { pl: 'Rok wydania wersji', en: 'Version year published' },
  },
  version_nickname: {
    visible: false,
    type: 'text',
    label: { pl: 'Nazwa wydania', en: 'Version nickname' },
  },
};

export function getColumnLabel(key: string, lang: AppLanguage = 'pl'): string {
  const col = tableConfig[key];
  if (!col) return key;
  return col.label[lang] || col.label.en || col.label.pl || key;
}

export function getColumnDataType(key: string): ColumnDataType {
  return tableConfig[key]?.type ?? 'text';
}

export function getColumnFilter(key: string): ColumnFilterType {
  const col = tableConfig[key];
  if (col?.filter) return col.filter;
  const type = getColumnDataType(key);
  if (type === 'number') return 'agNumberColumnFilter';
  return 'agTextColumnFilter';
}

export function getColumnFilterParams(key: string): Record<string, any> | undefined {
  return tableConfig[key]?.filterParams;
}

export function isColumnRowGroupEnabled(key: string): boolean {
  return !!tableConfig[key]?.enableRowGroup;
}

export function isColumnValueEnabled(key: string): boolean {
  return !!tableConfig[key]?.enableValue;
}

export function getColumnAggFunc(key: string): string | undefined {
  return tableConfig[key]?.aggFunc;
}

export function formatNumberPrecision(value: any, decimals = 2): string {
  if (value == null || value === '') return '';
  const num = typeof value === 'number' ? value : Number.parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return Number.isInteger(num) ? num.toString() : num.toFixed(decimals);
}

// ==========================================
// AG-Grid Default Configuration
// ==========================================

export const gridOptions: GridOptions = {
  tooltipShowDelay: 300,
  defaultColDef: {
    sortable: true,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    suppressHeaderFilterButton: true,
    suppressHeaderContextMenu: true,
    tooltipValueGetter: (params: ITooltipParams) => {
      if (params.value == null || params.value === '') return undefined;
      return formatNumberPrecision(params.value, 2);
    },
  },
  autoSizeStrategy: {
    type: 'fitGridWidth',
    defaultMinWidth: 90,
    columnLimits: [
      {
        colId: 'objectname',
        minWidth: 200,
      },
    ],
  },
};
