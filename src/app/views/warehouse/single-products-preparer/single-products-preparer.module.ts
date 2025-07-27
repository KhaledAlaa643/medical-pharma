import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { LayoutModule } from "app/views/layout/layout.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PaginatorModule } from "primeng/paginator";
import { CheckboxModule } from "primeng/checkbox";
import { SharedModuleModule } from "@modules/shared-module.module";
import { SingleProductPreparerRoutingModule } from "./single-product-preparer.routing.module";
import { PreparingSingleProducts } from "./preparing-single-products/preparing-single-products.component";
import { PreparedSingleProducts } from "./prepared-single-products/prepared-single-products.component";





@NgModule({
    imports: [
        CommonModule,
        PrimNgModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        PaginatorModule,
        SingleProductPreparerRoutingModule,
        CheckboxModule,
        SharedModuleModule
    ],
    declarations: [
        PreparingSingleProducts,
        PreparedSingleProducts
    ]
})
export class SingleProductsPreparerModule { }