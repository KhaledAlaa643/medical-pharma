import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCashPaymentComponent } from './create-cash-payment.component';

describe('CreateCashPaymentComponent', () => {
  let component: CreateCashPaymentComponent;
  let fixture: ComponentFixture<CreateCashPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCashPaymentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCashPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
