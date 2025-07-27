import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { cart } from '@models/cart';
import { client } from '@models/client';
import { pharmacie } from '@models/pharmacie';
import { pharmacyData } from '@models/pharmacie';
import { pharmacieInvoiceData } from '@models/pharmacie';
import { sales } from '@models/sales';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { invoiceService } from '@services/invoice.service';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import { pharmacyService } from '../../../core/services/pharmacy.service';
import { GeneralService } from '@services/general.service';
interface OrderDetails {
  note?: string;
  sales?: number;
  shipping_type?: number;
}
@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss'],
})
export class InvoiceDetailsComponent implements OnInit, OnChanges {
  @Input() client!: client;
  @Input() openPharmaciesDropdown!: boolean;
  @Input() WaitingPharmacyClient?: number;
  @Input() orderDetails!: OrderDetails;
  @Input() disablePharmaciesDropdown: boolean = false;
  @Input() displayPharmacy: boolean = false;
  openPharmacies!: boolean;
  @Output() addPharmacieEvent = new EventEmitter<pharmacyData>();
  @Output() addSalesEvent = new EventEmitter<number>();
  @Output() addNoteEvent = new EventEmitter<string>();
  @Output() openNoteModel = new EventEmitter<string>();
  @Output() addShippingTypeEvent = new EventEmitter<boolean>();
  @Output() openProductsDropdown = new EventEmitter<boolean>();
  options = [{ name: 'item1' }, { name: 'item1' }, { name: 'item1' }];
  display = false;
  fastDelivery = false;
  clientDataForm!: FormGroup;
  displayClient!: client;
  pharmacies!: pharmacie[];
  selectedPharmacies: any;
  shiftId: any;
  trackId: any;
  cityId: any;
  areaId: any;
  discount_tier_id: any;
  trackName: string = '';
  isModalOpen: boolean = true;

  pharmaciesAdress = '';
  debtLimit: number = 0;
  remainingDebitLimit: number = 0;
  allSales: sales[] = [];
  salesId!: number;
  shippingType!: boolean;
  onePharmacies = false;
  selectedSales!: any;
  timerStart!: any;
  sales: any;
  invoiceData: pharmacieInvoiceData = {
    track: {
      shifts: [
        {
          name: '',
        },
      ],
    },
  } as pharmacieInvoiceData;
  private subs = new Subscription();

  constructor(
    private pharmacyService: pharmacyService,
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService,
    private invoiceServic: invoiceService,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    this.getAllSales();
    if (localStorage.getItem('pharmacyId')) {
      this.selectedPharmacies = Number(localStorage.getItem('pharmacyId'));
      this.display = true;
      this.getAdress();
    } else if (this.WaitingPharmacyClient) {
      this.selectedPharmacies = this.WaitingPharmacyClient;
      this.display = true;
      this.getAdress();
    }
    if (localStorage.getItem('noProduct')) {
      if (Number(localStorage.getItem('noProduct')) == 0) {
        this.pharmaciesDropdown.disabled = true;
      }
    }
    this.sales = this.auth.getUser();
    this.clientDataForm = this.fb.group({
      pharmacy_id: [''],
      note: [''],
    });
  }

  displayData() {
    if (this.selectedPharmacies) {
      this.display = true;
    } else {
      this.display = false;
    }
  }
  @ViewChild('clientNoteModel') clientNoteModel!: ElementRef<HTMLElement>;

  @ViewChild('closeNoteModal') closeNoteModal!: ElementRef<HTMLElement>;

  // openNoteModel() {
  //   let el: HTMLElement = this.clientNoteModel.nativeElement;
  //   el.click();

  //   setTimeout(() => {
  //     this.closeNoteModal.nativeElement.focus();
  //   }, 800);
  // }
  pharmacy_note: string = '';

