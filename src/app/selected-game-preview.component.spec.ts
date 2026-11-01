import { TestBed } from '@angular/core/testing';
import { SelectedGamePreviewComponent } from './selected-game-preview.component';
import { DataPoint } from './models';

describe('SelectedGamePreviewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedGamePreviewComponent],
    }).compileComponents();
  });

  it('should create selected game preview component', () => {
    const fixture = TestBed.createComponent(SelectedGamePreviewComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display game title and details when game is provided', () => {
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
});

