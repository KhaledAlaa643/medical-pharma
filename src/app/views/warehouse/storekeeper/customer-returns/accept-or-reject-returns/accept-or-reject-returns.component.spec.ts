import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptOrRejectReturnsComponent } from './accept-or-reject-returns.component';

describe('AcceptOrRejectReturnsComponent', () => {
  let component: AcceptOrRejectReturnsComponent;
  let fixture: ComponentFixture<AcceptOrRejectReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptOrRejectReturnsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcceptOrRejectReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
