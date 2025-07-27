import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutModule } from '../layout/layout.module';
import { FrontPageRoutingModule } from './front-page.routing.module';
import { FrontPageComponent } from './front-page.component';

@NgModule({
  imports: [
    CommonModule,
    FrontPageRoutingModule,
    LayoutModule
  ],
  declarations: [FrontPageComponent]
})
export class FrontPageModule { }
