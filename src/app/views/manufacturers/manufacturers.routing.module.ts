import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddManufacturerComponent } from './add-manufacturer/add-manufacturer.component';
import { ManufacturersListComponent } from './manufacturers-list/manufacturers-list.component';

const routes: Routes = [
  // { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'add', component: AddManufacturerComponent },
  { path: 'edit/:id', component: AddManufacturerComponent },
  { path: 'list', component: ManufacturersListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class manufacturersRoutingModule {}
