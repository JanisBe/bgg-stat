import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AppLanguage, TranslationKeys } from './i18n';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="header-row">
      <h1>{{ title() }}</h1>

      <div class="header-actions">
        @if (fileDate()) {
          <span class="file-date" [title]="fileDate()">
            <svg class="date-icon" aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
              <line x1="16" x2="16" y1="2" y2="6"/>
              <line x1="8" x2="8" y1="2" y2="6"/>
              <line x1="3" x2="21" y1="10" y2="10"/>
            </svg>
            <span class="num">{{ fileDate() }}</span>
          </span>
        }

        <div class="lang-switcher" role="group" aria-label="Language switcher">
          <button
            type="button"
            class="lang-btn"
            [class.active]="currentLang() === 'pl'"
            (click)="languageChange.emit('pl')"
            title="Język polski"
          >
            PL
          </button>
          <button
            type="button"
            class="lang-btn"
            [class.active]="currentLang() === 'en'"
            (click)="languageChange.emit('en')"
            title="English language"
          >
            EN
          </button>
        </div>

        <button
          (click)="themeToggle.emit()"
          class="theme-toggle-btn"
          [title]="isDarkMode() ? t().switchToLight : t().switchToDark"
          [attr.aria-label]="isDarkMode() ? t().switchToLight : t().switchToDark"
          type="button"
        >
          @if (isDarkMode()) {
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          } @else {
            <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          }
        </button>
      </div>
    </header>

    @if (counter() !== 0) {
      <div class="displayed-games">
        <span class="num">{{ t().displayedGames.replace('{counter}', '' + counter()) }}</span>
      </div>
    }
  `,
  styles: [`
    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      flex-wrap: wrap;
      padding-bottom: var(--space-xs);
      border-bottom: var(--rule-bar) solid var(--color-rule-2);

      h1 {
        margin: 0;
        font-family: var(--font-display);
        font-size: var(--text-2xl);
        font-weight: 700;
        letter-spacing: var(--tracking-display);
        color: var(--color-ink);
        line-height: 1.1;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      flex-wrap: wrap;
    }

    .file-date {
      font-family: var(--font-outlier);
      font-size: var(--text-xs);
      color: var(--color-muted);
      background: var(--color-sheet);
      padding: var(--space-3xs) var(--space-xs);
      border-radius: var(--radius-pill);
      border: var(--rule-hair) solid var(--color-rule);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
    }

    .date-icon {
      color: var(--color-muted);
    }

    .lang-switcher {
      display: inline-flex;
      background: var(--color-sheet);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      padding: 1px;
      gap: 1px;
    }

    .lang-btn {
      background: transparent;
      border: none;
      font-family: var(--font-display);
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      color: var(--color-muted);
      padding: var(--space-3xs) var(--space-xs);
      border-radius: var(--radius-pill);
      cursor: pointer;
      line-height: 1;

      &:hover {
        color: var(--color-ink);
        background: var(--color-paper-2);
      }

      &.active {
        background: var(--color-ink);
        color: var(--color-paper);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .displayed-games {
      margin-top: var(--space-2xs);
      font-family: var(--font-outlier);
      font-size: var(--text-xs);
      color: var(--color-muted);
    }

    .theme-toggle-btn {
      background: var(--color-sheet);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--color-ink);
      padding: 0;

      &:hover {
        background: var(--color-paper-2);
        color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }
  `],
})
export class HeaderComponent {
  readonly title = input.required<string>();
  readonly fileDate = input<string | undefined>(undefined);
  readonly counter = input<number>(0);
  readonly currentLang = input.required<AppLanguage>();
  readonly isDarkMode = input.required<boolean>();
  readonly t = input.required<TranslationKeys>();

  readonly languageChange = output<AppLanguage>();
  readonly themeToggle = output<void>();
}
