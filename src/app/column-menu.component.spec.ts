import { TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { ColumnMenuComponent } from './column-menu.component';

describe('ColumnMenuComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnMenuComponent],
    }).compileComponents();
  });

  it('should not render popup when isOpen is false', () => {
    const fixture = TestBed.createComponent(ColumnMenuComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.column-menu-popup')).toBeNull();
  });

  it('should render popup and options when isOpen is true', () => {
    const fixture = TestBed.createComponent(ColumnMenuComponent);
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('options', [
      { key: 'objectname', visible: true, translation: 'Name' },
      { key: 'rating', visible: false, translation: 'Rating' },
    ]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.column-menu-popup')).toBeTruthy();
    const items = compiled.querySelectorAll('.column-menu-item');
    expect(items.length).toBe(2);
  });
});

