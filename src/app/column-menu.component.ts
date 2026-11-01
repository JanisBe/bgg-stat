import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { getActiveTranslations } from './i18n';
import { CheckboxOption } from './models';

@Component({
  selector: 'app-column-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (isOpen()) {
      <div (click)="close.emit()" class="column-menu-backdrop"></div>
      <div
        (click)="$event.stopPropagation()"
        [style.left.px]="x()"
        [style.top.px]="y()"
        class="column-menu-popup"
        [class.dark-theme]="isDarkMode()"
      >
        @if (colId() && colId() !== 'objectname') {
          <button (click)="onHideColumn()" class="column-menu-action" type="button">
            {{ t.hideColumn }}
          </button>
          <div class="column-menu-separator"></div>
        }
        <div class="column-menu-title">{{ t.columnsMenu }}</div>
        <div class="column-menu-list">
          @for (option of options(); track option.key) {
            <label class="column-menu-item">
              <input
                (change)="onToggle(option, $event)"
                [checked]="option.visible"
                [disabled]="option.key === 'objectname'"
                type="checkbox"
              />
              {{ option.translation || option.key }}
            </label>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .column-menu-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
    }

    .column-menu-popup {
      position: fixed;
      z-index: 1001;
      min-width: 220px;
      max-width: 320px;
      max-height: 360px;
      overflow: auto;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      padding: 8px 0;
      font-size: 13px;

      &.dark-theme {
        background: #24282c;
        border-color: #008b8b;
        color: #e0e0e0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);

        .column-menu-action {
          color: #e0e0e0;

          &:hover {
            background: #2f353b;
          }
        }

        .column-menu-separator {
          background: #444;
        }

        .column-menu-title {
          color: #aaa;
        }

        .column-menu-item:hover {
          background: #2f353b;
        }
      }
    }

    .column-menu-action {
      display: block;
      width: calc(100% - 16px);
      margin: 0 8px;
      padding: 6px 8px;
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;

      &:hover {
        background: #f0fafa;
      }
    }

    .column-menu-separator {
      height: 1px;
      background: #e0e0e0;
      margin: 6px 0;
    }

    .column-menu-title {
      padding: 4px 12px 6px;
      font-weight: bold;
      color: #555;
    }

    .column-menu-list {
      display: flex;
      flex-direction: column;
    }

    .column-menu-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      cursor: pointer;
      user-select: none;

      &:hover {
        background: #f5f5f5;
      }

      &:has(input:disabled) {
        opacity: 0.6;
        cursor: default;
      }
    }
  `]
})
export class ColumnMenuComponent {
  readonly t = getActiveTranslations();

  readonly isOpen = input<boolean>(false);
  readonly x = input<number>(0);
  readonly y = input<number>(0);
  readonly colId = input<string | null>(null);
  readonly options = input<CheckboxOption[]>([]);
  readonly isDarkMode = input<boolean>(false);

  readonly close = output<void>();
  readonly hideColumn = output<string>();
  readonly toggleColumn = output<{ option: CheckboxOption; checked: boolean }>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) {
      this.close.emit();
    }
  }

  onHideColumn(): void {
    const currentId = this.colId();
    if (currentId && currentId !== 'objectname') {
      this.hideColumn.emit(currentId);
    }
  }

  onToggle(option: CheckboxOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleColumn.emit({ option, checked });
  }
}

