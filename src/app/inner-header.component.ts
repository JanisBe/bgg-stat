import {Component, inject} from '@angular/core';
import {IHeaderParams} from 'ag-grid-community';
import {ColumnMenuService} from './column-menu.service';

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
      >⋮</button>
    </div>
  `,
  styles: [`
    .inner-header {
      display: flex;
      align-items: center;
      gap: 4px;
      width: 100%;
      min-width: 0;
    }

    .ag-header-cell-text {
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }

    .column-menu-btn {
      flex-shrink: 0;
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0 4px;
      font-size: 14px;
      line-height: 1;
      color: #666;
    }

    .column-menu-btn:hover {
      color: #000;
    }
  `],
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
      anchor: event.currentTarget as HTMLElement,
    });
  }
}
