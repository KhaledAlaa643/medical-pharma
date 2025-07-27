import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorClientsListComponent } from './supervisor-clients-list.component';

describe('SupervisorClientsListComponent', () => {
  let component: SupervisorClientsListComponent;
  let fixture: ComponentFixture<SupervisorClientsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupervisorClientsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupervisorClientsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
