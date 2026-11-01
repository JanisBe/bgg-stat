import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { getActiveTranslations } from './i18n';

@Component({
  selector: 'app-info-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="info-section" [class.dark-theme]="isDarkMode()">
      <br>
      <br>
      <h2>{{ t.infoTitle }}</h2>
      {{ t.infoTextPart1 }}<span class="bold" (click)="addUserName()">{{ t.infoTextClickHere }}</span>{{ t.infoTextPart2 }}
      <h2>{{ t.howToUseTitle }}</h2>
      <div [innerHTML]="t.howToUseText"></div>
    </div>
  `,
  styles: [`
    .bold {
      font-weight: bold;
      color: blue;
      text-decoration: underline;
      cursor: pointer;
    }

    .info-section.dark-theme {
      color: #e0e0e0;

      .bold {
        color: #63b3ed;
      }

      h2 {
        color: #f1f3f4;
      }
    }
  `]
})
export class InfoSectionComponent {
  readonly t = getActiveTranslations();
  readonly isDarkMode = input<boolean>(false);

  addUserName(): void {
    const userName = prompt(this.t.enterNamePrompt);
    if (userName) {
      window.open(`https://boardgamegeek.com/geekcollection.php?action=exportcsv&subtype=boardgame&username=${userName}&all=1`);
    }
  }
}

