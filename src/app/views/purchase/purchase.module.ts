import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseComponent } from './purchase.component';
import { PurchaseRoutingModule } from './purchase.routing.module';
import { LayoutModule } from "../layout/layout.module";
import { SharedModuleModule } from '@modules/shared-module.module';
import { SharedModule } from 'primeng/api';
import { SupplyModule } from './supply/supply.module';
import { LogsModule } from './logs/logs.module';
import { ReturnsModule } from './returns/returns.module';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { MarketDiscountComponent } from './discount/market-discount/market-discount.component';
import { ProductWarehouseBalanceComponent } from './product-warehouse-balance/product-warehouse-balance/product-warehouse-balance.component';
import { EditedDiscountsListComponent } from './product-warehouse-balance/edited-discounts-list/edited-discounts-list.component';
import { WarehouseTransfersModule } from '@modules/storekeeper/warehouse-transfers/warehouse-transfers.module';
import { ExpirationsAndOperationsModule } from './expirations-and-operations/expirations-and-operations.module';
import { CombinedSupplyRequestComponent } from './supply/combined-supply-request/combined-supply-request.component';
import { ItemSalesProductivityComponent } from './Item-sales-productivity/Item-sales-productivity.component';
import { ProductivityOfItemSalesComponent } from './Item-sales-productivity/Productivity-of-item-sales/Productivity-of-item-sales.component';
import { ItemSalesComponent } from './Item-sales-productivity/item-sales/item-sales.component';
import { ProductivityOfCompanyComponent } from './Item-sales-productivity/Productivity-of-company/Productivity-of-company.component';
import { SalesOfItemsByActiveIngredientComponent } from './Item-sales-productivity/Sales-of-items-by-active-ingredient/Sales-of-items-by-active-ingredient.component';
import { ProductivityOfAreaComponent } from './Item-sales-productivity/productivity-of-area/productivity-of-area.component';
import { ProductivityOfCityComponent } from './Item-sales-productivity/productivity-of-city/productivity-of-city.component';
import { AreaSalesComponent } from './Item-sales-productivity/area-sales/area-sales.component';
import { ProductivityOfTrackComponent } from './Item-sales-productivity/productivity-of-track/productivity-of-track.component'
import { TrackSalesComponent } from './Item-sales-productivity/track-sales/track-sales.component'
import { ItemInactivityReportsComponent } from './Item-inactivity-reports/Item-Inactivity-Reports/Item-Inactivity-Reports.component';
import { PurchaseInventoryModule } from './purchase-inventory/purchase-inventory.module';


@NgModule({
  imports: [
    CommonModule,
    PurchaseRoutingModule,
    LayoutModule,
    SharedModuleModule,
    SupplyModule,
    SharedModule,
    LogsModule,
    PrimNgModule,
    ReturnsModule,
    WarehouseTransfersModule,
    ExpirationsAndOperationsModule,
    PurchaseInventoryModule
  ],
  declarations: [
    PurchaseComponent,
    MarketDiscountComponent,
    ProductWarehouseBalanceComponent,
    EditedDiscountsListComponent,
    CombinedSupplyRequestComponent,
    ProductivityOfItemSalesComponent,
    ItemSalesProductivityComponent,
    ItemSalesComponent,
    ProductivityOfCompanyComponent,
    SalesOfItemsByActiveIngredientComponent,
    ProductivityOfAreaComponent,
    ProductivityOfCityComponent,
    AreaSalesComponent,
    ProductivityOfTrackComponent,
    TrackSalesComponent,
    ItemInactivityReportsComponent,
  ]
})
export class PurchaseModule { }
