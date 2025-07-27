import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SafeRoutingModule } from './safe-routing.module';
import { CreateSafeComponent } from './create-safe/create-safe.component';
import { SafeListComponent } from './safe-list/safe-list.component';
import { SharedModuleModule } from '@modules/shared-module.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from 'app/views/layout/layout.module';
import { SharedModule } from 'primeng/api';
import { ProgressBarModule } from 'primeng/progressbar';

@NgModule({
  declarations: [CreateSafeComponent, SafeListComponent],
  imports: [
    CommonModule,
    SafeRoutingModule,
    PrimNgModule,
    SharedModule,
    ProgressBarModule,
    LayoutModule,
    SharedModuleModule,
  ],
})
export class SafeModule {}
