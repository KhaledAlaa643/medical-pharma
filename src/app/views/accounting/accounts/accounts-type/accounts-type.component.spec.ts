import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountsTypeComponent } from './accounts-type.component';

describe('AccountsTypeComponent', () => {
  let component: AccountsTypeComponent;
  let fixture: ComponentFixture<AccountsTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountsTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountsTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
