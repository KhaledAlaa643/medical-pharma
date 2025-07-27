import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAndDeductionNoticeListComponent } from './add-and-deduction-notice-list.component';

describe('AddAndDeductionNoticeListComponent', () => {
  let component: AddAndDeductionNoticeListComponent;
  let fixture: ComponentFixture<AddAndDeductionNoticeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddAndDeductionNoticeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAndDeductionNoticeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
