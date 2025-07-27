import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliverLogbooksComponent } from './deliver-logbooks.component';

describe('DeliverLogbooksComponent', () => {
  let component: DeliverLogbooksComponent;
  let fixture: ComponentFixture<DeliverLogbooksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliverLogbooksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliverLogbooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
