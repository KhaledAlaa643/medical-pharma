import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafeListComponent } from './safe-list.component';

describe('SafeListComponent', () => {
  let component: SafeListComponent;
  let fixture: ComponentFixture<SafeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SafeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SafeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
