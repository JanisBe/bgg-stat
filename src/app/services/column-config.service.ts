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
  /** Table column options (configured in AG-Grid only) */
  readonly tableColumnOptions = signal<CheckboxOption[]>(this.buildInitialTableOptions('pl'));

  /** Tooltip fields options (configured in "Opcje" only, excludes objectname which is always the title header) */
  readonly tooltipOptions = signal<CheckboxOption[]>(this.buildInitialTooltipOptions('pl'));

  /** Backward-compatibility alias for tooltip options */
  readonly checkboxOptions = this.tooltipOptions;

  /** Set of visible table column keys */
  readonly visibleTableColumns = computed<Set<string>>(() => {
    const set = new Set<string>();
    for (const option of this.tableColumnOptions()) {
      if (option.visible) {
        set.add(option.key);
      }
    }
    return set;
  });

  /** Set of visible tooltip field keys */
  readonly visibleTooltipColumns = computed<Set<string>>(() => {
    const set = new Set<string>();
    for (const option of this.tooltipOptions()) {
      if (option.visible) {
        set.add(option.key);
      }
    }
    return set;
  });

  /** Backward-compatibility alias for visible tooltip columns */
  readonly visibleColumns = this.visibleTooltipColumns;

  buildInitialTableOptions(lang: AppLanguage): CheckboxOption[] {
    return Object.keys(tableConfig).map((key) => ({
      key,
      visible: tableConfig[key].visible,
      translation: getColumnLabel(key, lang) || key.charAt(0).toUpperCase() + key.slice(1),
    }));
  }

  buildInitialTooltipOptions(lang: AppLanguage): CheckboxOption[] {
    return Object.keys(tableConfig)
      .filter((key) => key !== 'objectname')
      .map((key) => ({
        key,
        visible: tableConfig[key].visible,
        translation: getColumnLabel(key, lang) || key.charAt(0).toUpperCase() + key.slice(1),
      }));
  }

  buildInitialOptions(lang: AppLanguage): CheckboxOption[] {
    return this.buildInitialTableOptions(lang);
  }

  /** Backward-compatibility method alias */
  buildInitialCheckboxOptions(lang: AppLanguage): CheckboxOption[] {
    return this.buildInitialOptions(lang);
  }

  applyStoredTableVisibility(columnVisibility?: Record<string, boolean>): void {
    if (!columnVisibility) return;
    this.tableColumnOptions.update((options) =>
      options.map((option) => {
        if (option.key in columnVisibility) {
          return { ...option, visible: columnVisibility[option.key] };
        }
        return option;
      })
    );
  }

  applyStoredTooltipVisibility(tooltipVisibility?: Record<string, boolean>): void {
    if (!tooltipVisibility) return;
    this.tooltipOptions.update((options) =>
      options.map((option) => {
        if (option.key in tooltipVisibility) {
          return { ...option, visible: tooltipVisibility[option.key] };
        }
        return option;
      })
    );
  }

  /** Backward-compatibility method for restoring visibility */
  applyStoredVisibility(columnVisibility?: Record<string, boolean>): void {
    this.applyStoredTableVisibility(columnVisibility);
    this.applyStoredTooltipVisibility(columnVisibility);
  }

  syncTableColumnVisibility(colId: string, visible: boolean): boolean {
    const options = this.tableColumnOptions();
    const option = options.find((o) => o.key === colId);
    if (!option || option.visible === visible) {
      return false;
    }

    this.tableColumnOptions.set(
      options.map((o) => (o.key === colId ? { ...o, visible } : o))
    );
    return true;
  }

  syncTooltipVisibility(colId: string, visible: boolean): boolean {
    const options = this.tooltipOptions();
    const option = options.find((o) => o.key === colId);
    if (!option || option.visible === visible) {
      return false;
    }

    this.tooltipOptions.set(
      options.map((o) => (o.key === colId ? { ...o, visible } : o))
    );
    return true;
  }

  /** Backward-compatibility method */
  syncColumnVisibility(colId: string, visible: boolean): boolean {
    return this.syncTableColumnVisibility(colId, visible);
  }

  updateLanguage(lang: AppLanguage): void {
    const updateOptions = (options: CheckboxOption[]) =>
      options.map((option) => ({
        ...option,
        translation: getColumnLabel(option.key, lang) || option.key.charAt(0).toUpperCase() + option.key.slice(1),
      }));

    this.tableColumnOptions.update(updateOptions);
    this.tooltipOptions.update(updateOptions);
  }

  resetToDefaults(lang: AppLanguage): void {
    this.tableColumnOptions.set(this.buildInitialTableOptions(lang));
    this.tooltipOptions.set(this.buildInitialTooltipOptions(lang));
  }

  generateColumnDefs(
    firstRow: Record<string, any> | undefined,
    lang: AppLanguage,
    screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  ): ColDef[] {
    const isMobile = screenWidth < 768;
    const isSmallDesktop = screenWidth < 1100;
    const shouldPinName = screenWidth >= 1024;
    const visibleCols = this.visibleTableColumns();

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