  getAdress() {
    if (!this.invoiceServic.getInvoiceCart()) {
      let id = Number(this.selectedPharmacies);
      if (this.selectedPharmacies) {
        localStorage.setItem('pharmacyId', this.selectedPharmacies);

        if (this.pharmacies) {
          const index = this.pharmacies.findIndex((c) => c.id == id);
          if (index > -1) {
            this.trackName = this.pharmacies[index]?.track?.name;
            console.log(this.pharmacies[index], 'pharamcy');
            this.trackId = this.pharmacies[index]?.track?.id;
            this.shiftId = this.pharmacies[index]?.track?.shifts[0]?.id;
            this.cityId = this.pharmacies[index]?.city?.id;
            console.log(this.orderDetails, 'orderDetails');

            this.selectedSales = this.orderDetails?.sales
              ? this.orderDetails?.sales
              : this.pharmacies[index]?.current_sales?.id;
            this.areaId = this.pharmacies[index]?.area?.id;
            this.discount_tier_id = this.pharmacies[index].discount_tier?.id
              ? this.pharmacies[index].discount_tier?.id
              : '';

            // if (this.pharmacies[index].note) {
            //   this.emitInvoiceData(
            //     this.pharmacies[index].note,
            //     'openNoteModel'
            //   );
            // }

            this.invoiceData.pharmaciesAdress = this.pharmacies[index]?.address;
            this.invoiceData.payment_type =
              this.pharmacies[index]?.payment_type?.name;
            this.checkTimePeriod();

            this.debtLimit = this.pharmacies[index].debt_limit;
            this.remainingDebitLimit =
              this.pharmacies[index].remaining_debt_limit;

            if (
              this.pharmacies[index].phone_number &&
              this.pharmacies[index].optional_phone_number
            ) {
              this.invoiceData.phone_number =
                this.pharmacies[index].phone_number +
                ' / ' +
                this.pharmacies[index].optional_phone_number;
            } else {
              this.invoiceData.phone_number =
                this.pharmacies[index].phone_number;
            }
            this.invoiceData.track = this.pharmacies[index].track;
            this.shiftString = this.invoiceData?.track?.shifts[0]
              ? ' من الساعه  ' +
                this.invoiceData?.track?.shifts[0]?.order_from +
                ' الى الساعه ' +
                this.invoiceData?.track?.shifts[0]?.order_to
              : ' ';
          }
        }
      } else {
        this.debtLimit = 0;
        this.remainingDebitLimit = 0;
        this.invoiceData.payment_type = '';
      }
    } else {
      localStorage.setItem('pharmacyId', this.selectedPharmacies);
      console.log(this.invoiceCart, 'pharmacy_id');
      this.trackName = this.invoiceCart.track.name;
      this.trackId = this.invoiceCart.track.id;
      this.shiftId = this.invoiceCart.shift.id;
      this.cityId = this.invoiceCart.city.id;
      this.areaId = this.invoiceCart.area.id;
      this.discount_tier_id = this.invoiceCart.pharmacy.discount_tier?.id;
      this.invoiceData.pharmaciesAdress = this.invoiceCart.pharmacy.address;
      this.invoiceData.payment_type =
        this.invoiceCart.pharmacy?.payment_type?.name;
      this.debtLimit = this.invoiceCart.pharmacy?.debt_limit;
      this.remainingDebitLimit =
        this.invoiceCart.pharmacy?.remaining_debt_limit;
      console.log(this.orderDetails, 'orderDetails');
      this.selectedSales = this.orderDetails?.sales
        ? this.orderDetails?.sales
        : this.invoiceCart?.pharmacy?.current_sales.id;

      if (this.invoiceCart.note) {
        this.clientDataForm.controls['note'].setValue(this.invoiceCart.note);
      }

      if (
        this.invoiceCart.pharmacy?.phone_number &&
        this.invoiceCart.pharmacy?.optional_phone_number
      ) {
        this.invoiceData.phone_number =
          this.invoiceCart.pharmacy?.phone_number +
          ' / ' +
          this.invoiceCart.pharmacy?.optional_phone_number;
      } else {
        this.invoiceData.phone_number = this.invoiceCart.pharmacy.phone_number;
      }
      this.invoiceData.track = this.invoiceCart?.track;
      this.invoiceData.shift = this.invoiceCart?.shift;

      this.shiftString = this.invoiceData?.shift
        ? ' من الساعه  ' +
          this.invoiceData.shift?.order_from +
          ' الى الساعه ' +
          this.invoiceData.shift?.order_to
        : '';
    }
  }
  shiftString: any;
  getAllSales() {
    this.subs.add(
      this.generalService.getUsers().subscribe({
        next: (res) => {
          this.allSales = res.data;
        },
      })
    );
  }
  invoiceCart: cart = {} as cart;
  ngOnChanges(changes: SimpleChanges) {
    if (this.invoiceServic.getInvoiceCart()) {
      this.invoiceCart = this.invoiceServic.getInvoiceCart();
      setTimeout(() => {
        this.selectedPharmacies = this.invoiceCart.pharmacy.id;
        this.display = true;
        this.getAdress();
        this.addPharmacieId(
          this.invoiceCart.pharmacy.id,
          this.invoiceCart.track.id,
          this.invoiceCart.shift.id,
          this.invoiceCart.city.id,
          this.invoiceCart.area.id,
          this.invoiceCart.pharmacy.discount_tier?.id
        );
        this.disablepharmaciesDropdown();
      }, 1000);
    }
    if (changes['openPharmaciesDropdown']) {
      if (!this.invoiceServic.getInvoiceCart()) {
        this.onEnterPharmacies();
      }
    }
    if (changes['disablePharmaciesDropdown']) {
      if (this.disablePharmaciesDropdown == true) {
        this.disablepharmaciesDropdown();
      } else {
        this.enablepharmaciesDropdown();
      }
    }

    if (changes['orderDetails']) {
      console.log(this.orderDetails, 'orderDetails');
      if (this.orderDetails?.note) {
        this.pharmacy_note = String(this.orderDetails?.note);
        this.clientDataForm.controls['note'].setValue(this.orderDetails?.note);
      }

      if (this.orderDetails?.sales) {
        this.selectedSales = this.orderDetails?.sales;
      }

      if (this.orderDetails?.shipping_type) {
        this.shippingType = this.orderDetails?.shipping_type === 1;
      }
    }

    if (changes['client']) {
      this.displayClient = this.client;
      if (this.displayClient) {
        console.log(this.displayClient);
        this.display = false;
        this.debtLimit = this.displayClient.debt_limit;
        this.remainingDebitLimit = this.displayClient.remaining_debt_limit;
        this.pharmacies = this.displayClient.pharmacies;

        setTimeout(() => {
          if (localStorage.getItem('pharmacyId')) {
            // this.getPharmacies(this.displayClient.id);
            this.selectedPharmacies = Number(
              localStorage.getItem('pharmacyId')
            );
            this.display = true;
            if (localStorage.getItem('noProduct') == '0') {
              setTimeout(() => {
                this.pharmaciesDropdown.disabled = true;
              }, 100);
            }
            this.getAdress();
            this.emitInvoiceData(true, 'openProdcytDropdown');
            this.addPharmacieId(
              this.selectedPharmacies,
              this.trackId,
              this.shiftId,
              this.cityId,
              this.areaId,
              this.discount_tier_id
            );
          } else if (this.displayClient.pharmacies.length > 1) {
            this.onePharmacies = false;
            this.selectedPharmacies = null;
          } else {
            this.selectedPharmacies = this.pharmacies[0].id;
            this.getAdress();
            this.display = true;
            this.addPharmacieId(
              this.selectedPharmacies,
              this.trackId,
              this.shiftId,
              this.cityId,
              this.areaId,
              this.discount_tier_id
            );
            this.emitInvoiceData(true, 'openProdcytDropdown');
          }
        }, 300);
      }
    }
  }
  addPharmacieId(
    PharmacyId: number,
    trackId: number,
    shiftId: number,
    cityId: number,
    areaId: number,
    discount_tier_id: number
  ) {
    if (
      PharmacyId &&
      !this.invoiceServic.getInvoiceCart() &&
      !this.disablePharmaciesDropdown
    ) {
      this.pharmacyService.setPharmacyID(PharmacyId);

      this.addPharmacieEvent.emit({
        PharmacyId: PharmacyId,
        trackId: trackId,
        shiftId: shiftId,
        cityId: cityId,
        areaId: areaId,
        pharmacy_note: this.pharmacy_note,
        discount_tier_id: discount_tier_id,
      });
    }
  }
  emitInvoiceData(data: any, type: string) {
    if (type == 'note') {
      this.addNoteEvent.emit(data);
    } else if (type == 'sales') {
      this.addSalesEvent.emit(data);
    } else if (type == 'shippingType') {
      this.addShippingTypeEvent.emit(data);
    } else if (type == 'openProdcytDropdown') {
      this.openProductsDropdown.emit(data);
    } else if (type == 'openNoteModel') {
      this.openNoteModel.emit(data);
    }

    console.log(data);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  @ViewChild('InvoiceModal') private pharmaciesDropdown!: Dropdown;
  onEnterPharmacies() {
    if (!this.invoiceServic.getInvoiceCart()) {
      this.pharmaciesDropdown?.focus();
    } else {
      this.pharmaciesDropdown.disabled = true;
    }
  }
  disablepharmaciesDropdown() {
    if (this.pharmaciesDropdown) this.pharmaciesDropdown.disabled = true;
    this.emitInvoiceData(true, 'openProdcytDropdown');
  }
  enablepharmaciesDropdown() {
    if (this.pharmaciesDropdown) this.pharmaciesDropdown.disabled = false;
  }

  onDropdownLoad(event: any) {
    if (this.onePharmacies) {
      this.pharmaciesDropdown.value = this.pharmacies[0];
    }
  }

  onDropdownKeydown(event: any, dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.displayData();
      this.getAdress();
      this.addPharmacieId(
        this.selectedPharmacies,
        this.trackId,
        this.shiftId,
        this.cityId,
        this.areaId,
        this.discount_tier_id
      );
      this.emitInvoiceData(true, 'openProdcytDropdown');
      dropdown?.close();
    }
  }

  // getPharmacies(client_id: number) {
  //   let all_params = {
  //     id: client_id,
  //   };
  //   this.subs.add(
  //     this.http.getReq('clients/view', { params: all_params }).subscribe({
  //       next: (res) => {
  //         this.pharmacies = res.data.pharmacies;
  //       },
  //       complete: () => {
  //
  //       },
  //     })
  //   );
  // }

  timePeriod: any;
  checkTimePeriod(): void {
    const currentTime = new Date();
    const hours = currentTime.getHours();

    if (hours >= 0 && hours < 12) {
      this.timePeriod = 0;
    } else {
      this.timePeriod = 1;
    }
  }
}
