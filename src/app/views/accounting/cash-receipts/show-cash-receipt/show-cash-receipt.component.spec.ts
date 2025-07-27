import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowCashReceiptComponent } from './show-cash-receipt.component';

describe('ShowCashReceiptComponent', () => {
  let component: ShowCashReceiptComponent;
  let fixture: ComponentFixture<ShowCashReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowCashReceiptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowCashReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
