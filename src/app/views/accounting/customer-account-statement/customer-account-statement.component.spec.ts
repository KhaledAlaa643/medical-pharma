import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAccountStatementComponent } from './customer-account-statement.component';

describe('CustomerAccountStatementComponent', () => {
  let component: CustomerAccountStatementComponent;
  let fixture: ComponentFixture<CustomerAccountStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerAccountStatementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerAccountStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
