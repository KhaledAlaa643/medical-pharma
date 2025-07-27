import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCashPaymentComponent } from './list-cash-payment.component';

describe('ListCashPaymentComponent', () => {
  let component: ListCashPaymentComponent;
  let fixture: ComponentFixture<ListCashPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListCashPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCashPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
