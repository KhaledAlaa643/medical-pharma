import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeductionNoticeComponent } from './create-deduction-notice.component';

describe('CreateDeductionNoticeComponent', () => {
  let component: CreateDeductionNoticeComponent;
  let fixture: ComponentFixture<CreateDeductionNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDeductionNoticeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDeductionNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
