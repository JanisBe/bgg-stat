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

  it('should format tooltip using visibleColumns and include zero values such as rating=0 and weight=0', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('visibleColumns', new Set(['average', 'avgweight', 'rank', 'rating', 'weight', 'baverage']));
    fixture.detectChanges();

    const options = (component as any).buildChartOptions();
    const formatter = options.tooltip.formatter;

    const mockPoint = {
      name: 'Hansa Teutonica',
      y: 7.75,
      x: 3.09,
      options: {
        raw: {
          objectname: 'Hansa Teutonica',
          average: 7.75,
          avgweight: 3.09,
          rank: 146,
          rating: 0,
          weight: 0,
          baverage: 7.47,
        },
      },
    };

    const tooltipResult: string = formatter.call(mockPoint);
    expect(tooltipResult).toContain('Hansa Teutonica');
    expect(tooltipResult).toContain('Średnia:');
    expect(tooltipResult).toContain('7.75');
    expect(tooltipResult).toContain('Średnia waga:');
    expect(tooltipResult).toContain('3.09');
    expect(tooltipResult).toContain('Miejsce w rankingu:');
    expect(tooltipResult).toContain('146');
    expect(tooltipResult).toContain('Średnia (BGG):');
    expect(tooltipResult).toContain('7.47');
    // Rating (0) and Weight (0) must be displayed!
    expect(tooltipResult).toContain('Ocena:');
    expect(tooltipResult).toContain('Waga:');
  });

  it('should dynamically exclude unchecked fields from tooltip', () => {
    const fixture = TestBed.createComponent(ChartComponent);
    const component = fixture.componentInstance;
    // Exclude rank, rating, and weight
    fixture.componentRef.setInput('visibleColumns', new Set(['average', 'avgweight', 'baverage']));
    fixture.detectChanges();

    const options = (component as any).buildChartOptions();
    const formatter = options.tooltip.formatter;

    const mockPoint = {
      name: 'Hansa Teutonica',
      y: 7.75,
      x: 3.09,
      options: {
        raw: {
          objectname: 'Hansa Teutonica',
          average: 7.75,
          avgweight: 3.09,
          rank: 146,
          rating: 0,
          weight: 0,
          baverage: 7.47,
        },
      },
    };

    const tooltipResult: string = formatter.call(mockPoint);
    expect(tooltipResult).toContain('Hansa Teutonica');
    expect(tooltipResult).toContain('Średnia:');
    expect(tooltipResult).not.toContain('Miejsce w rankingu:');
    expect(tooltipResult).not.toContain('Ocena:');
    expect(tooltipResult).not.toContain('Waga:');
  });
});

