import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneralSettingsComponent } from './general-settings.component';
import { SharedModuleModule } from "@modules/shared-module.module";
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { GeneralSettingsRoutingModule } from './general-settings.routing.module';
import { LayoutModule } from '../layout/layout.module';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModuleModule,
    PrimNgModule,
    LayoutModule,
    GeneralSettingsRoutingModule
  ],
  declarations: [
    SettingsComponent,
    GeneralSettingsComponent,
  ]
})
export class GeneralSettingsModule { }
