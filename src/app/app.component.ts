import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ViewChild,
  computed,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import {
  AllCommunityModule,
  ColDef,
  ColumnHeaderContextMenuEvent,
  ColumnVisibleEvent,
  GridApi,
  isColumn,
  ModuleRegistry,
  provideGlobalGridOptions,
  RowClassParams,
  RowClickedEvent,
  RowDoubleClickedEvent,
  RowStyle,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

import { gridOptions, tableConfig } from './tableConfig';
import { ColumnMenuRequest, ColumnMenuService } from './column-menu.service';
import { InnerHeaderComponent } from './inner-header.component';
import { environment } from '../environments/environment';
import { getActiveTranslations } from './i18n';
import {
  clearUiPreferences,
  hasUiPreferences,
  loadUiPreferences,
  saveUiPreferences,
  UiPreferences,
} from './uiPreferences';
import { CheckboxOption, ColumnMenuState, DataPoint } from './models';
import { ControlsComponent } from './controls.component';
import { ChartComponent } from './chart.component';
import { ColumnMenuComponent } from './column-menu.component';
import { InfoSectionComponent } from './info-section.component';
import { GameCardListComponent } from './game-card-list.component';
import { SelectedGamePreviewComponent } from './selected-game-preview.component';

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: 'legacy' });

