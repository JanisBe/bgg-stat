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
import { ColDef, ColumnVisibleEvent } from 'ag-grid-community';

import { environment } from '../environments/environment';
import { AppLanguage, I18nService, TranslationKeys } from './i18n';
import { UiPreferences } from './uiPreferences';
import { CheckboxOption, ColumnMenuState, DataPoint } from './models';
import { ColumnMenuRequest, ColumnMenuService } from './column-menu.service';
import { CollectionDataService } from './services/collection-data.service';
import { UiPreferencesService } from './services/ui-preferences.service';
import { ColumnConfigService } from './services/column-config.service';
import { HeaderComponent } from './header.component';
import { ControlsComponent } from './controls.component';
import { ChartComponent } from './chart.component';
import { GameTableComponent } from './game-table.component';
import { ColumnMenuComponent } from './column-menu.component';
import { InfoSectionComponent } from './info-section.component';
import { GameCardListComponent } from './game-card-list.component';
import { SelectedGamePreviewComponent } from './selected-game-preview.component';
import { formatDate } from './utils/date.utils';
import { openBggPage } from './utils/bgg.utils';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeaderComponent,
    ControlsComponent,
    ChartComponent,
    GameTableComponent,
    ColumnMenuComponent,
    InfoSectionComponent,
    GameCardListComponent,
    SelectedGamePreviewComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly i18n = inject(I18nService);
  readonly collectionDataService = inject(CollectionDataService);
  readonly uiPreferencesService = inject(UiPreferencesService);
  readonly columnConfigService = inject(ColumnConfigService);
  readonly columnMenuService = inject(ColumnMenuService);

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
  readonly hasSavedPreferences = this.uiPreferencesService.hasSavedPreferences;

  readonly showStandalone = signal<boolean>(true);
  readonly showExpansions = signal<boolean>(false);

  readonly rowData = signal<any[]>([]);
  readonly columnDefs = signal<ColDef[]>([]);
  readonly tableColumnOptions = this.columnConfigService.tableColumnOptions;
  readonly tooltipOptions = this.columnConfigService.tooltipOptions;
  readonly visibleTableColumns = this.columnConfigService.visibleTableColumns;
  readonly visibleTooltipColumns = this.columnConfigService.visibleTooltipColumns;
  readonly checkboxOptions = this.columnConfigService.tooltipOptions;
  readonly visibleColumns = this.columnConfigService.visibleTooltipColumns;

  readonly gamesPoints = signal<DataPoint[]>([]);
  readonly expansionPoints = signal<DataPoint[]>([]);

  readonly allActiveGames = computed(() => [
    ...this.gamesPoints(),
    ...this.expansionPoints(),
  ]);

  readonly columnMenuState = signal<ColumnMenuState>({
    open: false,
    x: 0,
    y: 0,
    colId: null,
  });

  @ViewChild('chartComp') chartComp?: ChartComponent;
  @ViewChild('gameTable') gameTable?: GameTableComponent;

  private pendingFilterModel: Record<string, unknown> | null = null;
  private pendingColumnState: any[] | null = null;
  private results: DataPoint[] = [];

  constructor() {
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
    this.scheduleSavePreferences();
  }

  setLanguage(lang: AppLanguage): void {
    this.i18n.setLanguage(lang);
    this.columnConfigService.updateLanguage(lang);

    if (this.dataLoaded() && this.rowData().length > 0) {
      this.updateColumnDefinitions();
      this.gameTable?.updateGridOptions({
        autoGroupColumnDef: {
          headerName: lang === 'pl' ? 'Grupa' : 'Group',
          minWidth: 260,
          pinned: 'left',
          cellRendererParams: {
            suppressCount: false,
          },
        },
        columnDefs: this.columnDefs(),
      });
    }
  }

  async onFileUpload(file: File): Promise<void> {
    if (file) {
      this.fileDate.set(formatDate(new Date(file.lastModified)));
    }
    await this.parseCsv(file);
  }

  async parseCsv(file: File | string): Promise<void> {
    if (file && (await this.collectionDataService.validateCsv(file))) {
      try {
        const data = await this.collectionDataService.parseCsv(file);
        this.results = data;
        this.processParsedData(data);
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    } else {
      alert(this.t.csvErrorAlert);
    }
  }

  onLoadMyExample(): void {
    this.collectionDataService.loadExample(environment.filePath).subscribe((response) => {
      if (response.fileDate) {
        this.fileDate.set(response.fileDate);
      }
      this.results = response.data;
      this.processParsedData(response.data);
    });
  }

  private processParsedData(data: DataPoint[]): void {
    const [games, expansions] = this.extractData(data);
    this.dataLoaded.set(true);
    this.gamesPoints.set(games);
    this.expansionPoints.set(expansions);

    const rows = this.collectionDataService.prepareRowData(data);
    this.rowData.set(rows);
    this.updateColumnDefinitions();

    setTimeout(() => {
      if (this.pendingColumnState || this.pendingFilterModel) {
        if (this.pendingColumnState) {
          this.gameTable?.applyColumnState(this.pendingColumnState);
          this.pendingColumnState = null;
        }
        if (this.pendingFilterModel) {
          this.gameTable?.setFilterModel(this.pendingFilterModel);
          this.pendingFilterModel = null;
        }
      }
    }, 50);
  }

  extractData(optionalData?: DataPoint[]): [DataPoint[], DataPoint[]] {
    const data = optionalData || this.results;
    const { games, expansions, count } = this.collectionDataService.extractChartPoints(
      data,
      this.showStandalone(),
      this.showExpansions()
    );
    this.counter.set(count);
    return [games, expansions];
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
        this.gameTable?.sizeColumnsToFit();
      }, 50);
    }
  }

  onChartPointSelected(point: any): void {
    const objectId = point?.objectid;
    if (!objectId) return;

    const all = this.allActiveGames();
    const game = all.find((g) => g.objectid === objectId) || point;
    this.selectedGame.set(game);
    this.chartComp?.selectPointByObjectId(objectId);
    this.gameTable?.selectGameByObjectId(objectId);
  }

  onCardGameSelected(game: DataPoint): void {
    this.selectedGame.set(game);
    this.chartComp?.selectPointByObjectId(game.objectid);
    this.gameTable?.selectGameByObjectId(game.objectid);
  }

  onTableRowSelected(game: any): void {
    this.selectedGame.set(game);
    this.chartComp?.selectPointByObjectId(game?.objectid);
  }

  clearSelectedGame(): void {
    this.selectedGame.set(null);
    this.chartComp?.clearSelection();
    this.gameTable?.deselectAll();
  }

  openBggPage(objectId: string | number | undefined): void {
    openBggPage(objectId);
  }

  private applyStoredPreferences(): void {
    const prefs = this.uiPreferencesService.load();
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
      this.columnConfigService.applyStoredTableVisibility(prefs.columnVisibility);
    }
    if (prefs.tooltipVisibility) {
      this.columnConfigService.applyStoredTooltipVisibility(prefs.tooltipVisibility);
    } else if (prefs.columnVisibility) {
      this.columnConfigService.applyStoredTooltipVisibility(prefs.columnVisibility);
    }

    this.pendingFilterModel = prefs.filterModel;
    this.pendingColumnState = prefs.columnState;
  }

  private scheduleSavePreferences(): void {
    this.uiPreferencesService.scheduleSave(() => this.buildCurrentPreferences());
  }

  private buildCurrentPreferences(): UiPreferences {
    const columnState = (this.gameTable?.getColumnState() ?? this.pendingColumnState ?? []).map(
      ({ hide, ...rest }: any) => rest
    );

    return {
      columnVisibility: Object.fromEntries(
        this.tableColumnOptions().map((option) => [option.key, option.visible])
      ),
      tooltipVisibility: Object.fromEntries(
        this.tooltipOptions().map((option) => [option.key, option.visible])
      ),
      showStandalone: this.showStandalone(),
      showExpansions: this.showExpansions(),
      filterModel: this.gameTable?.getFilterModel() ?? this.pendingFilterModel,
      columnState,
      darkMode: this.isDarkMode(),
    };
  }

  resetPreferences(): void {
    this.uiPreferencesService.clear();
    this.pendingFilterModel = null;
    this.pendingColumnState = null;
    this.showStandalone.set(true);
    this.showExpansions.set(false);
    this.isDarkMode.set(
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    );

    this.columnConfigService.resetToDefaults(this.currentLang());

    if (this.dataLoaded()) {
      this.updateColumnDefinitions();

      if (this.gameTable) {
        this.gameTable.resetColumnState();
        this.gameTable.setFilterModel(null);
      }

      const [games, expansions] = this.extractData();
      this.gamesPoints.set(games);
      this.expansionPoints.set(expansions);
    }
  }

  onTableFilterChanged(filteredData: any[]): void {
    const [games, expansions] = this.extractData(filteredData);
    this.gamesPoints.set(games);
    this.expansionPoints.set(expansions);
    this.scheduleSavePreferences();
  }

  onTooltipOptionToggled(entry: { key: string; visible: boolean }): void {
    if (this.columnConfigService.syncTooltipVisibility(entry.key, entry.visible)) {
      this.scheduleSavePreferences();
    }
  }

  onOptionToggled(entry: { key: string; visible: boolean }): void {
    this.onTooltipOptionToggled(entry);
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

    const exists = this.tableColumnOptions().some((o) => o.key === colId);
    if (exists) {
      this.columnConfigService.syncTableColumnVisibility(colId, false);
      this.gameTable?.setColumnsVisible([colId], false);
      this.scheduleSavePreferences();
    }

    this.closeColumnMenu();
  }

  toggleColumnFromMenu(event: { option: CheckboxOption; checked: boolean }): void {
    if (this.columnConfigService.syncTableColumnVisibility(event.option.key, event.checked)) {
      this.gameTable?.setColumnsVisible([event.option.key], event.checked);
      this.scheduleSavePreferences();
    }
  }

  onColumnVisible(event: ColumnVisibleEvent): void {
    const columns = event.columns ?? (event.column ? [event.column] : []);
    let changed = false;

    for (const column of columns) {
      if (this.columnConfigService.syncTableColumnVisibility(column.getColId(), column.isVisible())) {
        changed = true;
      }
    }

    if (changed) {
      this.scheduleSavePreferences();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
    if (this.dataLoaded() && this.rowData().length > 0) {
      this.updateColumnDefinitions();
      this.gameTable?.sizeColumnsToFit();
    }
  }

  onToggleFilters(): void {
    if (!this.showStandalone() && !this.showExpansions()) {
      this.showStandalone.set(true);
    }
    const [games, expansions] = this.extractData();
    this.gamesPoints.set(games);
    this.expansionPoints.set(expansions);
    this.gameTable?.triggerFilterChange();
    this.scheduleSavePreferences();
  }

  onGridStateChanged(): void {
    this.scheduleSavePreferences();
  }

  private onColumnVisibilityChanged(): void {
    if (!this.dataLoaded()) {
      this.scheduleSavePreferences();
      return;
    }

    this.scheduleSavePreferences();
  }

  private updateColumnDefinitions(): void {
    const firstRow = this.rowData()[0];
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const cols = this.columnConfigService.generateColumnDefs(firstRow, this.currentLang(), width);
    this.columnDefs.set(cols);
  }

  private checkScreenSize(): void {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = width < 768;
    const shouldPinName = width >= 1024;

    this.isMobile.set(isMobile);
    if (isMobile && this.activeTab() === 'all') {
      this.activeTab.set('chart');
    }
    this.gameTable?.setColumnsPinned(['objectname'], shouldPinName ? 'left' : null);
  }
}
