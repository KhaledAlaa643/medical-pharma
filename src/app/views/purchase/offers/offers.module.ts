import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffersComponent } from './offers.component';
import { OffersRoutingModule } from './offers.routing.module';
import { CreateOfferComponent } from './create-offer/create-offer.component';
import { OffersListComponent } from './offers-list/offers-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModuleModule } from '@modules/shared-module.module';
import { CreateShortageComponent } from './create-shortage/create-shortage.component';
import { CreateBonusComponent } from './create-bonus/create-bonus.component';
import { CreateOffersOnProductsComponent } from './create-offers-on-products/create-offers-on-products.component';
@NgModule({
  imports: [
    CommonModule,
    OffersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModuleModule,
  ],
  declarations: [
    OffersComponent,
    CreateOfferComponent,
    OffersListComponent,
    CreateShortageComponent,
    CreateBonusComponent,
    CreateOffersOnProductsComponent,
  ],
})
export class OffersModule {}
