import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogbooksArchieveComponent } from './logbooks-archive.component';

describe('LogbooksArchieveComponent', () => {
  let component: LogbooksArchieveComponent;
  let fixture: ComponentFixture<LogbooksArchieveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogbooksArchieveComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogbooksArchieveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
