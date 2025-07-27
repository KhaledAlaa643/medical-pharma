import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { LayoutModule } from "app/views/layout/layout.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PaginatorModule } from "primeng/paginator";
import { ReceiptsWorkerRoutingModule } from "./receipts-worker.routing.module";
import { CheckboxModule } from "primeng/checkbox";
import { TodaysReceiptsComponent } from "./todays-receipts/todays-receipts.component"
import { TodaysDeliveriesComponent } from "./todays-deliveries/todays-deliveries.component";
import { SharedModuleModule } from "@modules/shared-module.module";


@NgModule({
    imports: [
        CommonModule,
        PrimNgModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        PaginatorModule,
        ReceiptsWorkerRoutingModule,
        CheckboxModule,
        SharedModuleModule
    ],
    declarations: [
        TodaysReceiptsComponent,
        TodaysDeliveriesComponent,
        

    ],

})
export class ReceiptsWorkerModule { }