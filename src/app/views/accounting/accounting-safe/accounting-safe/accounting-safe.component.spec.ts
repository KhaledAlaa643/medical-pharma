import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingSafeComponent } from './accounting-safe.component';

describe('AccountingSafeComponent', () => {
  let component: AccountingSafeComponent;
  let fixture: ComponentFixture<AccountingSafeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountingSafeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountingSafeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
