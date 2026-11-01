import {
  clearUiPreferences,
  hasUiPreferences,
  loadUiPreferences,
  saveUiPreferences,
  UiPreferences,
} from './uiPreferences';

describe('uiPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return null when no preferences are saved', () => {
    expect(hasUiPreferences()).toBeFalse();
    expect(loadUiPreferences()).toBeNull();
  });

  it('should load saved preferences correctly when expansions are enabled', () => {
    const prefs: UiPreferences = {
      columnVisibility: { objectname: true },
      showStandalone: true,
      showExpansions: true,
      filterModel: null,
      columnState: [],
      darkMode: false,
    };

    saveUiPreferences(prefs);

    expect(hasUiPreferences()).toBeTrue();
    const loaded = loadUiPreferences();
    expect(loaded).toBeTruthy();
    expect(loaded?.showStandalone).toBeTrue();
    expect(loaded?.showExpansions).toBeTrue();
  });

  it('should load saved preferences correctly when only expansions are selected', () => {
    const prefs: UiPreferences = {
      columnVisibility: { objectname: true },
      showStandalone: false,
      showExpansions: true,
      filterModel: null,
      columnState: [],
      darkMode: false,
    };

    saveUiPreferences(prefs);

    const loaded = loadUiPreferences();
    expect(loaded?.showStandalone).toBeFalse();
    expect(loaded?.showExpansions).toBeTrue();
  });

  it('should default to base games when the user selected nothing (both are false)', () => {
    const prefs: UiPreferences = {
      columnVisibility: { objectname: true },
      showStandalone: false,
      showExpansions: false,
      filterModel: null,
      columnState: [],
      darkMode: false,
    };

    saveUiPreferences(prefs);

    const loaded = loadUiPreferences();
    expect(loaded).toBeTruthy();
    expect(loaded?.showStandalone).toBeTrue();
    expect(loaded?.showExpansions).toBeFalse();
  });

  it('should default to base games when filter preferences are missing', () => {
    localStorage.setItem(
      'bgg-stat-ui-preferences',
      JSON.stringify({
        columnVisibility: {},
        filterModel: null,
        columnState: [],
      })
    );

    const loaded = loadUiPreferences();
    expect(loaded).toBeTruthy();
    expect(loaded?.showStandalone).toBeTrue();
    expect(loaded?.showExpansions).toBeFalse();
  });

  it('should clear stored preferences', () => {
    saveUiPreferences({
      columnVisibility: {},
      showStandalone: true,
      showExpansions: false,
      filterModel: null,
      columnState: [],
    });

    expect(hasUiPreferences()).toBeTrue();
    clearUiPreferences();
    expect(hasUiPreferences()).toBeFalse();
    expect(loadUiPreferences()).toBeNull();
  });
});

