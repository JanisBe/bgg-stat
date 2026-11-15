import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BggApiService } from './bgg-api.service';
import { BggAuthService } from './bgg-auth.service';

describe('BggApiService', () => {
  let service: BggApiService;
  let httpTesting: HttpTestingController;
  let authService: BggAuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(BggApiService);
    httpTesting = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(BggAuthService);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should return null if user has no token configured', (done) => {
    service.getThingDetails(26997).subscribe((res) => {
      expect(res).toBeNull();
      done();
    });

    httpTesting.expectNone('https://boardgamegeek.com/xmlapi2/thing?id=26997&versions=1');
  });

  it('should request BGG XML with Bearer token and parse response', (done) => {
    authService.setToken('test-bgg-token');

    const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="26997">
    <name type="primary" value="1989: Dawn of Freedom" />
  </item>
</items>`;

    service.getThingDetails(26997).subscribe((details) => {
      expect(details).not.toBeNull();
      expect(details?.id).toBe(26997);
      expect(details?.primaryName).toBe('1989: Dawn of Freedom');
      done();
    });

    const req = httpTesting.expectOne('https://boardgamegeek.com/xmlapi2/thing?id=26997&versions=1');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-bgg-token');
    req.flush(sampleXml);
  });

  it('should return cached details on repeated calls without extra HTTP request', (done) => {
    authService.setToken('test-bgg-token');

    const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
  <item type="boardgame" id="26997">
    <name type="primary" value="1989: Dawn of Freedom" />
  </item>
</items>`;

    service.getThingDetails(26997).subscribe(() => {
      // Second call should come from cache
      service.getThingDetails(26997).subscribe((cachedDetails) => {
        expect(cachedDetails?.primaryName).toBe('1989: Dawn of Freedom');
        done();
      });
    });

    const req = httpTesting.expectOne('https://boardgamegeek.com/xmlapi2/thing?id=26997&versions=1');
    req.flush(sampleXml);
  });
});

