import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsReviewerComponent } from './products-reviewer/products-reviewer.component';
import { ReviewedListComponent } from './reviewed-list/reviewed-list.component';
import { PreparingListComponent } from './preparing-list/preparing-list.component';
import { ReviewedDetailsComponent } from './reviewed-details/reviewed-details.component';






const routes: Routes = [
    { path: '', redirectTo: 'single-products-reviewer', pathMatch: 'full' },
    { path: 'single-products-reviewer/:id', component: ProductsReviewerComponent },
    { path: 'single-reviewed-details/:id', component: ReviewedDetailsComponent },


    { path: 'single-reviewed-list', component: ReviewedListComponent },
    { path: 'single-preparing-list', component: PreparingListComponent },

    //bulk routes
    { path: 'bulk-preparing-list', component: PreparingListComponent },
    { path: 'bulk-products-reviewer/:id', component: ProductsReviewerComponent },
    { path: 'bulk-reviewed-list', component: ReviewedListComponent },
    { path: 'bulk-reviewed-details/:id', component: ReviewedDetailsComponent },



];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class ProductsSalesReviewerRoutingModule { }
