import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashSafeComponent } from './cash-safe.component';

const routes: Routes = [{ path: '', component: CashSafeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CashSafeRoutingModule { }
