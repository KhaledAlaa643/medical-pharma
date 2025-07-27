import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsComponent } from './products.component';
import { AddProductComponent } from './add-product/add-product.component';
import { ProductsRoutingModule } from './products.routing.module';
import { SharedModule } from 'primeng/api';
import { SharedModuleModule } from '@modules/shared-module.module';
import { LayoutModule } from '../layout/layout.module';
import { ReportsModule } from './reports/reports.module';
import { ProductsListComponent } from './products-list/products-list.component';
@NgModule({
  imports: [
    CommonModule,
    ProductsRoutingModule,
    SharedModule,
    SharedModuleModule,
    LayoutModule,
    ReportsModule,
  ],
  declarations: [ProductsComponent, AddProductComponent, ProductsListComponent],
})
export class ProductsModule {}
