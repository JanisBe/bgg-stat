import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getActiveTranslations } from './i18n';
import { DataPoint } from './models';

type SortOption = 'rating' | 'weight' | 'name' | 'rank';

@Component({
  selector: 'app-game-card-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="card-list-wrapper" [class.dark-theme]="isDarkMode()">
      <div class="list-controls">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            [placeholder]="t.searchPlaceholder"
            [ngModel]="searchQuery()"
            (ngModelChange)="onSearchChange($event)"
            class="search-input"
          />
          @if (searchQuery()) {
            <button
              type="button"
              class="clear-search-btn"
              (click)="clearSearch()"
              aria-label="Clear search"
            >
              ✕
            </button>
          }
        </div>

        <div class="sort-bar">
          <label class="sort-label">{{ t.sortBy }}:</label>
          <select
            [ngModel]="currentSort()"
            (ngModelChange)="onSortChange($event)"
            class="sort-select"
          >
            <option value="rating">{{ t.sortRating }}</option>
            <option value="weight">{{ t.sortWeight }}</option>
            <option value="name">{{ t.sortName }}</option>
            <option value="rank">{{ t.sortRank }}</option>
          </select>
        </div>
      </div>

      <div class="list-summary">
        {{ t.displayedGames.replace('{counter}', '' + sortedGames().length) }}
      </div>

      <div class="cards-grid">
        @for (game of displayedGames(); track game.objectid || game.objectname) {
          <div
            class="game-card"
            [class.selected]="selectedObjectId() === game.objectid"
            [class.expansion]="game.itemtype === 'expansion'"
            (click)="selectGame(game)"
          >
            <div class="card-main">
              <div class="card-title-row">
                <h4 class="card-title">{{ game.objectname || game.name }}</h4>
                @if (game.itemtype === 'expansion') {
                  <span class="type-pill expansion-pill">{{ t.expansions }}</span>
                }
              </div>

              @if (game.originalname && game.originalname !== game.objectname && game.originalname !== game.name) {
                <div class="card-original-title">{{ game.originalname }}</div>
              }

              <div class="card-stats">
                @if (game.average || game.y) {
                  <span class="badge rating-badge">
                    ★ {{ formatDecimal(game.average || game.y) }}
                  </span>
                }

                @if (game.avgweight || game.x) {
                  <span class="badge weight-badge" [class]="getWeightClass(game.avgweight || game.x)">
                    ⚖ {{ formatDecimal(game.avgweight || game.x) }}/5
                  </span>
                }

                @if (game.rank && game.rank !== '0' && game.rank !== 0) {
                  <span class="badge rank-badge">#{{ game.rank }}</span>
                }

                @if (game.minplayers || game.maxplayers) {
                  <span class="badge players-badge">
                    👥 {{ formatPlayers(game.minplayers, game.maxplayers) }}
                  </span>
                }

                @if (game.playingtime) {
                  <span class="badge time-badge">⏱ {{ game.playingtime }} {{ t.minutes }}</span>
                }

                @if (game.yearpublished && game.yearpublished !== '0') {
                  <span class="badge year-badge">📅 {{ game.yearpublished }}</span>
                }
              </div>
            </div>

            <div class="card-actions">
              @if (game.objectid) {
                <button
                  type="button"
                  class="bgg-link-btn"
                  (click)="onOpenBgg($event, game.objectid)"
                  [title]="t.openInBgg"
                >
                  {{ t.openInBgg }} ↗
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>{{ t.displayedGames.replace('{counter}', '0') }}</p>
          </div>
        }
      </div>

      @if (hasMore()) {
        <div class="load-more-container">
          <button type="button" class="load-more-btn" (click)="loadMore()">
            {{ t.showMore }} ({{ remainingCount() }})
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .card-list-wrapper {
      margin-top: 12px;
      font-family: inherit;
    }

    .list-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 12px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      font-size: 0.9rem;
      pointer-events: none;
      opacity: 0.6;
    }

    .search-input {
      width: 100%;
      height: 44px;
      padding: 8px 36px 8px 36px;
      border: 1px solid darkcyan;
      border-radius: 8px;
      font-size: 0.95rem;
      box-sizing: border-box;
      background: #ffffff;
      color: inherit;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;

      &:focus {
        border-color: #008b8b;
        box-shadow: 0 0 0 3px rgba(0, 139, 139, 0.2);
      }
    }

    .clear-search-btn {
      position: absolute;
      right: 8px;
      background: transparent;
      border: none;
      font-size: 14px;
      cursor: pointer;
      padding: 6px;
      color: #718096;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sort-bar {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sort-label {
      font-size: 0.88rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .sort-select {
      flex: 1;
      height: 38px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 0 10px;
      font-size: 0.88rem;
      background: #ffffff;
      color: inherit;
      outline: none;
      cursor: pointer;

      &:focus {
        border-color: darkcyan;
      }
    }

    .list-summary {
      font-size: 0.85rem;
      color: #64748b;
      margin-bottom: 10px;
      font-weight: 500;
    }

    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .game-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px 14px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      &:hover {
        border-color: darkcyan;
        box-shadow: 0 3px 8px rgba(0, 139, 139, 0.15);
      }

      &.selected {
        border: 2px solid darkcyan;
        background: #f0fdfa;
      }

      &.expansion {
        border-left: 4px solid #3b82f6;
      }
    }

    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 8px;
    }

    .card-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }

    .card-original-title {
      font-size: 0.82rem;
      color: #64748b;
      font-style: italic;
      margin-top: 2px;
    }

    .type-pill {
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      white-space: nowrap;
    }

    .expansion-pill {
      background: #dbeafe;
      color: #1e40af;
    }

    .card-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 3px 7px;
      border-radius: 5px;
      background: #f1f5f9;
      color: #334155;
    }

    .rating-badge {
      background: #fef3c7;
      color: #92400e;
    }

    .weight-light {
      background: #dcfce7;
      color: #166534;
    }

    .weight-medium {
      background: #ffedd5;
      color: #9a3412;
    }

    .weight-heavy {
      background: #fee2e2;
      color: #991b1b;
    }

    .rank-badge {
      background: #ede9fe;
      color: #5b21b6;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #f1f5f9;
    }

    .bgg-link-btn {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      color: darkcyan;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      min-height: 36px;
      display: inline-flex;
      align-items: center;

      &:hover {
        background: #f0fdfa;
        border-color: darkcyan;
      }
    }

    .load-more-container {
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }

    .load-more-btn {
      background: darkcyan;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      min-height: 44px;

      &:hover {
        background: #007070;
      }
    }

    .empty-state {
      padding: 30px;
      text-align: center;
      color: #64748b;
    }

    /* Dark theme */
    .card-list-wrapper.dark-theme {
      .search-input {
        background: #24282c;
        border-color: #008b8b;
        color: #e0e0e0;

        &:focus {
          box-shadow: 0 0 0 3px rgba(0, 168, 168, 0.3);
        }
      }

      .clear-search-btn {
        color: #94a3b8;
      }

      .sort-select {
        background: #24282c;
        border-color: #3f4448;
        color: #e0e0e0;
      }

      .list-summary {
        color: #94a3b8;
      }

      .game-card {
        background: #24282c;
        border-color: #3f4448;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);

        &.selected {
          border-color: #00a8a8;
          background: #1e3338;
        }

        &.expansion {
          border-left-color: #60a5fa;
        }
      }

      .card-title {
        color: #f1f5f9;
      }

      .card-original-title {
        color: #94a3b8;
      }

      .expansion-pill {
        background: #1e3a8a;
        color: #93c5fd;
      }

      .badge {
        background: #2d3339;
        color: #cbd5e1;
      }

      .rating-badge {
        background: #452b0a;
        color: #fcd34d;
      }

      .weight-light {
        background: #143521;
        color: #86efac;
      }

      .weight-medium {
        background: #3c2415;
        color: #fdba74;
      }

      .weight-heavy {
        background: #3c1618;
        color: #fca5a5;
      }

      .rank-badge {
        background: #2e1d4d;
        color: #c4b5fd;
      }

      .card-actions {
        border-top-color: #33393f;
      }

      .bgg-link-btn {
        background: #2e343a;
        border-color: #4b5563;
        color: #38bdf8;

        &:hover {
          background: #374151;
          border-color: #38bdf8;
        }
      }

      .load-more-btn {
        background: #008b8b;

        &:hover {
          background: #00a8a8;
        }
      }

      .empty-state {
        color: #94a3b8;
      }
    }
  `]
})
export class GameCardListComponent {
  readonly t = getActiveTranslations();

  readonly games = input<DataPoint[]>([]);
  readonly isDarkMode = input<boolean>(false);
  readonly selectedObjectId = input<string | number | null>(null);

  readonly gameSelected = output<DataPoint>();
  readonly openBgg = output<string | number>();

  readonly searchQuery = signal<string>('');
  readonly currentSort = signal<SortOption>('rating');
  readonly displayLimit = signal<number>(40);

  readonly filteredGames = computed(() => {
    const list = this.games() || [];
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter((g) => {
      const name = (g.objectname || g.name || '').toLowerCase();
      const orig = (g.originalname || '').toLowerCase();
      return name.includes(query) || orig.includes(query);
    });
  });

  readonly sortedGames = computed(() => {
    const list = [...this.filteredGames()];
    const sort = this.currentSort();

    return list.sort((a, b) => {
      if (sort === 'rating') {
        const rA = Number(a.average || a.y || 0);
        const rB = Number(b.average || b.y || 0);
        return rB - rA;
      }
      if (sort === 'weight') {
        const wA = Number(a.avgweight || a.x || 0);
        const wB = Number(b.avgweight || b.x || 0);
        return wB - wA;
      }
      if (sort === 'name') {
        const nA = (a.objectname || a.name || '').toLowerCase();
        const nB = (b.objectname || b.name || '').toLowerCase();
        return nA.localeCompare(nB);
      }
      if (sort === 'rank') {
        const rankA = Number(a.rank) || 999999;
        const rankB = Number(b.rank) || 999999;
        return rankA - rankB;
      }
      return 0;
    });
  });

  readonly displayedGames = computed(() => {
    return this.sortedGames().slice(0, this.displayLimit());
  });

  readonly hasMore = computed(() => {
    return this.sortedGames().length > this.displayLimit();
  });

  readonly remainingCount = computed(() => {
    return Math.max(0, this.sortedGames().length - this.displayLimit());
  });

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.displayLimit.set(40);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.displayLimit.set(40);
  }

  onSortChange(sort: SortOption): void {
    this.currentSort.set(sort);
  }

  loadMore(): void {
    this.displayLimit.update((limit) => limit + 40);
  }

  selectGame(game: DataPoint): void {
    this.gameSelected.emit(game);
  }

  onOpenBgg(event: MouseEvent, objectid: string | number): void {
    event.stopPropagation();
    this.openBgg.emit(objectid);
  }

  formatDecimal(val: any): string {
    const num = typeof val === 'number' ? val : Number.parseFloat(val);
    if (Number.isNaN(num)) return '' + val;
    return num.toFixed(2);
  }

  formatPlayers(min: any, max: any): string {
    if (!min && !max) return '';
    if (min && max && min === max) return `${min}`;
    if (min && max) return `${min} - ${max}`;
    return `${min || max}`;
  }

  getWeightClass(weight: any): string {
    const num = typeof weight === 'number' ? weight : Number.parseFloat(weight);
    if (Number.isNaN(num)) return 'weight-medium';
    if (num < 2.0) return 'weight-light';
    if (num > 3.2) return 'weight-heavy';
    return 'weight-medium';
  }
}

