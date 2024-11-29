import {Component} from '@angular/core';
import * as Papa from 'papaparse';
import * as Highcharts from 'highcharts';
import {HighchartsChartModule} from "highcharts-angular";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    HighchartsChartModule
  ],
  // Use SCSS here
})
export class AppComponent {
  Highcharts: typeof Highcharts = Highcharts;
  private readonly link = "https://boardgamegeek.com/boardgame/";
  chartOptions: Highcharts.Options = {
    chart: { type: 'scatter',height: 800 },
    title: { text: 'Average vs AvgWeight' },
    xAxis: { title: { text: 'Average' } },
    yAxis: { title: { text: 'AvgWeight' } },
    tooltip: {
      useHTML: true,
      pointFormat: 'Name: <b>{point.objectName}</b><br>Weight: <b>{point.x}</b><br>Rating: <b>{point.y}</b>'
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
    const dataPoints: DataPoint[] = [];
    data.forEach((row) => {
      const average = +parseFloat(row['average']).toFixed(2); // Column name in the CSV
      const avgWeight = +parseFloat(row['avgweight']).toFixed(2); // Column name in the CSV
      const objectName = row['objectname']; // Assume there's a column named categoryName
      const objectid = row['objectid']; // Assume there's a column named categoryName
      if (!isNaN(average) && !isNaN(avgWeight)) {
        dataPoints.push({ x: avgWeight, y: average, objectName, objectid });
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
}

export interface DataPoint {
  x: number;
  y: number;
  objectName: string;
  objectid?: string;
  url?: string;
}
