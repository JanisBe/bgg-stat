import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { I18nService } from './i18n';

@Component({
  selector: 'app-info-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="info-section sheet" [class.dark-theme]="isDarkMode()">
      <div class="info-block">
        <h2 class="section-heading">{{ t.infoTitle }}</h2>
        <p class="info-prose">
          {{ t.infoTextPart1 }}<button type="button" class="action-link" (click)="addUserName()">{{ t.infoTextClickHere }}</button>{{ t.infoTextPart2 }}
        </p>
      </div>

      <div class="rule-divider"></div>

      <div class="info-block">
        <h2 class="section-heading">{{ t.howToUseTitle }}</h2>
        <div class="how-to-content" [innerHTML]="t.howToUseText"></div>
      </div>
    </div>
  `,
  styles: [`
    .info-section {
      background: var(--color-sheet);
      border: var(--rule-bar) solid var(--color-rule-2);
      border-radius: var(--radius-card);
      padding: var(--space-lg) var(--space-xl);
      margin: var(--space-md) 0;
      color: var(--color-ink);
      font-family: var(--font-body);
      max-width: 900px;
    }

    .info-block {
      margin: var(--space-sm) 0;
    }

    .section-heading {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: var(--text-section);
      letter-spacing: var(--tracking-display);
      color: var(--color-ink);
      margin-bottom: var(--space-xs);
    }

    .info-prose {
      font-size: var(--text-md);
      line-height: 1.6;
      color: var(--color-ink-2);
    }

    .action-link {
      background: transparent;
      border: none;
      padding: 0;
      margin: 0;
      font: inherit;
      color: var(--color-accent);
      text-decoration: underline;
      text-underline-offset: 0.16em;
      text-decoration-thickness: 1px;
      cursor: pointer;
      display: inline;

      &:hover {
        color: var(--color-accent-2);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
      }
    }

    .rule-divider {
      height: var(--rule-hair);
      background: var(--color-rule);
      margin: var(--space-md) 0;
    }

    .how-to-content {
      font-size: var(--text-md);
      line-height: 1.65;
      color: var(--color-ink-2);

      .help-section {
        margin-bottom: var(--space-md);

        &:last-child {
          margin-bottom: 0;
        }
      }

      h3 {
        font-family: var(--font-display);
        font-size: var(--text-base);
        font-weight: 600;
        letter-spacing: var(--tracking-display);
        color: var(--color-ink);
        margin: 0 0 var(--space-2xs) 0;
      }

      p {
        margin: 0 0 var(--space-xs) 0;
      }

      ul {
        margin: var(--space-2xs) 0 var(--space-xs) var(--space-md);
        padding: 0;
      }

      li {
        margin-bottom: var(--space-2xs);
      }

      strong {
        color: var(--color-ink);
        font-weight: 600;
      }

      em {
        font-style: italic;
      }
    }
  `]
})
export class InfoSectionComponent {
  private readonly i18n = inject(I18nService);
  get t() { return this.i18n.t(); }
  readonly isDarkMode = input<boolean>(false);

  addUserName(): void {
    const userName = prompt(this.t.enterNamePrompt);
    if (userName) {
      window.open(`https://boardgamegeek.com/geekcollection.php?action=exportcsv&subtype=boardgame&username=${userName}&all=1`);
    }
  }
}
