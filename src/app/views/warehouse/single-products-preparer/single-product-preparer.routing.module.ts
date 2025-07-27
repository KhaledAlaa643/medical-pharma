import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SingleProductPreparerComponent } from './single-products-preparer.component';
import { PreparingSingleProducts } from './preparing-single-products/preparing-single-products.component';
import { PreparedSingleProducts } from './prepared-single-products/prepared-single-products.component';






const routes: Routes = [
    { path: '', redirectTo: 'preparing-single-products', pathMatch: 'full' },
    { path: 'preparing-products-wholesale', component: PreparingSingleProducts  },
    { path: 'preparing-products-retail', component: PreparingSingleProducts  },
    { path: 'prepared-products-wholesale', component: PreparedSingleProducts  },
    { path: 'prepared-products-retail', component: PreparedSingleProducts  },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class SingleProductPreparerRoutingModule { }
