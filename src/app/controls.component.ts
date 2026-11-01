import { ChangeDetectionStrategy, Component, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { getActiveTranslations } from './i18n';
import { CheckboxOption } from './models';

@Component({
  selector: 'app-controls',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="controls-row" [class.dark-theme]="isDarkMode()">
      <div class="upload">
        <input (change)="onFileChange($event)" accept="text/csv" type="file" />
        {{ t.or }}
        <p (click)="loadExample.emit()" class="myCSV bold">{{ t.useMyCsv }}</p>
      </div>

      @if (dataLoaded()) {
        <div class="filter-bar">
          <div class="filter-group">
            <strong>{{ t.filter }}</strong>
            <label class="filter-item">
              <input
                (change)="onToggleStandalone($event)"
                [checked]="showStandalone()"
                type="checkbox"
              />
              {{ t.baseGames }}
            </label>
            <label class="filter-item">
              <input
                (change)="onToggleExpansions($event)"
                [checked]="showExpansions()"
                type="checkbox"
              />
              {{ t.expansions }}
            </label>
          </div>
        </div>

        <div class="options" style="position: relative;">
          <div (click)="toggleOptions()" class="tooltip">
            {{ t.options }}
            @if (!dataLoaded()) {
              <span class="tooltiptext">{{ t.loadCsvTooltip }}</span>
            }
          </div>

          @if (isExpanded()) {
            <div (mouseleave)="isExpanded.set(false)" id="options-container">
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
            </div>
          }
        </div>
      }
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
        padding: 8px 12px;
        border-radius: 8px;
        background: #f8f9fa;
        height: 40px;
        box-sizing: border-box;
      }

      .upload {
        gap: 10px;
      }

      .filter-bar {
        gap: 15px;
        flex-grow: 1;
        justify-content: center;

        .filter-group {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          user-select: none;
        }
      }

      .options {
        cursor: pointer;
        position: relative;
        justify-content: center;
      }
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
        padding: 4px 8px;
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

    .tooltip {
      position: relative;
      display: inline-block;
      border-bottom: 1px dotted black;
    }

    .tooltip .tooltiptext {
      visibility: hidden;
      width: 250px;
      background-color: black;
      color: #fff;
      text-align: center;
      border-radius: 6px;
      padding: 5px 0;
      position: absolute;
      z-index: 1;
      top: -5px;
      right: 110%;
    }

    .tooltip .tooltiptext::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 100%;
      margin-top: -5px;
      border-width: 5px;
      border-style: solid;
      border-color: transparent transparent transparent black;
    }

    .tooltip:hover .tooltiptext {
      visibility: visible;
    }

    #options-container {
      position: absolute;
      margin-top: 10px;
      top: 100%;
      right: 0;
      background-color: white;
      z-index: 10;
      padding: 10px;
      border: 1px solid #ccc;
      max-height: 400px;
      overflow-y: auto;
    }

    .controls-row.dark-theme {
      .bold {
        color: #63b3ed;
      }

      .upload, .filter-bar, .options {
        background: #24282c;
        border-color: #008b8b;
        color: #e0e0e0;

        input[type="file"] {
          color: #e0e0e0;
        }
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
    }
  `]
})
export class ControlsComponent {
  readonly t = getActiveTranslations();

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

