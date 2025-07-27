import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { LayoutModule } from "app/views/layout/layout.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { PaginatorModule } from "primeng/paginator";
import { HousingWorkerRoutingModule } from "./housing-worker.routing.module";
import { CheckboxModule } from "primeng/checkbox";
import { TodaysHousedComponent } from "./todays-housed/todays-housed.component";
import { TodaysHousingComponent } from "./todays-housing/todays-housing.component";
import { SharedModuleModule } from "@modules/shared-module.module";
import { DatePipe } from '@angular/common';





@NgModule({
    imports: [
        CommonModule,
        PrimNgModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        PaginatorModule,
        HousingWorkerRoutingModule,
        CheckboxModule,
        SharedModuleModule
    ],
    declarations: [
        TodaysHousedComponent,
        TodaysHousingComponent,

    ],
    providers: [DatePipe],
})
export class HousingWorkerModule { }