import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TodaysHousingComponent } from './todays-housing/todays-housing.component';
import { TodaysHousedComponent } from './todays-housed/todays-housed.component';





const routes: Routes = [
    { path: '', redirectTo: 'todays-housing', pathMatch: 'full' },
    { path: 'todays-housing', component: TodaysHousingComponent  },
    { path: 'todays-housed', component: TodaysHousedComponent },

];

@NgModule({
    imports: [ RouterModule.forChild(routes) ],

    exports: [ RouterModule ],
})
export class HousingWorkerRoutingModule { }
