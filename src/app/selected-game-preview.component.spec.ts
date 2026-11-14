import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { SelectedGamePreviewComponent } from './selected-game-preview.component';
import { DataPoint } from './models';
import { BGG_API_TOKEN_STORAGE_KEY } from './bgg-auth.service';
import { BggApiService } from './bgg-api.service';
import { BggThingDetails } from './bgg-xml/bgg-xml.models';

describe('SelectedGamePreviewComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SelectedGamePreviewComponent],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create selected game preview component', () => {
    const fixture = TestBed.createComponent(SelectedGamePreviewComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display game title and details when game is provided without token', () => {
    const fixture = TestBed.createComponent(SelectedGamePreviewComponent);
    const game: DataPoint = {
      objectname: 'Wingspan',
      originalname: 'Wingspan',
      objectid: 266192,
      average: 8.06,
      avgweight: 2.45,
      rank: 28,
      minplayers: 1,
      maxplayers: 5,
      playingtime: 70,
      yearpublished: 2019,
      x: 2.45,
      y: 8.06,
    };

    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.game-title')?.textContent).toContain('Wingspan');
    expect(compiled.querySelector('.rating-badge')?.textContent).toContain('8.06');
    expect(compiled.querySelector('.weight-badge')?.textContent).toContain('2.45/5');
    expect(compiled.querySelector('.rank-badge')?.textContent).toContain('#28');
    // Without token, BGG details container should not exist
    expect(compiled.querySelector('.bgg-details-container')).toBeNull();
  });

  it('should emit close when close button is clicked', () => {
    const fixture = TestBed.createComponent(SelectedGamePreviewComponent);
    let closed = false;
    fixture.componentInstance.close.subscribe(() => {
      closed = true;
    });

    const game: DataPoint = { objectname: 'Azul', objectid: 230802, x: 1.76, y: 7.76 };
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.close-btn') as HTMLButtonElement;
    closeBtn.click();

    expect(closed).toBeTrue();
  });

  it('should emit openBgg when BGG button is clicked', () => {
    const fixture = TestBed.createComponent(SelectedGamePreviewComponent);
    let openedId: string | number | undefined;
    fixture.componentInstance.openBgg.subscribe((id) => {
      openedId = id;
    });

    const game: DataPoint = { objectname: 'Azul', objectid: 230802, x: 1.76, y: 7.76 };
    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();

    const bggBtn = fixture.nativeElement.querySelector('.bgg-btn') as HTMLButtonElement;
    bggBtn.click();

    expect(openedId).toBe(230802);
  });

  it('should load and render BGG details and poll visualizations when token is configured', () => {
    localStorage.setItem(BGG_API_TOKEN_STORAGE_KEY, 'test-token');

    const fakeDetails: BggThingDetails = {
      id: 26997,
      type: 'boardgame',
      primaryName: '1989: Dawn of Freedom',
      alternateNames: ['1989: Jesień Narodów'],
      thumbnail: 'https://example.com/thumb.jpg',
      image: 'https://example.com/image.jpg',
      categories: [{ id: 1019, name: 'Wargame' }],
      mechanics: [{ id: 2040, name: 'Hand Management' }],
      families: [],
      designers: [{ id: 3877, name: 'Jason Matthews' }],
      artists: [],
      publishers: ['GMT Games'],
      playerCountPoll: {
        totalVotes: 54,
        bestWith: 'Best with 2 players',
        results: [
          {
            numPlayers: '2',
            best: 52,
            recommended: 0,
            notRecommended: 0,
            totalVotes: 52,
            bestPercent: 100,
            recommendedPercent: 0,
            notRecommendedPercent: 0,
          },
        ],
      },
      playerAgePoll: {
        totalVotes: 21,
        suggestedAge: '14+',
        results: [
          {
            age: '14',
            numVotes: 10,
            percentage: 48,
          },
        ],
      },
    };

    const bggApiService = TestBed.inject(BggApiService);
    spyOn(bggApiService, 'getThingDetails').and.returnValue(of(fakeDetails));

    const fixture = TestBed.createComponent(SelectedGamePreviewComponent);
    const game: DataPoint = {
      objectname: '1989: Jesień Narodów',
      objectid: 26997,
      x: 3.3,
      y: 7.6,
    };

    fixture.componentRef.setInput('game', game);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.bgg-details-container')).not.toBeNull();
    expect(compiled.querySelector('.game-cover')?.getAttribute('src')).toBe('https://example.com/thumb.jpg');
    const categoryLink = compiled.querySelector('.category-link') as HTMLAnchorElement;
    expect(categoryLink).not.toBeNull();
    expect(categoryLink.getAttribute('href')).toBe('https://boardgamegeek.com/boardgamecategory/1019');
    expect(categoryLink.getAttribute('target')).toBe('_blank');
    expect(categoryLink.textContent).toContain('Wargame');

    const designerLink = compiled.querySelector('.designer-link') as HTMLAnchorElement;
    expect(designerLink).not.toBeNull();
    expect(designerLink.getAttribute('href')).toBe('https://boardgamegeek.com/boardgamedesigner/3877');
    expect(designerLink.getAttribute('target')).toBe('_blank');
    expect(designerLink.textContent).toContain('Jason Matthews');

    const mechanicLink = compiled.querySelector('.mechanic-link') as HTMLAnchorElement;
    expect(mechanicLink).not.toBeNull();
    expect(mechanicLink.getAttribute('href')).toBe('https://boardgamegeek.com/boardgamemechanic/2040');
    expect(mechanicLink.getAttribute('target')).toBe('_blank');
    expect(mechanicLink.textContent).toContain('Hand Management');

    // Polls assertions
    expect(compiled.querySelector('.polls-grid')).not.toBeNull();
    expect(compiled.querySelector('.best-badge')?.textContent).toContain('Best with 2 players');
    expect(compiled.querySelector('.bar-best')).not.toBeNull();
    expect(compiled.querySelector('.age-badge')?.textContent).toContain('14+');

    // Description & versions are removed
    expect(compiled.querySelector('.description-section')).toBeNull();
    expect(compiled.querySelector('.versions-section')).toBeNull();
  });
});
