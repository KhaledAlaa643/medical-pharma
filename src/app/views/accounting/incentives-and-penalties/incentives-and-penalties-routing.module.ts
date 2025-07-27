import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncentivesOrPenaltiesListComponent } from './incentives-or-penalties-list/incentives-or-penalties-list.component';
import { CreateIncentivesOrPenaltiesComponent } from './create-incentives-or-penalties/create-incentives-or-penalties.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  {
    path: 'list',
    component: IncentivesOrPenaltiesListComponent,
  },
  { path: 'create', component: CreateIncentivesOrPenaltiesComponent },
  { path: 'edit/:id', component: CreateIncentivesOrPenaltiesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncentivesAndPenaltiesRoutingModule {}
