import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashReceiptsComponent } from './cash-receipts.component';

describe('CashReceiptsComponent', () => {
  let component: CashReceiptsComponent;
  let fixture: ComponentFixture<CashReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashReceiptsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
