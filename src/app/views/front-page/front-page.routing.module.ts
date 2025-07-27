import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontPageComponent } from './front-page.component';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';



const routes: Routes = [

    { path: '',redirectTo: 'front-page',pathMatch: 'full'},
    { path: 'welcome-page',component: WelcomePageComponent},

      

    
]

@NgModule({
    imports: [ RouterModule.forChild(routes) ],
    exports: [ RouterModule ],
})
export class FrontPageRoutingModule { }
