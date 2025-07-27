import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexDeficitAndSurplusComponent } from './index-deficit-and-surplus/index-deficit-and-surplus.component';

const routes: Routes = [
  { path: '', component: IndexDeficitAndSurplusComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeficitAndSurplusRoutingModule {}
