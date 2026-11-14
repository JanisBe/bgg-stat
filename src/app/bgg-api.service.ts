import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { BggAuthService } from './bgg-auth.service';
import { BggThingDetails } from './bgg-xml/bgg-xml.models';
import { parseBggThingXml } from './bgg-xml/bgg-xml-parser';

@Injectable({
  providedIn: 'root',
})
export class BggApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(BggAuthService);

  private readonly cache = new Map<number, BggThingDetails>();

  /**
   * Fetches detailed game data from BGG XML API2.
   * If the user does not have a token configured, returns `of(null)` immediately.
   */
  getThingDetails(objectId: number | string): Observable<BggThingDetails | null> {
    const id = Number(objectId);
    if (!id || Number.isNaN(id)) {
      return of(null);
    }

    const token = this.authService.token();
    if (!token) {
      return of(null);
    }

    if (this.cache.has(id)) {
      return of(this.cache.get(id)!);
    }

    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${id}&versions=1`;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get(url, { headers, responseType: 'text' }).pipe(
      map((xml) => parseBggThingXml(xml)),
      tap((details) => {
        if (details) {
          this.cache.set(id, details);
        }
      }),
      catchError((error) => {
        console.error(`Failed to fetch BGG data for object ID ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  clearCache(): void {
    this.cache.clear();
  }
}

