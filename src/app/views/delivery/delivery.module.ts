import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeliveryComponent } from './delivery.component';
import { LayoutModule } from "../layout/layout.module";
import { ProgressBarModule } from 'primeng/progressbar';
import { SharedModuleModule } from "@modules/shared-module.module";
import { DeliveryRoutingModule } from './delivery.routing.module';
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
import { FastDeliveredLogComponent } from './fast-delivered-log/fast-delivered-log.component';
import { FastDeliveryLogComponent } from './fast-delivery-log/fast-delivery-log.component';
import { TrackOrderDeliveryComponent } from './track-order-delivery/track-order-delivery.component';
import { DeliveryReturnsComponent } from './delivery-returns/delivery-returns.component';
import { DeliveryToDelegatesComponent } from './delivery-to-delegates/delivery-to-delegates.component';
import { DeliveredToDelegatesComponent } from './delivered-to-delegates/delivered-to-delegates.component';




@NgModule({
  imports: [
    CommonModule,
    LayoutModule,
    ProgressBarModule,
    SharedModuleModule,
    DeliveryRoutingModule
  ],
  declarations: [

    DeliveriesLogComponent,
    DeliveryComponent,
    ElectronicReceivedComponent,
    ElectronicReceiptComponent,
    CustomerDeliveriesComponent,
    ReturnsListComponent,
    SearchOrderComponent,
    RegisterReturnPermissionComponent,
    TodaysCollectionsComponent,
    CollectionsListComponent,
    TracksListComponent,
    AddTrackComponent,
    DeliveryListComponent,
    DistributionManagerReceiptsLogComponent,
    FastDeliveredLogComponent,
    FastDeliveryLogComponent,
    TrackOrderDeliveryComponent,
    DeliveryReturnsComponent,
    DeliveryToDelegatesComponent,
    DeliveredToDelegatesComponent
  ]
})
export class DeliveryModule {


  constructor() { }

  ngOnInit() {

  }
  
 }