const t = getActiveTranslations();

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AgGridAngular,
    ControlsComponent,
    ChartComponent,
    ColumnMenuComponent,
    InfoSectionComponent,
    GameCardListComponent,
    SelectedGamePreviewComponent,
  ],
  template: `
    <div class="container" [class.dark-theme]="isDarkMode()">
      @if (fileDate()) {
        <div class="file-date">{{ fileDate() }}</div>
      }

      <div>
        <div class="header-row">
          <h1>{{ t.title }}</h1>
          <button
            (click)="toggleDarkMode()"
            class="theme-toggle-btn"
            [title]="isDarkMode() ? t.switchToLight : t.switchToDark"
            [attr.aria-label]="isDarkMode() ? t.switchToLight : t.switchToDark"
            type="button"
          >
            {{ isDarkMode() ? '☀️' : '🌙' }}
          </button>
        </div>

        @if (counter() !== 0) {
          <div class="displayed-games">
            {{ t.displayedGames.replace('{counter}', '' + counter()) }}
          </div>
        }

        <app-controls
          [dataLoaded]="dataLoaded()"
          [hasSavedPreferences]="hasSavedPreferences()"
          [checkboxOptions]="checkboxOptions()"
          [isDarkMode]="isDarkMode()"
          [(showStandalone)]="showStandalone"
          [(showExpansions)]="showExpansions"
          (fileSelected)="onFileUpload($event)"
          (loadExample)="onLoadMyExample()"
          (filterToggled)="onToggleFilters()"
          (optionToggled)="onOptionToggled($event)"
          (resetPreferences)="resetPreferences()"
        />

        @if (dataLoaded()) {
          <div class="view-tabs" role="tablist">
            @if (!isMobile()) {
              <button
                type="button"
                class="tab-btn"
                [class.active]="activeTab() === 'all'"
                (click)="setActiveTab('all')"
                role="tab"
                [attr.aria-selected]="activeTab() === 'all'"
              >
                📊 {{ t.viewAll }}
              </button>
            }
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'chart'"
              (click)="setActiveTab('chart')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'chart'"
            >
              📈 {{ t.viewChart }}
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'cards'"
              (click)="setActiveTab('cards')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'cards'"
            >
              🎴 {{ t.viewCards }}
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'table'"
              (click)="setActiveTab('table')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'table'"
            >
              📋 {{ t.viewTable }}
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'info'"
              (click)="setActiveTab('info')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'info'"
            >
              ℹ️ {{ t.viewInfo }}
            </button>
          </div>
        }

        <div class="main-content">
          <!-- Chart section -->
          @if (dataLoaded() && (activeTab() === 'all' || activeTab() === 'chart')) {
            <div class="content-section chart-section">
              <app-chart
                #chartComp
                [gamesData]="gamesPoints()"
                [expansionsData]="expansionPoints()"
                [visibleColumns]="visibleColumns()"
                [isDarkMode]="isDarkMode()"
                [isMobile]="isMobile()"
                [selectedObjectId]="selectedGame()?.objectid"
                (pointSelected)="onChartPointSelected($event)"
              />

              @if (selectedGame()) {
                <app-selected-game-preview
                  [game]="selectedGame()"
                  [isDarkMode]="isDarkMode()"
                  (close)="clearSelectedGame()"
                  (openBgg)="openBggPage($event)"
                />
              }
            </div>
          }

          <!-- Cards view -->
          @if (dataLoaded() && activeTab() === 'cards') {
            <div class="content-section cards-section">
              <app-game-card-list
                [games]="allActiveGames()"
                [isDarkMode]="isDarkMode()"
                [selectedObjectId]="selectedGame()?.objectid"
                (gameSelected)="onCardGameSelected($event)"
                (openBgg)="openBggPage($event)"
              />
            </div>
          }

          <!-- AG-Grid Table view -->
          @if (dataLoaded() && (activeTab() === 'all' || activeTab() === 'table')) {
            <div class="content-section table-section">
              <ag-grid-angular
                #agGrid
                (columnHeaderContextMenu)="onColumnHeaderContextMenu($event)"
                (columnMoved)="onGridStateChanged()"
                (columnResized)="onGridStateChanged()"
                (columnVisible)="onColumnVisible($event)"
                (filterChanged)="onFilterChanged()"
                (gridReady)="onGridReady($event)"
                (rowClicked)="onRowClicked($event)"
                (rowDoubleClicked)="onRowDoubleClicked($event)"
                (sortChanged)="onGridStateChanged()"
                [columnDefs]="columnDefs()"
                [columnHoverHighlight]="true"
                [getRowStyle]="rowStyle"
                [gridOptions]="gridOptions"
                [rowData]="rowData()"
                [class.ag-theme-alpine]="!isDarkMode()"
                [class.ag-theme-alpine-dark]="isDarkMode()"
                class="grid-container"
              />
            </div>
          }

          <!-- Info Section -->
          @if (!dataLoaded() || activeTab() === 'info' || (!isMobile() && activeTab() === 'all')) {
            <div class="content-section info-section-wrapper" [class.standalone-info]="activeTab() === 'info'">
              <app-info-section [isDarkMode]="isDarkMode()" />
            </div>
          }
        </div>
      </div>

      <app-column-menu
        [isOpen]="columnMenuState().open"
        [x]="columnMenuState().x"
        [y]="columnMenuState().y"
        [colId]="columnMenuState().colId"
        [options]="checkboxOptions()"
        [isDarkMode]="isDarkMode()"
        (close)="closeColumnMenu()"
        (hideColumn)="hideColumnFromMenu($event)"
        (toggleColumn)="toggleColumnFromMenu($event)"
      />
    </div>
  `,
  styles: [`
    .container {
      margin: 10px;
      font-family: "Unica One", arial, helvetica, sans-serif, serif;
      position: relative;
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
    }

    .file-date {
      position: absolute;
      top: 5px;
      right: 10px;
      font-size: 8px;
      color: gray;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;

      h1 {
        margin: 0;
        font-size: 1.8rem;
      }
    }

    .displayed-games {
      margin-top: 5px;
      font-size: 0.95rem;
    }

    .theme-toggle-btn {
      background: #f8f9fa;
      border: 1px solid darkcyan;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      padding: 0;
      user-select: none;

      &:hover {
        background: #e6f7f7;
        transform: scale(1.08);
      }
    }

    .view-tabs {
      display: flex;
      gap: 6px;
      margin: 14px 0 10px 0;
      background: #f1f5f9;
      padding: 4px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      overflow-x: auto;
    }

    .tab-btn {
      flex: 1;
      min-width: 75px;
      min-height: 40px;
      padding: 8px 10px;
      border: none;
      background: transparent;
      color: #475569;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 7px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      transition: all 0.15s ease;
      white-space: nowrap;

      &:hover {
        background: rgba(255, 255, 255, 0.6);
        color: #0f172a;
      }

      &.active {
        background: #ffffff;
        color: darkcyan;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        font-weight: 700;
      }
    }

    .main-content {
      margin-top: 10px;
    }

    .content-section {
      width: 100%;
    }

    .grid-container {
      width: 100%;
      height: 520px;
      margin: 10px 0;
      box-sizing: border-box;
    }

    .info-section-wrapper.standalone-info {
      padding: 10px 0;
    }

    @media (max-width: 767px) {
      .file-date {
        position: static;
        text-align: right;
        margin-bottom: 4px;
      }
    }

    .ag-header-cell:hover .ag-header-cell-text {
      position: absolute;
      background-color: white;
      padding: 5px;
      border: 1px solid #ccc;
      border-radius: 3px;
      z-index: 10;
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      max-width: 200px;
    }

    .container.dark-theme {
      color: #e0e0e0;

      .theme-toggle-btn {
        background: #2b3035;
        border-color: #00a8a8;
        color: #ffd43b;

        &:hover {
          background: #373e45;
        }
      }

      .file-date {
        color: #9aa0a6;
      }

      .view-tabs {
        background: #1e2226;
        border-color: #33393f;

        .tab-btn {
          color: #94a3b8;

          &:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #f1f5f9;
          }

          &.active {
            background: #2b3035;
            color: #38bdf8;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
          }
        }
      }

      .ag-header-cell:hover .ag-header-cell-text {
        background-color: #24282c;
        color: #e0e0e0;
        border-color: #444;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      }

      h1 {
        color: #f1f3f4;
      }
    }
  `],
})
export class AppComponent {
  readonly t = t;

