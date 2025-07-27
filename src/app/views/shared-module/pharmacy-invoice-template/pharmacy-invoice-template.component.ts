import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pharmacy-invoice-template',
  templateUrl: './pharmacy-invoice-template.component.html',
  styleUrls: ['./pharmacy-invoice-template.component.scss'],
  standalone:false
})
export class PharmacyInvoiceTemplateComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() downloadBoolean: boolean = false;
  @ViewChild('pharmacyInvoice') htmlPage!: ElementRef;
  @Input() invoiceData: any;
  allInvoiceProducts: any = [];
  totals: any;
  totalArabicString: any = '';
  constructor(
    private decimalPipe: DecimalPipe,
    private activatedRoute: ActivatedRoute,
    private http: HttpService
  ) {
    this.getSettingData();
    const storedData = localStorage.getItem('PharmacyInvoiceData');
    if (storedData) {
      const PharmacyInvoiceData = JSON.parse(storedData);
      this.invoiceData = PharmacyInvoiceData;
    }
  }
  a5Portrait: boolean = true;
  a4Landscape: boolean = false;
  a4Portrait: boolean = false;

  paperSize: string = 'a5portrait'; // Or 'a5portrait' 'a4portrait',  'a4landscape'depending on your condition

  settings!: any;

  getSettingData() {
    this.subs.add(
      this.http.getReq('settings').subscribe({
        next: (res) => {
          this.settings = res.data.reduce(
            (acc: any, item: any) => ({ ...acc, ...item }),
            {}
          );
        },
        complete: () => {
          this.activatedRoute.queryParams.subscribe((params) => {
            if (params['shouldPrint'] === 'true') {
              setTimeout(() => {
                window.print();
              }, 50);
            }
          });
        },
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoiceData']) {
      this.totalArabicString = this.decimalPipe.transform(
        this.totals?.total,
        'arabic'
      );
      this.totals = this.invoiceData?.additional_data?.totals;
      this.invoiceData?.data?.cart?.forEach((cart: any) => {
        cart.batches?.forEach((batches: any, index: any) => {
          this.allInvoiceProducts.push({
            location:
              batches?.corridor?.number +
              '/' +
              batches?.stand +
              '-' +
              batches?.shelf,
            order_quantity: batches?.batch_info?.ordered_quantity,
            bonus: cart?.bonus,
            price: batches?.batch_info?.price,
            total: batches?.batch_info?.total,
            discount: cart?.discount,
            expired_at: batches?.expired_at,
            operating_number: batches?.operating_number,
            product_name: cart?.product?.name,
          });
        });
      });
    }
  }

  ngOnInit() {
    this.totalArabicString = this.decimalPipe.transform(
      this.totals?.total,
      'arabic'
    );
    this.totals = this.invoiceData?.additional_data?.totals;
    this.invoiceData?.data?.cart?.forEach((cart: any) => {
      cart.batches?.forEach((batches: any, index: any) => {
        this.allInvoiceProducts.push({
          location:
            batches?.corridor?.number +
            '/' +
            batches?.stand +
            '-' +
            batches?.shelf,
          order_quantity: batches?.batch_info?.ordered_quantity,
          bonus: cart?.bonus,
          price: batches?.batch_info?.price,
          total: batches?.batch_info?.total,
          discount: cart?.discount,
          expired_at: batches?.expired_at,
          operating_number: batches?.operating_number,
          product_name: cart?.product?.name,
        });
      });
    });

    window.addEventListener('afterprint', () => {
      if (localStorage.getItem('PharmacyInvoiceData')) {
        localStorage.removeItem('PharmacyInvoiceData');
        window.close();
      }
    });
  }

  printContent() {
    setTimeout(() => {
      if (this.htmlPage) {
        let content = this.htmlPage.nativeElement.innerHTML;
        let printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(content);
          printWindow.document.close();
        } else {
          console.error('Failed to open print window.');
        }
      } else {
        console.error('Content to print is not available.');
      }
    }, 1000);
  }
  private subs = new Subscription();
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
