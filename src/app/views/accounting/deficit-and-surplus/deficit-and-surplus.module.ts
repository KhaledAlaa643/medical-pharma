import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeficitAndSurplusRoutingModule } from './deficit-and-surplus-routing.module';
import { IndexDeficitAndSurplusComponent } from './index-deficit-and-surplus/index-deficit-and-surplus.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [IndexDeficitAndSurplusComponent],
  imports: [
    CommonModule,
    DeficitAndSurplusRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class DeficitAndSurplusModule {}
