import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModuleModule } from '@modules/shared-module.module';
import { ReturnsRoutingModule } from './returns.routing.module';
import { CreatePurchaseReturnsComponent } from './create-purchase-returns/create-purchase-returns.component';
import { Purchase_returnComponent } from './purchase_return/purchase_return.component';
import { ReturnOrdersListComponent } from './return-orders-list/return-orders-list.component';
import { ReturnProductsListComponent } from './return-products-list/return-products-list.component';
import { ReturnDetailsComponent } from './return-details/return-details.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModuleModule,
    FormsModule,
    ReactiveFormsModule,
    ReturnsRoutingModule
  ],
  declarations: [
    CreatePurchaseReturnsComponent,
    Purchase_returnComponent,
    ReturnOrdersListComponent,
    ReturnProductsListComponent,
    ReturnDetailsComponent
  ]
})
export class ReturnsModule { }
