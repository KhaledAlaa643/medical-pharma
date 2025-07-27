import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesAdminComponent } from './sales-admin.component';
import { SalesTeamComponent } from '@modules/salesTeam.component';
import { ClientsComponent } from '@modules/clients.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full',
  },

  {
    path: '',
    component: SalesAdminComponent,
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      {
        path: 'orders',
        loadChildren: () =>
          import('@modules/orders.module').then((m) => m.OrdersModule),
      },
    ],
  },
  {
    path: '',
    component: SalesAdminComponent,
    children: [
      { path: '', redirectTo: 'purchases/orders', pathMatch: 'full' },
      {
        path: 'purchases/orders',
        loadChildren: () =>
          import('@modules/orders.module').then((m) => m.OrdersModule),
      },
    ],
  },
  {
    path: '',
    component: SalesAdminComponent,
    children: [
      { path: '', redirectTo: 'accounting/orders', pathMatch: 'full' },
      {
        path: 'accounting/orders',
        loadChildren: () =>
          import('@modules/orders.module').then((m) => m.OrdersModule),
      },
    ],
  },
  {
    path: '',
    component: SalesAdminComponent,
    children: [
      { path: '', redirectTo: 'clients', pathMatch: 'full' },
      {
        path: 'clients',
        loadChildren: () =>
          import('@modules/clients.module').then((m) => m.ClientsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesAdminRoutingModule {}
