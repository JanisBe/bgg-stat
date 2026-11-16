import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
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
      <div class="preview-panel sheet" [class.dark-theme]="isDarkMode()">
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
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="badges-row">
          @if (g.average || g.y) {
            <div class="stat-badge rating-badge">
              <svg class="badge-icon star-icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span class="badge-label">{{ t.rating }}:</span>
              <span class="badge-value num">{{ formatDecimal(g.average || g.y) }}</span>
            </div>
          }

          @if (g.avgweight || g.x) {
            <div class="stat-badge weight-badge" [class]="getWeightClass(g.avgweight || g.x)">
              <svg class="badge-icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
                <path d="M7 21h10"/>
                <path d="M12 3v18"/>
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
              </svg>
              <span class="badge-label">{{ t.weight }}:</span>
              <span class="badge-value num">{{ formatDecimal(g.avgweight || g.x) }}/5</span>
            </div>
          }

          @if (g.rank && g.rank !== '0' && g.rank !== 0) {
            <div class="stat-badge rank-badge">
              <svg class="badge-icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
              </svg>
              <span class="badge-value num">#{{ g.rank }}</span>
            </div>
          }

          @if (g.minplayers || g.maxplayers) {
            <div class="stat-badge players-badge">
              <svg class="badge-icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span class="badge-value num">
                {{ formatPlayers(g.minplayers, g.maxplayers) }}
                @if (g.bggbestplayers) {
                  <span class="best-players" title="BGG Best">({{ g.bggbestplayers }})</span>
                }
              </span>
            </div>
          }

          @if (g.playingtime) {
            <div class="stat-badge time-badge">
              <svg class="badge-icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="badge-value num">{{ g.playingtime }} {{ t.minutes }}</span>
            </div>
          }

          @if (g.yearpublished && g.yearpublished !== '0') {
            <div class="stat-badge year-badge">
              <svg class="badge-icon" aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                <line x1="16" x2="16" y1="2" y2="6"/>
                <line x1="8" x2="8" y1="2" y2="6"/>
                <line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              <span class="badge-value num">{{ g.yearpublished }}</span>
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
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>{{ bggError() }}</span>
                @if (g.objectid) {
                  <button type="button" class="retry-btn" (click)="fetchBggDetails(g.objectid)">
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21.5 2v6h-6"/>
                      <path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                    </svg>
                  </button>
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
                      <div class="poll-panel">
                        <div class="poll-header">
                          <span class="poll-title">{{ t.playerCountPoll }}</span>
                          @if (poll.bestWith) {
                            <span class="poll-badge best-badge">{{ poll.bestWith }}</span>
                          }
                        </div>

                        <div class="poll-bars-list">
                          @for (row of poll.results; track row.numPlayers) {
                            <div class="poll-bar-row">
                              <span class="poll-row-label">
                                <span class="num">{{ row.numPlayers }}</span>
                                <svg class="inline-user-icon" aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                </svg>
                              </span>
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
                              <span class="poll-row-value num">
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
                      <div class="poll-panel">
                        <div class="poll-header">
                          <span class="poll-title">{{ t.playerAgePoll }}</span>
                          @if (agePoll.suggestedAge) {
                            <span class="poll-badge age-badge">{{ t.communitySuggested }}: {{ agePoll.suggestedAge }}</span>
                          }
                        </div>

                        <div class="poll-bars-list">
                          @for (row of agePoll.results; track row.age) {
                            <div class="poll-bar-row">
                              <span class="poll-row-label num">{{ row.age }}+</span>
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
                              <span class="poll-row-value num">
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
              <svg class="external-icon" aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </button>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .preview-panel {
      margin-top: var(--space-sm);
      padding: var(--space-md);
      background: var(--color-sheet);
      border: var(--rule-bar) solid var(--color-rule-2);
      border-radius: var(--radius-card);
      font-family: var(--font-body);
      color: var(--color-ink);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-md);
    }

    .title-group {
      flex: 1;
      min-width: 0;
    }

    .game-title {
      margin: 0;
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      color: var(--color-ink);
      line-height: 1.25;
      overflow-wrap: break-word;
    }

    .original-title {
      margin-top: var(--space-3xs);
      font-size: var(--text-sm);
      color: var(--color-muted);
      font-style: italic;
    }

    .close-btn {
      background: transparent;
      border: var(--rule-hair) solid transparent;
      cursor: pointer;
      color: var(--color-muted);
      padding: var(--space-2xs);
      border-radius: var(--radius-pill);
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--color-paper-2);
        color: var(--color-ink);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin: var(--space-sm) 0;
    }

    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
      padding: var(--space-3xs) var(--space-xs);
      border-radius: var(--radius-pill);
      background: var(--color-paper-2);
      border: var(--rule-hair) solid var(--color-rule);
      font-size: var(--text-xs);
      color: var(--color-ink);
    }

    .badge-icon {
      flex-shrink: 0;
      color: var(--color-muted);
    }

    .star-icon {
      color: var(--color-accent);
    }

    .badge-label {
      color: var(--color-muted);
    }

    .badge-value {
      font-weight: 600;
      color: var(--color-ink);
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

    .bgg-details-container {
      margin-top: var(--space-sm);
      padding-top: var(--space-sm);
      border-top: var(--rule-hair) solid var(--color-rule);
    }

    .bgg-loading-indicator {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: var(--text-sm);
      color: var(--color-muted);
      padding: var(--space-sm) 0;
    }

    .loading-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--color-rule);
      border-top-color: var(--color-accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .bgg-error-banner {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-xs) var(--space-sm);
      background: var(--color-error-bg);
      color: var(--color-error);
      border: var(--rule-hair) solid var(--color-error);
      border-radius: var(--radius-pill);
      font-size: var(--text-sm);
    }

    .retry-btn {
      background: transparent;
      border: var(--rule-hair) solid var(--color-error);
      color: var(--color-error);
      border-radius: var(--radius-pill);
      padding: var(--space-3xs) var(--space-2xs);
      cursor: pointer;
      display: inline-flex;
      align-items: center;

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .bgg-details-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }

    .bgg-main-info {
      display: flex;
      gap: var(--space-md);
      align-items: flex-start;
    }

    .cover-wrapper {
      flex-shrink: 0;
    }

    .game-cover {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: var(--radius-card);
      border: var(--rule-hair) solid var(--color-rule-2);
    }

    .bgg-text-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2xs);
    }

    .meta-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }

    .meta-left-col {
      flex: 1;
      min-width: 160px;
    }

    .meta-row {
      font-size: var(--text-sm);
      line-height: 1.4;
      color: var(--color-ink-2);
    }

    .meta-label {
      font-weight: 600;
      color: var(--color-ink);
      margin-right: var(--space-2xs);
    }

    .designer-link {
      color: var(--color-ink);
      text-decoration: underline;
      text-underline-offset: 0.15em;

      &:hover {
        color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .mechanics-row {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }

    .meta-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2xs);
    }

    .meta-pill {
      font-family: var(--font-display);
      font-size: var(--text-xs);
      font-weight: 500;
      letter-spacing: var(--tracking-display);
      padding: var(--space-3xs) var(--space-xs);
      border-radius: var(--radius-pill);
      text-decoration: none;
      background: var(--color-paper-2);
      color: var(--color-ink);
      border: var(--rule-hair) solid var(--color-rule);

      &:hover {
        background: var(--color-paper-3);
        color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .polls-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-xs);
    }

    .poll-panel {
      padding-top: var(--space-xs);
      border-top: var(--rule-hair) solid var(--color-rule-2);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }

    .poll-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-xs);
    }

    .poll-title {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-display);
      color: var(--color-muted);
      text-transform: uppercase;
    }

    .poll-badge {
      font-family: var(--font-outlier);
      font-size: var(--text-xs);
      padding: var(--space-3xs) var(--space-2xs);
      border-radius: var(--radius-pill);
      background: var(--color-paper-2);
      border: var(--rule-hair) solid var(--color-rule);
    }

    .best-badge {
      color: var(--color-success);
      border-color: var(--color-success);
    }

    .poll-bars-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2xs);
    }

    .poll-bar-row {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: var(--text-xs);
    }

    .poll-row-label {
      min-width: 44px;
      font-family: var(--font-outlier);
      color: var(--color-ink-2);
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }

    .inline-user-icon {
      color: var(--color-muted);
    }

    .stacked-bar-track, .age-bar-track {
      flex: 1;
      height: 8px;
      background: var(--color-paper-2);
      border-radius: var(--radius-pill);
      overflow: hidden;
      display: flex;
    }

    .bar-segment {
      height: 100%;
    }

    .bar-best {
      background: var(--color-accent);
    }

    .bar-rec {
      background: var(--color-muted);
    }

    .bar-not {
      background: var(--color-rule);
    }

    .age-bar-fill {
      height: 100%;
      background: var(--color-accent);
      border-radius: var(--radius-pill);
    }

    .poll-row-value {
      min-width: 38px;
      text-align: right;
      font-family: var(--font-outlier);
      color: var(--color-ink);
    }

    .poll-legend {
      display: flex;
      gap: var(--space-md);
      font-size: var(--text-xs);
      color: var(--color-muted);
      padding-top: var(--space-2xs);
      border-top: var(--rule-hair) solid var(--color-rule);
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
    }

    .legend-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .dot-best { background: var(--color-accent); }
    .dot-rec { background: var(--color-muted); }
    .dot-not { background: var(--color-rule); }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: var(--space-md);
      padding-top: var(--space-xs);
      border-top: var(--rule-hair) solid var(--color-rule);
    }

    .bgg-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-xs);
      background: var(--color-accent);
      color: var(--color-accent-ink);
      border: var(--rule-hair) solid var(--color-accent);
      padding: var(--space-xs) var(--space-md);
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

  private readonly destroyRef = inject(DestroyRef);
  private activeRequestSub?: Subscription;

  constructor() {
    effect(() => {
      const g = this.game();
      const hasToken = this.authService.hasToken();

      if (!g?.objectid || !hasToken) {
        this.activeRequestSub?.unsubscribe();
        this.activeRequestSub = undefined;
        this.bggDetails.set(null);
        this.isLoadingBgg.set(false);
        this.bggError.set(null);
        return;
      }

      this.fetchBggDetails(g.objectid);
    });
  }

  fetchBggDetails(objectId: number | string): void {
    this.activeRequestSub?.unsubscribe();
    this.isLoadingBgg.set(true);
    this.bggError.set(null);

    this.activeRequestSub = this.bggApiService
      .getThingDetails(objectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
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
