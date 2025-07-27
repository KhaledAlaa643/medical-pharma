import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManufacturersComponent } from './manufacturers.component';
import { manufacturersRoutingModule } from './manufacturers.routing.module';
import { SharedModule } from 'primeng/api';
import { SharedModuleModule } from '@modules/shared-module.module';
import { LayoutModule } from '../layout/layout.module';
import { AddManufacturerComponent } from './add-manufacturer/add-manufacturer.component';
import { ManufacturersListComponent } from './manufacturers-list/manufacturers-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    manufacturersRoutingModule,
    SharedModule,
    SharedModuleModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    ManufacturersListComponent,
    AddManufacturerComponent,
    ManufacturersComponent,
  ],
})
export class ManufacturersModule {}
