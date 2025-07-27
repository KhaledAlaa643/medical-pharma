import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModuleModule } from '@modules/shared-module.module';
import { LogsRoutingModule } from './logs.routing.module';
import { OrderLogsComponent } from './order-logs/order-logs.component';
import { ItemLogsComponent } from './item-logs/item-logs.component';

@NgModule({
  imports: [
    CommonModule,
    LogsRoutingModule,
    SharedModuleModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    OrderLogsComponent,
    ItemLogsComponent
  ]
})
export class LogsModule { }
