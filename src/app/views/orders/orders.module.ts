import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders.component';
import { DrugInfoComponent } from './drug-info/drug-info.component';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { ItemSalesComponent } from './Item-sales/Item-sales.component';
import { NewItemsComponent } from './new-items/new-items.component';
import { OffersComponent } from './offers/offers.component';
import { RegisterRequestComponent } from './register-request/register-request.component';
import { ShortcomingsBonusesComponent } from './shortcomings-bonuses/shortcomings-bonuses.component';
import { WaitingClientsComponent } from './waiting-clients/waiting-clients.component';
import { ordersRoutingModule } from './orders.routing.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from '../layout/layout.module';
import { GoogleMapsModule } from '@angular/google-maps'
import { SharedModuleModule } from '@modules/shared-module.module';


import { FormsModule,ReactiveFormsModule }    from '@angular/forms';
import { AllOrdersComponent } from './all-orders/all-orders.component';
import { PaginatorModule } from 'primeng/paginator';
import { TrackDeliveryComponent } from './track-delivery/track-delivery.component';
import { CustomSharedModule } from 'app/core/shared/shared-module';
import {FocusNextDirective } from 'app/core/directives/auto-tab.directive';





@NgModule({
  imports: [
    CommonModule,
    ordersRoutingModule,
    PrimNgModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    GoogleMapsModule,
    CustomSharedModule,
    SharedModuleModule
    
  ],
  declarations: [
    OrdersComponent,
    DrugInfoComponent,
    InvoiceDetailsComponent,
    ItemSalesComponent,
    NewItemsComponent,
    OffersComponent,
    RegisterRequestComponent,
    ShortcomingsBonusesComponent,
    TrackDeliveryComponent,
    AllOrdersComponent,
    WaitingClientsComponent,
    FocusNextDirective
    
    
  ],
  exports: []
})
export class OrdersModule { }
