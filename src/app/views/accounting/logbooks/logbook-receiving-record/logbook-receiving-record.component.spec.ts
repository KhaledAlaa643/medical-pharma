import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogbookReceivingRecordComponent } from './logbook-receiving-record.component';

describe('LogbookReceivingRecordComponent', () => {
  let component: LogbookReceivingRecordComponent;
  let fixture: ComponentFixture<LogbookReceivingRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogbookReceivingRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogbookReceivingRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
