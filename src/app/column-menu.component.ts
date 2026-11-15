import { ChangeDetectionStrategy, Component, HostListener, inject, input, output } from '@angular/core';
import { I18nService } from './i18n';
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
              <span>{{ option.translation || option.key }}</span>
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
      z-index: var(--z-dropdown);
    }

    .column-menu-popup {
      position: fixed;
      z-index: calc(var(--z-dropdown) + 1);
      min-width: 220px;
      max-width: 320px;
      max-height: 380px;
      overflow-y: auto;
      background: var(--color-sheet);
      border: var(--rule-bar) solid var(--color-rule-2);
      border-radius: var(--radius-card);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      padding: var(--space-xs) 0;
      font-size: var(--text-sm);
      color: var(--color-ink);
    }

    .column-menu-action {
      display: block;
      width: calc(100% - 16px);
      margin: 0 var(--space-xs);
      padding: var(--space-2xs) var(--space-xs);
      text-align: left;
      border: none;
      background: transparent;
      cursor: pointer;
      font-family: inherit;
      font-size: var(--text-sm);
      color: var(--color-ink);
      border-radius: var(--radius-pill);

      &:hover {
        background: var(--color-paper-2);
        color: var(--color-accent);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .column-menu-separator {
      height: var(--rule-hair);
      background: var(--color-rule);
      margin: var(--space-2xs) 0;
    }

    .column-menu-title {
      font-family: var(--font-display);
      font-weight: 600;
      font-size: var(--text-xs);
      color: var(--color-muted);
      padding: var(--space-2xs) var(--space-md);
      letter-spacing: 0.02em;
    }

    .column-menu-list {
      display: flex;
      flex-direction: column;
    }

    .column-menu-item {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      padding: var(--space-2xs) var(--space-md);
      cursor: pointer;
      user-select: none;
      font-size: var(--text-sm);
      color: var(--color-ink);

      &:hover {
        background: var(--color-paper-2);
      }

      input[type="checkbox"] {
        accent-color: var(--color-accent);
      }
    }
  `]
})
export class ColumnMenuComponent {
  private readonly i18n = inject(I18nService);
  get t() { return this.i18n.t(); }

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
    const id = this.colId();
    if (id) {
      this.hideColumn.emit(id);
    }
  }

  onToggle(option: CheckboxOption, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleColumn.emit({ option, checked });
  }
}
