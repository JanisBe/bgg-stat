import { TestBed } from '@angular/core/testing';
import { ColumnConfigService } from './column-config.service';

describe('ColumnConfigService', () => {
  let service: ColumnConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColumnConfigService],
    });
    service = TestBed.inject(ColumnConfigService);
  });

  it('should be created and have initial options for table and tooltip', () => {
    expect(service).toBeTruthy();
    expect(service.tableColumnOptions().length).toBeGreaterThan(0);
    expect(service.tooltipOptions().length).toBeGreaterThan(0);
    expect(service.visibleTableColumns().has('average')).toBeTrue();
    expect(service.visibleTooltipColumns().has('average')).toBeTrue();
    // objectname is included in table columns, but excluded from tooltip options
    expect(service.tableColumnOptions().some((o) => o.key === 'objectname')).toBeTrue();
    expect(service.tooltipOptions().some((o) => o.key === 'objectname')).toBeFalse();
    expect(service.visibleTooltipColumns().has('objectname')).toBeFalse();
  });

  it('should toggle tooltip visibility without affecting table column visibility', () => {
    const initialTableVisible = service.visibleTableColumns().has('average');
    expect(initialTableVisible).toBeTrue();

    const changed = service.syncTooltipVisibility('average', false);
    expect(changed).toBeTrue();
    expect(service.visibleTooltipColumns().has('average')).toBeFalse();
    // Table columns must remain unaffected!
    expect(service.visibleTableColumns().has('average')).toBeTrue();
  });

  it('should toggle table column visibility without affecting tooltip visibility', () => {
    const initialTooltipVisible = service.visibleTooltipColumns().has('average');
    expect(initialTooltipVisible).toBeTrue();

    const changed = service.syncTableColumnVisibility('average', false);
    expect(changed).toBeTrue();
    expect(service.visibleTableColumns().has('average')).toBeFalse();
    // Tooltip options must remain unaffected!
    expect(service.visibleTooltipColumns().has('average')).toBeTrue();
  });

  it('should apply stored table visibility independently from tooltip visibility', () => {
    service.applyStoredTableVisibility({ average: false, rank: false });
    expect(service.visibleTableColumns().has('average')).toBeFalse();
    expect(service.visibleTableColumns().has('rank')).toBeFalse();
    expect(service.visibleTooltipColumns().has('average')).toBeTrue();
    expect(service.visibleTooltipColumns().has('rank')).toBeTrue();

    service.applyStoredTooltipVisibility({ average: true, rank: false });
    expect(service.visibleTooltipColumns().has('average')).toBeTrue();
    expect(service.visibleTooltipColumns().has('rank')).toBeFalse();
    // Table column remains false
    expect(service.visibleTableColumns().has('average')).toBeFalse();
  });

  it('should reset both table and tooltip options on resetToDefaults', () => {
    service.syncTableColumnVisibility('average', false);
    service.syncTooltipVisibility('average', false);

    expect(service.visibleTableColumns().has('average')).toBeFalse();
    expect(service.visibleTooltipColumns().has('average')).toBeFalse();

    service.resetToDefaults('pl');

    expect(service.visibleTableColumns().has('average')).toBeTrue();
    expect(service.visibleTooltipColumns().has('average')).toBeTrue();
  });
});
