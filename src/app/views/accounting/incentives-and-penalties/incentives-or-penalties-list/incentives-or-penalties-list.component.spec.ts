import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncentivesOrPenaltiesListComponent } from './incentives-or-penalties-list.component';

describe('IncentivesOrPenaltiesListComponent', () => {
  let component: IncentivesOrPenaltiesListComponent;
  let fixture: ComponentFixture<IncentivesOrPenaltiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncentivesOrPenaltiesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncentivesOrPenaltiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
