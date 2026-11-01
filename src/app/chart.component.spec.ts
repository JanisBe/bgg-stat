import { TestBed } from '@angular/core/testing';
import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartComponent],
    }).compileComponents();
  });

  it('should create chart component', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render chart container element', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#hcContainer')).toBeTruthy();
  });
});

