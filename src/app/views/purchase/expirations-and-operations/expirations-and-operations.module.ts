import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpirationsAndOperationsComponent } from './expirations-and-operations.component';
import { ProhibitedExpirationsComponent } from './prohibited-expirations/prohibited-expirations.component';
import { EditOperationsComponent } from './edit-operations/edit-operations.component';
import { EditedOperationsComponent } from './edited-operations/edited-operations.component';
import { ExpirationsAndOperationsReportsComponent } from './expirations-and-operations-reports/expirations-and-operations-reports.component';
import { ExpirationsAndOperationsRoutingModule } from './expirations-andoperations.routing.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModuleModule } from '@modules/shared-module.module';

@NgModule({
  imports: [
    CommonModule,
    ExpirationsAndOperationsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModuleModule
  ],
  declarations: [
    ExpirationsAndOperationsComponent
  ,ProhibitedExpirationsComponent,
  EditOperationsComponent,
  EditedOperationsComponent,
  ExpirationsAndOperationsReportsComponent
]
})
export class ExpirationsAndOperationsModule { }
