import { TestBed } from '@angular/core/testing';
import { ControlsComponent } from './controls.component';

describe('ControlsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsComponent],
    }).compileComponents();
  });

  it('should create controls component', () => {
    const fixture = TestBed.createComponent(ControlsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit loadExample when example button is clicked', () => {
    const fixture = TestBed.createComponent(ControlsComponent);
    let emitted = false;
    fixture.componentInstance.loadExample.subscribe(() => {
      emitted = true;
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const exampleBtn = compiled.querySelector('.myCSV') as HTMLElement;
    exampleBtn.click();

    expect(emitted).toBeTrue();
  });

  it('should render filter bar only when dataLoaded is true', () => {
    const fixture = TestBed.createComponent(ControlsComponent);
    fixture.componentRef.setInput('dataLoaded', false);
    fixture.detectChanges();

    let compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.filter-bar')).toBeNull();

    fixture.componentRef.setInput('dataLoaded', true);
    fixture.detectChanges();

    compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.filter-bar')).toBeTruthy();
  });

  it('should automatically select expansions when unchecking base games if expansions is false', () => {
    const fixture = TestBed.createComponent(ControlsComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('dataLoaded', true);
    component.showStandalone.set(true);
    component.showExpansions.set(false);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('.filter-item input') as NodeListOf<HTMLInputElement>;
    const standaloneInput = inputs[0];

    standaloneInput.checked = false;
    standaloneInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.showStandalone()).toBeFalse();
    expect(component.showExpansions()).toBeTrue();
  });

  it('should automatically select base games when unchecking expansions if base games is false', () => {
    const fixture = TestBed.createComponent(ControlsComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('dataLoaded', true);
    component.showStandalone.set(false);
    component.showExpansions.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('.filter-item input') as NodeListOf<HTMLInputElement>;
    const expansionsInput = inputs[1];

    expansionsInput.checked = false;
    expansionsInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.showStandalone()).toBeTrue();
    expect(component.showExpansions()).toBeFalse();
  });

  it('should keep other checkbox checked when unchecking one if both were checked', () => {
    const fixture = TestBed.createComponent(ControlsComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('dataLoaded', true);
    component.showStandalone.set(true);
    component.showExpansions.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const inputs = compiled.querySelectorAll('.filter-item input') as NodeListOf<HTMLInputElement>;
    const standaloneInput = inputs[0];

    standaloneInput.checked = false;
    standaloneInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.showStandalone()).toBeFalse();
    expect(component.showExpansions()).toBeTrue();
  });
});
