import { Injectable, computed, signal } from '@angular/core';
import { ColDef, ITooltipParams, ValueFormatterParams } from 'ag-grid-community';
import { CheckboxOption } from '../models';
import {
  formatNumberPrecision,
  getColumnAggFunc,
  getColumnDataType,
  getColumnFilter,
  getColumnFilterParams,
  getColumnLabel,
  isColumnRowGroupEnabled,
  isColumnValueEnabled,
  tableConfig,
} from '../tableConfig';
import { AppLanguage } from '../i18n';

@Injectable({
  providedIn: 'root',
})
export class ColumnConfigService {
  readonly checkboxOptions = signal<CheckboxOption[]>(this.buildInitialCheckboxOptions('pl'));

  readonly visibleColumns = computed<Set<string>>(() => {
    const set = new Set<string>();
    for (const option of this.checkboxOptions()) {
      if (option.visible) {
        set.add(option.key);
      }
    }
    return set;
  });

  buildInitialCheckboxOptions(lang: AppLanguage): CheckboxOption[] {
    return Object.keys(tableConfig).map((key) => ({
      key,
      visible: tableConfig[key].visible,
      translation: getColumnLabel(key, lang) || key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }

  applyStoredVisibility(columnVisibility?: Record<string, boolean>): void {
    if (!columnVisibility) return;
    this.checkboxOptions.update((options) =>
      options.map((option) => {
        if (option.key in columnVisibility) {
          return { ...option, visible: columnVisibility[option.key] };
        }
        return option;
      })
    );
  }

  syncColumnVisibility(colId: string, visible: boolean): boolean {
    const options = this.checkboxOptions();
    const option = options.find((o) => o.key === colId);
    if (!option || option.visible === visible) {
      return false;
    }

    this.checkboxOptions.set(
      options.map((o) => (o.key === colId ? { ...o, visible } : o))
    );
    return true;
  }

  updateLanguage(lang: AppLanguage): void {
    this.checkboxOptions.update((options) =>
      options.map((option) => ({
        ...option,
        translation: getColumnLabel(option.key, lang) || option.key.charAt(0).toUpperCase() + option.key.slice(1),
      }))
    );
  }

  resetToDefaults(lang: AppLanguage): void {
    this.checkboxOptions.set(this.buildInitialCheckboxOptions(lang));
  }

  generateColumnDefs(
    firstRow: Record<string, any> | undefined,
    lang: AppLanguage,
    screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  ): ColDef[] {
    const isMobile = screenWidth < 768;
    const isSmallDesktop = screenWidth < 1100;
    const shouldPinName = screenWidth >= 1024;
    const visibleCols = this.visibleColumns();

    const columnNames = Object.keys(firstRow || {}).map((key) => {
      const type = getColumnDataType(key);
      const isNumber = type === 'number';
      const filter = getColumnFilter(key);
      const filterParams = getColumnFilterParams(key);
      const enableRowGroup = isColumnRowGroupEnabled(key);
      const enableValue = isColumnValueEnabled(key);
      const aggFunc = getColumnAggFunc(key);
      const label = getColumnLabel(key, lang) || key.charAt(0).toUpperCase() + key.slice(1);

      return {
        field: key,
        headerName: label,
        headerTooltip: label,
        filter,
        filterParams,
        enableRowGroup,
        enableValue,
        aggFunc,
        sortable: true,
        wrapHeaderText: true,
        autoHeaderHeight: true,
        minWidth: key === 'objectname' ? (isMobile ? 180 : 200) : (isSmallDesktop ? 100 : 80),
        width: isSmallDesktop ? (key === 'objectname' ? 200 : 110) : undefined,
        hide: !visibleCols.has(key),
        floatingFilter: true,
        cellDataType: type,
        valueFormatter: isNumber
          ? (params: ValueFormatterParams) => formatNumberPrecision(params.value, 2)
          : undefined,
        tooltipValueGetter: (params: ITooltipParams) => {
          if (params.value == null || params.value === '') return undefined;
          return isNumber ? formatNumberPrecision(params.value, 2) : String(params.value);
        },
      } as ColDef;
    });

    columnNames.forEach((col) => {
      if (col.field === 'objectname') {
        col.pinned = shouldPinName ? 'left' : null;
        col.lockPinned = shouldPinName;
        col.lockVisible = true;
      }
    });

    return columnNames;
  }
}
