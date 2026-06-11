import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

export interface ColumnMenuRequest {
  colId: string;
  anchor?: HTMLElement;
  clientX?: number;
  clientY?: number;
}

@Injectable({providedIn: 'root'})
export class ColumnMenuService {
  private readonly openSubject = new Subject<ColumnMenuRequest>();
  readonly open$ = this.openSubject.asObservable();

  open(request: ColumnMenuRequest): void {
    this.openSubject.next(request);
  }
}
