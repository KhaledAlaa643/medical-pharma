import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndexDeficitAndSurplusComponent } from './index-deficit-and-surplus.component';

describe('IndexDeficitAndSurplusComponent', () => {
  let component: IndexDeficitAndSurplusComponent;
  let fixture: ComponentFixture<IndexDeficitAndSurplusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IndexDeficitAndSurplusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndexDeficitAndSurplusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
