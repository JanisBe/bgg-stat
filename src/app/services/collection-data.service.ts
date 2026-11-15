import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Papa from 'papaparse';
import { ParseResult } from 'papaparse';
import { Observable, map } from 'rxjs';
import { DataPoint } from '../models';
import { tableConfig } from '../tableConfig';
import { formatDate } from '../utils/date.utils';

export interface ChartExtractionResult {
  games: DataPoint[];
  expansions: DataPoint[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class CollectionDataService {
  private readonly http = inject(HttpClient);

  /**
   * Validates if the file/content matches the expected BGG 58-column CSV structure.
   */
  validateCsv(file: File | string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const expectedHeader = ['objectname', 'objectid', 'rating', 'numplays'];
      Papa.parse(file as any, {
        header: false,
        preview: 1,
        complete: (results: Papa.ParseResult<string[]>) => {
          const fileHeader = results.data?.[0];
          if (fileHeader?.length !== 58) {
            resolve(false);
            return;
          }
          const matches = expectedHeader.every(
            (value, index) => value.toLowerCase().trim() === fileHeader[index]?.toLowerCase()?.trim()
          );
          resolve(matches);
        },
        error: (error) => reject(error),
      });
    });
  }

  /**
   * Parses CSV file or text into an array of DataPoint objects.
   */
  parseCsv(file: File | string): Promise<DataPoint[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file as any, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (result: ParseResult<DataPoint>) => {
          resolve(result.data);
        },
        error: (error) => reject(error),
      });
    });
  }

  /**
   * Loads example collection CSV from the assets endpoint.
   */
  loadExample(filePath: string): Observable<{ data: DataPoint[]; fileDate?: string }> {
    return this.http.get(filePath, { observe: 'response', responseType: 'text' }).pipe(
      map((response) => {
        let fileDate: string | undefined;
        const lastModified = response.headers.get('Last-Modified');
        if (lastModified) {
          fileDate = formatDate(new Date(lastModified));
        }
        return { content: response.body || '', fileDate };
      }),
      // Convert to parsed DataPoint[]
      map((res) => {
        const parsed = Papa.parse(res.content, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        return {
          data: (parsed.data || []) as DataPoint[],
          fileDate: res.fileDate,
        };
      })
    );
  }

  /**
   * Cleans and prepares row data for AG-Grid (e.g. converting "8+" age to number 8).
   */
  prepareRowData(rawData: DataPoint[]): DataPoint[] {
    return (rawData || []).map((row) => {
      const cloned = { ...row };
      if (cloned.bggrecagerange && typeof cloned.bggrecagerange === 'string') {
        cloned.bggrecagerange = Number.parseFloat(cloned.bggrecagerange.replace('+', ''));
      }
      return cloned;
    });
  }

  /**
   * Filters and splits raw rows into standalone games and expansions for the chart.
   */
  extractChartPoints(
    data: DataPoint[],
    showStandalone: boolean,
    showExpansions: boolean
  ): ChartExtractionResult {
    let count = 0;
    const games: DataPoint[] = [];
    const expansions: DataPoint[] = [];

    (data || []).forEach((row) => {
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

        if (isStandalone && showStandalone) {
          games.push(dataPoint);
          count++;
        } else if (isExpansion && showExpansions) {
          expansions.push(dataPoint);
          count++;
        }
      }
    });

    return { games, expansions, count };
  }
}
