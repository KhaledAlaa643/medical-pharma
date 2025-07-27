import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrepardingComponent } from './preparding/preparding.component';
import { PreparedComponent } from './prepared/prepared.component';




const routes: Routes = [
    { path: 'preparing', component: PrepardingComponent },
    { path: 'prepared', component: PreparedComponent },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class BulkProductsPreparerRoutingModule { }
