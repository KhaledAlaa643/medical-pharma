import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComplainsComponent } from './complains.component';
import { ComplainRequestComponent } from './complain-request/complain-request.component';
import { ComplainPageComponent } from './complain-page/complain-page.component';
import { ComplainsRoutingModule } from './complains.routing.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from '../layout/layout.module';
import { SharedModuleModule } from '@modules/shared-module.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { RouterModule } from '@angular/router';
import { AllComplainsComponent } from './all-complains/all-complains.component';
import { CustomSharedModule } from 'app/core/shared/shared-module';


@NgModule({
  imports: [
    CommonModule,
    ComplainsRoutingModule,
    PrimNgModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    RouterModule,
    CustomSharedModule,
    SharedModuleModule
  ],
  declarations: [
    ComplainsComponent,
    ComplainRequestComponent,
    AllComplainsComponent,
    ComplainPageComponent,


  
  ],

})
export class ComplainsModule { }