  readonly isDarkMode = signal<boolean>(
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  readonly isMobile = signal<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  readonly activeTab = signal<'all' | 'chart' | 'cards' | 'table' | 'info'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'chart' : 'all'
  );
  readonly selectedGame = signal<any | null>(null);

  readonly fileDate = signal<string | undefined>(undefined);
  readonly counter = signal<number>(0);
  readonly dataLoaded = signal<boolean>(false);
  readonly hasSavedPreferences = signal<boolean>(hasUiPreferences());

  readonly showStandalone = signal<boolean>(true);
  readonly showExpansions = signal<boolean>(false);

  readonly rowData = signal<any[]>([]);
  readonly columnDefs = signal<ColDef[]>([]);
  readonly visibleColumns = signal<Set<string>>(new Set());

  readonly gamesPoints = signal<DataPoint[]>([]);
  readonly expansionPoints = signal<DataPoint[]>([]);

  readonly allActiveGames = computed(() => [
    ...this.gamesPoints(),
    ...this.expansionPoints(),
  ]);

  readonly checkboxOptions = signal<CheckboxOption[]>(this.buildInitialCheckboxOptions());

  readonly columnMenuState = signal<ColumnMenuState>({
    open: false,
    x: 0,
    y: 0,
    colId: null,
  });

  @ViewChild('agGrid') agGrid!: AgGridAngular;
  @ViewChild('chartComp') chartComp?: ChartComponent;

  private gridApi!: GridApi;
  private savePreferencesTimeout?: ReturnType<typeof setTimeout>;
  private pendingFilterModel: Record<string, unknown> | null = null;
  private pendingColumnState: ReturnType<GridApi['getColumnState']> | null = null;
  private results: DataPoint[] = [];

  private readonly link = 'https://boardgamegeek.com/boardgame/';
  private readonly doubleTapDelayMs = 300;
  private lastTapTime = 0;
  private lastTapObjectId: string | number | null = null;
  private lastContextMenuX = 0;
  private lastContextMenuY = 0;

  gridOptions = {
    ...gridOptions,
    defaultColDef: {
      ...gridOptions.defaultColDef,
      innerHeaderComponent: InnerHeaderComponent,
    },
    isExternalFilterPresent: () => true,
    doesExternalFilterPass: (node: any) => {
      const type = node.data.itemtype;
      if (type === 'standalone') return this.showStandalone();
      if (type === 'expansion') return this.showExpansions();
      return true;
    },
  };

  rowStyle: ((params: RowClassParams) => (RowStyle | undefined)) | undefined = (params) => {
    if (params.data.itemtype === 'expansion') {
      return { background: this.isDarkMode() ? '#3a4046' : '#c8c8c8' };
    }
    return { background: this.isDarkMode() ? '#22262a' : '#ececec' };
  };

