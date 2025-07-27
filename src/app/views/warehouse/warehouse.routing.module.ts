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
      { path: '', redirectTo: 'receipts-worker', pathMatch: 'full' },
      {
        path: 'receipts-worker',
        loadChildren: () =>
          import('@modules/receipts-worker/receipts-worker.module').then(
            (m) => m.ReceiptsWorkerModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'housing-worker', pathMatch: 'full' },
      {
        path: 'housing-worker',
        loadChildren: () =>
          import('@modules/housing-worker/housing-worker.module').then(
            (m) => m.HousingWorkerModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'bulk-products-preparer', pathMatch: 'full' },
      {
        path: 'bulk-products-preparer',
        loadChildren: () =>
          import('@modules/bulk-products-preparer.module').then(
            (m) => m.BulkProductsPreparerModule
          ),
      },
    ],
  },
  {
    path: '',
    children: [
      { path: '', redirectTo: 'storekeeper', pathMatch: 'full' },
      {
        path: 'storekeeper',
        loadChildren: () =>
          import('@modules/storekeeper.module').then(
            (m) => m.StorekeeperModule
          ),
      },
    ],
  },

  {
    path: '',

    children: [
      { path: '', redirectTo: 'single-products-preparer', pathMatch: 'full' },
      {
        path: 'single-products-preparer',
        loadChildren: () =>
          import('@modules/single-products-preparer/single-products-preparer.module').then(
            (m) => m.SingleProductsPreparerModule
          ),
      },
    ],
  },
  {
    path: '',

    children: [
      { path: '', redirectTo: 'products-sales-reviewer', pathMatch: 'full' },
      {
        path: 'products-sales-reviewer',
        loadChildren: () =>
          import('@modules/products-sales-reviewer/products-sales-reviewer.module').then(
            (m) => m.ProductsSalesReviewerModule
          ),
      },
    ],
  },
  {
    path: '',

    children: [
      { path: '', redirectTo: 'receiving-auditor', pathMatch: 'full' },
      {
        path: 'receiving-auditor',
        loadChildren: () =>
          import('@modules/receiving-auditor/receiving-auditor.module').then(
            (m) => m.ReceivingAuditorModule
          ),
      },
    ],
  },
  {
    path: '',

    children: [
      { path: '', redirectTo: 'manage-warehouses', pathMatch: 'full' },
      {
        path: 'manage-warehouses',
        loadChildren: () =>
          import('@modules/manage-warehouses.module').then(
            (m) => m.ManageWarehousesModule
          ),
      },
    ],
  },


];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ],
})
export class WarehouseRoutingModule { }
