import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehousesTransfersComponent } from './warehouses-transfers.component';
import { WarehousesTransfersRoutingModule } from './warehouses-transfers.routing.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModuleModule } from '@modules/shared-module.module';
import { RegisterNewComponent } from './register-new/register-new.component';
import { TransfersOrdersComponent } from './transfers-orders/transfers-orders.component';
import { TransfersProductsComponent } from './transfers-products/transfers-products.component';

@NgModule({
  imports: [
    CommonModule,
    WarehousesTransfersRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModuleModule
  ],
  declarations: [
    WarehousesTransfersComponent,
    RegisterNewComponent,
    TransfersOrdersComponent,
    TransfersProductsComponent,    
  ]
})
export class WarehousesTransfersModule { }
