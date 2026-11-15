import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ViewChild,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  AllCommunityModule,
  ColDef,
  ColumnHeaderContextMenuEvent,
  ColumnVisibleEvent,
  DefaultMenuItem,
  GetContextMenuItemsParams,
  GridApi,
  GridReadyEvent,
  isColumn,
  MenuItemDef,
  ModuleRegistry,
  provideGlobalGridOptions,
  RowClassParams,
  RowClickedEvent,
  RowDoubleClickedEvent,
  RowStyle,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';

import { LicenseKey } from './license';
import { gridOptions } from './tableConfig';
import { AG_GRID_LOCALE_PL, AppLanguage, I18nService } from './i18n';
import { InnerHeaderComponent } from './inner-header.component';
import { ColumnMenuRequest } from './column-menu.service';

import { DoubleTapDetector, isTouchDevice } from './utils/touch.utils';

LicenseManager.setLicenseKey(LicenseKey);
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
provideGlobalGridOptions({ theme: 'legacy' });

@Component({
  selector: 'app-game-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      #agGrid
      (columnHeaderContextMenu)="onColumnHeaderContextMenu($event)"
      (columnMoved)="gridStateChange.emit()"
      (columnResized)="gridStateChange.emit()"
      (columnVisible)="columnVisible.emit($event)"
      (filterChanged)="onAgFilterChanged()"
      (gridReady)="onGridReady($event)"
      (rowClicked)="onRowClicked($event)"
      (rowDoubleClicked)="onRowDoubleClicked($event)"
      (sortChanged)="gridStateChange.emit()"
      [columnDefs]="columnDefs()"
      [columnHoverHighlight]="true"
      [getRowStyle]="rowStyle"
      [gridOptions]="effectiveGridOptions"
      [rowData]="rowData()"
      [class.ag-theme-alpine]="!isDarkMode()"
      [class.ag-theme-alpine-dark]="isDarkMode()"
      class="grid-container"
    />
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .grid-container {
      width: 100%;
      height: 540px;
      margin: var(--space-xs) 0;
      box-sizing: border-box;
    }

    .ag-header-cell:hover .ag-header-cell-text {
      position: absolute;
      background: var(--color-sheet);
      color: var(--color-ink);
      padding: var(--space-2xs) var(--space-xs);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-card);
      z-index: var(--z-dropdown);
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 220px;
    }
  `],
})
export class GameTableComponent {
  private readonly i18n = inject(I18nService);
  private readonly doubleTapDetector = new DoubleTapDetector();

  readonly rowData = input<any[]>([]);
  readonly columnDefs = input<ColDef[]>([]);
  readonly isDarkMode = input<boolean>(false);
  readonly currentLang = input<AppLanguage>('pl');
  readonly showStandalone = input<boolean>(true);
  readonly showExpansions = input<boolean>(false);
  readonly selectedObjectId = input<string | number | null | undefined>(null);

  readonly rowSelect = output<any>();
  readonly gameOpenBgg = output<string | number>();
  readonly filteredDataChange = output<any[]>();
  readonly gridStateChange = output<void>();
  readonly columnVisible = output<ColumnVisibleEvent>();
  readonly columnMenuOpen = output<ColumnMenuRequest>();

  @ViewChild('agGrid') agGrid!: AgGridAngular;

  private gridApi?: GridApi;
  private lastContextMenuX = 0;
  private lastContextMenuY = 0;

  readonly effectiveGridOptions = {
    ...gridOptions,
    autoSizeStrategy:
      typeof window !== 'undefined' && window.innerWidth >= 1100
        ? gridOptions.autoSizeStrategy
        : undefined,
    localeText: this.i18n.currentLang() === 'pl' ? AG_GRID_LOCALE_PL : undefined,
    rowGroupPanelShow: 'never' as const,
    groupDefaultExpanded: 1,
    sideBar:
      typeof window !== 'undefined' && window.innerWidth >= 1024
        ? {
          toolPanels: [
            {
              id: 'columns',
              labelDefault: 'Kolumny',
              labelKey: 'columns',
              iconKey: 'columns',
              toolPanel: 'agColumnsToolPanel',
              toolPanelParams: {
                suppressRowGroups: true,
                suppressValues: true,
                suppressPivots: true,
                suppressPivotMode: true,
                suppressColumnFilter: false,
                suppressColumnSelectAll: false,
                suppressColumnExpandAll: true,
              },
            },
            {
              id: 'filters',
              labelDefault: 'Filtry',
              labelKey: 'filters',
              iconKey: 'filter',
              toolPanel: 'agFiltersToolPanel',
            },
          ],
        }
        : false,
    getContextMenuItems: (params: GetContextMenuItemsParams): (DefaultMenuItem | MenuItemDef)[] => {
      const isPl = this.i18n.currentLang() === 'pl';
      const game = params.node?.data;
      const objectId = game?.objectid;
      const gameName = game?.objectname || game?.name;

      const items: (DefaultMenuItem | MenuItemDef)[] = [];

      if (objectId) {
        items.push({
          name: isPl ? `Otwórz „${gameName ?? 'grę'}” na BGG` : `Open "${gameName ?? 'game'}" on BGG`,
          action: () => this.gameOpenBgg.emit(objectId),
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
        }, {
          name: isPl ? 'Pokaż szczegóły gry' : 'Show game details',
          action: () => this.rowSelect.emit(game),
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        }, 'separator');
      }

      items.push('copy', 'copyWithHeaders');

      return items;
    },
    autoGroupColumnDef: {
      headerName: this.i18n.currentLang() === 'pl' ? 'Grupa' : 'Group',
      minWidth: 260,
      pinned: 'left' as const,
      cellRendererParams: {
        suppressCount: false,
      },
    },
    defaultColDef: {
      ...gridOptions.defaultColDef,
      innerHeaderComponent: InnerHeaderComponent,
    },
    isExternalFilterPresent: () => true,
    doesExternalFilterPass: (node: any) => {
      if (node.group) return true;
      const type = node.data?.itemtype;
      if (type === 'standalone') return this.showStandalone();
      if (type === 'expansion') return this.showExpansions();
      return true;
    },
  };

  rowStyle = (params: RowClassParams): RowStyle | undefined => {
    if (params.node.group) {
      return undefined;
    }
    if (params.data?.itemtype === 'expansion') {
      return { background: this.isDarkMode() ? '#3a4046' : '#c8c8c8' };
    }
    return { background: this.isDarkMode() ? '#22262a' : '#ececec' };
  };

  constructor() {
    effect(() => {
      const selectedId = this.selectedObjectId();
      if (this.gridApi) {
        if (!selectedId) {
          this.gridApi.deselectAll();
        } else {
          this.gridApi.forEachNode((node) => {
            node.setSelected(node.data?.objectid === selectedId);
          });
        }
      }
    });

    effect(() => {
      // Re-trigger row redraw when dark mode changes
      this.isDarkMode();
      this.gridApi?.redrawRows();
    });

    effect(() => {
      // Re-trigger external filter when standalone/expansions flags change
      this.showStandalone();
      this.showExpansions();
      this.gridApi?.onFilterChanged();
    });
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    if (typeof window !== 'undefined' && window.innerWidth >= 1100) {
      this.gridApi.sizeColumnsToFit();
    }
    const currentSelected = this.selectedObjectId();
    if (currentSelected) {
      this.selectGameByObjectId(currentSelected, true);
    }
  }

  onRowClicked(event: RowClickedEvent): void {
    if (!event.data) return;
    const objectId = event.data.objectid;

    if (isTouchDevice() && this.doubleTapDetector.isDoubleTap(objectId)) {
      this.gameOpenBgg.emit(objectId);
      return;
    }

    this.rowSelect.emit(event.data);
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    if (!event.data?.objectid) return;
    this.gameOpenBgg.emit(event.data.objectid);
  }

  onAgFilterChanged(): void {
    if (!this.gridApi) return;
    const filteredData: any[] = [];
    this.gridApi.forEachNodeAfterFilter((node) => {
      if (node.data) {
        filteredData.push(node.data);
      }
    });
    this.filteredDataChange.emit(filteredData);
    this.gridStateChange.emit();
  }

  onColumnHeaderContextMenu(event: ColumnHeaderContextMenuEvent): void {
    if (!isColumn(event.column)) {
      return;
    }

    const colId = event.column.getColId();
    const headerEl = document.querySelector(`.ag-header-cell[col-id="${colId}"]`) as HTMLElement | null;

    this.columnMenuOpen.emit({
      colId,
      anchor: headerEl ?? undefined,
      clientX: this.lastContextMenuX,
      clientY: this.lastContextMenuY,
    });
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.ag-header-cell, .ag-header-group-cell')) {
      return;
    }

    this.lastContextMenuX = event.clientX;
    this.lastContextMenuY = event.clientY;
    event.preventDefault();
  }

  // Public methods for parent component control
  sizeColumnsToFit(): void {
    if (typeof window !== 'undefined' && window.innerWidth >= 1100) {
      this.gridApi?.sizeColumnsToFit();
    }
  }

  setColumnsPinned(colIds: string[], pinned: 'left' | 'right' | null): void {
    this.gridApi?.setColumnsPinned(colIds, pinned);
  }

  setColumnsVisible(colIds: string[], visible: boolean): void {
    this.gridApi?.setColumnsVisible(colIds, visible);
  }

  resetColumnState(): void {
    this.gridApi?.resetColumnState();
  }

  setFilterModel(model: any): void {
    this.gridApi?.setFilterModel(model);
    this.gridApi?.onFilterChanged();
  }

  getFilterModel(): Record<string, unknown> | null {
    return this.gridApi ? this.gridApi.getFilterModel() : null;
  }

  getColumnState(): any[] {
    return this.gridApi ? this.gridApi.getColumnState() : [];
  }

  redrawRows(): void {
    this.gridApi?.redrawRows();
  }

  triggerFilterChange(): void {
    this.gridApi?.onFilterChanged();
  }

  deselectAll(): void {
    this.gridApi?.deselectAll();
  }

  selectGameByObjectId(objectId: string | number | null | undefined, ensureVisible = false): void {
    if (!this.gridApi) return;
    this.gridApi.forEachNode((node) => {
      const isMatch = node.data?.objectid === objectId;
      node.setSelected(isMatch);
      if (isMatch && ensureVisible) {
        this.gridApi?.ensureNodeVisible(node, 'middle');
      }
    });
  }

  applyColumnState(state: any[]): void {
    if (this.gridApi && state?.length) {
      this.gridApi.applyColumnState({ state, applyOrder: true });
    }
  }

  updateGridOptions(options: { autoGroupColumnDef?: any; columnDefs?: ColDef[] }): void {
    if (!this.gridApi) return;
    if (options.autoGroupColumnDef) {
      this.gridApi.setGridOption('autoGroupColumnDef', options.autoGroupColumnDef);
    }
    if (options.columnDefs) {
      this.gridApi.setGridOption('columnDefs', options.columnDefs);
    }
  }
}
