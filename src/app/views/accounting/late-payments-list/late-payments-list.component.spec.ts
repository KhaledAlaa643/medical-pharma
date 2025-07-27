import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatePaymentsListComponent } from './late-payments-list.component';

describe('LatePaymentsListComponent', () => {
  let component: LatePaymentsListComponent;
  let fixture: ComponentFixture<LatePaymentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LatePaymentsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatePaymentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
