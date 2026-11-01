import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(withXhr(), withInterceptorsFromDi())
  ]
};
