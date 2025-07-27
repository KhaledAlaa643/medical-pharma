import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ElectronicReceivedComponent } from './electronic-received/electronic-received.component';
import { ElectronicReceiptComponent } from './electronic-receipt/electronic-receipt.component';
import { CustomerDeliveriesComponent } from './customer-deliveries/customer-deliveries.component';
import { DeliveriesLogComponent } from './deliveries-log/deliveries-log.component';
import { ReturnsListComponent } from './returns-list/returns-list.component';
import { SearchOrderComponent } from './search-order/search-order.component';
import { RegisterReturnPermissionComponent } from './register-return-permission/register-return-permission.component';
import { TodaysCollectionsComponent } from './todays-collections/todays-collections.component';
import { CollectionsListComponent } from './collections-list/collections-list.component';
import { AddTrackComponent } from './add-track/add-track.component';
import { TracksListComponent } from './tracks-list/tracks-list.component';
import { DeliveryListComponent } from './delivery-list/delivery-list.component';
import { DistributionManagerReceiptsLogComponent } from './distribution-manager-receipts-log/distribution-manager-receipts-log.component';
import { FastDeliveryLogComponent } from './fast-delivery-log/fast-delivery-log.component';
import { FastDeliveredLogComponent } from './fast-delivered-log/fast-delivered-log.component';
import { TrackOrderDeliveryComponent } from './track-order-delivery/track-order-delivery.component';
import { DeliveryReturnsComponent } from './delivery-returns/delivery-returns.component';
import { DeliveryToDelegatesComponent } from './delivery-to-delegates/delivery-to-delegates.component';
import { DeliveredToDelegatesComponent } from './delivered-to-delegates/delivered-to-delegates.component';

const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'electronic-receipt', component: ElectronicReceiptComponent },
  { path: 'received', component: ElectronicReceivedComponent },
  { path: 'add-track', component: AddTrackComponent },
  { path: 'edit-track/:id', component: AddTrackComponent },
  { path: 'tracks-list', component: TracksListComponent },
  { path: 'delivery-to-delegates', component: DeliveryToDelegatesComponent },
  { path: 'delivered-to-delegates', component: DeliveredToDelegatesComponent },
  //----------------------------------------------------------------------------------
  { path: 'customer-deliveries', component: CustomerDeliveriesComponent },
  { path: 'deliveries-log', component: DeliveriesLogComponent },
  { path: 'returns-list', component: ReturnsListComponent },
  { path: 'search-order', component: SearchOrderComponent },
  {
    path: 'register-return-permission/:orderId/:pharmacyId',
    component: RegisterReturnPermissionComponent,
  },
  { path: 'todays-collections', component: TodaysCollectionsComponent },
  { path: 'collections-list', component: CollectionsListComponent },
  { path: 'delivery-list', component: DeliveryListComponent },
  {
    path: 'distribution-manager-receipts-log',
    component: DistributionManagerReceiptsLogComponent,
  },
  { path: 'fast-delivery-log', component: FastDeliveryLogComponent },
  { path: 'fast-delivered-log', component: FastDeliveredLogComponent },
  { path: 'track-order-delivery', component: TrackOrderDeliveryComponent },
  { path: 'returns', component: DeliveryReturnsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryRoutingModule {}
