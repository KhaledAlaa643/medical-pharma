import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupervisorClientListComponent } from './add-supervisor-client-list.component';

describe('AddSupervisorClientListComponent', () => {
  let component: AddSupervisorClientListComponent;
  let fixture: ComponentFixture<AddSupervisorClientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSupervisorClientListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSupervisorClientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
