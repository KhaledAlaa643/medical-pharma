import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsolidatedCustomerAccountStatementComponent } from './consolidated-customer-account-statement.component';

describe('ConsolidatedCustomerAccountStatementComponent', () => {
  let component: ConsolidatedCustomerAccountStatementComponent;
  let fixture: ComponentFixture<ConsolidatedCustomerAccountStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsolidatedCustomerAccountStatementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsolidatedCustomerAccountStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
