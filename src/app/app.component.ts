import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
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
  DefaultMenuItem,
  GetContextMenuItemsParams,
  GridApi,
  ITooltipParams,
  isColumn,
  MenuItemDef,
  ModuleRegistry,
  provideGlobalGridOptions,
  RowClassParams,
  RowClickedEvent,
  RowDoubleClickedEvent,
  RowStyle,
  ValueFormatterParams,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';

import {
  formatNumberPrecision,
  getColumnAggFunc,
  getColumnDataType,
  getColumnFilter,
  getColumnFilterParams,
  getColumnLabel,
  gridOptions,
  isColumnRowGroupEnabled,
  isColumnValueEnabled,
  tableConfig,
} from './tableConfig';
import { LicenseKey } from './license';
import { ColumnMenuRequest, ColumnMenuService } from './column-menu.service';
import { InnerHeaderComponent } from './inner-header.component';
import { environment } from '../environments/environment';
import { AG_GRID_LOCALE_PL, AppLanguage, I18nService, TranslationKeys } from './i18n';
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

LicenseManager.setLicenseKey(LicenseKey);
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);
provideGlobalGridOptions({ theme: 'legacy' });

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
      <div>
        <header class="header-row">
          <h1>{{ t.title }}</h1>

          <div class="header-actions">
            @if (fileDate()) {
              <span class="file-date" [title]="fileDate()">
                <svg class="date-icon" aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <span class="num">{{ fileDate() }}</span>
              </span>
            }

            <div class="lang-switcher" role="group" aria-label="Language switcher">
              <button
                type="button"
                class="lang-btn"
                [class.active]="currentLang() === 'pl'"
                (click)="setLanguage('pl')"
                title="Język polski"
              >
                PL
              </button>
              <button
                type="button"
                class="lang-btn"
                [class.active]="currentLang() === 'en'"
                (click)="setLanguage('en')"
                title="English language"
              >
                EN
              </button>
            </div>

            <button
              (click)="toggleDarkMode()"
              class="theme-toggle-btn"
              [title]="isDarkMode() ? t.switchToLight : t.switchToDark"
              [attr.aria-label]="isDarkMode() ? t.switchToLight : t.switchToDark"
              type="button"
            >
              @if (isDarkMode()) {
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              } @else {
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              }
            </button>
          </div>
        </header>

        @if (counter() !== 0) {
          <div class="displayed-games">
            <span class="num">{{ t.displayedGames.replace('{counter}', '' + counter()) }}</span>
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
                <svg class="tab-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect width="7" height="9" x="3" y="3" rx="1"/>
                  <rect width="7" height="5" x="14" y="3" rx="1"/>
                  <rect width="7" height="9" x="14" y="12" rx="1"/>
                  <rect width="7" height="5" x="3" y="16" rx="1"/>
                </svg>
                <span>{{ t.viewAll }}</span>
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
              <svg class="tab-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              <span>{{ t.viewChart }}</span>
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'cards'"
              (click)="setActiveTab('cards')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'cards'"
            >
              <svg class="tab-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="14" height="18" x="5" y="3" rx="2"/>
                <line x1="9" y1="7" x2="15" y2="7"/>
                <line x1="9" y1="11" x2="15" y2="11"/>
              </svg>
              <span>{{ t.viewCards }}</span>
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'table'"
              (click)="setActiveTab('table')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'table'"
            >
              <svg class="tab-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v18"/>
                <rect width="18" height="18" x="3" y="3" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M3 15h18"/>
              </svg>
              <span>{{ t.viewTable }}</span>
            </button>
            <button
              type="button"
              class="tab-btn"
              [class.active]="activeTab() === 'info'"
              (click)="setActiveTab('info')"
              role="tab"
              [attr.aria-selected]="activeTab() === 'info'"
            >
              <svg class="tab-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>{{ t.viewInfo }}</span>
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
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--color-paper);
    }

    .container {
      margin: 0 auto;
      padding: var(--space-md) var(--gutter);
      position: relative;
      max-width: var(--container);
      min-height: 100vh;
      font-family: var(--font-body);
      color: var(--color-ink);
      box-sizing: border-box;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      flex-wrap: wrap;
      padding-bottom: var(--space-xs);
      border-bottom: var(--rule-bar) solid var(--color-rule-2);

      h1 {
        margin: 0;
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 700;
        letter-spacing: var(--tracking-display);
        color: var(--color-ink);
        line-height: 1.1;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }

    .file-date {
      font-family: var(--font-outlier);
      font-size: var(--text-xs);
      color: var(--color-muted);
      background: var(--color-sheet);
      padding: var(--space-3xs) var(--space-xs);
      border-radius: var(--radius-pill);
      border: var(--rule-hair) solid var(--color-rule);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
    }

    .date-icon {
      color: var(--color-muted);
    }

    .lang-switcher {
      display: inline-flex;
      background: var(--color-sheet);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      padding: 1px;
      gap: 1px;
    }

    .lang-btn {
      background: transparent;
      border: none;
      font-family: var(--font-display);
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      color: var(--color-muted);
      padding: var(--space-3xs) var(--space-xs);
      border-radius: var(--radius-pill);
      cursor: pointer;
      line-height: 1;

      &:hover {
        color: var(--color-ink);
        background: var(--color-paper-2);
      }

      &.active {
        background: var(--color-ink);
        color: var(--color-paper);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .displayed-games {
      margin-top: var(--space-2xs);
      font-family: var(--font-outlier);
      font-size: var(--text-xs);
      color: var(--color-muted);
    }

    .theme-toggle-btn {
      background: var(--color-sheet);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-ink);
      padding: 0;

      &:hover {
        background: var(--color-paper-2);
        color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .view-tabs {
      display: flex;
      gap: var(--space-3xs);
      margin: var(--space-sm) 0 var(--space-xs) 0;
      background: var(--color-paper-2);
      padding: 2px;
      border-radius: var(--radius-card);
      border: var(--rule-hair) solid var(--color-rule);
      overflow-x: auto;
    }

    .tab-btn {
      flex: 1;
      min-width: 75px;
      min-height: 34px;
      padding: var(--space-2xs) var(--space-xs);
      border: var(--rule-hair) solid transparent;
      background: transparent;
      color: var(--color-ink-2);
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 500;
      letter-spacing: var(--tracking-display);
      border-radius: var(--radius-pill);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2xs);
      white-space: nowrap;

      &:hover {
        background: var(--color-paper-3);
        color: var(--color-ink);
      }

      &.active {
        background: var(--color-sheet);
        color: var(--color-accent);
        border-color: var(--color-rule-2);
        font-weight: 600;
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .tab-icon {
      flex-shrink: 0;
    }

    .main-content {
      margin-top: var(--space-2xs);
    }

    .content-section {
      width: 100%;
    }

    .grid-container {
      width: 100%;
      height: 540px;
      margin: var(--space-xs) 0;
      box-sizing: border-box;
    }

    .info-section-wrapper.standalone-info {
      padding: var(--space-xs) 0;
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
export class AppComponent {
  readonly i18n = inject(I18nService);
  get t(): TranslationKeys {
    return this.i18n.t();
  }
  readonly currentLang = this.i18n.currentLang;

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
    localeText: this.i18n.currentLang() === 'pl' ? AG_GRID_LOCALE_PL : undefined,
    rowGroupPanelShow: 'never' as const,
    groupDefaultExpanded: 1,
    sideBar: {
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
    },
    getContextMenuItems: (params: GetContextMenuItemsParams): (DefaultMenuItem | MenuItemDef)[] => {
      const isPl = this.i18n.currentLang() === 'pl';
      const game = params.node?.data;
      const objectId = game?.objectid;
      const gameName = game?.objectname || game?.name;

      const items: (DefaultMenuItem | MenuItemDef)[] = [];

      if (objectId) {
        items.push({
          name: isPl ? `Otwórz „${gameName ?? 'grę'}” na BGG` : `Open "${gameName ?? 'game'}" on BGG`,
          action: () => this.openBggPage(objectId),
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
        });

        items.push({
          name: isPl ? 'Pokaż szczegóły gry' : 'Show game details',
          action: () => {
            this.selectedGame.set(game);
            this.chartComp?.selectPointByObjectId(objectId);
          },
          icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        });

        items.push('separator');
      }

      items.push('copy');
      items.push('copyWithHeaders');

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

  rowStyle: ((params: RowClassParams) => (RowStyle | undefined)) | undefined = (params) => {
    if (params.node.group) {
      return undefined;
    }
    if (params.data?.itemtype === 'expansion') {
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

    effect(() => {
      const isDark = this.isDarkMode();
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark-theme', isDark);
        document.body.classList.toggle('dark-theme', isDark);
      }
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode.update((dark) => !dark);
    if (this.gridApi) {
      this.gridApi.redrawRows();
    }
    this.scheduleSavePreferences();
  }

  getTranslation(key: string): string {
    return getColumnLabel(key, this.currentLang());
  }

  setLanguage(lang: AppLanguage): void {
    this.i18n.setLanguage(lang);
    this.checkboxOptions.update((options) =>
      options.map((option) => ({
        ...option,
        translation: this.getTranslation(option.key),
      }))
    );
    if (this.dataLoaded() && this.rowData().length > 0) {
      this.columnDefs.set(this.generateColumns(this.rowData()[0]));
      if (this.gridApi) {
        this.gridApi.setGridOption('autoGroupColumnDef', {
          headerName: lang === 'pl' ? 'Grupa' : 'Group',
          minWidth: 260,
          pinned: 'left',
          cellRendererParams: {
            suppressCount: false,
          },
        });
        this.gridApi.setGridOption('columnDefs', this.columnDefs());
      }
    }
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
      alert(this.t.csvErrorAlert);
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
    if (!event.data) return;
    const objectId = event.data.objectid;

    if (this.isTouchDevice() && this.isDoubleTap(objectId)) {
      this.openBggPage(objectId);
      return;
    }

    this.selectedGame.set(event.data);
    this.chartComp?.selectPointByObjectId(objectId);
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent): void {
    if (!event.data?.objectid) return;
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
      if (node.data) {
        filteredData.push(node.data);
      }
    });
    const [games, expansions] = this.extractData(filteredData);
    this.gamesPoints.set(games);
    this.expansionPoints.set(expansions);
    this.scheduleSavePreferences();
  }

  private calculateCellDataType(key: string): string {
    return getColumnDataType(key);
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

    const option = this.checkboxOptions().some((o) => o.key === colId);
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
      this.gridApi.forEachNodeAfterFilter((node) => {
        if (node.data) {
          filteredData.push(node.data);
        }
      });
      const [games, expansions] = this.extractData(filteredData);
      this.gamesPoints.set(games);
      this.expansionPoints.set(expansions);
    }

    this.scheduleSavePreferences();
  }

  private generateColumns(collection: any[]): ColDef[] {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const visibleCols = this.visibleColumns();

    const columnNames = Object.keys(collection || {}).map((key) => {
      const type = this.calculateCellDataType(key);
      const isNumber = type === 'number';
      const filter = getColumnFilter(key);
      const filterParams = getColumnFilterParams(key);
      const enableRowGroup = isColumnRowGroupEnabled(key);
      const enableValue = isColumnValueEnabled(key);
      const aggFunc = getColumnAggFunc(key);

      return {
        field: key,
        headerName: this.generateName(key),
        headerTooltip: this.generateName(key),
        filter,
        filterParams,
        enableRowGroup,
        enableValue,
        aggFunc,
        sortable: true,
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
