import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountingSafeComponent } from './accounting-safe/accounting-safe.component';

const routes: Routes = [{ path: '', component: AccountingSafeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountingSafeRoutingModule {}
