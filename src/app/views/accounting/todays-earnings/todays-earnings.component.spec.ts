import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodaysEarningsComponent } from './todays-earnings.component';

describe('TodaysEarningsComponent', () => {
  let component: TodaysEarningsComponent;
  let fixture: ComponentFixture<TodaysEarningsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TodaysEarningsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodaysEarningsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
