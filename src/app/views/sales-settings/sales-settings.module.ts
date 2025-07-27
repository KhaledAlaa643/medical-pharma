import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesSettingsComponent } from './sales-settings.component';
import { SharedModuleModule } from "@modules/shared-module.module";
import { LayoutModule } from "../layout/layout.module";
import { ProgressBarModule } from 'primeng/progressbar';
import { SettingsComponent } from './settings/settings.component';
import { SalesSettingsRoutingModule } from './sales-settings.routing.module';



@NgModule({
  imports: [
    CommonModule,
    SharedModuleModule,
    LayoutModule,
    ProgressBarModule,
    SalesSettingsRoutingModule
  ],
  declarations: [SalesSettingsComponent,SettingsComponent]
})
export class SalesSettingsModule { }
