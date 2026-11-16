import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { IHeaderParams } from 'ag-grid-community';
import { ColumnMenuService } from './column-menu.service';

@Component({
  selector: 'app-inner-header',
  template: `
    <div class="inner-header">
      <span class="ag-header-cell-text" [title]="params.displayName">{{ params.displayName }}</span>
      <button
        type="button"
        class="column-menu-btn"
        (click)="openMenu($event)"
        [attr.aria-label]="menuLabel"
      >
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5"/>
          <circle cx="8" cy="8" r="1.5"/>
          <circle cx="8" cy="13" r="1.5"/>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .inner-header {
      display: flex;
      align-items: center;
      gap: 2px;
      width: 100%;
      min-width: 0;
      height: 100%;
      box-sizing: border-box;
    }

    .ag-header-cell-text {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
      font-family: var(--font-display);
      font-weight: 600;
      letter-spacing: var(--tracking-display);
      white-space: normal;
      overflow-wrap: normal;
      word-break: normal;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .column-menu-btn {
      flex-shrink: 0;
      border: var(--rule-hair) solid transparent;
      background: transparent;
      cursor: pointer;
      padding: 2px;
      border-radius: var(--radius-pill);
      color: var(--color-muted);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      opacity: 0.6;
      transition: opacity var(--dur-micro, 120ms) ease;

      &:hover,
      &:focus-visible {
        opacity: 1;
        color: var(--color-ink);
        background: var(--color-paper-3);
      }

      &:focus-visible {
        outline: 2px solid var(--color-focus);
      }
    }

    .inner-header:hover .column-menu-btn {
      opacity: 1;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class InnerHeaderComponent {
  params!: IHeaderParams;
  menuLabel = 'Column menu';
  private readonly columnMenuService = inject(ColumnMenuService);

  agInit(params: IHeaderParams): void {
    this.params = params;
  }

  refresh(params: IHeaderParams): boolean {
    this.params = params;
    return true;
  }

  openMenu(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.columnMenuService.open({
      colId: this.params.column.getColId(),
      clientX: event.clientX,
      clientY: event.clientY,
    });
  }
}
