import {Component} from '@angular/core';
import * as Papa from 'papaparse';
import * as Highcharts from 'highcharts';
import {HighchartsChartModule} from "highcharts-angular";
import {FormsModule} from "@angular/forms";

// noinspection SpellCheckingInspection
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    HighchartsChartModule,
    FormsModule
  ],
  // Use SCSS here
})
export class AppComponent {
  counter = 0;
  isExpanded: boolean = false;
  Highcharts: typeof Highcharts = Highcharts;
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
        complete: (result) => {
          const dataPoints = this.extractData(result.data as any[]);
          this.updateChart(dataPoints);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        },
      });
    }
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
      window.open(`https://boardgamegeek.com/geekcollection.php?action=exportcsv&subtype=boardgame&username={userName}&all=1`)
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
