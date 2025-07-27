import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IncentivesAndPenaltiesRoutingModule } from './incentives-and-penalties-routing.module';
import { CreateIncentivesOrPenaltiesComponent } from './create-incentives-or-penalties/create-incentives-or-penalties.component';
import { IncentivesOrPenaltiesListComponent } from './incentives-or-penalties-list/incentives-or-penalties-list.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [
    CreateIncentivesOrPenaltiesComponent,
    IncentivesOrPenaltiesListComponent,
  ],
  imports: [
    CommonModule,
    IncentivesAndPenaltiesRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class IncentivesAndPenaltiesModule {}
