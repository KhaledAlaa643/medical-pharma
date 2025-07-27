import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { printingData } from '@models/printingData.js';
import { ColumnValue, columnHeaders } from '@models/tableData.js';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface showData {
  product_name: string,
  quantity: number,
  price: number,
  expired_at: string,
  status: any
}

@Component({
  selector: 'app-reviewed-details',
  templateUrl: './reviewed-details.component.html',
  styleUrls: [ './reviewed-details.component.scss' ]
})
export class ReviewedDetailsComponent implements OnInit {
  invoiceId: any
  warehouseFilter!: FormGroup
  isActiveTapArray: boolean[] = Array(3).fill(false)
  data: any = []
  printingdata!: printingData
  packagingData!: FormGroup
  reviewed: showData[] = []
  alldata: showData[] = []
  private subs = new Subscription()
  containsBulk!: boolean;

  columnsArray: columnHeaders[] = [
    {
      name: ' اسم الصنف',
    },
    {
      name: ' الكمية ',
    },

    {
      name: ' السعر ',
    },
    {
      name: ' التاريخ والتشغيلة',
    }
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal'
    },
    {
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'price',
      type: 'normal'
    },


    {
      name: 'expired_at',
      type: 'normal'
    },
  ]

  singleProductReviewerHeaders = [
    { field: 'name', header: ' اسم الصنف', type: 'normal' },
    { field: 'order_quantity', header: '  الكمية', type: 'normal' },
    { field: 'price', header: 'السعر ', type: 'normal' },
    { field: 'expired_at', header: 'التاريخ والتشغيلة', type: "normal" },
  ];


  constructor(private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpService,
    private router: Router) { }

  ngOnInit() {
    this.containsBulk = this.activeRoute.snapshot.url.join('/').includes('bulk');
    this.invoiceId = String(this.activeRoute.snapshot.paramMap.get('id'))
    this.getReviewedInvoiceData()
    this.warehouseFilter = this.fb.group({
      invoice_number: [ '' ],
      invoice_id: [ '' ],
      created_at: [ '' ],
      pharmacy_id: [ '' ],
      basket_number: [ '' ],
      auditor_name: [ '' ],
    })
    this.packagingData = this.fb.group({
      bags_num: [ '' ],
      cartons_num: [ '' ],
      fridges_num: [ '' ],
      invoices_num: [ '' ]
    })
    this.isActiveTapArray[ 0 ] = true

  }

  changeActiveTab(index: any) {
    this.isActiveTapArray.fill(false)
    this.isActiveTapArray[ index ] = true
    if (index == 0) {
      this.data = this.alldata
    }
    else {
      this.data = this.reviewed
    }
  }

  getReviewedInvoiceData() {
    let params = {
      'invoice_id': this.invoiceId
    }
    this.subs.add(this.http.getReq('warehouses/orders/retail/view-reviewed', { params: params }).subscribe({
      next: res => {
        
        res.data.cart.all.forEach((element: any) => {
          this.alldata.push({
            'product_name': element.product_name,
            'quantity': element.quantity + element.bonus,
            'price': element.price,
            'expired_at': element.expired_at + ' ' + element.operating_number,
            'status': element.status.value
          })
   
      });

      res.data.cart.inventoried.forEach((element: any) => {
          this.reviewed.push({
            'product_name': element.product_name,
            'quantity': element.quantity + element.bonus,
            'price': element.price,
            'expired_at': element.expired_at + ' ' + element.operating_number,
            'status': element.status.value
          })
      });
        this.data = res.data
        this.printingdata = res
        this.printingdata.data.cart=[...res.data.cart.all]
      }, complete: () => {
        //set upper data
        this.warehouseFilter.controls[ 'invoice_number' ].setValue(this.data?.id)

        this.warehouseFilter.controls[ 'created_at' ].setValue(datePipe.transform(this.data.completed_at, 'yyyy-MM-dd'))
        this.warehouseFilter.controls[ 'pharmacy_id' ].setValue(this.data?.pharmacy?.name)
        this.warehouseFilter.controls[ 'auditor_name' ].setValue(this.data?.invoice?.printed_by?.name)

        //set bottom data
        this.packagingData.patchValue(this.data?.invoice)

        //set table data


      }
    }))
  }

  clickedButton: 'printInvoice' | 'printSticker' | null = null;

  ModalChooser(buttonType: 'printInvoice' | 'printSticker'): void {
    this.clickedButton = buttonType;
  }

  urlToInvoice: any
  navigateToInvoicePrint() {

    if (this.printingdata.data.client.type_value == 1) {
      const serializedPharmacyInvoiceData = JSON.stringify(this.printingdata);
      localStorage.setItem('PharmacyInvoiceData', serializedPharmacyInvoiceData);
    }
    else if (this.printingdata.data.client.type_value == 0) {
      const serializedSalesInvoiceData = JSON.stringify(this.printingdata);
      localStorage.setItem('PharmacyInvoiceData', serializedSalesInvoiceData);
    }
    if (this.printingdata.data.client.type_value == 0) {
      this.urlToInvoice = this.router.serializeUrl(this.router.createUrlTree([ 'ToPrint/pharmacy-invoice' ], { queryParams: { shouldPrint: 'true' } }));
    } else if (this.printingdata.data.client.type_value == 1) {
      this.urlToInvoice = this.router.serializeUrl(this.router.createUrlTree([ 'ToPrint/sales-invoice' ], { queryParams: { shouldPrint: 'true' } }));
    }
    setTimeout(() => {
      window.open(this.urlToInvoice, '_blank');
    }, 100);

  }

  navigateToQRCodePrint() {

    if (this.printingdata.data.client.type_value == 1) {
      const serializedPharmacyInvoiceData = JSON.stringify(this.printingdata);
      localStorage.setItem('PharmacyInvoiceData', serializedPharmacyInvoiceData);
    }
    else if (this.printingdata.data.client.type_value == 0) {
      const serializedSalesInvoiceData = JSON.stringify(this.printingdata);
      localStorage.setItem('PharmacyInvoiceData', serializedSalesInvoiceData);
    }

    // let QRCodeData = this.printingdata
    let qrCodeData = {
      "invoice_id": this.printingdata.data.id,
      "bags_num": this.printingdata.data?.invoice?.bags_num,
      "fridges_num": this.printingdata.data?.invoice?.fridges_num,
      "cartons_num": this.printingdata.data?.invoice?.cartons_num,
      "total": this.printingdata.data?.invoice?.total,
      "track_number": this.printingdata.data?.pharmacy?.track?.id,
      "city_name": this.printingdata.data?.pharmacy?.city?.name,
      "phone_number": this.printingdata.data?.pharmacy?.phone_number,
      "optional_phone_number":this.printingdata.data?.pharmacy?.optional_phone_number,
      "client_name": this.printingdata.data?.client?.name,
      "pharmacy_name": this.printingdata.data?.pharmacy?.name,
      "address": this.printingdata.data?.pharmacy?.address,
    }

    let serializedQrCodeData = encodeURIComponent(JSON.stringify(qrCodeData));
    const urlTreeQRCode = this.router.createUrlTree([ 'ToPrint/QR-code-sticker' ], { queryParams: { qrCodeData: serializedQrCodeData, shouldPrint: 'true', type: 'ReviewedDetails' } });
    const urlToQrCode = this.router.serializeUrl(urlTreeQRCode);
    window.open(urlToQrCode, '_blank');
  }

}
