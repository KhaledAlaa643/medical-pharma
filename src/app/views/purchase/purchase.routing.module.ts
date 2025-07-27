import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarketDiscountComponent } from './discount/market-discount/market-discount.component';
import { ProductWarehouseBalanceComponent } from './product-warehouse-balance/product-warehouse-balance/product-warehouse-balance.component';
import { EditedDiscountsListComponent } from './product-warehouse-balance/edited-discounts-list/edited-discounts-list.component';
import { ItemSalesProductivityComponent } from './Item-sales-productivity/Item-sales-productivity.component';
import { ItemInactivityReportsComponent } from './Item-inactivity-reports/Item-Inactivity-Reports/Item-Inactivity-Reports.component';

import { ClientsComponent } from '@modules/clients.component';
import { AddManufacturerComponent } from '@modules/add-manufacturer/add-manufacturer.component';
import { ManufacturersComponent } from '@modules/manufacturers.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'purchase',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'supply', pathMatch: 'full' },
      {
        path: 'supply',
        loadChildren: () =>
          import('@modules/supply.module').then((m) => m.SupplyModule),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'logs', pathMatch: 'full' },
      {
        path: 'logs',
        loadChildren: () =>
          import('@modules/logs/logs.module').then((m) => m.LogsModule),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'returns', pathMatch: 'full' },
      {
        path: 'returns',
        loadChildren: () =>
          import('@modules/returns/returns.module').then(
            (m) => m.ReturnsModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'transfers', pathMatch: 'full' },
      {
        path: 'transfers',
        loadChildren: () =>
          import('@modules/warehouses-transfers.module').then(
            (m) => m.WarehousesTransfersModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'expirations-and-operations', pathMatch: 'full' },
      {
        path: 'expirations-and-operations',
        loadChildren: () =>
          import('@modules/expirations-and-operations.module').then(
            (m) => m.ExpirationsAndOperationsModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'inventory', pathMatch: 'full' },
      {
        path: 'inventory',
        loadChildren: () =>
          import('@modules/purchase-inventory.module').then(
            (m) => m.PurchaseInventoryModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'offers', pathMatch: 'full' },
      {
        path: 'offers',
        loadChildren: () =>
          import('@modules/offers.module').then((m) => m.OffersModule),
      },
    ],
  },
  {
    path: 'manufacturers',
    loadChildren: () =>
      import('@modules/manufacturers.module').then(
        (m) => m.ManufacturersModule
      ),
    // canActivate: [ LoginGuard ]
  },
  {
    path: 'market-discount',
    component: MarketDiscountComponent,
  },
  {
    path: 'products-warehouses-balance',
    component: ProductWarehouseBalanceComponent,
  },
  {
    path: 'edited-discounts-list',
    component: EditedDiscountsListComponent,
  },
  {
    path: 'Item-sales-productivity',
    component: ItemSalesProductivityComponent,
  },
  {
    path: 'Item-inactivity-reports',
    component: ItemInactivityReportsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseRoutingModule {}
