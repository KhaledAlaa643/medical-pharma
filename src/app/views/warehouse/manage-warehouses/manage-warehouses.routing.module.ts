import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddWarehouseComponent } from './add-warehouse/add-warehouse.component';
import { WarehousesListComponent } from './warehouses-list/warehouses-list.component';
import { ReactiveFormsModule } from '@angular/forms';


const routes: Routes = [
    { path: '', redirectTo: 'manage-warehouses', pathMatch: 'full' },
    { path: 'add', component: AddWarehouseComponent },
    { path: 'edit/:id', component: AddWarehouseComponent },
    { path: 'warehouses-list', component: WarehousesListComponent },

];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule,ReactiveFormsModule ],
})
export class ManageWarehousesRoutingModule { }

