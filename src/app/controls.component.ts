import { ChangeDetectionStrategy, Component, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18nService } from './i18n';
import { CheckboxOption } from './models';
import { BggAuthService } from './bgg-auth.service';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls-row" [class.dark-theme]="isDarkMode()">
      <div class="upload">
        <label class="file-btn">
          <span class="file-icon">📁</span>
          <span>{{ t.chooseFile }}</span>
          <input (change)="onFileChange($event)" accept="text/csv" type="file" />
        </label>
        <span class="or-text">{{ t.or }}</span>
        <p (click)="loadExample.emit()" class="myCSV bold">{{ t.useMyCsv }}</p>
      </div>

      @if (dataLoaded()) {
        <div class="filter-bar">
          <div class="filter-group">
            <strong>{{ t.filter }}</strong>
            <label class="filter-item" [class.active]="showStandalone()">
              <input
                (change)="onToggleStandalone($event)"
                [checked]="showStandalone()"
                type="checkbox"
              />
              {{ t.baseGames }}
            </label>
            <label class="filter-item" [class.active]="showExpansions()">
              <input
                (change)="onToggleExpansions($event)"
                [checked]="showExpansions()"
                type="checkbox"
              />
              {{ t.expansions }}
            </label>
          </div>
        </div>
      }

      <div class="options" style="position: relative;">
        <div (click)="toggleOptions()" class="options-btn" role="button" tabindex="0">
          ⚙️ {{ t.options }}
        </div>

        @if (isExpanded()) {
          <div class="options-backdrop" (click)="isExpanded.set(false)"></div>
          <div (mouseleave)="isExpanded.set(false)" id="options-container">
            <div class="bgg-token-section">
              <div class="bgg-token-header">
                <span class="section-title">{{ t.bggApiSettings }}</span>
                <span class="token-status-pill" [class.active]="authService.hasToken()">
                  {{ authService.hasToken() ? t.bggTokenConfigured : t.bggTokenNotConfigured }}
                </span>
              </div>
              <div class="token-input-row">
                <input
                  [type]="showTokenInput() ? 'text' : 'password'"
                  [placeholder]="t.tokenPlaceholder"
                  [ngModel]="tokenInput()"
                  (ngModelChange)="tokenInput.set($event)"
                  class="token-input"
                />
                <button
                  type="button"
                  class="token-mask-btn"
                  (click)="showTokenInput.set(!showTokenInput())"
                  [title]="showTokenInput() ? 'Hide' : 'Show'"
                >
                  {{ showTokenInput() ? '🙈' : '👁️' }}
                </button>
              </div>
              <div class="token-btn-row">
                <button (click)="saveToken()" type="button" class="btn-token-save">{{ t.saveToken }}</button>
                @if (authService.hasToken()) {
                  <button (click)="clearToken()" type="button" class="btn-token-clear">{{ t.clearToken }}</button>
                }
              </div>
              @if (tokenFeedback()) {
                <div class="token-feedback-msg">{{ tokenFeedback() }}</div>
              }
            </div>

            @if (dataLoaded()) {
              <div class="section-divider"></div>

              @if (hasSavedPreferences()) {
                <div class="option-item reset-item">
                  <button (click)="resetPreferences.emit()" type="button">{{ t.resetPreferences }}</button>
                </div>
              }
              @for (option of checkboxOptions(); track option.key) {
                <div class="option-item">
                  <label [attr.for]="option.key">{{ option.translation || option.key }}</label>
                  <input
                    [id]="option.key"
                    (change)="onOptionChange(option, $event)"
                    [checked]="option.visible"
                    type="checkbox"
                  />
                </div>
              }
            } @else {
              <div class="section-divider"></div>
              <div class="csv-hint">
                <span class="hint-icon">ℹ️</span>
                <span>{{ t.loadCsvTooltip }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .bold {
      font-weight: bold;
      color: blue;
      text-decoration: underline;
      cursor: pointer;
    }

    .myCSV {
      display: inline;
      margin: 0;
    }

    .or-text {
      color: #64748b;
      font-size: 0.9rem;
    }

    .file-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      color: darkcyan;
      padding: 4px 10px;
      border-radius: 6px;
      background: #ffffff;
      border: 1px solid darkcyan;
      position: relative;
      overflow: hidden;
      user-select: none;
      min-height: 28px;
      box-sizing: border-box;

      &:hover {
        background: #f0fdfa;
      }

      input[type="file"] {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
        width: 100%;
        height: 100%;
      }
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 10px;

      .upload, .filter-bar, .options {
        display: flex;
        align-items: center;
        border: 1px solid darkcyan;
        padding: 6px 12px;
        border-radius: 8px;
        background: #f8f9fa;
        min-height: 40px;
        box-sizing: border-box;
      }

      .upload {
        gap: 8px;
      }

      .filter-bar {
        gap: 15px;
        flex-grow: 1;
        justify-content: center;

        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background-color 0.15s ease;

          &:hover {
            background: #e6f7f7;
          }

          &.active {
            font-weight: 600;
          }
        }
      }

      .options {
        cursor: pointer;
        position: relative;
        justify-content: center;
        user-select: none;
      }
    }

    .options-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99;
    }

    .option-item {
      margin: 5px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .reset-item {
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ccc;

      button {
        width: 100%;
        cursor: pointer;
        padding: 6px 8px;
        font-family: inherit;
        font-size: 12px;
        background: #fff;
        border: 1px solid darkcyan;
        border-radius: 4px;

        &:hover {
          background: #f0fafa;
        }
      }
    }

    .bgg-token-section {
      padding-bottom: 8px;
    }

    .bgg-token-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .section-title {
        font-weight: 700;
        font-size: 0.85rem;
        color: #1e293b;
      }
    }

    .token-status-pill {
      font-size: 0.72rem;
      padding: 2px 6px;
      border-radius: 9999px;
      background: #e2e8f0;
      color: #64748b;
      font-weight: 600;

      &.active {
        background: #dcfce7;
        color: #166534;
      }
    }

    .token-input-row {
      display: flex;
      gap: 4px;
      align-items: center;
      margin-bottom: 6px;
    }

    .token-input {
      flex: 1;
      min-width: 0;
      padding: 5px 8px;
      font-size: 0.8rem;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-family: monospace;
      outline: none;

      &:focus {
        border-color: darkcyan;
      }
    }

    .token-mask-btn {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 6px;
      cursor: pointer;
      font-size: 0.8rem;

      &:hover {
        background: #e2e8f0;
      }
    }

    .token-btn-row {
      display: flex;
      gap: 6px;
    }

    .btn-token-save {
      flex: 1;
      padding: 5px 8px;
      font-size: 0.78rem;
      font-weight: 600;
      background: darkcyan;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #007070;
      }
    }

    .btn-token-clear {
      padding: 5px 8px;
      font-size: 0.78rem;
      background: #f8fafc;
      color: #ef4444;
      border: 1px solid #fca5a5;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #fee2e2;
      }
    }

    .token-feedback-msg {
      margin-top: 6px;
      font-size: 0.75rem;
      color: #059669;
      font-weight: 500;
    }

    .section-divider {
      height: 1px;
      background: #e2e8f0;
      margin: 8px 0;
    }

    .options-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      user-select: none;
    }

    .csv-hint {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #64748b;
      padding: 4px 0;
      line-height: 1.35;
    }

    #options-container {
      position: absolute;
      margin-top: 10px;
      top: 100%;
      right: 0;
      background-color: white;
      z-index: 100;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 8px;
      max-height: 400px;
      min-width: 220px;
      overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 640px) {
      .controls-row {
        flex-direction: column;
        align-items: stretch;

        .upload, .filter-bar, .options {
          width: 100%;
          justify-content: center;
        }
      }

      #options-container {
        right: auto;
        left: 50%;
        transform: translateX(-50%);
        width: 90vw;
        max-width: 320px;
      }
    }

    .controls-row.dark-theme {
      .bold {
        color: #63b3ed;
      }

      .or-text {
        color: #94a3b8;
      }

      .file-btn {
        background: #2e343a;
        border-color: #008b8b;
        color: #38bdf8;

        &:hover {
          background: #374151;
        }
      }

      .upload, .filter-bar, .options {
        background: #24282c;
        border-color: #008b8b;
        color: #e0e0e0;
      }

      .filter-bar .filter-item:hover {
        background: #2f383e;
      }

      #options-container {
        background-color: #24282c;
        border-color: #008b8b;
        color: #e0e0e0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
      }

      .reset-item {
        border-bottom: 1px solid #444;

        button {
          background: #2e343a;
          border-color: darkcyan;
          color: #e0e0e0;

          &:hover {
            background: #3b424a;
          }
        }
      }

      .bgg-token-header .section-title {
        color: #f1f5f9;
      }

      .token-status-pill {
        background: #334155;
        color: #94a3b8;

        &.active {
          background: #143521;
          color: #86efac;
        }
      }

      .token-input {
        background: #1e2226;
        border-color: #475569;
        color: #f1f5f9;

        &:focus {
          border-color: #38bdf8;
        }
      }

      .token-mask-btn {
        background: #2e343a;
        border-color: #475569;
        color: #f1f5f9;

        &:hover {
          background: #3b424a;
        }
      }

      .btn-token-save {
        background: #008b8b;

        &:hover {
          background: #00a8a8;
        }
      }

      .btn-token-clear {
        background: #2e1d1d;
        border-color: #7f1d1d;
        color: #fca5a5;

        &:hover {
          background: #3f1d1d;
        }
      }

      .token-feedback-msg {
        color: #34d399;
      }

      .section-divider {
        background: #334155;
      }

      .csv-hint {
        color: #94a3b8;
      }
    }
  `]
})
export class ControlsComponent {
  private readonly i18n = inject(I18nService);
  get t() { return this.i18n.t(); }
  readonly authService = inject(BggAuthService);

  readonly dataLoaded = input<boolean>(false);
  readonly hasSavedPreferences = input<boolean>(false);
  readonly checkboxOptions = input<CheckboxOption[]>([]);
  readonly isDarkMode = input<boolean>(false);

  readonly showStandalone = model<boolean>(true);
  readonly showExpansions = model<boolean>(false);

  readonly fileSelected = output<File>();
  readonly loadExample = output<void>();
  readonly filterToggled = output<void>();
  readonly optionToggled = output<{ key: string; visible: boolean }>();
  readonly resetPreferences = output<void>();

  readonly isExpanded = signal<boolean>(false);
  readonly tokenInput = signal<string>(this.authService.token() || '');
  readonly showTokenInput = signal<boolean>(false);
  readonly tokenFeedback = signal<string | null>(null);

  saveToken(): void {
    this.authService.setToken(this.tokenInput());
    this.tokenFeedback.set(this.t.tokenSaved);
    setTimeout(() => this.tokenFeedback.set(null), 3000);
  }

  clearToken(): void {
    this.tokenInput.set('');
    this.authService.clearToken();
    this.tokenFeedback.set(this.t.tokenCleared);
    setTimeout(() => this.tokenFeedback.set(null), 3000);
  }

  toggleOptions(): void {
    this.isExpanded.update(v => !v);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.fileSelected.emit(input.files[0]);
    }
  }

  onToggleStandalone(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!checked && !this.showExpansions()) {
      this.showExpansions.set(true);
    }
    this.showStandalone.set(checked);
    this.filterToggled.emit();
  }

  onToggleExpansions(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (!checked && !this.showStandalone()) {
      this.showStandalone.set(true);
    }
    this.showExpansions.set(checked);
    this.filterToggled.emit();
  }

  onOptionChange(option: CheckboxOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.optionToggled.emit({ key: option.key, visible: checked });
  }
}

