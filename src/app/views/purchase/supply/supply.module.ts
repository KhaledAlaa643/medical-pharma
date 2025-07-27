import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplyComponent } from './supply.component';
import { ProductLinkingComponent } from './product-linking/product-linking.component';
import { LinkedFilesComponent } from './linked-files/linked-files.component';
import { SupplyRequestComponent } from './supply-request/supply-request.component';
import { AddSupplierComponent } from './add-supplier/add-supplier.component';
import { SuppliersListComponent } from './suppliers-list/suppliers-list.component';
import { SupplyRoutingModule } from './supply.routing.module';
import { UnregisteredProductsComponent } from './unregistered-products/unregistered-products.component';
import { SupplyRequestDetailsComponent } from './supply-request-details/supply-request-details.component';
import { SupplyRequestEditComponent } from './supply-request-edit/supply-request-edit.component';
import { SupplierAccountStatementComponent } from './supplier-account-statement/supplier-account-statement.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModuleModule } from '@modules/shared-module.module';
import { SuppliersGroupedAccountStatementComponent } from './suppliers-grouped-account-statement/suppliers-grouped-account-statement.component';

@NgModule({
  imports: [
    CommonModule,
    SupplyRoutingModule,
    SharedModuleModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    SupplyComponent,
    ProductLinkingComponent,
    LinkedFilesComponent,
    UnregisteredProductsComponent,
    SupplyRequestComponent,
    SupplyRequestDetailsComponent,
    SupplyRequestEditComponent,
    AddSupplierComponent,
    SuppliersListComponent,
    SupplierAccountStatementComponent,
    SuppliersGroupedAccountStatementComponent
  ]
})
export class SupplyModule { }
