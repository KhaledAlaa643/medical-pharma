import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'warehouse',
    pathMatch: 'full',
  },
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'Inventory-of-Items-and-Warehouses',
        pathMatch: 'full',
      },
      {
        path: 'Inventory-of-Items-and-Warehouses',
        loadChildren: () =>
          import('@modules/Inventory-of-Items-and-Warehouses.module').then(
            (m) => m.InventoryOfItemsAndWarehousesModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'Inventory-of-Items-and-Warehouses/accounting',
        pathMatch: 'full',
      },
      {
        path: 'Inventory-of-Items-and-Warehouses/accounting',
        loadChildren: () =>
          import('@modules/Inventory-of-Items-and-Warehouses.module').then(
            (m) => m.InventoryOfItemsAndWarehousesModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'customer-returns', pathMatch: 'full' },
      {
        path: 'customer-returns',
        loadChildren: () =>
          import('@modules/customer-returns.module').then(
            (m) => m.CustomerReturnsModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'product-movement', pathMatch: 'full' },
      {
        path: 'product-movement',
        loadChildren: () =>
          import('@modules/product-movement/product-movement.module').then(
            (m) => m.ProductMovementModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'accounting/product-movement',
        pathMatch: 'full',
      },
      {
        path: 'accounting/product-movement',
        loadChildren: () =>
          import('@modules/product-movement/product-movement.module').then(
            (m) => m.ProductMovementModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'warehouse-transfers', pathMatch: 'full' },
      {
        path: 'warehouse-transfers',
        loadChildren: () =>
          import(
            '@modules/warehouse-transfers/warehouse-transfers.module'
          ).then((m) => m.WarehouseTransfersModule),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'warehouse-settlement', pathMatch: 'full' },
      {
        path: 'warehouse-settlement',
        loadChildren: () =>
          import('@modules/warehouse-settlement.module').then(
            (m) => m.WarehouseSettlementModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'warehouse-inventory', pathMatch: 'full' },
      {
        path: 'warehouse-inventory',
        loadChildren: () =>
          import('@modules/inventory.module').then((m) => m.InventoryModule),
      },
    ],
  },
  {
    path: '',

    children: [
      { path: '', redirectTo: 'edit-operation', pathMatch: 'full' },
      {
        path: 'edit-operation',
        loadChildren: () =>
          import('@modules/edit-operation.module').then(
            (m) => m.EditOperationModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class storekeeperRoutingModule {}
