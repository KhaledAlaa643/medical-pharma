import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditOperationComponent } from './edit-operation.component';
import { EditDateOperationComponent } from './edit-date-operation/edit-date-operation.component';
import { EditedDateOperationComponent } from './edited-date-operation/edited-date-operation.component';
import { EditOperationRoutingModule } from './edit-operation.routing.module';
import { PrimNgModule } from "app/core/shared/prim-ng/prim-ng.module";
import { SharedModuleModule } from '@modules/shared-module.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    EditOperationRoutingModule,
    PrimNgModule,
    FormsModule,
    SharedModuleModule,
    ReactiveFormsModule
  ],
  declarations: [
    EditOperationComponent,
    EditDateOperationComponent,
    EditedDateOperationComponent
  ]
})
export class EditOperationModule { }
