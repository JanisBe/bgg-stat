import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
  output,
} from '@angular/core';
import * as Highcharts from 'highcharts';
import { Chart } from 'highcharts';
import { getActiveTranslations } from './i18n';
import { tableConfig } from './tableConfig';
import { DataPoint, StringKeyValueMap } from './models';

const NOT_DISPLAYED = new Set(['x', 'y', 'objectname', 'url', 'name', 'Nazwa', 'rating', 'weight', 'objectid']);

@Component({
  selector: 'app-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="graph"
      [class.highcharts-dark]="isDarkMode()"
      [class.highcharts-light]="!isDarkMode()"
    >
      <div #container id="hcContainer"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .graph {
      margin: 10px 0;
    }

    #hcContainer {
      width: 100%;
      height: 100%;
      display: block;
    }
  `]
})
export class ChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') private readonly containerRef?: ElementRef<HTMLDivElement>;

  readonly t = getActiveTranslations();
  readonly isDarkMode = input<boolean>(false);
  readonly isMobile = input<boolean>(false);
  readonly gamesData = input<DataPoint[]>([]);
  readonly expansionsData = input<DataPoint[]>([]);
  readonly visibleColumns = input<Set<string>>(new Set());

  readonly pointSelected = output<DataPoint>();

  private chart?: Chart;
  private isViewReady = false;
  private readonly link = 'https://boardgamegeek.com/boardgame/';

  constructor() {
    effect(() => {
      // Register reactivity dependencies
      this.isDarkMode();
      this.isMobile();
      this.gamesData();
      this.expansionsData();
      this.visibleColumns();

      if (this.isViewReady) {
        this.renderOrUpdateChart();
      }
    });
  }

  ngAfterViewInit(): void {
    this.isViewReady = true;
    this.renderOrUpdateChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }

  selectPointByObjectId(objectId: string | number | undefined): void {
    if (!this.chart || objectId === undefined) return;

    this.chart.getSelectedPoints().forEach(p => p.select(false));
    this.chart.series.forEach(series => {
      const point = series.data.find(p => (p.options as any).objectid === objectId);
      if (point) {
        point.select(true, false);
      }
    });
  }

  clearSelection(): void {
    if (this.chart) {
      this.chart.getSelectedPoints().forEach(p => p.select(false));
    }
  }

  renderOrUpdateChart(): void {
    if (!this.containerRef?.nativeElement) return;

    const options = this.buildChartOptions();
    this.chart = Highcharts.chart(this.containerRef.nativeElement, options);
  }

  private buildChartOptions(): Highcharts.Options {
    const self = this;
    const isDark = this.isDarkMode();
    const isMobileDevice = this.isMobile();
    const games = this.processPoints(this.gamesData());
    const expansions = this.processPoints(this.expansionsData());

    return {
      chart: {
        type: 'scatter',
        height: isMobileDevice ? 400 : 700,
        zooming: {
          type: 'xy'
        },
        panning: {
          enabled: true,
          type: 'xy'
        },
        panKey: 'shift'
      },
      palette: {
        colorScheme: isDark ? 'dark' : 'light'
      } as any,
      title: { text: this.t.chartTitle },
      xAxis: { title: { text: this.t.chartXAxis } },
      yAxis: { title: { text: this.t.chartYAxis } },
      tooltip: {
        useHTML: true,
        formatter: function () {
          const point = this as Highcharts.Point;
          let tooltip = `Name: <b>${point.name}</b><br>`;
          const options = point.options as any;
          for (const tooltipName of Object.keys(options)) {
            if (options[tooltipName] && !NOT_DISPLAYED.has(tooltipName)) {
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
          name: this.t.chartSeriesGames,
          marker: {
            symbol: 'circle',
            color: 'rgba(237,86,27,0.5)'
          },
          data: games,
        },
        {
          type: 'scatter',
          name: this.t.chartSeriesExpansions,
          marker: {
            symbol: 'square',
            color: 'rgba(5,141,199,0.5)'
          },
          data: expansions,
        },
      ],
      plotOptions: {
        scatter: {
          marker: {
            radius: isMobileDevice ? 3.5 : 2.5,
            states: {
              select: {
                fillColor: 'red',
                lineColor: 'black',
                lineWidth: 2,
                radius: isMobileDevice ? 7 : 6
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
                const options = this.options as any;
                self.pointSelected.emit(options);
              },
            },
          },
        },
      },
    };
  }

  private processPoints(dataPoints: DataPoint[]): any[] {
    const visibleCols = this.visibleColumns();

    return dataPoints.map((point) => {
      const additionalProps: StringKeyValueMap = {};
      Object.keys(tableConfig).forEach(key => {
        if (visibleCols.has(key) && !(key in additionalProps)) {
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

  private getTranslation(key: string): string {
    const browserLang = typeof navigator !== 'undefined' ? (navigator.language || 'en') : 'en';
    const locale = browserLang.startsWith('pl') ? 'Pl' : 'En';
    return tableConfig[key]?.[`translation${locale}`] || key;
  }
}

