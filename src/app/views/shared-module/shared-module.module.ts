import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SharedModuleComponent } from './shared-module.component';
import { PrimNgModule } from 'app/core/shared/prim-ng/prim-ng.module';
import { LayoutModule } from '../layout/layout.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { RouterModule } from '@angular/router';
import { CustomSharedModule } from 'app/core/shared/shared-module';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { HttpClientModule } from '@angular/common/http';
import { SharedModuleRoutingModule } from './shared-module.routing.module';
import { WareHouseTable } from './warehouse-table/warehouse-table.component';
import { PharmacyInvoiceTemplateComponent } from './pharmacy-invoice-template/pharmacy-invoice-template.component';
import { PrintTableComponent } from './print-table/print-table.component';
import { ChooseClientTypeComponent } from './choose-client-type/choose-client-type.component';
import { Shared_tableComponent } from './shared_table/shared_table.component';
import { QRCodeStickerComponent } from './QR-code-sticker/QR-code-sticker.component';
import { TableComponentComponent } from './table-component/table-component.component';
import { DisableButtonDirective } from 'app/core/directives/singleClick.directive';
import { SalesInvoiceComponent } from './sales-invoice/sales-invoice.component';
import { NotesModalComponent } from './notes-modal/notes-modal.component';
import { PrintingOptionsPopupComponent } from './printing-options-popup/printing-options-popup.component';
import { Shared_popupComponent } from './shared_popup/shared_popup.component';
import { FocusNextDirective } from 'app/core/directives/focusNext.directive';



@NgModule({
  imports: [
    CommonModule,
    SharedModuleRoutingModule,
    PrimNgModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    RouterModule,
    CustomSharedModule,
    TableModule,
    CalendarModule,
    HttpClientModule,

  ],
  exports: [
    SharedModuleComponent,
    WareHouseTable,
    CustomSharedModule,
    PrintTableComponent,
    ChooseClientTypeComponent,
    Shared_tableComponent,
    PharmacyInvoiceTemplateComponent,
    QRCodeStickerComponent,
    SalesInvoiceComponent,
    NotesModalComponent,
    PrintingOptionsPopupComponent,
    Shared_popupComponent,
    FocusNextDirective
  ],
  declarations: [
    SharedModuleComponent,
    WareHouseTable,
    PrintTableComponent,
    ChooseClientTypeComponent,
    Shared_tableComponent,
    PharmacyInvoiceTemplateComponent,
    QRCodeStickerComponent,
    SalesInvoiceComponent,
    NotesModalComponent,
    PrintingOptionsPopupComponent,
    Shared_popupComponent,
    FocusNextDirective

  ],
  providers: [
    DecimalPipe,
  ],
})
export class SharedModuleModule { }
