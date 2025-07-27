import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashSafeComponent } from './cash-safe.component';

describe('CashSafeComponent', () => {
  let component: CashSafeComponent;
  let fixture: ComponentFixture<CashSafeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashSafeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashSafeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
