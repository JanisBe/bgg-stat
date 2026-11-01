import { TestBed } from '@angular/core/testing';
import { GameCardListComponent } from './game-card-list.component';
import { DataPoint } from './models';

describe('GameCardListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCardListComponent],
    }).compileComponents();
  });

  it('should create game card list component', () => {
    const fixture = TestBed.createComponent(GameCardListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should filter games by search query', () => {
    const fixture = TestBed.createComponent(GameCardListComponent);
    const component = fixture.componentInstance;

    const sampleGames: DataPoint[] = [
      { objectname: 'Brass: Birmingham', originalname: 'Brass: Birmingham', x: 3.9, y: 8.6 },
      { objectname: 'Catan', originalname: 'Catan', x: 2.3, y: 7.1 },
      { objectname: 'Terraforming Mars', originalname: 'Terraforming Mars', x: 3.2, y: 8.4 },
    ];

    fixture.componentRef.setInput('games', sampleGames);
    fixture.detectChanges();

    expect(component.sortedGames().length).toBe(3);

    component.onSearchChange('catan');
    expect(component.sortedGames().length).toBe(1);
    expect(component.sortedGames()[0].objectname).toBe('Catan');

    component.clearSearch();
    expect(component.sortedGames().length).toBe(3);
  });

  it('should sort games by rating and complexity', () => {
    const fixture = TestBed.createComponent(GameCardListComponent);
    const component = fixture.componentInstance;

    const sampleGames: DataPoint[] = [
      { objectname: 'Game A', average: 7.0, avgweight: 1.5, x: 1.5, y: 7.0 },
      { objectname: 'Game B', average: 8.5, avgweight: 3.0, x: 3.0, y: 8.5 },
      { objectname: 'Game C', average: 7.8, avgweight: 4.2, x: 4.2, y: 7.8 },
    ];

    fixture.componentRef.setInput('games', sampleGames);
    fixture.detectChanges();

    // Default sort is rating descending: Game B (8.5), Game C (7.8), Game A (7.0)
    expect(component.sortedGames()[0].objectname).toBe('Game B');
    expect(component.sortedGames()[1].objectname).toBe('Game C');
    expect(component.sortedGames()[2].objectname).toBe('Game A');

    // Sort by weight descending: Game C (4.2), Game B (3.0), Game A (1.5)
    component.onSortChange('weight');
    expect(component.sortedGames()[0].objectname).toBe('Game C');
    expect(component.sortedGames()[1].objectname).toBe('Game B');
    expect(component.sortedGames()[2].objectname).toBe('Game A');
  });

  it('should emit gameSelected when a card is clicked', () => {
    const fixture = TestBed.createComponent(GameCardListComponent);
    const component = fixture.componentInstance;

    const sampleGame: DataPoint = { objectname: 'Root', objectid: 237182, x: 3.8, y: 8.1 };
    let selected: DataPoint | undefined;
    component.gameSelected.subscribe((game) => {
      selected = game;
    });

    component.selectGame(sampleGame);
    expect(selected).toEqual(sampleGame);
  });
});

