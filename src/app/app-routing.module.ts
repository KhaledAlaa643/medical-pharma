import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';
import { ComplainsComponent } from '@modules/complains.component';
import { SalesTeamComponent } from '@modules/salesTeam.component';
import { SharedModuleComponent } from '@modules/shared-module.component';
import { WarehouseComponent } from '@modules/warehouse.component';
import { FrontPageComponent } from '@modules/front-page.component';
import { GeneralSettingsComponent } from '@modules/general-settings.component';
import { PurchaseComponent } from './views/purchase/purchase.component';
import { ProductsComponent } from '@modules/products.component';
import { SalesSettingsComponent } from '@modules/sales-settings.component';
import { DeliveryComponent } from '@modules/delivery.component';
import { AccountingComponent } from './views/accounting/accounting.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'sales-admin',
    loadChildren: () =>
      import('@modules/sales-admin.module').then((m) => m.SalesAdminModule),
    canActivate: [LoginGuard],
  },

  {
    path: 'warehouse',
    component: WarehouseComponent,
    loadChildren: () =>
      import('@modules/warehouse.module').then((m) => m.WarehouseModule),
    canActivate: [LoginGuard],
  },
  {
    path: 'products',
    component: ProductsComponent,
    loadChildren: () =>
      import('@modules/products.module').then((m) => m.ProductsModule),
    canActivate: [LoginGuard],
  },

  {
    path: 'purchases',
    component: PurchaseComponent,
    loadChildren: () =>
      import('@modules/purchase.module').then((m) => m.PurchaseModule),
    canActivate: [LoginGuard],
  },
  {
    path: 'delivery',
    component: DeliveryComponent,
    loadChildren: () =>
      import('@modules/delivery.module').then((m) => m.DeliveryModule),
    canActivate: [LoginGuard],
  },

  {
    path: 'general-settings',
    component: GeneralSettingsComponent,
    loadChildren: () =>
      import('@modules/general-settings.module').then(
        (m) => m.GeneralSettingsModule
      ),
    canActivate: [LoginGuard],
  },
  {
    path: 'settings',
    component: SalesSettingsComponent,
    loadChildren: () =>
      import('@modules/sales-settings.module').then(
        (m) => m.SalesSettingsModule
      ),
    canActivate: [LoginGuard],
  },
  {
    path: 'ToPrint',
    component: SharedModuleComponent,
    loadChildren: () =>
      import('@modules/shared-module.module').then((m) => m.SharedModuleModule),
    canActivate: [LoginGuard],
  },

  {
    path: '',
    component: ComplainsComponent,
    children: [
      { path: '', redirectTo: 'complains', pathMatch: 'full' },
      {
        path: 'complains',
        loadChildren: () =>
          import('@modules/complains.module').then((m) => m.ComplainsModule),
        canActivate: [LoginGuard],
      },
    ],
  },
  {
    path: '',
    component: SalesTeamComponent,
    children: [
      { path: '', redirectTo: 'salesTeam', pathMatch: 'full' },
      {
        path: 'salesTeam',
        loadChildren: () =>
          import('@modules/salesTeam.module').then((m) => m.SalesTeamModule),
        canActivate: [LoginGuard],
      },
    ],
  },
  {
    path: '',
    component: SharedModuleComponent,
    children: [
      {
        path: 'shared-module',
        loadChildren: () =>
          import('@modules/shared-module.module').then(
            (m) => m.SharedModuleModule
          ),
        canActivate: [LoginGuard],
      },
    ],
  },
  {
    path: '',
    component: FrontPageComponent,
    children: [
      {
        path: 'front-page',
        loadChildren: () =>
          import('@modules/front-page.module').then((m) => m.FrontPageModule),
        canActivate: [LoginGuard],
      },
    ],
  },

  {
    path: 'auth',
    loadChildren: () =>
      import('@modules/auth.module').then((m) => m.AuthModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'accounting',
    component: AccountingComponent,
    loadChildren: () =>
      import('./views/accounting/accounting.module').then(
        (m) => m.AccountingModule
      ),
    // canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
