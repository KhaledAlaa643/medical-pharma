import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOffersOnProductsComponent } from './create-offers-on-products.component';

describe('CreateOffersOnProductsComponent', () => {
  let component: CreateOffersOnProductsComponent;
  let fixture: ComponentFixture<CreateOffersOnProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOffersOnProductsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOffersOnProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
