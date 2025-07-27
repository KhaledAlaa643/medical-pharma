import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { OrderDetails } from '@models/invoice';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-sales-invoice',
  templateUrl: './sales-invoice.component.html',
  styleUrls: [ './sales-invoice.component.scss' ],
  standalone:false
})
export class SalesInvoiceComponent implements OnInit {


  @ViewChild('pharmacyInvoice') htmlPage!: ElementRef;

  @ViewChild('upperArea1') upperArea1!: ElementRef
  @ViewChild('table1') table1!: ElementRef
  @ViewChild('upperArea2') upperArea2!: ElementRef
  @ViewChild('table2') table2!: ElementRef
  @ViewChild('upperArea3') upperArea3!: ElementRef
  @ViewChild('table3') table3!: ElementRef

  @ViewChild('fullTable1') fullTable1!: ElementRef;
  @ViewChild('fullTable2') fullTable2!: ElementRef;
  @ViewChild('fullTable3') fullTable3!: ElementRef;
  invoiceData!: OrderDetails
  arabicTime: string = ''
  date: string = ''
  invoiceBodyData: any[] = []
  constructor(
    private activatedRoute: ActivatedRoute
  ) {

  }


  ngOnInit(): void {

    const storedData = localStorage.getItem('PharmacyInvoiceData');
    if (storedData) {
      const PharmacyInvoiceData = JSON.parse(storedData);
      this.invoiceData = PharmacyInvoiceData
      this.invoiceBodyData = PharmacyInvoiceData.data.cart
    }

    this.activatedRoute.queryParams.subscribe(params => {
      if (params[ 'shouldPrint' ] === 'true') {
        setTimeout(() => {
          window.print()
        }, 50);
      }
    });
    window.addEventListener('afterprint', () => {
      if (localStorage.getItem('PharmacyInvoiceData')) {
        localStorage.removeItem('PharmacyInvoiceData')
      }
      window.close();
    });


  }

}