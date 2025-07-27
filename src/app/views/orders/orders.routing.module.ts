import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterRequestComponent } from './register-request/register-request.component';
import { TrackDeliveryComponent } from './track-delivery/track-delivery.component';
import { AllOrdersComponent } from './all-orders/all-orders.component';



const routes: Routes = [
  { path: '', redirectTo: 'register-request', pathMatch: 'full' },
  { path: 'register-request', component: RegisterRequestComponent },
  {path:'track-delivery',component:TrackDeliveryComponent},
  { path: 'All-orders', component: AllOrdersComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ordersRoutingModule { }
