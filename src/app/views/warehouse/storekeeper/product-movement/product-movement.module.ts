import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { SharedModuleModule } from '@modules/shared-module.module';

import { ProductMovementComponent } from '../product-movement/product-movement.component';

import { ProductMovementRoutingModule } from './product-movement.module.routing';

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
    ProductMovementRoutingModule
  ],
  declarations: [
    ProductMovementComponent,

  ]
})
export class ProductMovementModule { }
