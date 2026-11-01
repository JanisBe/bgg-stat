import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app.component';
import { saveUiPreferences } from './uiPreferences';

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the app with base games enabled and expansions disabled by default', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(app.showStandalone).toBeTrue();
    expect(app.showExpansions).toBeFalse();
  });

  it('should render title heading', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(fixture.componentInstance.t.title);
  });

  it('should default to base games when stored preferences have nothing selected', () => {
    saveUiPreferences({
      columnVisibility: {},
      showStandalone: false,
      showExpansions: false,
      filterModel: null,
      columnState: [],
    });

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.showStandalone).toBeTrue();
    expect(app.showExpansions).toBeFalse();
  });

  it('should preserve expansions when explicitly stored in preferences', () => {
    saveUiPreferences({
      columnVisibility: {},
      showStandalone: true,
      showExpansions: true,
      filterModel: null,
      columnState: [],
    });

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.showStandalone).toBeTrue();
    expect(app.showExpansions).toBeTrue();
  });

  it('should reset filter to base games on resetPreferences', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.showStandalone = false;
    app.showExpansions = true;

    app.resetPreferences();

    expect(app.showStandalone).toBeTrue();
    expect(app.showExpansions).toBeFalse();
  });
});
