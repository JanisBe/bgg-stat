import { Injectable, signal } from '@angular/core';
import {
  clearUiPreferences,
  hasUiPreferences,
  loadUiPreferences,
  saveUiPreferences,
  UiPreferences,
} from '../uiPreferences';

@Injectable({
  providedIn: 'root',
})
export class UiPreferencesService {
  readonly hasSavedPreferences = signal<boolean>(hasUiPreferences());

  private saveTimeout?: ReturnType<typeof setTimeout>;

  load(): UiPreferences | null {
    return loadUiPreferences();
  }

  save(prefs: UiPreferences): void {
    saveUiPreferences(prefs);
    this.hasSavedPreferences.set(true);
  }

  scheduleSave(getPreferences: () => UiPreferences, delayMs = 300): void {
    this.cancelScheduledSave();
    this.saveTimeout = setTimeout(() => {
      this.save(getPreferences());
    }, delayMs);
  }

  cancelScheduledSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = undefined;
    }
  }

  clear(): void {
    this.cancelScheduledSave();
    clearUiPreferences();
    this.hasSavedPreferences.set(false);
  }
}
