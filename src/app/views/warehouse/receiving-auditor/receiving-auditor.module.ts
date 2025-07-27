import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { LayoutModule } from "app/views/layout/layout.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PaginatorModule } from "primeng/paginator";
import { CheckboxModule } from "primeng/checkbox";
import { SharedModuleModule } from "@modules/shared-module.module";
import { ReceivingAuditorRoutingModule } from "./receiving-auditor.module.routing";
import { SupplyOrderListComponent } from "./supply-order-list/supply-order-list.component";
import { AuditCompletedComponent } from "./audit-completed/audit-completed.component";
import { ReturnsListComponent } from "./returns-list/returns-list.component";
import { ReceivingCompletedComponent } from "./receiving-completed/receiving-completed.component";
import { ProhibitedBatchComponent } from "./prohibited-batch/prohibited-batch.component";
import { OperatingExpiryReportComponent } from "./operating-expiry-report/operating-expiry-report.component";
import { ToastrModule } from "ngx-toastr";
import { SupplyOrderDetailsComponent } from "./supply-order-details/supply-order-details.component";
import { ReturnsListDetailsComponent } from "./returned-list-details/returns-list-details.component";
import { AuditCompletedDetailsComponent } from "./audit-completed-details/audit-completed-details.component";


@NgModule({
    imports: [
        CommonModule,
        PrimNgModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        PaginatorModule,
        CheckboxModule,
        SharedModuleModule,
        ReceivingAuditorRoutingModule,
        ToastrModule,

    ],
    declarations: [
        SupplyOrderListComponent,
        AuditCompletedComponent,
        ReturnsListComponent,
        ReceivingCompletedComponent,
        ProhibitedBatchComponent,
        OperatingExpiryReportComponent,
        SupplyOrderDetailsComponent,
        ReturnsListDetailsComponent,
        AuditCompletedDetailsComponent
    ]
})
export class ReceivingAuditorModule { }