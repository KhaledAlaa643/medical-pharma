import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashReceiptsListComponent } from './cash-receipts-list.component';

describe('CashReceiptsListComponent', () => {
  let component: CashReceiptsListComponent;
  let fixture: ComponentFixture<CashReceiptsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashReceiptsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashReceiptsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
