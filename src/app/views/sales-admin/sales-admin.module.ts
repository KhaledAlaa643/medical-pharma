import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesAdminComponent } from './sales-admin.component';
import { SalesAdminRoutingModule } from './sales-admin.routing.module';
import { LayoutModule } from '../layout/layout.module';
import { SharedModuleModule } from '@modules/shared-module.module';
import { ProgressBarModule } from 'primeng/progressbar';



@NgModule({
  imports: [
    CommonModule,
    SalesAdminRoutingModule,
    LayoutModule,
    SharedModuleModule,
    ProgressBarModule
  ],
  declarations: [SalesAdminComponent]
})
export class SalesAdminModule { }
