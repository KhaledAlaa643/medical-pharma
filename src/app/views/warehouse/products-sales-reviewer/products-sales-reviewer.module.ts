import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { LayoutModule } from "app/views/layout/layout.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PaginatorModule } from "primeng/paginator";
import { CheckboxModule } from "primeng/checkbox";
import { SharedModuleModule } from "@modules/shared-module.module";
import { ProductsSalesReviewerRoutingModule } from "./products-sales-reviewer.module.routing";
import { ProductsReviewerComponent } from "./products-reviewer/products-reviewer.component";
import { ReviewedDetailsComponent } from "./reviewed-details/reviewed-details.component";
import { ReviewedListComponent } from "./reviewed-list/reviewed-list.component";
import { PreparingListComponent } from "./preparing-list/preparing-list.component";





@NgModule({
    imports: [
        CommonModule,
        PrimNgModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        PaginatorModule,
        ProductsSalesReviewerRoutingModule,
        CheckboxModule,
        SharedModuleModule
    ],
    declarations: [
        ProductsReviewerComponent,
        ReviewedListComponent,
        PreparingListComponent,
        ReviewedDetailsComponent

    ]
})
export class ProductsSalesReviewerModule { }