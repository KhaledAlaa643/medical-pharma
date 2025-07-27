import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferBalanceIndexComponent } from './transfer-balance-index.component';

describe('TransferBalanceIndexComponent', () => {
  let component: TransferBalanceIndexComponent;
  let fixture: ComponentFixture<TransferBalanceIndexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferBalanceIndexComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferBalanceIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
