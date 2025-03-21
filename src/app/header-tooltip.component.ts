import {Component} from '@angular/core';
import {IHeaderAngularComp} from "ag-grid-angular";
import {IHeaderParams} from "ag-grid-community";

@Component({
  selector: 'app-tooltip-header',
  template: `
    <div class="ag-header-cell-label custom-header">
      <span class="ag-header-cell-text" [title]="displayName">{{ displayName }}</span>
    </div>
  `,
  styles: [`
    .custom-header {
      width: 100%;
      height: 100%;
    }
  `]
})
export class TooltipHeaderComponent implements IHeaderAngularComp {
  public displayName: string | undefined;

  agInit(params: IHeaderParams): void {
    this.displayName = params.displayName;
  }

  refresh(params: IHeaderParams): boolean {
    this.displayName = params.displayName;
    return true;
  }
}
