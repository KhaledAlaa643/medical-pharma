import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesTeamRoutingModule } from './sales.routing.module';
import { ProductionReportsComponent } from './productionReports/productionReports.component';
import { SalesTeamComponent } from './salesTeam.component';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { AgentProductivityComponent } from './productionReports/agent-productivity/agent-productivity.component';
import { AgentSalesComponent } from './productionReports/agentSales/agentSales.component';
import { ClientSalesComponent } from './productionReports/clientSales/clientSales.component';
import { ClientAgentSalesComponent } from './productionReports/clientAgentSales/clientAgentSales.component';
import { CreateClientListComponent } from './create-client-list/create-client-list.component';
import { CityGovernateProductionComponent } from './productionReports/cityGovernateProduction/cityGovernateProduction.component';
import { CitySalesComponent } from './productionReports/citySales/citySales.component';
// import { CityClientSalesComponent } from './productionReports/cityClientSales/cityClientSales.component';
import { SalesManClientsComponent } from './Sales-man-clients/Sales-man-clients.component';
import { CalendarModule } from 'primeng/calendar'
import { LayoutModule } from '../layout/layout.module';
import { PaginatorModule } from 'primeng/paginator';
import { CityProductivityComponent } from './productionReports/city-productivity/city-productivity.component';
import { TrackProductivityComponent } from './productionReports/track-productivity/track-productivity.component';
import { TrackSalesComponent } from './productionReports/trackSales/trackSales.component';
import { CityAgentTrackSalesComponent } from './productionReports/cityAgentTrackSales/cityAgentTrackSales.component';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { SharedModuleModule } from '@modules/shared-module.module';



@NgModule({
  imports: [
    CommonModule,
    SalesTeamRoutingModule,
    TableModule,
    FormsModule,
    CalendarModule,
    LayoutModule,
    PaginatorModule,
    PrimNgModule,
    SharedModuleModule


  ],
  declarations: [
    SalesTeamComponent,
    ProductionReportsComponent,
    AgentProductivityComponent,
    AgentSalesComponent,
    ClientSalesComponent,
    ClientAgentSalesComponent,
    CityGovernateProductionComponent,
    CitySalesComponent,
    // CityClientSalesComponent,
    SalesManClientsComponent,
    CityProductivityComponent,
    TrackProductivityComponent,
    TrackSalesComponent,
    CityAgentTrackSalesComponent,
    CreateClientListComponent
  ]
})
export class SalesTeamModule { }