  constructor(
    private readonly http: HttpClient,
    private readonly columnMenuService: ColumnMenuService,
  ) {
    this.columnMenuService.open$.subscribe((request) => this.openColumnMenu(request));
    this.applyStoredPreferences();
  }

  toggleDarkMode(): void {
    this.isDarkMode.update((dark) => !dark);
    if (this.gridApi) {
      this.gridApi.redrawRows();
    }
    this.scheduleSavePreferences();
  }

  getTranslation(key: string): string {
    const browserLang = typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en';
    const locale = browserLang.startsWith('pl') ? 'Pl' : 'En';
    return tableConfig[key]?.[`translation${locale}`] || key;
  }

  async onFileUpload(file: File): Promise<void> {
    if (file) {
      this.fileDate.set(this.formatDate(new Date(file.lastModified)));
    }
    await this.pareseCSV(file);
  }

  async pareseCSV(file: any): Promise<void> {
    if (file && (await this.validateCsv(file))) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result: ParseResult<DataPoint>) => {
          this.results = result.data;
          const [games, expansions] = this.extractData();
          this.dataLoaded.set(true);
          this.gamesPoints.set(games);
          this.expansionPoints.set(expansions);
          this.processTableData(result);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    } else {
      alert(t.csvErrorAlert);
    }
  }

  extractData(optionalData?: DataPoint[]): [DataPoint[], DataPoint[]] {
    const data = optionalData || this.results;
    let count = 0;
    const dataPoints: DataPoint[] = [];
    const expansion: DataPoint[] = [];

    data.forEach((row) => {
      const average = +Number.parseFloat(String(row['average'])).toFixed(3);
      const avgWeight = +Number.parseFloat(String(row['avgweight'])).toFixed(3);
      const objectName = row['objectname'];
      const objectid = row['objectid'];

      if (!Number.isNaN(average) && !Number.isNaN(avgWeight) && avgWeight !== 0) {
        const dataPoint: DataPoint = {
          x: avgWeight,
          y: average,
          objectname: objectName,
          objectid: objectid,
        };

        Object.keys(row).forEach((key) => {
          if (tableConfig[key]) {
            dataPoint[key] = row[key];
          }
        });

        const isStandalone = row['itemtype'] === 'standalone';
        const isExpansion = row['itemtype'] === 'expansion';

        if (isStandalone && this.showStandalone()) {
          dataPoints.push(dataPoint);
          count++;
        } else if (isExpansion && this.showExpansions()) {
          expansion.push(dataPoint);
          count++;
        }
      }
    });

    this.counter.set(count);
    return [dataPoints, expansion];
  }

  setActiveTab(tab: 'all' | 'chart' | 'cards' | 'table' | 'info'): void {
    this.activeTab.set(tab);
    if (tab === 'chart' || tab === 'all') {
      setTimeout(() => {
        this.chartComp?.renderOrUpdateChart();
      }, 50);
    }
    if (tab === 'table' || tab === 'all') {
      setTimeout(() => {
        this.gridApi?.sizeColumnsToFit();
      }, 50);
    }
  }

  onChartPointSelected(point: any): void {
    const objectId = point.objectid;
    if (!objectId) return;

    const all = this.allActiveGames();
    const game = all.find((g) => g.objectid === objectId) || point;
    this.selectedGame.set(game);
    this.chartComp?.selectPointByObjectId(objectId);

    if (this.gridApi) {
      this.gridApi.forEachNode((node) => {
        if (node.data?.objectid === objectId) {
          node.setSelected(true);
        } else {
          node.setSelected(false);
        }
      });
    }
  }

  onCardGameSelected(game: DataPoint): void {
    this.selectedGame.set(game);
    this.chartComp?.selectPointByObjectId(game.objectid);

    if (this.gridApi) {
      this.gridApi.forEachNode((node) => {
        if (node.data?.objectid === game.objectid) {
          node.setSelected(true);
        } else {
          node.setSelected(false);
        }
      });
    }
  }

  clearSelectedGame(): void {
    this.selectedGame.set(null);
    this.chartComp?.clearSelection();
    if (this.gridApi) {
      this.gridApi.deselectAll();
    }
  }

  onRowClicked(event: RowClickedEvent): void {
    const objectId = event.data.objectid;

    if (this.isTouchDevice() && this.isDoubleTap(objectId)) {
      this.openBggPage(objectId);
      return;
    }

    this.selectedGame.set(event.data);
    this.chartComp?.selectPointByObjectId(objectId);
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    this.openBggPage(event.data.objectid);
  }

  private isTouchDevice(): boolean {
    return 'ontouchstart' in globalThis || navigator.maxTouchPoints > 0;
  }

  private isDoubleTap(objectId: string | number): boolean {
    const now = Date.now();
    const isDoubleTap = this.lastTapObjectId === objectId && now - this.lastTapTime < this.doubleTapDelayMs;
    this.lastTapTime = now;
    this.lastTapObjectId = objectId;
    return isDoubleTap;
  }

  openBggPage(objectId: string | number | undefined): void {
    if (objectId) {
      window.open(this.link + objectId, '_blank');
    }
  }

  populateVisibleColumns(): void {
    const nextSet = new Set<string>();
    for (const option of this.checkboxOptions()) {
      if (option.visible) {
        nextSet.add(option.key);
      }
    }
    this.visibleColumns.set(nextSet);
  }

  private applyStoredPreferences(): void {
    const prefs = loadUiPreferences();
    if (!prefs) {
      return;
    }

    if (prefs.darkMode !== undefined) {
      this.isDarkMode.set(prefs.darkMode);
    }
    if (prefs.showStandalone !== undefined) {
      this.showStandalone.set(prefs.showStandalone);
    }
    if (prefs.showExpansions !== undefined) {
      this.showExpansions.set(prefs.showExpansions);
    }
    if (!this.showStandalone() && !this.showExpansions()) {
      this.showStandalone.set(true);
      this.showExpansions.set(false);
    }

    if (prefs.columnVisibility) {
      const options = this.checkboxOptions();
      this.checkboxOptions.set(
        options.map((option) => {
          if (option.key in prefs.columnVisibility) {
            return { ...option, visible: prefs.columnVisibility[option.key] };
          }
          return option;
        })
      );
    }

    this.pendingFilterModel = prefs.filterModel;
    this.pendingColumnState = prefs.columnState;
  }

  private scheduleSavePreferences(): void {
    clearTimeout(this.savePreferencesTimeout);
    this.savePreferencesTimeout = setTimeout(() => this.savePreferences(), 300);
  }

  private savePreferences(): void {
    if (!this.gridApi) {
      this.persistPreferencesWithoutGrid();
      return;
    }

    const columnState = this.gridApi.getColumnState().map(({ hide, ...rest }) => rest);
    const prefs: UiPreferences = {
      columnVisibility: Object.fromEntries(
        this.checkboxOptions().map((option) => [option.key, option.visible])
      ),
      showStandalone: this.showStandalone(),
      showExpansions: this.showExpansions(),
      filterModel: this.gridApi.getFilterModel(),
      columnState,
      darkMode: this.isDarkMode(),
    };

    saveUiPreferences(prefs);
    this.hasSavedPreferences.set(true);
  }

  private persistPreferencesWithoutGrid(): void {
    const prefs: UiPreferences = {
      columnVisibility: Object.fromEntries(
        this.checkboxOptions().map((option) => [option.key, option.visible])
      ),
      showStandalone: this.showStandalone(),
      showExpansions: this.showExpansions(),
      filterModel: this.pendingFilterModel,
      columnState: this.pendingColumnState ?? [],
      darkMode: this.isDarkMode(),
    };

    saveUiPreferences(prefs);
    this.hasSavedPreferences.set(true);
  }

  resetPreferences(): void {
    clearUiPreferences();
    this.hasSavedPreferences.set(false);
    this.pendingFilterModel = null;
    this.pendingColumnState = null;
    this.showStandalone.set(true);
    this.showExpansions.set(false);
    this.isDarkMode.set(
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    );

    this.checkboxOptions.set(this.buildInitialCheckboxOptions());

    if (this.dataLoaded()) {
      this.populateVisibleColumns();
      this.columnDefs.set(this.generateColumns(this.rowData()[0] ?? {}));

      if (this.gridApi) {
        this.gridApi.resetColumnState();
        this.gridApi.setFilterModel(null);
        this.gridApi.onFilterChanged();
        this.gridApi.redrawRows();
      }

      const [games, expansions] = this.extractData();
      this.gamesPoints.set(games);
      this.expansionPoints.set(expansions);
    }
  }

  onFilterChanged(): void {
    const filteredData: any[] = [];
    this.gridApi.forEachNodeAfterFilter((node) => {
      filteredData.push(node.data);
    });
    const [games, expansions] = this.extractData(filteredData);
    this.gamesPoints.set(games);
    this.expansionPoints.set(expansions);
    this.scheduleSavePreferences();
  }

  private calculateCellDataType(key: string): string {
    const entry = tableConfig[key];
    if (entry.type) {
      if (entry.type === 'n') {
        return 'number';
      } else if (entry.type === 'b') {
        return 'boolean';
      }
    }
    return 'text';
  }

  onOptionToggled(entry: { key: string; visible: boolean }): void {
    this.syncColumnVisibility(entry.key, entry.visible, true);
    this.onColumnVisibilityChanged();
  }

  onColumnHeaderContextMenu(event: ColumnHeaderContextMenuEvent): void {
    if (!isColumn(event.column)) {
      return;
    }

    const colId = event.column.getColId();
    const headerEl = document.querySelector(`.ag-header-cell[col-id="${colId}"]`) as HTMLElement | null;

    this.openColumnMenu({
      colId,
      anchor: headerEl ?? undefined,
      clientX: this.lastContextMenuX,
      clientY: this.lastContextMenuY,
    });
  }

  openColumnMenu(request: ColumnMenuRequest): void {
    let x = 0;
    let y = 0;

    if (request.anchor) {
      const rect = request.anchor.getBoundingClientRect();
      x = rect.left;
      y = rect.bottom + 4;
    } else {
      x = request.clientX ?? 0;
      y = request.clientY ?? 0;
    }

    this.columnMenuState.set({
      open: true,
      x,
      y,
      colId: request.colId,
    });
  }

  closeColumnMenu(): void {
    this.columnMenuState.update((state) => ({
      ...state,
      open: false,
      colId: null,
    }));
  }

  hideColumnFromMenu(colId: string): void {
    if (colId === 'objectname') {
      return;
    }

    const option = this.checkboxOptions().find((o) => o.key === colId);
    if (option) {
      this.syncColumnVisibility(colId, false, true);
      this.onColumnVisibilityChanged();
    }

    this.closeColumnMenu();
  }

  toggleColumnFromMenu(event: { option: CheckboxOption; checked: boolean }): void {
    this.syncColumnVisibility(event.option.key, event.checked, true);
    this.onColumnVisibilityChanged();
  }

  onColumnVisible(event: ColumnVisibleEvent): void {
    const columns = event.columns ?? (event.column ? [event.column] : []);
    let changed = false;

    for (const column of columns) {
      if (this.syncColumnVisibility(column.getColId(), column.isVisible(), false)) {
        changed = true;
      }
    }

    if (changed) {
      this.onColumnVisibilityChanged();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  onToggleFilters(): void {
    if (!this.showStandalone() && !this.showExpansions()) {
      this.showStandalone.set(true);
    }
    const [games, expansions] = this.extractData();
    this.gamesPoints.set(games);
    this.expansionPoints.set(expansions);
    if (this.gridApi) {
      this.gridApi.onFilterChanged();
    }
    this.scheduleSavePreferences();
  }

  onGridReady(params: { api: GridApi }): void {
    this.gridApi = params.api;
    this.checkScreenSize();
    this.applyPendingGridState();
    if (this.selectedGame()?.objectid) {
      this.gridApi.forEachNode((node) => {
        if (node.data?.objectid === this.selectedGame()?.objectid) {
          node.setSelected(true);
          this.gridApi?.ensureNodeVisible(node, 'middle');
        }
      });
    }
  }

  private applyPendingGridState(): void {
    if (this.pendingColumnState?.length) {
      this.gridApi.applyColumnState({ state: this.pendingColumnState, applyOrder: true });
      this.pendingColumnState = null;
    }

    if (this.pendingFilterModel) {
      this.gridApi.setFilterModel(this.pendingFilterModel);
      this.pendingFilterModel = null;
      this.gridApi.onFilterChanged();
    }
  }

  onGridStateChanged(): void {
    this.scheduleSavePreferences();
  }

  onLoadMyExample(): void {
    const filePath = environment.filePath;
    this.http.get(filePath, { observe: 'response', responseType: 'text' }).subscribe((response) => {
      const lastModified = response.headers.get('Last-Modified');
      if (lastModified) {
        this.fileDate.set(this.formatDate(new Date(lastModified)));
      }
      this.pareseCSV(response.body!);
    });
  }

  private processTableData(result: ParseResult<DataPoint>): void {
    this.populateVisibleColumns();
    const rows = result.data.map((row) => {
      if (row.bggrecagerange && typeof row.bggrecagerange === 'string') {
        row.bggrecagerange = Number.parseFloat(row.bggrecagerange.replace('+', ''));
      }
      return row;
    });
    this.rowData.set(rows);

    const cols = this.generateColumns(result.data[0] as unknown as any[]);
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (cols[0]) {
      cols[0].pinned = isMobile ? null : 'left';
    }
    this.columnDefs.set(cols);
  }

  private validateCsv(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const expectedHeader = ['objectname', 'objectid', 'rating', 'numplays'];
      if (file) {
        Papa.parse(file, {
          header: false,
          preview: 1,
          complete: (results: Papa.ParseResult<string[]>) => {
            const fileHeader = results.data[0];
            const result =
              fileHeader.length === 58 &&
              expectedHeader.every(
                (value, index) => value.toLowerCase().trim() === fileHeader[index].toLowerCase().trim()
              );
            resolve(result);
          },
          error(error) {
            reject(error);
          },
        });
      }
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

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  private syncColumnVisibility(colId: string, visible: boolean, updateGrid: boolean): boolean {
    const options = this.checkboxOptions();
    const option = options.find((o) => o.key === colId);
    if (!option || option.visible === visible) {
      return false;
    }

    this.checkboxOptions.set(
      options.map((o) => (o.key === colId ? { ...o, visible } : o))
    );

    this.visibleColumns.update((cols) => {
      const next = new Set(cols);
      if (visible) {
        next.add(colId);
      } else {
        next.delete(colId);
      }
      return next;
    });

    if (updateGrid && this.gridApi) {
      this.gridApi.setColumnsVisible([colId], visible);
    }

    return true;
  }

  private generateName(key: string): string {
    return this.getTranslation(key) || key.charAt(0).toUpperCase() + key.slice(1);
  }

  private onColumnVisibilityChanged(): void {
    if (!this.dataLoaded()) {
      this.scheduleSavePreferences();
      return;
    }

    if (this.gridApi) {
      const filteredData: any[] = [];
      this.gridApi.forEachNodeAfterFilter((node) => filteredData.push(node.data));
      const [games, expansions] = this.extractData(filteredData);
      this.gamesPoints.set(games);
      this.expansionPoints.set(expansions);
    }

    this.scheduleSavePreferences();
  }

  private generateColumns(collection: any[]): ColDef[] {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const visibleCols = this.visibleColumns();

    const columnNames = Object.keys(collection || {}).map((key) => ({
      field: key,
      headerName: this.generateName(key),
      headerTooltip: this.generateName(key),
      filter: true,
      sortable: true,
      hide: !visibleCols.has(key),
      floatingFilter: true,
      cellDataType: this.calculateCellDataType(key),
    } as ColDef));

    columnNames.forEach((col) => {
      if (col.field === 'objectname') {
        col.pinned = isMobile ? null : 'left';
        col.lockPinned = !isMobile;
        col.lockVisible = true;
      }
    });

    return columnNames;
  }

  private checkScreenSize(): void {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    this.isMobile.set(isMobile);
    if (isMobile && this.activeTab() === 'all') {
      this.activeTab.set('chart');
    }
    if (!this.gridApi) return;
    this.gridApi.setColumnsPinned(['objectname'], isMobile ? null : 'left');
  }

  private buildInitialCheckboxOptions(): CheckboxOption[] {
    return Object.keys(tableConfig).map((key) => ({
      key,
      visible: tableConfig[key].visible,
      translation: this.getTranslation(key),
    }));
  }
}
