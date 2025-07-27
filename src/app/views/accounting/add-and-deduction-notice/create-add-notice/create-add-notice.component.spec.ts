import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAddNoticeComponent } from './create-add-notice.component';

describe('CreateAddNoticeComponent', () => {
  let component: CreateAddNoticeComponent;
  let fixture: ComponentFixture<CreateAddNoticeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateAddNoticeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAddNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
