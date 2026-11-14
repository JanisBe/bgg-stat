import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { I18nService } from './i18n';
import { DataPoint } from './models';
import { BggAuthService } from './bgg-auth.service';
import { BggApiService } from './bgg-api.service';
import { BggThingDetails } from './bgg-xml/bgg-xml.models';

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

        @if (authService.hasToken()) {
          <div class="bgg-details-container">
            @if (isLoadingBgg()) {
              <div class="bgg-loading-indicator">
                <span class="loading-spinner"></span>
                <span>{{ t.loadingBggData }}</span>
              </div>
            } @else if (bggError()) {
              <div class="bgg-error-banner">
                <span>⚠️ {{ bggError() }}</span>
                @if (g.objectid) {
                  <button type="button" class="retry-btn" (click)="fetchBggDetails(g.objectid)">↺</button>
                }
              </div>
            } @else if (bggDetails(); as details) {
              <div class="bgg-details-content">
                <div class="bgg-main-info">
                  @if (details.thumbnail || details.image) {
                    <div class="cover-wrapper">
                      <img
                        [src]="details.thumbnail || details.image"
                        [alt]="details.primaryName"
                        class="game-cover"
                        loading="lazy"
                      />
                    </div>
                  }

                  <div class="bgg-text-info">
                    <div class="meta-top-row">
                      <div class="meta-left-col">
                        @if (details.designers.length > 0) {
                          <div class="meta-row">
                            <span class="meta-label">{{ t.designers }}:</span>
                            <span class="meta-value">
                              @for (des of details.designers; track des.id; let last = $last) {
                                <a
                                  [href]="'https://boardgamegeek.com/boardgamedesigner/' + des.id"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="designer-link"
                                  [title]="des.name"
                                >{{ des.name }}</a>@if (!last) {, }
                              }
                            </span>
                          </div>
                        }
                      </div>

                      @if (details.categories.length > 0) {
                        <div class="meta-right-col">
                          <div class="meta-tags categories-tags">
                            @for (cat of details.categories; track cat.id) {
                              <a
                                [href]="'https://boardgamegeek.com/boardgamecategory/' + cat.id"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="meta-pill category-pill category-link"
                                [title]="cat.name"
                              >
                                <span>{{ cat.name }}</span>
                              </a>
                            }
                          </div>
                        </div>
                      }
                    </div>

                    @if (details.mechanics.length > 0) {
                      <div class="mechanics-row">
                        <span class="meta-label">{{ t.mechanics }}:</span>
                        <div class="meta-tags">
                          @for (mech of details.mechanics; track mech.id) {
                            <a
                              [href]="'https://boardgamegeek.com/boardgamemechanic/' + mech.id"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="meta-pill mechanic-pill mechanic-link"
                              [title]="mech.name"
                            >
                              <span>{{ mech.name }}</span>
                            </a>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </div>

                @if (details.playerCountPoll || details.playerAgePoll) {
                  <div class="polls-grid">
                    @if (details.playerCountPoll; as poll) {
                      <div class="poll-card">
                        <div class="poll-header">
                          <span class="poll-title">{{ t.playerCountPoll }}</span>
                          @if (poll.bestWith) {
                            <span class="poll-badge best-badge">{{ poll.bestWith }}</span>
                          }
                        </div>

                        <div class="poll-bars-list">
                          @for (row of poll.results; track row.numPlayers) {
                            <div class="poll-bar-row">
                              <span class="poll-row-label">{{ row.numPlayers }} 👤</span>
                              <div
                                class="stacked-bar-track"
                                [title]="row.numPlayers + ': ' + row.best + ' ' + t.pollBest + ', ' + row.recommended + ' ' + t.pollRecommended + ', ' + row.notRecommended + ' ' + t.pollNotRecommended"
                              >
                                @if (row.bestPercent > 0) {
                                  <div class="bar-segment bar-best" [style.width.%]="row.bestPercent"></div>
                                }
                                @if (row.recommendedPercent > 0) {
                                  <div class="bar-segment bar-rec" [style.width.%]="row.recommendedPercent"></div>
                                }
                                @if (row.notRecommendedPercent > 0) {
                                  <div class="bar-segment bar-not" [style.width.%]="row.notRecommendedPercent"></div>
                                }
                              </div>
                              <span class="poll-row-value">
                                @if (row.bestPercent > 0) {
                                  <span class="val-best">{{ row.bestPercent }}%</span>
                                } @else if (row.recommendedPercent > 0) {
                                  <span class="val-rec">{{ row.recommendedPercent }}%</span>
                                } @else {
                                  <span class="val-muted">—</span>
                                }
                              </span>
                            </div>
                          }
                        </div>

                        <div class="poll-legend">
                          <span class="legend-item"><span class="legend-dot dot-best"></span>{{ t.pollBest }}</span>
                          <span class="legend-item"><span class="legend-dot dot-rec"></span>{{ t.pollRecommended }}</span>
                          <span class="legend-item"><span class="legend-dot dot-not"></span>{{ t.pollNotRecommended }}</span>
                        </div>
                      </div>
                    }

                    @if (details.playerAgePoll; as agePoll) {
                      <div class="poll-card">
                        <div class="poll-header">
                          <span class="poll-title">{{ t.playerAgePoll }}</span>
                          @if (agePoll.suggestedAge) {
                            <span class="poll-badge age-badge">{{ t.communitySuggested }}: {{ agePoll.suggestedAge }}</span>
                          }
                        </div>

                        <div class="poll-bars-list">
                          @for (row of agePoll.results; track row.age) {
                            <div class="poll-bar-row">
                              <span class="poll-row-label">{{ row.age }}+</span>
                              <div
                                class="age-bar-track"
                                [title]="row.age + ' lat: ' + row.numVotes + ' ' + t.votes + ' (' + row.percentage + '%)'"
                              >
                                <div
                                  class="age-bar-fill"
                                  [class.top-age]="row.age + '+' === agePoll.suggestedAge"
                                  [style.width.%]="row.percentage"
                                ></div>
                              </div>
                              <span class="poll-row-value">
                                <span [class.val-best]="row.age + '+' === agePoll.suggestedAge">{{ row.percentage }}%</span>
                              </span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }

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

    /* BGG Details container */
    .bgg-details-container {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px dashed #e2e8f0;
    }

    .bgg-loading-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      color: #64748b;
      font-size: 0.82rem;
    }

    .loading-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid #cbd5e1;
      border-top-color: darkcyan;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .bgg-error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      background: #fef2f2;
      color: #991b1b;
      border: 1px solid #fecaca;
      border-radius: 6px;
      font-size: 0.8rem;
    }

    .retry-btn {
      background: transparent;
      border: 1px solid #991b1b;
      color: #991b1b;
      border-radius: 4px;
      padding: 2px 6px;
      cursor: pointer;
      font-size: 0.85rem;
    }

    .bgg-details-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .bgg-main-info {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .cover-wrapper {
      flex-shrink: 0;
    }

    .game-cover {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
      border: 1px solid #e2e8f0;
    }

    .bgg-text-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .meta-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
    }

    .meta-left-col {
      flex: 1;
      min-width: 160px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .meta-right-col {
      display: flex;
      justify-content: flex-end;
    }

    .categories-tags {
      justify-content: flex-end;
    }

    .meta-row {
      font-size: 0.8rem;
      line-height: 1.35;
      color: #475569;
    }

    .meta-label {
      font-weight: 600;
      color: #334155;
      margin-right: 4px;
    }

    .mechanics-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
      flex-wrap: wrap;
    }

    .meta-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 2px;
    }

    .meta-pill {
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
    }

    .category-pill {
      background: #e0f2fe;
      color: #0369a1;
    }

    .mechanic-pill {
      background: #f3e8ff;
      color: #6b21a8;
    }

    .designer-link {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: #94a3b8;
      transition: color 0.15s ease, text-decoration-color 0.15s ease;

      &:hover {
        color: darkcyan;
        text-decoration-color: darkcyan;
      }
    }

    .category-link {
      display: inline-flex;
      align-items: center;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s ease, transform 0.1s ease, color 0.15s ease;

      &:hover {
        background: #bae6fd;
        color: #0284c7;
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    .mechanic-link {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.15s ease, transform 0.1s ease, color 0.15s ease;

      &:hover {
        background: #e9d5ff;
        color: #581c87;
        transform: translateY(-1px);
        text-decoration: underline;
      }

      &:active {
        transform: translateY(0);
      }
    }

    /* Polls grid & cards */
    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 10px;
    }

    .poll-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .poll-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .poll-title {
      font-weight: 700;
      font-size: 0.8rem;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .poll-badge {
      font-size: 0.72rem;
      padding: 2px 7px;
      border-radius: 9999px;
      font-weight: 600;
    }

    .best-badge {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .age-badge {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }

    .poll-bars-list {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .poll-bar-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.78rem;
    }

    .poll-row-label {
      min-width: 40px;
      font-weight: 600;
      color: #475569;
      font-size: 0.75rem;
    }

    .stacked-bar-track, .age-bar-track {
      flex: 1;
      height: 10px;
      background: #e2e8f0;
      border-radius: 9999px;
      overflow: hidden;
      display: flex;
    }

    .bar-segment {
      height: 100%;
      transition: width 0.3s ease;
    }

    .bar-best {
      background: #16a34a;
    }

    .bar-rec {
      background: #f59e0b;
    }

    .bar-not {
      background: #cbd5e1;
    }

    .age-bar-fill {
      height: 100%;
      background: #0284c7;
      border-radius: 9999px;
      transition: width 0.3s ease;

      &.top-age {
        background: darkcyan;
      }
    }

    .poll-row-value {
      min-width: 34px;
      text-align: right;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .val-best {
      color: #16a34a;
    }

    .val-rec {
      color: #d97706;
    }

    .val-muted {
      color: #94a3b8;
    }

    .poll-legend {
      display: flex;
      gap: 12px;
      font-size: 0.7rem;
      color: #64748b;
      padding-top: 4px;
      border-top: 1px solid #f1f5f9;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .dot-best {
      background: #16a34a;
    }

    .dot-rec {
      background: #f59e0b;
    }

    .dot-not {
      background: #cbd5e1;
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
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

      .bgg-details-container {
        border-top-color: #3f4448;
      }

      .bgg-loading-indicator {
        color: #94a3b8;
      }

      .loading-spinner {
        border-color: #475569;
        border-top-color: #38bdf8;
      }

      .bgg-error-banner {
        background: #3c1618;
        color: #fca5a5;
        border-color: #7f1d1d;
      }

      .retry-btn {
        border-color: #fca5a5;
        color: #fca5a5;
      }

      .game-cover {
        border-color: #475569;
      }

      .meta-row {
        color: #cbd5e1;
      }

      .meta-label {
        color: #f1f5f9;
      }

      .designer-link {
        color: #cbd5e1;
        text-decoration-color: #64748b;

        &:hover {
          color: #38bdf8;
          text-decoration-color: #38bdf8;
        }
      }

      .category-pill {
        background: #082f49;
        color: #7dd3fc;
      }

      .category-link {
        background: #082f49;
        color: #7dd3fc;

        &:hover {
          background: #0c4a6e;
          color: #bae6fd;
        }
      }

      .mechanic-pill {
        background: #3b0764;
        color: #d8b4fe;
      }

      .mechanic-link {
        background: #3b0764;
        color: #d8b4fe;

        &:hover {
          background: #581c87;
          color: #f3e8ff;
        }
      }

      .poll-card {
        background: #1e2226;
        border-color: #33393f;
      }

      .poll-title {
        color: #e2e8f0;
      }

      .best-badge {
        background: #143521;
        color: #86efac;
        border-color: #166534;
      }

      .age-badge {
        background: #082f49;
        color: #7dd3fc;
        border-color: #0369a1;
      }

      .poll-row-label {
        color: #94a3b8;
      }

      .stacked-bar-track, .age-bar-track {
        background: #2d3339;
      }

      .bar-best {
        background: #22c55e;
      }

      .bar-rec {
        background: #f59e0b;
      }

      .bar-not {
        background: #475569;
      }

      .age-bar-fill {
        background: #38bdf8;

        &.top-age {
          background: #00a8a8;
        }
      }

      .val-best {
        color: #4ade80;
      }

      .val-rec {
        color: #fbbf24;
      }

      .val-muted {
        color: #64748b;
      }

      .poll-legend {
        color: #94a3b8;
        border-top-color: #2d3339;
      }

      .dot-best {
        background: #22c55e;
      }

      .dot-rec {
        background: #f59e0b;
      }

      .dot-not {
        background: #475569;
      }

      .bgg-btn {
        background: #008b8b;

        &:hover {
          background: #00a8a8;
        }
      }
    }
  `],
})
export class SelectedGamePreviewComponent {
  private readonly i18n = inject(I18nService);
  get t() { return this.i18n.t(); }
  readonly authService = inject(BggAuthService);
  readonly bggApiService = inject(BggApiService);

  readonly game = input<DataPoint | null>(null);
  readonly isDarkMode = input<boolean>(false);

  readonly close = output<void>();
  readonly openBgg = output<string | number>();

  readonly bggDetails = signal<BggThingDetails | null>(null);
  readonly isLoadingBgg = signal<boolean>(false);
  readonly bggError = signal<string | null>(null);

  constructor() {
    effect(() => {
      const g = this.game();
      const hasToken = this.authService.hasToken();

      if (!g?.objectid || !hasToken) {
        this.bggDetails.set(null);
        this.isLoadingBgg.set(false);
        this.bggError.set(null);
        return;
      }

      this.fetchBggDetails(g.objectid);
    });
  }

  fetchBggDetails(objectId: number | string): void {
    this.isLoadingBgg.set(true);
    this.bggError.set(null);

    this.bggApiService.getThingDetails(objectId).subscribe({
      next: (details) => {
        this.bggDetails.set(details);
        this.isLoadingBgg.set(false);
      },
      error: () => {
        this.bggError.set(this.t.fetchBggError);
        this.isLoadingBgg.set(false);
      },
    });
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
