import {Component, ViewChild} from '@angular/core';
import * as Papa from 'papaparse';
import {ParseResult} from 'papaparse';
import * as Highcharts from 'highcharts';
import {HighchartsChartModule} from "highcharts-angular";
import {FormsModule} from "@angular/forms";
import {ColDef} from "ag-grid-community";
import {AgGridAngular} from "ag-grid-angular";
import {gridOptions, tableConfig} from "./tableConfig";

const NOT_DISPLAYED = ['x', 'y', 'objectname', 'url'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    HighchartsChartModule,
    FormsModule,
    AgGridAngular
  ],
  standalone: true,
})
export class AppComponent {
  counter = 0;
  isExpanded: boolean = false;
  dataLoaded: boolean = false;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  visibleColumns: Set<string> = new Set();
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  protected readonly gridOptions = gridOptions;
  excludeExpansions = false;
  private results: DataPoint[] = [];


  private readonly link = "https://boardgamegeek.com/boardgame/";

  chartOptions: Highcharts.Options = {
    chart: {type: 'scatter', height: 800},
    title: {text: 'Average vs AvgWeight'},
    xAxis: {title: {text: 'Average'}},
    yAxis: {title: {text: 'AvgWeight'}},
    tooltip: {
      useHTML: true,
      formatter: function () {
        const point = this as Highcharts.Point;
        // console.log(point);
        let tooltip = `Name: <b>${point.name}</b><br>`;
        tooltip += `Rating: <b>${point.y}</b><br>`;
        tooltip += `Weight: <b>${point.x}</b><br>`;

        // Include selected options in the tooltip based on checkbox state
        const options = point.options as any;
        // console.log(options)
        for (let tooltipName of Object.keys(options)) {
          if (!!options[tooltipName] &&  !NOT_DISPLAYED.includes(tooltipName)) {
            // @ts-ignore
            tooltip += `${tooltipName}: <b>${point[tooltipName]}</b><br>`;
          }
        }

        return tooltip;
      }
      // pointFormat: 'Name: <b>{point.objectName}</b><br>Weight: <b>{point.x}</b><br>Rating: <b>{point.y}</b>'
    },
    series: [
      {
        type: 'scatter',
        name: 'Games',
        data: [],
        color: 'rgba(5,141,199,0.5)'
      },
      {
        type: 'scatter',
        name: 'Expansions',
        data: [],
        color: 'rgba(237,86,27,0.5)'
      },
    ],
    plotOptions: {
      scatter:{
        marker:{
          radius: 2.5
        },
      },
      series: {
        cursor: 'pointer', // Show pointer cursor for clickable points
        point: {
          events: {
            click: function () {
              // Open a webpage when a point is clicked
              let options = this.options as any;
              const url = options['url']; // URL is passed as a property in point data
              if (url) {
                window.open(url, '_blank'); // Open in a new tab
              }
            },
          },
        },
      },
    },
  };
  checkboxOptions = Object.keys(tableConfig).map(key => ({
    key,
    visible: tableConfig[key].visible
  }));

