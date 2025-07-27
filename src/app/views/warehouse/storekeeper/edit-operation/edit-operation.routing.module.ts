import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditDateOperationComponent } from './edit-date-operation/edit-date-operation.component';
import { EditedDateOperationComponent } from './edited-date-operation/edited-date-operation.component';








const routes: Routes = [
    { path: '', redirectTo: 'edit-operation', pathMatch: 'full' },
    { path: 'edit-date-operation', component: EditDateOperationComponent },
    { path: 'edited-date-operation', component: EditedDateOperationComponent },



];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class EditOperationRoutingModule { }
