import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddAndDeductionNoticeListComponent } from './add-and-deduction-notice-list/add-and-deduction-notice-list.component';
import { CreateAddNoticeComponent } from './create-add-notice/create-add-notice.component';
import { CreateDeductionNoticeComponent } from './create-deduction-notice/create-deduction-notice.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: AddAndDeductionNoticeListComponent,
  },
  { path: 'create-add-notice', component: CreateAddNoticeComponent },
  {
    path: 'create-deduction-notice',
    component: CreateDeductionNoticeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddAndDeductionNoticeRoutingModule {}
