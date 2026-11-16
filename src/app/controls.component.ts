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
      <div class="upload-section">
        <label class="file-btn" tabindex="0">
          <svg class="control-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>{{ t.chooseFile }}</span>
          <input (change)="onFileChange($event)" accept="text/csv" type="file" tabindex="-1" />
        </label>
        <span class="or-separator">{{ t.or }}</span>
        <button type="button" (click)="loadExample.emit()" class="example-btn">
          {{ t.useMyCsv }}
        </button>
      </div>

      @if (dataLoaded()) {
        <div class="filter-section">
          <div class="filter-group">
            <span class="filter-label">{{ t.filter }}</span>
            <label class="filter-chip" [class.active]="showStandalone()">
              <input
                (change)="onToggleStandalone($event)"
                [checked]="showStandalone()"
                type="checkbox"
              />
              <span>{{ t.baseGames }}</span>
            </label>
            <label class="filter-chip" [class.active]="showExpansions()">
              <input
                (change)="onToggleExpansions($event)"
                [checked]="showExpansions()"
                type="checkbox"
              />
              <span>{{ t.expansions }}</span>
            </label>
          </div>
        </div>
      }

      <div class="options-wrapper">
        <button
          type="button"
          (click)="toggleOptions()"
          class="options-trigger"
          [attr.aria-expanded]="isExpanded()"
        >
          <svg class="control-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>{{ t.options }}</span>
        </button>

        @if (isExpanded()) {
          <div class="options-backdrop" (click)="isExpanded.set(false)"></div>
          <div id="options-container" class="options-dropdown sheet">
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
                  [attr.aria-label]="showTokenInput() ? 'Hide' : 'Show'"
                >
                  @if (showTokenInput()) {
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  } @else {
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  }
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

              <div class="options-section-header">
                <span class="section-title">{{ t.tooltipOptionsTitle }}</span>
                <span class="options-hint-text">{{ t.tooltipOptionsHint }}</span>
              </div>

              @if (hasSavedPreferences()) {
                <div class="option-item reset-item">
                  <button (click)="resetPreferences.emit()" type="button" class="btn-reset">{{ t.resetPreferences }}</button>
                </div>
              }
              @for (option of tooltipOptions(); track option.key) {
                <div class="option-item">
                  <label [attr.for]="'tooltip-' + option.key">{{ option.translation || option.key }}</label>
                  <input
                    [id]="'tooltip-' + option.key"
                    (change)="onOptionChange(option, $event)"
                    [checked]="option.visible"
                    type="checkbox"
                  />
                </div>
              }
            } @else {
              <div class="section-divider"></div>
              <div class="csv-hint">
                <svg class="control-icon" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>{{ t.loadCsvTooltip }}</span>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .controls-row {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      flex-wrap: wrap;
      margin: var(--space-xs) 0 var(--space-sm) 0;
      font-family: var(--font-body);
    }

    .upload-section, .filter-section, .options-wrapper {
      display: flex;
      align-items: center;
      background: var(--color-sheet);
      border: var(--rule-hair) solid var(--color-rule);
      border-radius: var(--radius-card);
      height: 38px;
      padding: 0 var(--space-sm);
      box-sizing: border-box;
    }

    .upload-section {
      gap: var(--space-xs);
    }

    .or-separator {
      color: var(--color-muted);
      font-size: var(--text-xs);
    }

    .file-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
      cursor: pointer;
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      color: var(--color-ink);
      padding: var(--space-2xs) var(--space-xs);
      background: var(--color-paper-2);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);
      position: relative;
      overflow: hidden;
      user-select: none;

      &:hover {
        background: var(--color-paper-3);
        color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
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

    .example-btn {
      background: transparent;
      border: none;
      padding: 0;
      font-family: var(--font-body);
      font-size: var(--text-sm);
      color: var(--color-accent);
      text-decoration: underline;
      text-underline-offset: 0.16em;
      cursor: pointer;

      &:hover {
        color: var(--color-accent-2);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
      }
    }

    .filter-section {
      flex-grow: 1;
      justify-content: center;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }

    .filter-label {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-display);
      color: var(--color-muted);
      text-transform: uppercase;
    }

    .filter-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
      cursor: pointer;
      user-select: none;
      padding: var(--space-3xs) var(--space-xs);
      font-size: var(--text-sm);
      color: var(--color-ink-2);
      border-radius: var(--radius-pill);

      &:hover {
        background: var(--color-paper-2);
      }

      input[type="checkbox"] {
        accent-color: var(--color-accent);
      }

      &.active {
        font-weight: 600;
        color: var(--color-ink);
      }
    }

    .options-wrapper {
      position: relative;
      padding: 0;
    }

    .options-trigger {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2xs);
      height: 100%;
      padding: 0 var(--space-sm);
      background: transparent;
      border: none;
      cursor: pointer;
      font-family: var(--font-display);
      font-size: var(--text-sm);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      color: var(--color-ink);
      border-radius: var(--radius-card);

      &:hover {
        background: var(--color-paper-2);
        color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .options-backdrop {
      position: fixed;
      inset: 0;
      z-index: var(--z-dropdown);
    }

    .options-dropdown {
      position: absolute;
      margin-top: var(--space-2xs);
      top: 100%;
      right: 0;
      background: var(--color-sheet);
      z-index: calc(var(--z-dropdown) + 1);
      padding: var(--space-sm);
      border: var(--rule-bar) solid var(--color-rule-2);
      border-radius: var(--radius-card);
      max-height: 420px;
      min-width: 250px;
      overflow-y: auto;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      color: var(--color-ink);
    }

    .bgg-token-section {
      padding-bottom: var(--space-xs);
    }

    .bgg-token-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-xs);
      margin-bottom: var(--space-xs);

      .section-title {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: var(--text-sm);
        letter-spacing: var(--tracking-display);
      }
    }

    .token-status-pill {
      font-family: var(--font-outlier);
      font-size: var(--text-xs);
      padding: var(--space-3xs) var(--space-2xs);
      border-radius: var(--radius-pill);
      background: var(--color-paper-2);
      color: var(--color-muted);
      border: var(--rule-hair) solid var(--color-rule);

      &.active {
        background: var(--color-success-bg);
        color: var(--color-success);
        border-color: var(--color-success);
      }
    }

    .token-input-row {
      display: flex;
      gap: var(--space-2xs);
      align-items: center;
      margin-bottom: var(--space-xs);
    }

    .token-input {
      flex: 1;
      min-width: 0;
      padding: var(--space-2xs) var(--space-xs);
      font-size: var(--text-sm);
      font-family: var(--font-outlier);
      background: var(--color-paper);
      color: var(--color-ink);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .token-mask-btn {
      background: var(--color-paper-2);
      border: var(--rule-hair) solid var(--color-rule);
      border-radius: var(--radius-pill);
      padding: var(--space-2xs);
      cursor: pointer;
      color: var(--color-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: var(--color-paper-3);
        color: var(--color-ink);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .token-btn-row {
      display: flex;
      gap: var(--space-xs);
    }

    .btn-token-save {
      flex: 1;
      padding: var(--space-2xs) var(--space-sm);
      font-family: var(--font-display);
      font-size: var(--text-xs);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      background: var(--color-accent);
      color: var(--color-accent-ink);
      border: var(--rule-hair) solid var(--color-accent);
      border-radius: var(--radius-pill);
      cursor: pointer;

      &:hover {
        background: var(--color-accent-2);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
      }
    }

    .btn-token-clear {
      padding: var(--space-2xs) var(--space-xs);
      font-family: var(--font-display);
      font-size: var(--text-xs);
      background: var(--color-paper-2);
      color: var(--color-error);
      border: var(--rule-hair) solid var(--color-error);
      border-radius: var(--radius-pill);
      cursor: pointer;

      &:hover {
        background: var(--color-error-bg);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .token-feedback-msg {
      margin-top: var(--space-xs);
      font-size: var(--text-xs);
      color: var(--color-success);
      font-family: var(--font-display);
    }

    .section-divider {
      height: var(--rule-hair);
      background: var(--color-rule);
      margin: var(--space-xs) 0;
    }

    .options-section-header {
      margin: var(--space-xs) 0 var(--space-2xs) 0;

      .section-title {
        font-family: var(--font-display);
        font-weight: 600;
        font-size: var(--text-sm);
        letter-spacing: var(--tracking-display);
        color: var(--color-ink);
        display: block;
      }

      .options-hint-text {
        display: block;
        font-size: var(--text-xs);
        color: var(--color-muted);
        line-height: 1.35;
        margin-top: var(--space-3xs);
      }
    }

    .btn-reset {
      width: 100%;
      cursor: pointer;
      padding: var(--space-2xs) var(--space-xs);
      font-family: var(--font-display);
      font-size: var(--text-xs);
      background: var(--color-paper-2);
      color: var(--color-ink);
      border: var(--rule-hair) solid var(--color-rule-2);
      border-radius: var(--radius-pill);

      &:hover {
        background: var(--color-paper-3);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .option-item {
      margin: var(--space-2xs) 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
      font-size: var(--text-sm);

      label {
        cursor: pointer;
      }

      input[type="checkbox"] {
        accent-color: var(--color-accent);
      }
    }

    .csv-hint {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: var(--text-xs);
      color: var(--color-muted);
      padding: var(--space-xs) 0;
    }

    .control-icon {
      flex-shrink: 0;
    }

    @media (max-width: 640px) {
      .controls-row {
        flex-direction: column;
        align-items: stretch;

        .upload-section, .filter-section, .options-wrapper {
          width: 100%;
          justify-content: center;
        }
      }

      .options-dropdown {
        right: auto;
        left: 50%;
        transform: translateX(-50%);
        width: 90vw;
        max-width: 320px;
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
  readonly tooltipOptions = input<CheckboxOption[]>([]);
  readonly isDarkMode = input<boolean>(false);

  readonly showStandalone = model<boolean>(true);
  readonly showExpansions = model<boolean>(false);

  readonly fileSelected = output<File>();
  readonly loadExample = output<void>();
  readonly filterToggled = output<void>();
  readonly tooltipOptionToggled = output<{ key: string; visible: boolean }>();
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
    this.tooltipOptionToggled.emit({ key: option.key, visible: checked });
    this.optionToggled.emit({ key: option.key, visible: checked });
  }
}
