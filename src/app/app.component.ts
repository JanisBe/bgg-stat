import {Component} from '@angular/core';
import * as Papa from 'papaparse';
import {ParseResult} from 'papaparse';
import * as Highcharts from 'highcharts';
import {HighchartsChartModule} from "highcharts-angular";
import {FormsModule} from "@angular/forms";
import {ColDef, GridOptions} from "ag-grid-community";
import {AgGridAngular} from "ag-grid-angular";
import {tableConfig} from "./tableConfig";
// noinspection SpellCheckingInspection
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
  Highcharts: typeof Highcharts = Highcharts;
  rowData: any[] = [];
  columnDefs: ColDef[] = [];
  gridOptions: GridOptions = {
    autoSizeStrategy: {
      type: 'fitGridWidth',
      defaultMinWidth: 100,
      columnLimits: [
        {
          colId: 'objectname',
          minWidth: 350
        }
      ]
    },
  };

  private readonly link = "https://boardgamegeek.com/boardgame/";
  options = {
    tooltipNames: [
      {objectid: false},
      {originalname: false},
      {bggrecplayers: false},
      {baverage: false},
      {bggrecagerange: false},
      {playingtime: false}
    ] as TooltipName[],
    excludeExpansions: true,
  };
  chartOptions: Highcharts.Options = {
    chart: {type: 'scatter', height: 800},
    title: {text: 'Average vs AvgWeight'},
    xAxis: {title: {text: 'Average'}},
    yAxis: {title: {text: 'AvgWeight'}},
    tooltip: {
      useHTML: true,
      formatter: function () {
        const point = this as Highcharts.Point;
        console.log(point);
        let tooltip = `Name: <b>${point.name}</b><br>`;
        tooltip += `Rating: <b>${point.y}</b><br>`;
        tooltip += `Weight: <b>${point.x}</b><br>`;

        // Include selected options in the tooltip based on checkbox state
        const options = point.options as any;
        for (let tooltipName of Object.keys(options)) {
          if (options[tooltipName]) {
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
        data: [], // Data will be dynamically updated
      },
    ],
    plotOptions: {
      series: {
        cursor: 'pointer', // Show pointer cursor for clickable points
        point: {
          events: {
            click: function (event: any) {
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

  onFileUpload(event: any): void {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true, // Parse the CSV as JSON objects with keys from the header row
        skipEmptyLines: true,
        complete: (result: ParseResult<DataPoint>) => {
          const dataPoints = this.extractData(result.data as any[]);
          this.dataLoaded = true;
          this.updateChart(dataPoints);
          this.processTableData(result);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
  }

  private processTableData(result: ParseResult<DataPoint>) {
    this.rowData = result.data;
    this.columnDefs = Object.keys(result.data[0] || {}).map(key => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1),
      filter: true,
      hide: this.isHidden(key),
      suppressToolPanel: true
    }));
    this.columnDefs[0].pinned = "left";
  }

  isHidden(key: string): boolean {
    let foundKey = tableConfig.find(obj => obj.hasOwnProperty(key));
    return foundKey ? foundKey[key] : true;
  }

  extractData(data: any[]): DataPoint[] {
    this.counter = 0;
    const dataPoints: DataPoint[] = [];
    data.forEach((row) => {
      const average = +parseFloat(row['average']).toFixed(2); // Column name in the CSV
      const avgWeight = +parseFloat(row['avgweight']).toFixed(2); // Column name in the CSV
      const objectName = row['objectname']; // Assume there's a column named categoryName
      const objectid = row['objectid']; // Assume there's a column named categoryName
      if (!isNaN(average) && !isNaN(avgWeight)) {
        if (this.options.excludeExpansions) {
          if (row['itemtype'] === 'standalone') {
            dataPoints.push({x: avgWeight, y: average, objectName, objectid});
            this.counter++;
          }
        }
      }
    });
    return dataPoints;
  }

  updateChart(dataPoints: DataPoint[]): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          type: 'scatter',
          name: 'Games',
          marker: {
            symbol: 'circle'
          },
          data: dataPoints.map((point) => ({
            x: point.x,
            y: point.y,
            objectName: point.objectName,
            url: this.link + point.objectid,
          })),
        },
      ],
    };
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

  get objectKeys() {
    return Object.keys;
  }

  onUpdate() {
    console.log("asd")
  }
}

interface DataPoint {
  x: number;
  y: number;
  objectName: string;
  objectid?: string;
  url?: string;
  originalname?: false;
  bggrecplayers?: false;
  baverage?: false;
  bggrecagerange?: false;
  playingtime?: false;
}

type TooltipName = {
  [key: string]: boolean;
};
