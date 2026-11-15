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
    expect(app.showStandalone()).toBeTrue();
    expect(app.showExpansions()).toBeFalse();
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
    expect(app.showStandalone()).toBeTrue();
    expect(app.showExpansions()).toBeFalse();
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
    expect(app.showStandalone()).toBeTrue();
    expect(app.showExpansions()).toBeTrue();
  });

  it('should reset filter to base games on resetPreferences', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.showStandalone.set(false);
    app.showExpansions.set(true);

    app.resetPreferences();

    expect(app.showStandalone()).toBeTrue();
    expect(app.showExpansions()).toBeFalse();
  });

  it('should switch activeTab when setActiveTab is called', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(['all', 'chart']).toContain(app.activeTab());
    app.setActiveTab('cards');
    expect(app.activeTab()).toBe('cards');
    app.setActiveTab('table');
    expect(app.activeTab()).toBe('table');
    app.setActiveTab('info');
    expect(app.activeTab()).toBe('info');
    app.setActiveTab('all');
    expect(app.activeTab()).toBe('all');
    app.setActiveTab('chart');
    expect(app.activeTab()).toBe('chart');
  });

  it('should clear selected game on clearSelectedGame', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.selectedGame.set({ objectname: 'Catan', x: 2.3, y: 7.2 } as any);
    expect(app.selectedGame()).toBeTruthy();

    app.clearSelectedGame();
    expect(app.selectedGame()).toBeNull();
  });

  it('should switch language between pl and en', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    app.setLanguage('en');
    fixture.detectChanges();
    expect(app.currentLang()).toBe('en');
    expect(app.t.title).toBe('BGG Collection Visualizer');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('BGG Collection');
    const activeLangBtn = compiled.querySelector('.lang-btn.active');
    expect(activeLangBtn?.textContent?.trim()).toBe('EN');

    app.setLanguage('pl');
    fixture.detectChanges();
    expect(app.currentLang()).toBe('pl');
    expect(app.t.title).toBe('Kolekcja BGG');
    expect(compiled.querySelector('h1')?.textContent).toContain('Kolekcja BGG');
  });

  it('should render header actions containing lang switcher and theme toggle without overlap', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const headerActions = compiled.querySelector('.header-actions');
    expect(headerActions).toBeTruthy();

    const langSwitcher = headerActions?.querySelector('.lang-switcher');
    expect(langSwitcher).toBeTruthy();
    expect(langSwitcher?.querySelectorAll('.lang-btn').length).toBe(2);

    const themeToggle = headerActions?.querySelector('.theme-toggle-btn');
    expect(themeToggle).toBeTruthy();

    app.fileDate.set('2026-11-14');
    fixture.detectChanges();
    const fileDate = headerActions?.querySelector('.file-date');
    expect(fileDate).toBeTruthy();
    expect(fileDate?.textContent).toContain('2026-11-14');
  });
});
