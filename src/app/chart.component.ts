import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import * as Highcharts from 'highcharts';
import { Chart } from 'highcharts';
import { I18nService } from './i18n';
import { formatNumberPrecision, getColumnLabel, tableConfig } from './tableConfig';
import { DataPoint, StringKeyValueMap } from './models';

const NOT_DISPLAYED = new Set(['x', 'y', 'objectname', 'url', 'name', 'Nazwa', 'Name', 'rating', 'weight', 'objectid']);

@Component({
  selector: 'app-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="graph sheet"
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
      margin: var(--space-md) 0;
      background: var(--color-sheet);
      border: var(--rule-bar) solid var(--color-rule-2);
      border-radius: var(--radius-card);
      padding: var(--space-xs);
      box-sizing: border-box;
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

  private readonly i18n = inject(I18nService);
  get t() { return this.i18n.t(); }
  readonly isDarkMode = input<boolean>(false);
  readonly isMobile = input<boolean>(false);
  readonly selectedObjectId = input<string | number | null>(null);
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
      this.i18n.currentLang();
      this.isDarkMode();
      this.isMobile();
      this.selectedObjectId();
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
    const selId = this.selectedObjectId();
    if (selId) {
      this.selectPointByObjectId(selId);
    }
  }

  private buildChartOptions(): Highcharts.Options {
    const self = this;
    const isDark = this.isDarkMode();
    const isMobileDevice = this.isMobile();
    const games = this.processPoints(this.gamesData());
    const expansions = this.processPoints(this.expansionsData());

    const textColor = isDark ? '#e4e8ec' : '#1e242a';
    const mutedColor = isDark ? '#98a2ad' : '#58626e';
    const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const gamesColor = isDark ? 'rgba(235, 75, 135, 0.75)' : 'rgba(180, 24, 90, 0.70)';
    const expansionsColor = isDark ? 'rgba(84, 154, 230, 0.75)' : 'rgba(38, 92, 138, 0.70)';
    const selectColor = isDark ? '#fb7185' : '#be123c';

    return {
      chart: {
        type: 'scatter',
        backgroundColor: 'transparent',
        height: isMobileDevice ? 400 : 700,
        zooming: {
          type: 'xy'
        },
        panning: {
          enabled: true,
          type: 'xy'
        },
        panKey: 'shift',
        style: {
          fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif'
        }
      },
      title: {
        text: this.t.chartTitle,
        style: {
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontWeight: '600',
          fontSize: '18px',
          color: textColor,
          letterSpacing: '-0.02em'
        }
      },
      xAxis: {
        title: {
          text: this.t.chartXAxis,
          style: {
            fontFamily: '"Hanken Grotesk", sans-serif',
            fontWeight: '600',
            fontSize: '13px',
            color: mutedColor
          }
        },
        labels: {
          style: {
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '12px',
            color: mutedColor
          }
        },
        gridLineColor,
        lineColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)',
        tickColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)'
      },
      yAxis: {
        title: {
          text: this.t.chartYAxis,
          style: {
            fontFamily: '"Hanken Grotesk", sans-serif',
            fontWeight: '600',
            fontSize: '13px',
            color: mutedColor
          }
        },
        labels: {
          style: {
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '12px',
            color: mutedColor
          }
        },
        gridLineColor
      },
      legend: {
        itemStyle: {
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontWeight: '500',
          fontSize: '13px',
          color: textColor
        },
        itemHoverStyle: {
          color: selectColor
        }
      },
      tooltip: {
        useHTML: true,
        backgroundColor: isDark ? '#24292e' : '#f4f6f8',
        borderColor: isDark ? '#48525c' : '#c8d0d8',
        borderRadius: 2,
        shadow: false,
        style: {
          color: textColor,
          fontFamily: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
          fontSize: '13px'
        },
        formatter: function () {
          const point = this as Highcharts.Point;
          let tooltip = `<div style="font-family:'Hanken Grotesk',sans-serif;font-weight:600;font-size:14px;margin-bottom:4px;border-bottom:1px solid ${gridLineColor};padding-bottom:3px;">${point.name}</div>`;
          const options = point.options as any;
          for (const tooltipName of Object.keys(options)) {
            if (options[tooltipName] && !NOT_DISPLAYED.has(tooltipName)) {
              const val = formatNumberPrecision(options[tooltipName], 2);
              tooltip += `<div style="display:flex;justify-content:space-between;gap:12px;font-size:12px;"><span style="color:${mutedColor}">${tooltipName}:</span> <span style="font-family:'IBM Plex Mono',monospace;font-weight:500;">${val}</span></div>`;
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
            fillColor: gamesColor
          },
          data: games,
        },
        {
          type: 'scatter',
          name: this.t.chartSeriesExpansions,
          marker: {
            symbol: 'square',
            fillColor: expansionsColor
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
                fillColor: selectColor,
                lineColor: textColor,
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
        if (key !== 'objectname' && visibleCols.has(key) && !(key in additionalProps)) {
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
    return getColumnLabel(key, this.i18n.currentLang());
  }
}
