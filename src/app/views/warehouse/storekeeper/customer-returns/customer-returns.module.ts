import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerReturnsComponent } from './customer-returns.component';
import { customerReturnsRoutingModule } from './customer-returns.routing.module';
import { ReturnsListComponent } from './returns-list/returns-list.component';
import { ReturnPermissionDetailsComponent } from './return-permission-details/return-permission-details.component';
import { RegisterReturnPermissionComponent } from './register-return-permission/register-return-permission.component';
import { ReturnProductsListComponent } from './return-products-list/return-products-list.component';
import { RegisterReturnWithoutPermissionComponent } from './register-return-without-permission/register-return-without-permission.component';
import { RegisterReturnPermissionDetailsComponent } from './register-return-permission-details/register-return-permission-details.component';
import { AcceptReturnComponent } from './accept-return/accept-return.component';
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { SharedModuleModule } from '@modules/shared-module.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";



@NgModule({
  imports: [
    CommonModule,
    customerReturnsRoutingModule,
    PrimNgModule,
    SharedModuleModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [	
    CustomerReturnsComponent,
    ReturnsListComponent,
    ReturnPermissionDetailsComponent,
    RegisterReturnPermissionComponent,
    RegisterReturnPermissionDetailsComponent,
    ReturnProductsListComponent,
    RegisterReturnWithoutPermissionComponent,
    AcceptReturnComponent
   ]
})
export class CustomerReturnsModule { }
