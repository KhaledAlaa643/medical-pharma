import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventoryAndStockBalanceComponent } from './inventory-and-stock-balance/inventory-and-stock-balance.component';
import { InventoryAndStockBalanceDetailsComponent } from './inventory-and-stock-balance-details/inventory-and-stock-balance-details.component';

const routes: Routes = [
  { path: '', redirectTo: 'inventory-and-stock-balance', pathMatch: 'full' },
  {
    path: 'inventory-and-stock-balance',
    component: InventoryAndStockBalanceComponent,
  },
  {
    path: 'inventory-and-stock-balance-details/:id',
    component: InventoryAndStockBalanceDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

  exports: [RouterModule],
})
export class InventoryOfItemsAndWarehousesRoutingModule {}
