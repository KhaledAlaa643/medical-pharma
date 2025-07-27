import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TableComponentComponent } from './table-component/table-component.component';
import { QRCodeStickerComponent } from './QR-code-sticker/QR-code-sticker.component';
import { PharmacyInvoiceTemplateComponent } from './pharmacy-invoice-template/pharmacy-invoice-template.component';
import { SalesInvoiceComponent } from './sales-invoice/sales-invoice.component';
import { PrintTableComponent } from './print-table/print-table.component';




const routes: Routes = [
  { path: '', redirectTo: 'table-component', pathMatch: 'full' },
  { path: 'ToPrint/QR-code-sticker', component: QRCodeStickerComponent },
  { path: 'ToPrint/pharmacy-invoice', component: PharmacyInvoiceTemplateComponent },
  { path: 'ToPrint/sales-invoice', component: SalesInvoiceComponent },
  { path: 'ToPrint/Data', component: PrintTableComponent }


];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class SharedModuleRoutingModule { }