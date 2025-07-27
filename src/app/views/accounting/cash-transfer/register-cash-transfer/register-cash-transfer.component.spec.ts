import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCashTransferComponent } from './register-cash-transfer.component';

describe('RegisterCashTransferComponent', () => {
  let component: RegisterCashTransferComponent;
  let fixture: ComponentFixture<RegisterCashTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterCashTransferComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterCashTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
