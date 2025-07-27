import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComplainRequestComponent } from './complain-request/complain-request.component';
import { AllComplainsComponent } from './all-complains/all-complains.component';
import { ComplainPageComponent } from './complain-page/complain-page.component';




const routes: Routes = [
  { path: '', redirectTo: 'complain-request', pathMatch: 'full' },
  { path: 'complain-request', component: ComplainRequestComponent },
  { path: 'all-complains/log', component: AllComplainsComponent },
  { path: 'all-complains/previous', component: AllComplainsComponent },
  {path:'complain-details/:type/:id',component:ComplainPageComponent}
];
@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ],
})
export class ComplainsRoutingModule { }
