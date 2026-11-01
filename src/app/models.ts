export interface DataPoint {
  bggrecagerange?: number | string;
  [key: string]: any;
  x: number;
  y: number;
  objectname: string;
  objectid?: string | number;
  url?: string;
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

