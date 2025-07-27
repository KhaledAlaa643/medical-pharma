import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkProductsPreparerComponent } from './bulk-products-preparer.component';
import { PrepardingComponent } from './preparding/preparding.component';
import { PreparedComponent } from './prepared/prepared.component';
import { BulkProductsPreparerRoutingModule } from './bulk-products-preparer.module.routing';
import { SharedModuleModule } from '@modules/shared-module.module';
import { SharedModule } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";



@NgModule({
  imports: [
    CommonModule,
    BulkProductsPreparerRoutingModule,
    SharedModuleModule,
    SharedModule,
    DropdownModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    BulkProductsPreparerComponent,
    PrepardingComponent,
    PreparedComponent
  ]
})
export class BulkProductsPreparerModule { }
