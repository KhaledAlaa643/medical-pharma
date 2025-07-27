import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTransferBalanceComponent } from './create-transfer-balance.component';

describe('CreateTransferBalanceComponent', () => {
  let component: CreateTransferBalanceComponent;
  let fixture: ComponentFixture<CreateTransferBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateTransferBalanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTransferBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
