import {Component, HostListener, ViewChild} from '@angular/core';
import * as Papa from 'papaparse';
import {ParseResult} from 'papaparse';
import * as Highcharts from 'highcharts';
import {Chart} from 'highcharts';
import {FormsModule} from "@angular/forms";
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
  RowStyle
} from "ag-grid-community";
import {AgGridAngular} from "ag-grid-angular";
import {gridOptions, tableConfig} from "./tableConfig";
import {ColumnMenuRequest, ColumnMenuService} from "./column-menu.service";
import {InnerHeaderComponent} from "./inner-header.component";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {getActiveTranslations} from "./i18n";
import {
  clearUiPreferences,
  hasUiPreferences,
  loadUiPreferences,
  saveUiPreferences,
  UiPreferences
} from "./uiPreferences";

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: "legacy" });

const t = getActiveTranslations();

const NOT_DISPLAYED = new Set(['x', 'y', 'objectname', 'url', 'name', 'Nazwa', 'rating', 'weight', 'objectid']);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    FormsModule,
    AgGridAngular,
  ],
  standalone: true,
})
export class AppComponent {
  t = t;
  chart: Chart | undefined;
  chartOptions: Highcharts.Options = {
    chart: { type: 'scatter', height: 800 },
    title: { text: t.chartTitle },
    xAxis: { title: { text: t.chartXAxis } },
    yAxis: { title: { text: t.chartYAxis } },
    tooltip: {
      useHTML: true,
      formatter: function () {
        const point = this as Highcharts.Point;
        let tooltip = `Name: <b>${point.name}</b><br>`;
        const options = point.options as any;
        for (let tooltipName of Object.keys(options)) {
          if (!!options[tooltipName] && !NOT_DISPLAYED.has(tooltipName)) {
            // @ts-ignore
            tooltip += `${tooltipName}: <b>${point[tooltipName]}</b><br>`;
          }
        }
        return tooltip;
      }
    },
    series: [
      {
        type: 'scatter',
        name: t.chartSeriesGames,
        data: [],
        color: 'rgba(5,141,199,0.5)'
      },
      {
        type: 'scatter',
        name: t.chartSeriesExpansions,
        data: [],
        color: 'rgba(237,86,27,0.5)'
      },
    ],
    plotOptions: {
      scatter: {
        marker: {
          radius: 2.5,
          states: {
            select: {
              fillColor: 'red',
              lineColor: 'black',
              lineWidth: 2,
              radius: 6
            }
          }
        },
        allowPointSelect: true
      },
      series: {
        cursor: 'pointer',
        point: {
          events: {
            click: function () {
              let options = this.options as any;
              const url = options['url'];
              if (url) {
                window.open(url, '_blank');
              }
            },
          },
        },
      },
    },
  };
  private gridApi!: GridApi;
  private savePreferencesTimeout?: ReturnType<typeof setTimeout>;
  private pendingFilterModel: Record<string, unknown> | null = null;
  private pendingColumnState: ReturnType<GridApi['getColumnState']> | null = null;
  counter = 0;
  isExpanded: boolean = false;
  dataLoaded: boolean = false;
  hasSavedPreferences = hasUiPreferences();
  fileDate?: string;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  visibleColumns: Set<string> = new Set();
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  showStandalone = true;
  showExpansions = true;
  columnMenuOpen = false;
  columnMenuX = 0;
  columnMenuY = 0;
  columnMenuColId: string | null = null;
  gridOptions = {
    ...gridOptions,
    defaultColDef: {
      ...gridOptions.defaultColDef,
      innerHeaderComponent: InnerHeaderComponent,
    },
    isExternalFilterPresent: () => true,
    doesExternalFilterPass: (node: any) => {
      const type = node.data.itemtype;
      if (type === 'standalone') return this.showStandalone;
      if (type === 'expansion') return this.showExpansions;
      return true;
    }
  };
  private results: DataPoint[] = [];


  private readonly link = "https://boardgamegeek.com/boardgame/";
  private readonly doubleTapDelayMs = 300;
  private lastTapTime = 0;
  private lastTapObjectId: string | number | null = null;
  private lastContextMenuX = 0;
  private lastContextMenuY = 0;

  checkboxOptions = Object.keys(tableConfig).map(key => ({
    key,
    visible: tableConfig[key].visible,
    translation: this.getTranslation(key)
  }));

  constructor(
    private readonly http: HttpClient,
    private readonly columnMenuService: ColumnMenuService,
  ) {
    this.columnMenuService.open$.subscribe(request => this.openColumnMenu(request));
    this.applyStoredPreferences();
  }

