import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarehouseInventoryComponent } from './warehouse-inventory/warehouse-inventory.component';








const routes: Routes = [
    { path: '', redirectTo: 'single-products-reviewer', pathMatch: 'full' },
    { path: 'inventory', component: WarehouseInventoryComponent },



];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class InventoryRoutingModule { }
