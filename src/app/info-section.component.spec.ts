import { TestBed } from '@angular/core/testing';
import { InfoSectionComponent } from './info-section.component';

describe('InfoSectionComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoSectionComponent],
    }).compileComponents();
  });

  it('should create the info section component', () => {
    const fixture = TestBed.createComponent(InfoSectionComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render section headings', () => {
    const fixture = TestBed.createComponent(InfoSectionComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const headings = compiled.querySelectorAll('h2');
    expect(headings.length).toBe(2);
    expect(headings[0].textContent).toContain(fixture.componentInstance.t.infoTitle);
  });
});

