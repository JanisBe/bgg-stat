import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from './i18n';
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
          <svg class="search-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
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
              <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
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
            class="game-card sheet"
            [class.selected]="selectedObjectId() === game.objectid"
            [class.expansion]="game.itemtype === 'expansion'"
            tabindex="0"
            role="button"
            [attr.aria-pressed]="selectedObjectId() === game.objectid"
            (click)="selectGame(game)"
            (keydown.enter)="selectGame(game)"
            (keydown.space)="selectGame(game); $event.preventDefault()"
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
                    <svg class="badge-icon star-icon" aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span class="num">{{ formatDecimal(game.average || game.y) }}</span>
                  </span>
                }

                @if (game.avgweight || game.x) {
                  <span class="badge weight-badge" [class]="getWeightClass(game.avgweight || game.x)">
                    <svg class="badge-icon" aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                      <path d="M7 21h10"/>
                      <path d="M12 3v18"/>
                      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
                    </svg>
                    <span class="num">{{ formatDecimal(game.avgweight || game.x) }}/5</span>
                  </span>
                }

                @if (game.rank && game.rank !== '0' && game.rank !== 0) {
                  <span class="badge rank-badge">
                    <span class="num">#{{ game.rank }}</span>
                  </span>
                }

                @if (game.minplayers || game.maxplayers) {
                  <span class="badge players-badge">
                    <svg class="badge-icon" aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <span class="num">{{ formatPlayers(game.minplayers, game.maxplayers) }}</span>
                  </span>
                }

                @if (game.playingtime) {
                  <span class="badge time-badge">
                    <svg class="badge-icon" aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span class="num">{{ game.playingtime }} {{ t.minutes }}</span>
                  </span>
                }

                @if (game.yearpublished && game.yearpublished !== '0') {
                  <span class="badge year-badge">
                    <svg class="badge-icon" aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                      <line x1="16" x2="16" y1="2" y2="6"/>
                      <line x1="8" x2="8" y1="2" y2="6"/>
                      <line x1="3" x2="21" y1="10" y2="10"/>
                    </svg>
                    <span class="num">{{ game.yearpublished }}</span>
                  </span>
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
                  <span>{{ t.openInBgg }}</span>
                  <svg class="external-icon" aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state sheet">
            <p>{{ t.displayedGames.replace('{counter}', '0') }}</p>
          </div>
        }
      </div>

      @if (hasMore()) {
        <div class="load-more-container">
          <button type="button" class="load-more-btn" (click)="loadMore()">
            <span>{{ t.showMore }}</span>
            <span class="num">({{ remainingCount() }})</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .card-list-wrapper {
      margin-top: var(--space-sm);
      font-family: var(--font-body);
      color: var(--color-ink);
    }

    .list-controls {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      margin-bottom: var(--space-xs);
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: var(--space-sm);
      pointer-events: none;
      color: var(--color-muted);
    }

    .search-input {
      width: 100%;
      height: 38px;
      padding: var(--space-2xs) var(--space-xl) var(--space-2xs) 36px;
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      font-size: var(--text-sm);
      font-family: var(--font-body);
      box-sizing: border-box;
      background: var(--color-sheet);
      color: var(--color-ink);

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .clear-search-btn {
      position: absolute;
      right: var(--space-xs);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: var(--space-3xs);
      color: var(--color-muted);
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--color-ink);
        background: var(--color-paper-2);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .sort-bar {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
    }

    .sort-label {
      font-family: var(--font-display);
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      color: var(--color-muted);
      white-space: nowrap;
      text-transform: uppercase;
    }

    .sort-select {
      flex: 1;
      height: 34px;
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      padding: 0 var(--space-sm);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      background: var(--color-sheet);
      color: var(--color-ink);
      cursor: pointer;

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .list-summary {
      font-family: var(--font-outlier);
      font-size: var(--text-xs);
      color: var(--color-muted);
      margin-bottom: var(--space-xs);
    }

    .cards-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .game-card {
      background: var(--color-sheet);
      border: var(--rule-hair) solid var(--color-rule);
      border-radius: var(--radius-card);
      padding: var(--space-sm);
      cursor: pointer;
      position: relative;
      user-select: none;
      outline: none;

      &:hover {
        background: var(--color-paper-2);
        border-color: var(--color-rule-2);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 1px;
      }

      &.selected {
        background: color-mix(in oklab, var(--color-accent) 8%, var(--color-sheet));
        border-color: var(--color-accent);
      }

      &.expansion {
        background: color-mix(in oklab, var(--color-rule) 14%, var(--color-sheet));
      }
    }

    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: var(--space-xs);
    }

    .card-title {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-md);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      color: var(--color-ink);
      line-height: 1.25;
    }

    .card-original-title {
      font-size: var(--text-xs);
      color: var(--color-muted);
      font-style: italic;
      margin-top: var(--space-3xs);
    }

    .type-pill {
      font-family: var(--font-display);
      font-size: var(--text-xs);
      padding: var(--space-3xs) var(--space-2xs);
      border-radius: var(--radius-pill);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      white-space: nowrap;
    }

    .expansion-pill {
      background: var(--color-paper-2);
      color: var(--color-muted);
      border: var(--rule-hair) solid var(--color-rule);
    }

    .card-stats {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2xs);
      margin-top: var(--space-xs);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-3xs);
      font-size: var(--text-xs);
      padding: var(--space-3xs) var(--space-2xs);
      border-radius: var(--radius-pill);
      background: var(--color-paper-2);
      border: var(--rule-hair) solid var(--color-rule);
      color: var(--color-ink);
    }

    .badge-icon {
      flex-shrink: 0;
      color: var(--color-muted);
    }

    .star-icon {
      color: var(--color-accent);
    }

    .weight-light {
      background: color-mix(in oklab, var(--color-success) 12%, var(--color-paper-2));
      border-color: var(--color-success);
    }

    .weight-medium {
      background: var(--color-paper-2);
      border-color: var(--color-rule-2);
    }

    .weight-heavy {
      background: color-mix(in oklab, var(--color-accent) 12%, var(--color-paper-2));
      border-color: var(--color-accent);
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--space-xs);
      padding-top: var(--space-xs);
      border-top: var(--rule-hair) solid var(--color-rule);
    }

    .bgg-link-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
      background: transparent;
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      padding: var(--space-3xs) var(--space-xs);
      font-family: var(--font-display);
      font-size: var(--text-xs);
      font-weight: 500;
      letter-spacing: var(--tracking-display);
      color: var(--color-ink);
      cursor: pointer;

      &:hover {
        background: var(--color-paper-2);
        color: var(--color-accent);
        border-color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .load-more-container {
      margin-top: var(--space-md);
      text-align: center;
    }

    .load-more-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      background: var(--color-accent);
      color: var(--color-accent-ink);
      border: var(--rule-hair) solid var(--color-accent);
      padding: var(--space-xs) var(--space-lg);
      border-radius: var(--radius-pill);
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      cursor: pointer;

      &:hover {
        background: var(--color-accent-2);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
      }
    }

    .empty-state {
      padding: var(--space-xl);
      text-align: center;
      color: var(--color-muted);
      border: var(--rule-bar) solid var(--color-rule-2);
      border-radius: var(--radius-card);
    }
  `]
})
export class GameCardListComponent {
  private readonly i18n = inject(I18nService);
  get t() { return this.i18n.t(); }

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
