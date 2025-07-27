import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderLogsComponent } from './order-logs/order-logs.component';
import { ItemLogsComponent } from './item-logs/item-logs.component';






const routes: Routes = [
    { path: 'supply-requests', component: OrderLogsComponent },
    { path: 'supply-requests-products', component: ItemLogsComponent },
    // { path: 'manage/linked_files', component: LinkedFilesComponent },
];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class LogsRoutingModule { }