  getTranslation(key: string): string {
    const browserLang = navigator.language || 'en';
    const locale = browserLang.startsWith('pl') ? 'Pl' : 'En';

    return tableConfig[key]?.[`translation${locale}`] || key;
  }

  rowStyle: ((params: RowClassParams) => (RowStyle | undefined)) | undefined = (params) => {
    if (params.data.itemtype == 'expansion') {
      return { background: '#c8c8c8' };
    }
    return { background: '#ececec' };
  };

  async onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileDate = this.formatDate(new Date(file.lastModified));
    }
    await this.pareseCSV(file)
  }

  async pareseCSV(file: any) {
    if (file && (await this.validateCsv(file))) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result: ParseResult<DataPoint>) => {
          this.results = result.data;
          const dataPoints = this.extractData();
          this.dataLoaded = true;
          this.updateChart(dataPoints[0], dataPoints[1]);
          this.processTableData(result);
          this.initializeChart();
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    } else {
      alert(t.csvErrorAlert);
    }
  }

  extractData(optionalData?: DataPoint[]): DataPoint[][] {
    const data = optionalData || this.results;
    this.counter = 0;
    const dataPoints: DataPoint[] = [];
    const expansion: DataPoint[] = [];
    data.forEach((row) => {
      const average = +Number.parseFloat(row['average']).toFixed(3);
      const avgWeight = +Number.parseFloat(row['avgweight']).toFixed(3);
      const objectName = row['objectname'];
      const objectid = row['objectid'];
      if (!Number.isNaN(average) && !Number.isNaN(avgWeight) && avgWeight !== 0) {
        const dataPoint: DataPoint = {
          x: avgWeight,
          y: average,
          objectname: objectName,
          objectid: objectid
        };

        Object.keys(row).forEach(key => {
          if (tableConfig[key]) {
            dataPoint[key] = row[key];
          }
        });

        const isStandalone = row['itemtype'] === 'standalone';
        const isExpansion = row['itemtype'] === 'expansion';

        if (isStandalone && this.showStandalone) {
          dataPoints.push(dataPoint);
          this.counter++;
        } else if (isExpansion && this.showExpansions) {
          expansion.push(dataPoint);
          this.counter++;
        }
      }
    });
    return [dataPoints, expansion];
  }

  onRowClicked(event: RowClickedEvent) {
    const objectId = event.data.objectid;

    if (this.isTouchDevice() && this.isDoubleTap(objectId)) {
      this.openBggPage(objectId);
      return;
    }

    if (!this.chart) return;

    // Wyczyść poprzednie zaznaczenia
    this.chart.getSelectedPoints().forEach(p => p.select(false));

    // Szukamy w obu seriach (Gry i Dodatki)
    this.chart.series.forEach(series => {
      const point = series.data.find(p => (p.options as any).objectid === objectId);
      if (point) {
        point.select(true, false);
      }
    });
  }

  onRowDoubleClicked(event: RowDoubleClickedEvent) {
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

  private openBggPage(objectId: string | number | undefined): void {
    if (objectId) {
      window.open(this.link + objectId, '_blank');
    }
  }

  populateVisibleColumns(): void {
    this.visibleColumns.clear();
    for (const option of this.checkboxOptions) {
      if (option.visible) {
        this.visibleColumns.add(option.key);
      }
    }
  }

  private applyStoredPreferences(): void {
    const prefs = loadUiPreferences();
    if (!prefs) {
      return;
    }

    if (prefs.showStandalone !== undefined) {
      this.showStandalone = prefs.showStandalone;
    }
    if (prefs.showExpansions !== undefined) {
      this.showExpansions = prefs.showExpansions;
    }

    for (const option of this.checkboxOptions) {
      if (option.key in prefs.columnVisibility) {
        option.visible = prefs.columnVisibility[option.key];
      }
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
        this.checkboxOptions.map(option => [option.key, option.visible])
      ),
      showStandalone: this.showStandalone,
      showExpansions: this.showExpansions,
      filterModel: this.gridApi.getFilterModel(),
      columnState,
    };

    saveUiPreferences(prefs);
    this.hasSavedPreferences = true;
  }

  private persistPreferencesWithoutGrid(): void {
    const prefs: UiPreferences = {
      columnVisibility: Object.fromEntries(
        this.checkboxOptions.map(option => [option.key, option.visible])
      ),
      showStandalone: this.showStandalone,
      showExpansions: this.showExpansions,
      filterModel: this.pendingFilterModel,
      columnState: this.pendingColumnState ?? [],
    };

    saveUiPreferences(prefs);
    this.hasSavedPreferences = true;
  }

  resetPreferences(): void {
    clearUiPreferences();
    this.hasSavedPreferences = false;
    this.pendingFilterModel = null;
    this.pendingColumnState = null;
    this.showStandalone = true;
    this.showExpansions = true;

    this.checkboxOptions = Object.keys(tableConfig).map(key => ({
      key,
      visible: tableConfig[key].visible,
      translation: this.getTranslation(key)
    }));

    if (this.dataLoaded) {
      this.populateVisibleColumns();
      this.columnDefs = this.generateColumns(this.rowData[0] ?? {});

    if (this.gridApi) {
        this.gridApi.resetColumnState();
        this.gridApi.setFilterModel(null);
        this.gridApi.onFilterChanged();
      }

      const dataPoints = this.extractData();
      this.updateChart(dataPoints[0], dataPoints[1]);
      this.chart = Highcharts.chart("hcContainer", this.chartOptions);
    }
  }

  onFilterChanged() {
    const filteredData: any[] = [];
    this.gridApi.forEachNodeAfterFilter(node => {
      filteredData.push(node.data);
    });
    const dataPoints = this.extractData(filteredData);
    this.updateChart(dataPoints[0], dataPoints[1]);
    this.chart = Highcharts.chart("hcContainer", this.chartOptions);
    this.scheduleSavePreferences();
  }

  private calculateCellDataType(key: string): string {
    const entry = tableConfig[key];
    if (entry.type) {
      if (entry.type === "n") {
        return "number";
      } else if (entry.type === "b") {
        return "boolean";
      }
    }
    return "text"
  }

  onUpdate(entry: { key: string, visible: boolean }) {
    this.syncColumnVisibility(entry.key, entry.visible, true);
    this.onColumnVisibilityChanged();
  }

  onColumnHeaderContextMenu(event: ColumnHeaderContextMenuEvent) {
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

  openColumnMenu(request: ColumnMenuRequest) {
    if (request.anchor) {
      const rect = request.anchor.getBoundingClientRect();
      this.columnMenuX = rect.left;
      this.columnMenuY = rect.bottom + 4;
    } else {
      this.columnMenuX = request.clientX ?? 0;
      this.columnMenuY = request.clientY ?? 0;
    }

    this.columnMenuColId = request.colId;
    this.columnMenuOpen = true;
  }

  closeColumnMenu() {
    this.columnMenuOpen = false;
    this.columnMenuColId = null;
  }

  hideColumnFromMenu() {
    if (!this.columnMenuColId || this.columnMenuColId === 'objectname') {
      return;
    }

    const option = this.checkboxOptions.find(o => o.key === this.columnMenuColId);
    if (option) {
      option.visible = false;
      this.syncColumnVisibility(this.columnMenuColId, false, true);
      this.onColumnVisibilityChanged();
    }

    this.closeColumnMenu();
  }

  toggleColumnFromMenu(option: { key: string; visible: boolean }, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    option.visible = checked;
    this.syncColumnVisibility(option.key, checked, true);
    this.onColumnVisibilityChanged();
  }

  onColumnVisible(event: ColumnVisibleEvent) {
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
  onResize() {
    this.checkScreenSize();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.columnMenuOpen) {
      this.closeColumnMenu();
    }
  }

  onToggleFilters() {
    const dataPoints = this.extractData();
    this.updateChart(dataPoints[0], dataPoints[1]);
    this.chart = Highcharts.chart("hcContainer", this.chartOptions);
    this.gridApi.onFilterChanged();
    this.scheduleSavePreferences();
  }


  updateChart(dataPoints: DataPoint[], expansions: DataPoint[]): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          type: 'scatter',
          name: t.chartSeriesGames,
          marker: {
            symbol: 'circle',
            color: 'rgba(237,86,27,0.5)'
          },
          data: this.processPoints(dataPoints),
        },
        {
          type: 'scatter',
          name: t.chartSeriesExpansions,
          marker: {
            symbol: 'square',
            color: 'rgba(5,141,199,0.5)'
          },
          data: this.processPoints(expansions),
        },
      ],
    };
  }

  onGridReady(params: { api: GridApi; }) {
    this.gridApi = params.api;
    this.checkScreenSize();
    this.applyPendingGridState();
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

  addUserName() {
    const userName = prompt(t.enterNamePrompt);
    if (userName) {
      window.open(`https://boardgamegeek.com/geekcollection.php?action=exportcsv&subtype=boardgame&username=${userName}&all=1`)
    }
  }

  toggleOptions() {
    this.isExpanded = !this.isExpanded;
  }

  onLoadMyExample() {
    const filePath = environment.filePath;
    this.http.get(filePath, { observe: 'response', responseType: 'text' }).subscribe((response) => {
      const lastModified = response.headers.get('Last-Modified');
      if (lastModified) {
        this.fileDate = this.formatDate(new Date(lastModified));
      }
      this.pareseCSV(response.body!);
    });
  }

  private processTableData(result: ParseResult<DataPoint>) {
    this.populateVisibleColumns();
    this.rowData = result.data.map(row => {
      if (row.bggrecagerange && typeof row.bggrecagerange === 'string') {
        row.bggrecagerange = Number.parseFloat(row.bggrecagerange.replace('+', ''));
      }
      return row;
    });
    this.columnDefs = this.generateColumns(result.data[0] as unknown as any[]);
    const isMobile = window.innerWidth < 768;
    if (this.columnDefs[0]) {
      this.columnDefs[0].pinned = isMobile ? null : "left";
    }
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

            const result = fileHeader.length === 58 &&
              expectedHeader.every((value, index) =>
                value.toLowerCase().trim() === fileHeader[index].toLowerCase().trim()
              );
            resolve(result);
          },
          error(error) {
            reject(error);
          }
        });
      }
    });
  }

  @HostListener('document:contextmenu', ['$event'])
  onDocumentContextMenu(event: MouseEvent) {
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

  private initializeChart(): void {
    this.chart = Highcharts.chart('hcContainer', this.chartOptions);
  }

  private syncColumnVisibility(colId: string, visible: boolean, updateGrid: boolean): boolean {
    const option = this.checkboxOptions.find(o => o.key === colId);
    if (!option || option.visible === visible) {
      return false;
    }

    option.visible = visible;
    if (visible) {
      this.visibleColumns.add(colId);
    } else {
      this.visibleColumns.delete(colId);
    }

    if (updateGrid && this.gridApi) {
      this.gridApi.setColumnsVisible([colId], visible);
    }

    return true;
  }

  private generateName(key: string) {
    return this.getTranslation(key) || key.charAt(0).toUpperCase() + key.slice(1);
  }

  private onColumnVisibilityChanged(): void {
    if (!this.dataLoaded) {
      this.scheduleSavePreferences();
      return;
    }

    if (this.gridApi) {
      const filteredData: any[] = [];
      this.gridApi.forEachNodeAfterFilter(node => filteredData.push(node.data));
      const dataPoints = this.extractData(filteredData);
      this.updateChart(dataPoints[0], dataPoints[1]);
      this.chart = Highcharts.chart("hcContainer", this.chartOptions);
    }

    this.scheduleSavePreferences();
  }

  private processPoints(dataPoints: DataPoint[]) {
    return dataPoints.map((point) => {
      const additionalProps: StringKeyValueMap = {};
      Object.keys(tableConfig).forEach(key => {
        if (this.visibleColumns.has(key) && !(key in additionalProps)) {
          const translatedKey = this.getTranslation(key) || key.charAt(0).toUpperCase() + key.slice(1);
          additionalProps[translatedKey] = point[key];
        }
      });

      return {
        name: point.objectname,
        x: point.x,
        y: point.y,
        url: this.link + point.objectid,
        objectid: point.objectid,
        ...additionalProps
      };
    });
  }

  private generateColumns(collection: any[]) {
    const isMobile = window.innerWidth < 768;
    let columnNames = Object.keys(collection || {}).map(key => ({
      field: key,
      headerName: this.generateName(key),
      headerTooltip: this.generateName(key),
      filter: true,
      sortable: true,
      hide: !this.visibleColumns.has(key),
      floatingFilter: true,
      cellDataType: this.calculateCellDataType(key),
    } as ColDef));
    columnNames.forEach(col => {
      if (col.field === 'objectname') {
        col.pinned = isMobile ? null : 'left';
        col.lockPinned = !isMobile;
        col.lockVisible = true;
      }
    });
    return columnNames;
  }

  private checkScreenSize() {
    if (!this.gridApi) return;
    const isMobile = window.innerWidth < 768;
    this.gridApi.setColumnsPinned(['objectname'], isMobile ? null : 'left');
  }
}

interface DataPoint {
  bggrecagerange?: number | string;

  [key: string]: any;

  x: number;
  y: number;
  objectname: string;
  objectid?: string;
  url?: string;
}

type StringKeyValueMap = {
  [key: string]: string;
};
