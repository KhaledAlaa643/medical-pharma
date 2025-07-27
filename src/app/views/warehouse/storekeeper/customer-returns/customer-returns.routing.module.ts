import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReturnsListComponent } from './returns-list/returns-list.component';
import { ReturnPermissionDetailsComponent } from './return-permission-details/return-permission-details.component';
import { RegisterReturnPermissionComponent } from './register-return-permission/register-return-permission.component';
import { RegisterReturnPermissionDetailsComponent } from './register-return-permission-details/register-return-permission-details.component';
import { ReturnProductsListComponent } from './return-products-list/return-products-list.component';
import { RegisterReturnWithoutPermissionComponent } from './register-return-without-permission/register-return-without-permission.component';
import { AcceptReturnComponent } from './accept-return/accept-return.component';

const routes: Routes = [
  { path: '', redirectTo: 'single-products-reviewer', pathMatch: 'full' },
  { path: 'returns-list', component: ReturnsListComponent },
  { path: 'return-products-list', component: ReturnProductsListComponent },
  {
    path: 'return-permission-details/:id',
    component: ReturnPermissionDetailsComponent,
  },
  {
    path: 'register-return-without-permission',
    component: RegisterReturnWithoutPermissionComponent,
  },
  {
    path: 'register-return-permission',
    component: RegisterReturnPermissionComponent,
  },
  {
    path: 'register-return-permission/:id/:pharmacy_id',
    component: RegisterReturnPermissionDetailsComponent,
  },
  { path: 'accept-returns', component: AcceptReturnComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule],
})
export class customerReturnsRoutingModule {}
