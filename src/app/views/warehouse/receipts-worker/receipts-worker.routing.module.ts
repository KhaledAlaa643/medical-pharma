import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodaysReceiptsComponent } from './todays-receipts/todays-receipts.component';
import { TodaysDeliveriesComponent } from './todays-deliveries/todays-deliveries.component';



const routes: Routes = [
    { path: '', redirectTo: 'todays-receipts', pathMatch: 'full' },
    { path: 'todays-receipts', component: TodaysReceiptsComponent },
    { path: 'todays-deliveries', component: TodaysDeliveriesComponent },




];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class ReceiptsWorkerRoutingModule { }