  async onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file && await this.validateCsv(file)) {
      Papa.parse(file, {
        header: true, // Parse the CSV as JSON objects with keys from the header row
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
      alert("Problem z plikiem CSV, czy na pewno pochodzi z BGG?\nProblem with CSV file, is it for sure from BGG?");
    }
  }

  private initializeChart(): void {
    Highcharts.chart('hcContainer', this.chartOptions);
  }

  private processTableData(result: ParseResult<DataPoint>) {
    this.populateVisibleColumns();
    this.rowData = result.data.map(row => {
      // Check if 'bggrecagerange' has a '+' and remove it, then convert to number
      if (row.bggrecagerange && typeof row.bggrecagerange === 'string') {
        row.bggrecagerange = parseFloat(row.bggrecagerange.replace('+', ''));
      }
      return row;
    });
    this.columnDefs = this.generateColumns(result.data[0] as unknown as any[]);
    this.columnDefs[0].pinned = "left";
  }

  private generateColumns(collection: any[]) {
    return Object.keys(collection || {}).map(key => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      filter: true,
      hide: !this.visibleColumns.has(key),
      suppressColumnsToolPanel: true,
      floatingFilter: true,
      cellDataType: this.calculateCellDataType(key),
    } as ColDef));
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

  populateVisibleColumns(): void {
    for (const key in tableConfig) {
      if (tableConfig[key] && tableConfig[key].visible) {
        this.visibleColumns.add(key);
      }
    }
  }

  extractData(): DataPoint[][] {
    const data = this.results;
    this.counter = 0;
    const dataPoints: DataPoint[] = [];
    const expansion: DataPoint[] = [];
    data.forEach((row) => {
      const average = +parseFloat(row['average']).toFixed(2);
      const avgWeight = +parseFloat(row['avgweight']).toFixed(2);
      const objectName = row['objectname'];
      const objectid = row['objectid'];

      if (!isNaN(average) && !isNaN(avgWeight)) {
        const dataPoint: DataPoint = {
          x: avgWeight,
          y: average,
          objectname: objectName,
          objectid
        };

        // Dynamically add all properties from the original row
        Object.keys(row).forEach(key => {
          // Only add if the column is configured to be visible
          if (tableConfig[key]) {
            dataPoint[key] = row[key];
          }
        });

        if (this.excludeExpansions) {
          if (row['itemtype'] === 'standalone') {
            dataPoints.push(dataPoint);
            this.counter++;
          }
        } else {
          if (row['itemtype'] === 'standalone') {
            dataPoints.push(dataPoint);
            this.counter++;
          }
          if (row['itemtype'] === 'expansion') {
            expansion.push(dataPoint);
            this.counter++;
          }
        }
      }
    });
    return [dataPoints,expansion];
  }


  updateChart(dataPoints: DataPoint[], expansions: DataPoint[]): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          type: 'scatter',
          name: 'Games',
          marker: {
            symbol: 'circle',
            color: 'rgba(237,86,27,0.5)'
          },
          data: this.processPoints(dataPoints),
        },
        {
          type: 'scatter',
          name: 'Expansions',
          marker: {
            symbol: 'square',
            color: 'rgba(5,141,199,0.5)'
          },
          data: this.processPoints(expansions),
        },
      ],
    };
  }

  private processPoints(dataPoints: DataPoint[]) {
    return dataPoints.map((point) => {
      const additionalProps = {};
      Object.keys(tableConfig).forEach(key => {
        if (tableConfig[key].visible) {
          // @ts-ignore
          additionalProps[key] = point[key];
        }
      });

      return {
        name: point.objectname,
        x: point.x,
        y: point.y,
        url: this.link + point.objectid,
        ...additionalProps
      };
    });
  }

  addUserName() {
    const userName = prompt('Enter your name:');
    if (userName) {
      window.open(`https://boardgamegeek.com/geekcollection.php?action=exportcsv&subtype=boardgame&username=${userName}&all=1`)
    }
  }

  toggleOptions() {
    this.isExpanded = !this.isExpanded;
  }

  onUpdate(entry: { key: string, visible: boolean }) {
    if (this.visibleColumns.has(entry.key) && !entry.visible) {
      this.visibleColumns.delete(entry.key);
      this.agGrid.api.setColumnsVisible([entry.key], false);
    } else if (entry.visible) {
      this.visibleColumns.add(entry.key);
      this.agGrid.api.setColumnsVisible([entry.key], true);
    }

    this.chartOptions = {
      ...this.chartOptions,
      tooltip: {
        ...this.chartOptions.tooltip,
        formatter: function () {
          const point = this as Highcharts.Point;
          let tooltip = `Name: <b>${point.name}</b><br>`;
          tooltip += `Rating: <b>${point.y}</b><br>`;
          tooltip += `Weight: <b>${point.x}</b><br>`;

          // Include selected options in the tooltip based on checkbox state
          const options = point.options as any;
          for (let tooltipName of Object.keys(options)) {
            // Only add to tooltip if the checkbox for this column is checked
            if (!!options[tooltipName] &&  !NOT_DISPLAYED.includes(tooltipName)) {
              tooltip += `${tooltipName}: <b>${options[tooltipName]}</b><br>`;
            }
          }

          return tooltip;
        }
      }
    };

    // Redraw the chart with updated options
    Highcharts.chart("hcContainer", this.chartOptions);
  }
  onUpdateExcludeExpansions(excludeExpansions: boolean) {
    this.excludeExpansions = excludeExpansions;
    const dataPoints = this.extractData();
    this.updateChart(dataPoints[0], dataPoints[1]);
    Highcharts.chart("hcContainer", this.chartOptions);
  }

  private validateCsv(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const expectedHeader = ['objectname', 'objectid', 'rating', 'numplays'];
      if (file) {
        Papa.parse(file, {
          header: false, // Parse without converting to objects
          preview: 1,    // Only read the first row
          complete: (results: Papa.ParseResult<string[]>) => {
            // Get the first row (header)
            const fileHeader = results.data[0];

            // Check if the header matches exactly
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
