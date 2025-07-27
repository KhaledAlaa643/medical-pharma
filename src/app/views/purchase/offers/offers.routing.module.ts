import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateOfferComponent } from './create-offer/create-offer.component';
import { OffersListComponent } from './offers-list/offers-list.component';
import { CreateShortageComponent } from './create-shortage/create-shortage.component';
import { CreateBonusComponent } from './create-bonus/create-bonus.component';
import { CreateOffersOnProductsComponent } from './create-offers-on-products/create-offers-on-products.component';

const routes: Routes = [
  {
    path: 'create-offer-on-products',
    component: CreateOffersOnProductsComponent,
  },
  { path: 'create-shortage', component: CreateShortageComponent },
  { path: 'list', component: OffersListComponent },
  { path: 'create-bonus', component: CreateBonusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OffersRoutingModule {}
