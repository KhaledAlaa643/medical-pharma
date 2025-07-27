import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LayoutModule } from "../layout/layout.module";
import { WarehouseRoutingModule } from "./warehouse.routing.module";
import { WarehouseComponent } from "./warehouse.component";
import { BulkProductsPreparerModule } from "./bulk-products-preparer/bulk-products-preparer.module";
import { HousingWorkerComponent } from "./housing-worker/housing-worker.component";
import { ReceiptsWorkerComponent } from "./receipts-worker/receipts-worker.component";
import { SharedModuleModule } from "@modules/shared-module.module";
import { SingleProductPreparerComponent } from "./single-products-preparer/single-products-preparer.component";
import { ProductSalesReviewerComponent } from "./products-sales-reviewer/products-sales-reviewer.component";
import { ReceiptsWorkerModule } from "./receipts-worker/receipts-worker.module";
import { ProgressBarModule } from 'primeng/progressbar';


ProductSalesReviewerComponent



@NgModule({
    imports: [
        CommonModule,
        LayoutModule,
        WarehouseRoutingModule,
        BulkProductsPreparerModule,
        ReceiptsWorkerModule,
        SharedModuleModule,
        ProgressBarModule

    ],
    declarations: [
        WarehouseComponent,
        HousingWorkerComponent,
        ReceiptsWorkerComponent,
        SingleProductPreparerComponent,
        ProductSalesReviewerComponent,

    ]
})

export class WarehouseModule { }