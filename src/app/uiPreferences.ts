import { ColumnState } from 'ag-grid-community';

const STORAGE_KEY = 'bgg-stat-ui-preferences';

export interface UiPreferences {
  columnVisibility: Record<string, boolean>;
  showStandalone: boolean;
  showExpansions: boolean;
  filterModel: Record<string, unknown> | null;
  columnState: ColumnState[];
}

export function hasUiPreferences(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

export function loadUiPreferences(): UiPreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as UiPreferences;
  } catch {
    return null;
  }
}

export function saveUiPreferences(prefs: UiPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota / private browsing errors
  }
}

export function clearUiPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
