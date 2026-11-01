import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { getActiveTranslations } from './i18n';
import { DataPoint } from './models';

@Component({
  selector: 'app-selected-game-preview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (game(); as g) {
      <div class="preview-card" [class.dark-theme]="isDarkMode()">
        <div class="card-header">
          <div class="title-group">
            <h3 class="game-title">{{ g.objectname || g.name }}</h3>
            @if (g.originalname && g.originalname !== g.objectname && g.originalname !== g.name) {
              <div class="original-title">{{ g.originalname }}</div>
            }
          </div>
          <button
            type="button"
            class="close-btn"
            (click)="close.emit()"
            [attr.aria-label]="t.close"
            [title]="t.close"
          >
            ✕
          </button>
        </div>

        <div class="badges-row">
          @if (g.average || g.y) {
            <div class="stat-badge rating-badge">
              <span class="badge-icon">★</span>
              <span class="badge-label">{{ t.rating }}:</span>
              <span class="badge-value">{{ formatDecimal(g.average || g.y) }}</span>
            </div>
          }

          @if (g.avgweight || g.x) {
            <div class="stat-badge weight-badge" [class]="getWeightClass(g.avgweight || g.x)">
              <span class="badge-icon">⚖</span>
              <span class="badge-label">{{ t.weight }}:</span>
              <span class="badge-value">{{ formatDecimal(g.avgweight || g.x) }}/5</span>
            </div>
          }

          @if (g.rank && g.rank !== '0' && g.rank !== 0) {
            <div class="stat-badge rank-badge">
              <span class="badge-icon">🏆</span>
              <span class="badge-value">#{{ g.rank }}</span>
            </div>
          }

          @if (g.minplayers || g.maxplayers) {
            <div class="stat-badge players-badge">
              <span class="badge-icon">👥</span>
              <span class="badge-value">
                {{ formatPlayers(g.minplayers, g.maxplayers) }}
                @if (g.bggbestplayers) {
                  <span class="best-players" title="BGG Best">({{ g.bggbestplayers }})</span>
                }
              </span>
            </div>
          }

          @if (g.playingtime) {
            <div class="stat-badge time-badge">
              <span class="badge-icon">⏱</span>
              <span class="badge-value">{{ g.playingtime }} {{ t.minutes }}</span>
            </div>
          }

          @if (g.yearpublished && g.yearpublished !== '0') {
            <div class="stat-badge year-badge">
              <span class="badge-icon">📅</span>
              <span class="badge-value">{{ g.yearpublished }}</span>
            </div>
          }
        </div>

        <div class="card-footer">
          @if (g.objectid) {
            <button
              type="button"
              class="bgg-btn"
              (click)="openBgg.emit(g.objectid)"
            >
              <span>{{ t.openInBgg }}</span>
              <span class="external-icon">↗</span>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .preview-card {
      margin-top: 12px;
      padding: 14px 16px;
      background: #ffffff;
      border: 1px solid #d0d7de;
      border-left: 4px solid darkcyan;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      animation: fadeIn 0.2s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .title-group {
      flex: 1;
      min-width: 0;
    }

    .game-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      color: #1a202c;
      line-height: 1.3;
      word-break: break-word;
    }

    .original-title {
      margin-top: 2px;
      font-size: 0.85rem;
      color: #718096;
      font-style: italic;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 16px;
      cursor: pointer;
      color: #718096;
      padding: 4px 8px;
      border-radius: 4px;
      line-height: 1;
      min-width: 32px;
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #edf2f7;
        color: #2d3748;
      }
    }

    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px 0;
    }

    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.82rem;
      padding: 4px 8px;
      border-radius: 6px;
      background: #f1f5f9;
      color: #334155;
      font-weight: 500;
    }

    .badge-label {
      opacity: 0.75;
    }

    .badge-value {
      font-weight: 700;
    }

    .rating-badge {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .weight-light {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .weight-medium {
      background: #ffedd5;
      color: #9a3412;
      border: 1px solid #fed7aa;
    }

    .weight-heavy {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fecaca;
    }

    .rank-badge {
      background: #ede9fe;
      color: #5b21b6;
      border: 1px solid #ddd6fe;
    }

    .best-players {
      font-size: 0.75rem;
      opacity: 0.8;
      margin-left: 2px;
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;
    }

    .bgg-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: darkcyan;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      min-height: 40px;
      transition: background 0.15s ease, transform 0.1s ease;

      &:hover {
        background: #007070;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .external-icon {
      font-size: 0.95rem;
    }

    /* Dark theme */
    .preview-card.dark-theme {
      background: #24282c;
      border-color: #3f4448;
      border-left-color: #00a8a8;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);

      .game-title {
        color: #f1f5f9;
      }

      .original-title {
        color: #94a3b8;
      }

      .close-btn {
        color: #94a3b8;

        &:hover {
          background: #33393f;
          color: #f1f5f9;
        }
      }

      .stat-badge {
        background: #2d3339;
        color: #cbd5e1;
      }

      .rating-badge {
        background: #452b0a;
        color: #fcd34d;
        border-color: #78350f;
      }

      .weight-light {
        background: #143521;
        color: #86efac;
        border-color: #166534;
      }

      .weight-medium {
        background: #3c2415;
        color: #fdba74;
        border-color: #9a3412;
      }

      .weight-heavy {
        background: #3c1618;
        color: #fca5a5;
        border-color: #991b1b;
      }

      .rank-badge {
        background: #2e1d4d;
        color: #c4b5fd;
        border-color: #5b21b6;
      }

      .bgg-btn {
        background: #008b8b;

        &:hover {
          background: #00a8a8;
        }
      }
    }
  `]
})
export class SelectedGamePreviewComponent {
  readonly t = getActiveTranslations();
  readonly game = input<DataPoint | null>(null);
  readonly isDarkMode = input<boolean>(false);

  readonly close = output<void>();
  readonly openBgg = output<string | number>();

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
