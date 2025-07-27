import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogbookDeliveryRecordComponent } from './logbook-delivery-record.component';

describe('LogbookDeliveryRecordComponent', () => {
  let component: LogbookDeliveryRecordComponent;
  let fixture: ComponentFixture<LogbookDeliveryRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogbookDeliveryRecordComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogbookDeliveryRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
