import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseSettlementComponent } from './warehouse-settlement.component';
import { WarehouseSettlementRoutingModule } from './warehouse-settlement.routing.module';
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { SharedModuleModule } from '@modules/shared-module.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { UnsettledComponent } from './unsettled/unsettled.component';

@NgModule({
  imports: [
    CommonModule,
    WarehouseSettlementRoutingModule,
    PrimNgModule,
    FormsModule,
    SharedModuleModule,
    ReactiveFormsModule,
  ],
  declarations: [
    WarehouseSettlementComponent,
    UnsettledComponent
  ]
})
export class WarehouseSettlementModule { }
