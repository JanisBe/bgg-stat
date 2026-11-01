export interface DataPoint {
  x: number;
  y: number;
  objectname: string;
  name?: string;
  objectid?: string | number;
  url?: string;
  originalname?: string;
  average?: number | string;
  avgweight?: number | string;
  rank?: number | string;
  bggbestplayers?: string;
  bggrecplayers?: string;
  minplayers?: number | string;
  maxplayers?: number | string;
  playingtime?: number | string;
  yearpublished?: number | string;
  itemtype?: string;
  bggrecagerange?: number | string;
  [key: string]: any;
}

export type StringKeyValueMap = {
  [key: string]: string;
};

export interface CheckboxOption {
  key: string;
  visible: boolean;
  translation: string;
}

export interface ColumnMenuState {
  open: boolean;
  x: number;
  y: number;
  colId: string | null;
}

