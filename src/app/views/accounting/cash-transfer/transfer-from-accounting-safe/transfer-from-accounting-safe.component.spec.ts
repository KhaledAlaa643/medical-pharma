import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferFromAccountingSafeComponent } from './transfer-from-accounting-safe.component';

describe('TransferFromAccountingSafeComponent', () => {
  let component: TransferFromAccountingSafeComponent;
  let fixture: ComponentFixture<TransferFromAccountingSafeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferFromAccountingSafeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferFromAccountingSafeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
