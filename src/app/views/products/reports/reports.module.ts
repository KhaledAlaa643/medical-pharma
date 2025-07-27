import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { ProductSalesProductivityComponent } from './product-sales-productivity/product-sales-productivity.component';
import { ProductSalesComponent } from './product-sales/product-sales.component';
import { Manufacturer_salesComponent } from './manufacturer_sales/manufacturer_sales.component';
import { ActiveIngredientSalesComponent } from './active-ingredient-sales/active-ingredient-sales.component';
import { GovernorateProductivityComponent } from './governorate-productivity/governorate-productivity.component';
import { SharedModule } from 'primeng/api';
import { SharedModuleModule } from '@modules/shared-module.module';
import { FormsModule ,ReactiveFormsModule } from '@angular/forms';
import { CitiesProductivityComponent } from './cities-productivity/cities-productivity.component';
import { CitySalesComponent } from './city-sales/city-sales.component';
import { TrackProductivityComponent } from './track-productivity/track-productivity.component';
import { TrackSalesComponent } from './track-sales/track-sales.component';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    SharedModuleModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [ReportsComponent,ProductSalesProductivityComponent,ProductSalesComponent,Manufacturer_salesComponent,ActiveIngredientSalesComponent,GovernorateProductivityComponent,CitiesProductivityComponent,CitySalesComponent,TrackProductivityComponent,TrackSalesComponent]
})
export class ReportsModule { }
