import { TestBed } from '@angular/core/testing';
import { BggAuthService, BGG_API_TOKEN_STORAGE_KEY } from './bgg-auth.service';

describe('BggAuthService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize without token when localStorage is empty', () => {
    const service = TestBed.inject(BggAuthService);
    expect(service.token()).toBeNull();
    expect(service.hasToken()).toBeFalse();
  });

  it('should initialize with token when already stored in localStorage', () => {
    localStorage.setItem(BGG_API_TOKEN_STORAGE_KEY, 'stored-secret-token');
    const service = TestBed.inject(BggAuthService);
    expect(service.token()).toBe('stored-secret-token');
    expect(service.hasToken()).toBeTrue();
  });

  it('should set and persist new token', () => {
    const service = TestBed.inject(BggAuthService);
    service.setToken('   new-token-123   ');
    expect(service.token()).toBe('new-token-123');
    expect(service.hasToken()).toBeTrue();
    expect(localStorage.getItem(BGG_API_TOKEN_STORAGE_KEY)).toBe('new-token-123');
  });

  it('should clear token and remove from localStorage', () => {
    localStorage.setItem(BGG_API_TOKEN_STORAGE_KEY, 'initial-token');
    const service = TestBed.inject(BggAuthService);
    expect(service.hasToken()).toBeTrue();

    service.clearToken();
    expect(service.token()).toBeNull();
    expect(service.hasToken()).toBeFalse();
    expect(localStorage.getItem(BGG_API_TOKEN_STORAGE_KEY)).toBeNull();
  });
});

