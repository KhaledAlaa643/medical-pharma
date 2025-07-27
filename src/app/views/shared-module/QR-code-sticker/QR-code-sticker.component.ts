import {
  Component,
  ElementRef,
  Input,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  DomPortalOutlet,
  PortalOutlet,
  TemplatePortal,
} from '@angular/cdk/portal';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '@services/http.service';
import { OrderDetails } from '@models/invoice';

interface invoiceTypes {
  bag_num: number;
  fridge_num: number;
  carton_num: number;
  total: number;
}

@Component({
  selector: 'app-QR-code-sticker',
  templateUrl: './QR-code-sticker.component.html',
  styleUrls: ['./QR-code-sticker.component.scss'],
  standalone:false
})
export class QRCodeStickerComponent implements OnInit {
  @Input() downloadBoolean: boolean = false;
  @ViewChild('QRcode') htmlPage!: ElementRef;
  @Input() stickerData: any;
  @Input() stickerType: any;
  @Input() printCount: any;

  stickersArray: any;
  printCountArray: any = [];
  qrData: any;
  numberOfPrint = 0;
  PharmacyinvoiceData!: any;
  urlToInvoice: any;
  stickersToPrint: any;
  stickersToPrinJSON: any;

  private subs = new Subscription();
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpService
  ) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['printCount']) {
      this.printCountArray = new Array(this.printCount).fill(0);
      if (this.printCount) {
      }
    }
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['qrCodeData']) {
        const qrCodeData = JSON.parse(decodeURIComponent(params['qrCodeData']));
        this.stickerData = qrCodeData;
        this.downloadBoolean = true;
      }
    });

    if (localStorage.getItem('PharmacyInvoiceData')) {
      const storedData = localStorage.getItem('PharmacyInvoiceData');
      this.PharmacyinvoiceData = storedData ? JSON.parse(storedData) : null;
    }
    if (this.PharmacyinvoiceData.data.client.type_value == 0) {
      this.urlToInvoice = this.router.serializeUrl(
        this.router.createUrlTree(['ToPrint/pharmacy-invoice'], {
          queryParams: { shouldPrint: 'true' },
        })
      );
    } else if (this.PharmacyinvoiceData.data.client.type_value == 1) {
      this.urlToInvoice = this.router.serializeUrl(
        this.router.createUrlTree(['ToPrint/sales-invoice'], {
          queryParams: { shouldPrint: 'true' },
        })
      );
    }

    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['type'] === 'SingleProductReviewer') {
        setTimeout(() => {
          window.open(this.urlToInvoice, '_blank');
          setTimeout(() => {
            window.print();
          }, 800);
        }, 500);
      } else if (params['type'] === 'ReviewedDetails') {
        setTimeout(() => {
          window.print();
        }, 400);
      }
    });

    window.addEventListener('afterprint', () => {
      window.close();
    });

    let invoiceData: invoiceTypes = {
      bag_num: this.PharmacyinvoiceData.data.invoice.bags_num,
      fridge_num: this.PharmacyinvoiceData.data.invoice.fridges_num,
      carton_num: this.PharmacyinvoiceData.data.invoice.cartons_num,
      total: this.PharmacyinvoiceData.data.invoice.total,
    };
    this.stickersArray = this.generateStickers(invoiceData);
  }
  printQrContent() {
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

  generateStickers(invoiceData: any): any[] {
    let stickers = [];
    if (invoiceData.bag_num > 0) {
      let bag_num = new Array(invoiceData.bag_num);
      stickers.push({ type: 'bag', count: bag_num });
    }
    if (invoiceData.fridge_num > 0) {
      let fridge_num = new Array(invoiceData.fridge_num);
      stickers.push({ type: 'fridge', count: fridge_num });
    }
    if (invoiceData.carton_num > 0) {
      let carton_num = new Array(invoiceData.carton_num);
      stickers.push({ type: 'carton', count: carton_num });
    }
    return stickers;
  }
}
