import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIncentivesOrPenaltiesComponent } from './create-incentives-or-penalties.component';

describe('CreateIncentivesOrPenaltiesComponent', () => {
  let component: CreateIncentivesOrPenaltiesComponent;
  let fixture: ComponentFixture<CreateIncentivesOrPenaltiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateIncentivesOrPenaltiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateIncentivesOrPenaltiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
