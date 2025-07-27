import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { ToggleModal } from '@services/toggleModal.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { QRCodeStickerComponent } from '@modules/QR-code-sticker/QR-code-sticker.component';
import { PharmacyInvoiceTemplateComponent } from '@modules/pharmacy-invoice-template/pharmacy-invoice-template.component';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-products-reviewer',
  templateUrl: './products-reviewer.component.html',
  styleUrls: ['./products-reviewer.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ProductsReviewerComponent implements OnInit, OnDestroy {
  // barcode scanning
  barcodeInput1: string = '';
  lastKeypressTime: number = 0;
  scanBuffer: string = '';
  @ViewChild('barCode') barCode!: ElementRef;

  clearFocusedInputIfNotBarcode() {
    // Get the currently focused element
    const focusedElement = document.activeElement;

    // Check if the focused element is an input and its ID is not 'barcode'
    if (
      focusedElement &&
      focusedElement.tagName === 'INPUT' &&
      focusedElement.id !== 'barcode'
    ) {
      // Cast the element to an HTMLInputElement to access value property
      (focusedElement as HTMLInputElement).value = '';
    }
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    // Prevent the default behavior to avoid double handling

    if (event.key !== 'Enter') {
      const now = Date.now();
      if (now - this.lastKeypressTime > 20) {
        // Reset the buffer if the delay between key presses is too long
        this.scanBuffer = '';
      } else {
        this.clearFocusedInputIfNotBarcode();
        this.blurAllInputs();
        this.barCode.nativeElement.focus();
      }

      this.scanBuffer += event.key;
      this.lastKeypressTime = now;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    let isFocused = document.activeElement === this.quatityInput?.nativeElement;
    if (event.key == 'Enter' && isFocused) {
      this.confirmBtn.nativeElement.click();
    } else if (event.key === 'Enter') {
      if (Date.now() - this.lastKeypressTime < 25) {
        this.processBarcode(this.scanBuffer);
        this.scanBuffer = '';
      } else {
      }
      this.lastKeypressTime = 0;
    }
  }

  processBarcode(barcode: string) {
    // Processing logic for barcod
    this.checkBarcodeExist(barcode);
    this.barcodeInput1 = barcode;
  }

  previousFocusedInput!: HTMLInputElement;
  onFocus(event: FocusEvent) {
    this.previousFocusedInput = event.target as HTMLInputElement;
  }

  goToNext(element: any, event: any) {
    const next = document.getElementById(element) as HTMLElement;
    if (next) {
      event.preventDefault();
      next.focus();
    }
  }

  warehouseFilter!: FormGroup;
  invoiceData: any = [];
  notReviewed: any = [];
  reviewed: any = [];
  invoiceId: any;
  productCode!: FormGroup;
  hideInvoiceDetails = true;
  private subs = new Subscription();
  pharmacies: any = [];
  editOrder!: FormGroup;
  baskets: any = [];
  data: any = [];
  allData: any;
  allProducts: any = [];
  editBarcode!: FormGroup;
  packagingData!: FormGroup;
  reviewedOrderData: any = [
    { bags_num: 0 },
    { cartons_num: 0 },
    { fridges_num: 0 },
    { invoices_num: 0 },
  ];

  isActiveTapArray: boolean[] = Array(3).fill(false);

  elementRef: any;
  containsBulk: boolean;
  permissions: any = [];
  order_number: any;
  created_at: any;
  pharmacyName_id: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private auth: AuthService,
    public toggleModal: ToggleModal,
    private http: HttpService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private generalService: GeneralService
  ) {
    this.containsBulk = this.activeRoute.snapshot.url
      .join('/')
      .includes('bulk');
  }

  selectedType: any;
  barcodeBuffer: string = '';
  scanned: any = false;

  firsttime = true;
  lastKeyPressTime = 0;
  tempVal = '';

  lastKeyValue = '';
  normalTyping = false;
  activateAdd(event: any) {
    this.confirmBtn.nativeElement?.focus();
    event.preventDefault();
  }

  // @HostListener('document:keydown', [ '$event' ])
  // handleKeyDown(event: KeyboardEvent) {
  //   const currentTime = new Date().getTime();
  //   let isFocused = document.activeElement === this.quatityInput?.nativeElement;
  //   if (event.key == 'Enter' && isFocused) {

  //     this.confirmBtn.nativeElement.click()
  //   }
  //   else {
  //     if (event.key == 'Enter') {
  //       if (this.barcodeBuffer.length > 0) {

  //         this.barcodeBuffer = this.removeNonNumericChars(this.barcodeBuffer)
  //         this.checkBarcodeExist(this.barcodeBuffer)
  //         this.barcodeBuffer = ''
  //         this.firsttime = true
  //         this.barCode.nativeElement.focus();
  //         this.normalTyping = false;
  //       }

  //     }
  //     else if (/^\d$/.test(event.key) && (currentTime - this.lastKeyPressTime < 25 || this.lastKeyPressTime == 0 && !this.firsttime)) {
  //       this.firsttime = false;
  //       this.blurAllInputs()
  //       this.quatityInput.nativeElement?.blur();
  //       this.barCode.nativeElement.focus();
  //       if (this.normalTyping) {
  //         const inputValue = this.previousFocusedInput?.value;
  //         if (inputValue && inputValue?.length > 0) {
  //           this.previousFocusedInput.value = inputValue.slice(0, -1);
  //         }
  //         this.barcodeBuffer += this.lastKeyValue
  //       };

  //       this.normalTyping = false;
  //       this.barcodeBuffer += event.key
  //       let time = currentTime - this.lastKeyPressTime
  //       this.lastKeyPressTime = currentTime;

  //     } else {
  //       this.lastKeyPressTime = currentTime;
  //       this.normalTyping = true;

  //     }

  //   }

  //   this.lastKeyValue = event.key;

  // }

  // removeNonNumericChars(inputString: string) {
  //   return inputString.replace(/[^0-9]/g, '');
  // }

  blurAllInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => this.renderer.selectRootElement(input).blur());
  }

  multiple_corridors_enabled!: string;
  ngOnInit(): void {
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
      if (this.multiple_corridors_enabled == 'false') {
        const location_index_name = this.columnsName.findIndex(
          (c: any) => c.name == 'location'
        );
        const location_index_array = this.columnsArray.findIndex(
          (c: any) => c.name == 'موقع الصنف'
        );
        if (location_index_name > -1) {
          this.columnsName.splice(location_index_name, 1);
        }
        if (location_index_array > -1) {
          this.columnsArray.splice(location_index_array, 1);
        }
      }
    }
    this.invoiceId = String(this.activeRoute.snapshot.paramMap.get('id'));
    this.permissions = this.auth.getUserPermissions();

    this.activeRoute.params.subscribe((params) => {
      const id = params['id'];
      const type = params['type'];

      if (id) {
        this.selectedType = true;
      } else if (type) {
        this.selectedType = false;
      }
    });

    this.getData();
    this.productCode = this.fb.group({
      price: [''],
      barcode: [''],
      quantity: [''],
      batch_id: [''],
      cart_id: [''],
    });

    this.packagingData = this.fb.group({
      bags_num: [''],
      cartons_num: [''],
      fridges_num: [''],
      invoices_num: [''],
    });
    this.warehouseFilter = this.fb.group({
      invoice_number: [''],
      invoice_id: [''],
      created_at: [''],
      pharmacy_id: [''],
      basket_number: [''],
      auditor_name: [''],
    });

    this.editOrder = this.fb.group({
      product_name: [''],
      batch_id: [''],
      cart_id: [''],
      expired_at: ['', Validators.required],
      operating_number: ['', Validators.required],
      order_quantity: [''],
    });
    this.editBarcode = this.fb.group({
      barcode: [''],
      product_id: [''],
    });

    if (this.invoiceId != 'null') {
      this.hideInvoiceDetails = false;
      this.filter();
    }
    this.isActiveTapArray[0] = true;
  }

  columnsArray: columnHeaders[] = [
    {
      name: '',
    },
    {
      name: 'موقع الصنف',
    },
    {
      name: ' اسم الصنف',
    },
    {
      name: 'الشركة المصنعه',
    },
    {
      name: '  الكمية',
    },
    {
      name: 'السعر',
    },

    {
      name: 'التاريخ والتشغيلة',
    },
    {
      name: 'أمر',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'check',
      type: 'rewiewStatusCheckbox',
    },
    {
      name: 'location',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'productNavName',
    },
    {
      name: 'company',
      type: 'normal',
    },
    {
      name: 'order_quantity',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'highlight_price',
    },
    {
      name: 'expired_at',
      type: 'normal',
    },
    {
      name: 'order',
      type: 'modifyBatch',
    },
  ];

  allInvoiceProducts: any = [];
  order_id: any;
  reviewed_index: any = 0;
  notReviewed_index: any = 0;
  indexOfHighlight: number = 0;
  disableFilterBtn: boolean = false;
  filter() {
    this.disableFilterBtn = true;
    let Data: any;
    if (!this.invoiceId) {
      this.disableBtn();
    }
    if (this.invoiceId != 'null') {
      this.warehouseFilter.controls['invoice_id'].setValue(this.invoiceId);
    } else {
      this.warehouseFilter.removeControl('invoice_id');
    }
    if (this.warehouseFilter.controls['invoice_number'].value) {
      this.invoiceId = 'null';
      this.warehouseFilter.removeControl('invoice_id');
    }
    let addParams = false;
    let params: any = {};
    for (const key in this.warehouseFilter.value) {
      const value = this.warehouseFilter.value[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key == 'created_at') {
          params[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          params[key] = value;
        }
        addParams = true;
      }
    }
    let url: string = '';
    if (this.containsBulk && this.permissions.includes('bulk_reviewer')) {
      url = 'warehouses/orders/bulk/view-prepared';
    } else if (
      !this.containsBulk &&
      this.permissions.includes('retail_reviewer')
    ) {
      url = 'warehouses/orders/retail/view-preparing';
    }
    this.subs.add(
      this.http.getReq(url, { params: params }).subscribe({
        next: (res) => {
          this.invoiceData = [];
          this.reviewed = [];
          this.allInvoiceProducts = [];
          Data = res?.status_code;
          this.order_id = res.data.id;
          this.allData = res?.data;

          this.warehouseFilter.controls['invoice_number'].setValue(
            res.data.order_number
          );
          this.warehouseFilter.controls['invoice_number'].disable();

          this.warehouseFilter.controls['pharmacy_id'].setValue(
            res.data.pharmacy.id
          );
          this.warehouseFilter.controls['pharmacy_id'].disable();
          // if (this.warehouseFilter.controls[ 'basket_number' ].value && !this.warehouseFilter.controls[ 'created_at' ].value) {
          let date = new Date(res.data.closed_at);
          this.warehouseFilter.controls['created_at'].setValue(date);
          // }

          this.warehouseFilter.controls['created_at'].disable();

          this.allInvoiceProducts = [];
          this.allProducts = [];
          this.reviewed = [];
          this.notReviewed = [];
          this.notReviewed_index = 0;
          this.reviewed_index = 0;
          this.indexOfHighlight = 0;
          res?.data?.cart?.forEach((cart: any, index: number) => {
            if (this.allInvoiceProducts.length > 0) {
              if (
                this.allInvoiceProducts[this.allInvoiceProducts.length - 1]
                  .product_id != cart.product_id
              ) {
                this.indexOfHighlight = 0;
              } else {
                this.indexOfHighlight++;
              }
            } else {
              this.indexOfHighlight++;
            }
            this.allInvoiceProducts.push({
              name: cart.product_name,
              location: cart.location,
              company: cart.manufacturer_name,
              order_quantity: cart.quantity + cart.bonus,
              price: cart.price,
              expired_at: cart?.expired_at + ' ' + cart?.operating_number,
              order: 'تعديل التشغيلة',
              check: true,
              completed_at:
                cart.status.value == 2 || cart.status.valuee == 3
                  ? true
                  : false,
              Product_id: cart.product_id,
              batch_id: cart.batch_id,
              cart_id: cart.cart_id,
              expired_At: cart.expired_at,
              product_name: cart.product_name,
              operating_number: cart?.operating_number,
              reviewed: cart?.inventoried,
              indexOfHighlight: this.indexOfHighlight,
              price_color: cart.price_color,
              no_operation: true,
            });
            this.allProducts.push({
              Product_id: cart.product_id,
              price: cart.price,
              quantity: cart.quantity + cart?.bonus,
              barcode: cart?.product_barcode,
              batch_id: cart.batch_id,
              cart_id: cart.cart_id,
              name: cart.product_name,
              expired_at: cart.expired_at,
              operating_number: cart?.operating_number,
              order_quantity: cart.quantity + cart.bonus,
              price_color: cart.price_color,
            });
            if (cart.inventoried == true) {
              if (this.reviewed.length > 0) {
                if (
                  this.reviewed[this.reviewed.length - 1].product_id !=
                  cart.product_id
                ) {
                  this.reviewed_index = 0;
                } else {
                  this.reviewed_index++;
                }
              } else {
                this.reviewed_index++;
              }
              this.reviewed.push({
                name: cart.product_name,
                location: cart.location,
                company: cart.manufacturer_name,
                order_quantity: cart.quantity + cart.bonus,
                price: cart?.price,
                expired_at: cart?.expired_at + ' ' + cart?.operating_number,
                order: 'تعديل التشغيلة',
                check: true,
                completed_at:
                  cart.status.value == 2 || cart.status.value == 3
                    ? true
                    : false,
                Product_id: cart.product_id,
                batch_id: cart.batch_id,
                cart_id: cart.id,
                expired_At: cart.expired_at,
                product_name: cart.product_name,
                operating_number: cart?.operating_number,
                reviewed: cart?.inventoried,
                barcode: cart.product_barcode,
                indexOfHighlight: this.reviewed_index,
                // 'cart_batch_id': batches.batch_info.cart_batch_id,
                price_color: cart.price_color,
                no_operation: true,
              });
            } else {
              if (this.notReviewed.length > 0) {
                if (
                  this.notReviewed[this.notReviewed.length - 1].product_id !=
                  cart.product_id
                ) {
                  this.notReviewed_index = 0;
                } else {
                  this.notReviewed_index++;
                }
              } else {
                this.notReviewed_index++;
              }
              this.notReviewed.push({
                name: cart.product_name,
                location: cart.location,
                company: cart.manufacturer_name,
                order_quantity: cart?.quantity + cart?.bonus,
                price: cart.price,
                expired_at: cart?.expired_at + ' ' + cart?.operating_number,
                order: 'تعديل التشغيلة',
                check: true,
                completed_at:
                  cart.status.value == 2 || cart.status.value == 3
                    ? true
                    : false,
                Product_id: cart.product_id,
                batch_id: cart.batch_id,
                cart_id: cart.cart_id,
                expired_At: cart.expired_at,
                product_name: cart.product_name,
                operating_number: cart?.operating_number,
                reviewed: cart?.inventoried,
                barcode: cart?.product_barcode,
                indexOfHighlight: this.notReviewed_index,
                // 'cart_batch_id': batches.batch_info.cart_batch_id,
                price_color: cart.price_color,
                no_operation: false,
              });
            }
          });
          this.baskets = [];
          res?.additional_data.baskets?.forEach((basket: any) => {
            this.baskets.push({
              number: basket?.number,
            });
          });
        },
        complete: () => {
          this.disableFilterBtn = false;
          this.changeActiveTab(0);
          if (Data != 400) {
            this.hideInvoiceDetails = false;
          }
        },
        error: (error) => {
          this.disableFilterBtn = false;
          if (error.status_code == 400) {
            this.hideInvoiceDetails = true;
          }
        },
      })
    );
  }

  @ViewChild('filterBtn') filterBtn!: ElementRef<HTMLElement>;
  disableBtn() {
    let el: HTMLElement = this.filterBtn.nativeElement;
    el.setAttribute('disabled', 'true');
    setTimeout(() => {
      el.removeAttribute('disabled');
    }, 3000);
  }
  @ViewChild('confirmBtn') confirmBtn!: ElementRef<HTMLElement>;
  disableConfirmBtn() {
    let el: HTMLElement = this.confirmBtn.nativeElement;
    el.setAttribute('disabled', 'true');
    setTimeout(() => {
      el.removeAttribute('disabled');
    }, 3000);
  }
  formDataPayLoad = new FormData();

  getData() {
    let tempArr: any = ['pharmacies'];

    this.generalService.getDropdownData(tempArr).subscribe({
      next: (res) => {
        this.pharmacies = res.data.pharmacies;
      },
    });

    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          res.data.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.pharmacies.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
              });
            });
          });
        },
      })
    );
  }

  changeActiveTab(index: any) {
    this.isActiveTapArray.fill(false);
    this.isActiveTapArray[index] = true;
    if (index == 0) {
      this.data = this.notReviewed;
    } else if (index == 1) {
      this.data = this.allInvoiceProducts;
    } else {
      this.data = this.reviewed;
    }
  }
  showModal(data: any) {
    this.toggleModal.showModal = true;
  }
  PharmacyinvoiceData!: any;
  urlToInvoice: any;
  @ViewChild('openConfirmation1Model')
  openConfirmation1Model!: ElementRef<HTMLElement>;
  @ViewChild('openConfirmation2Model')
  openConfirmation2Model!: ElementRef<HTMLElement>;
  refreshPage: any = false;
  qrCodeData: any;
  serializedQrCodeData: any;
  finalizeAndPrint() {
    console.log(this.packagingData.value);
    if (
      this.packagingData.controls['bags_num'].value &&
      this.packagingData.controls['bags_num'].value != null
    ) {
      this.reviewedOrderData[0].bags_num = Number(
        this.packagingData.controls['bags_num'].value
      );
    } else {
      this.reviewedOrderData[0].bags_num = null;
    }

    if (
      this.packagingData.controls['cartons_num'].value &&
      this.packagingData.controls['cartons_num'].value != null
    ) {
      this.reviewedOrderData[0].cartons_num = Number(
        this.packagingData.controls['cartons_num'].value
      );
    } else {
      this.reviewedOrderData[0].cartons_num = null;
    }

    if (
      this.packagingData.controls['fridges_num'].value &&
      this.packagingData.controls['fridges_num'].value != null
    ) {
      this.reviewedOrderData[0].fridges_num = Number(
        this.packagingData.controls['fridges_num'].value
      );
    } else {
      this.reviewedOrderData[0].fridges_num = null;
    }

    if (
      this.packagingData.controls['invoices_num'].value &&
      this.packagingData.controls['invoices_num'].value != null
    ) {
      this.reviewedOrderData[0].invoices_num =
        this.packagingData.controls['invoices_num'].value;
    } else {
      this.reviewedOrderData[0].invoices_num = null;
    }

    let non_inventoried_batches_ids: any = [];

    if (this.notReviewed.length > 0) {
      this.notReviewed.forEach((element: any) => {
        non_inventoried_batches_ids.push(element.batch_id);
      });
    }

    let params = {
      packaging: this.reviewedOrderData[0],
      // non_inventoried_batches_ids: non_inventoried_batches_ids,
      order_id: this.order_id,
      bulk: this.containsBulk,
    };
    this.subs.add(
      this.http
        .postReq('warehouses/orders/complete-inventorying', params)
        .subscribe({
          next: (res) => {
            this.PharmacyinvoiceData = res;

            // if (this.PharmacyinvoiceData.data.client.type_value == 1) {
            //   const serializedPharmacyInvoiceData = JSON.stringify(this.PharmacyinvoiceData);
            //   localStorage.setItem('PharmacyInvoiceData', serializedPharmacyInvoiceData);
            // }
            // else if (this.PharmacyinvoiceData.data.client.type_value == 0) {
            const serializedPharmacyInvoiceData = JSON.stringify(
              this.PharmacyinvoiceData
            );
            localStorage.setItem(
              'PharmacyInvoiceData',
              serializedPharmacyInvoiceData
            );
            // }
            this.qrCodeData = {
              invoice_id: this.order_id,
              bags_num: this.PharmacyinvoiceData.data?.invoice?.bags_num,
              fridges_num: this.PharmacyinvoiceData.data?.invoice?.fridges_num,
              cartons_num: this.PharmacyinvoiceData.data?.invoice?.cartons_num,
              total: this.PharmacyinvoiceData.data?.invoice?.total,
              track_number: this.PharmacyinvoiceData.data?.pharmacy?.track?.id,
              city_name: this.PharmacyinvoiceData.data?.pharmacy?.city?.name,
              phone_number:
                this.PharmacyinvoiceData.data?.pharmacy?.phone_number,
              optional_phone_number:
                this.PharmacyinvoiceData.data?.pharmacy?.optional_phone_number,
              client_name: this.PharmacyinvoiceData.data?.client?.name,
              pharmacy_name: this.PharmacyinvoiceData.data?.pharmacy?.name,
              address: this.PharmacyinvoiceData.data?.pharmacy?.address,
            };
            this.serializedQrCodeData = encodeURIComponent(
              JSON.stringify(this.qrCodeData)
            );
          },
          complete: () => {
            if (!this.containsBulk) {
              const urlTreeQRCode = this.router.createUrlTree(
                ['ToPrint/QR-code-sticker'],
                {
                  queryParams: {
                    qrCodeData: this.serializedQrCodeData,
                    shouldPrint: 'true',
                    type: 'SingleProductReviewer',
                  },
                }
              );
              const urlToQrCode = this.router.serializeUrl(urlTreeQRCode);
              window.open(urlToQrCode, '_blank');
            } else if (this.containsBulk) {
              const urlTreeSalesInvoice = this.router.createUrlTree(
                ['ToPrint/sales-invoice'],
                { queryParams: { shouldPrint: 'true' } }
              );
              const urlTreePharmacyInvoice = this.router.createUrlTree(
                ['ToPrint/pharmacy-invoice'],
                { queryParams: { shouldPrint: 'true' } }
              );

              if (this.PharmacyinvoiceData.data.client.type_value == 1) {
                this.urlToInvoice = this.router.serializeUrl(
                  urlTreePharmacyInvoice
                );
              } else if (this.PharmacyinvoiceData.data.client.type_value == 0) {
                this.urlToInvoice =
                  this.router.serializeUrl(urlTreeSalesInvoice);
              }
              setTimeout(() => {
                window.open(this.urlToInvoice, '_blank');
              }, 400);
            }

            setTimeout(() => {
              if (!this.containsBulk) {
                this.router.navigate([
                  '/warehouse/products-sales-reviewer/single-preparing-list',
                ]);
              } else {
                this.router.navigate([
                  '/warehouse/products-sales-reviewer/bulk-preparing-list',
                ]);
              }
            }, 1000);

            setTimeout(() => {
              this.closeFinalConfirm();
            }, 1500);
          },
          // , error: () => {
          //   this.closeFinalConfirm()
          // }
        })
    );
  }

  closeFinalConfirm() {
    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    confirmation1Model.click();
  }
  openConfirmPopup() {
    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    let confirmation2Model: HTMLElement =
      this.openConfirmation2Model.nativeElement;
    if (this.notReviewed.length > 0) {
      confirmation2Model.click();
    } else {
      this.openFinalConfirmation();
    }
  }
  openFinalConfirmation() {
    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    confirmation1Model.click();
  }

  @ViewChild('openEditConfigrations')
  openEditConfigrations!: ElementRef<HTMLElement>;

  @ViewChild('openEditBarcode') openEditBarcode!: ElementRef<HTMLElement>;
  openCloseBarcode() {
    this.barcodeBuffer = '';
    this.productCode.controls['barcode'].setValue('');
    let openEditBarcode: HTMLElement = this.openEditBarcode.nativeElement;
    openEditBarcode.click();
  }

  @ViewChild('quatityInput') private quatityInput!: ElementRef;
  activateQuatity() {
    this.quatityInput.nativeElement?.focus();
  }

  openEditOperationModel(data: any) {
    if (this.isActiveTapArray[0]) {
      this.editOrder.patchValue(data);
      this.editOrder.controls['expired_at'].setValue(
        datePipe.transform(data.expired_At, 'yyyy-MM')
      );
      this.editOrder.controls['order_quantity'].setValue(data.order_quantity);
      const index = this.data.findIndex(
        (c: any) => c.batch_id == data.batch_id
      );
      if (index > -1) {
        this.editOrder.controls['product_name'].setValue(
          this.allProducts[index].name
        );
        this.editOrder.controls['expired_at'].setValue(
          datePipe.transform(this.allProducts[index].expired_at, 'yyyy-MM')
        );
        this.editOrder.controls['operating_number'].setValue(
          this.allProducts[index].operating_number
        );
      }
      setTimeout(() => {
        let editConfigrationBtn: HTMLElement =
          this.openEditConfigrations.nativeElement;
        editConfigrationBtn.click();
      }, 400);
    }
  }
  activeProductId: any;
  setProductData(Productdata: any) {
    if (this.isActiveTapArray[0]) {
      const indexProductId = this.allProducts.findIndex(
        (c: any) => c.Product_id == Productdata.product_id
      );
      this.activeProductId = Productdata.batch_id;
      this.ProductId = Productdata.product_id;

      this.productCode.controls['batch_id'].setValue(Productdata.batch_id);
      if (indexProductId > -1) {
        this.ProductId = this.allProducts[indexProductId].product_id;
        this.productCode.controls['price'].setValue(
          this.allProducts[indexProductId].price
        );
        this.productCode.controls['cart_id'].setValue(
          this.allProducts[indexProductId].cart_id
        );
        this.productCode.controls['barcode'].setValue(
          this.allProducts[indexProductId].barcode
        );
        this.activateQuatity();
      }
    }
  }
  @ViewChild('barcodeInput', { read: ElementRef }) barcodeInput!: ElementRef;
  ProductId: any;
  productQuantity: any;

  handleBarcodeScan(scannedData: any) {
    this.barcodeBuffer = '';
    this.productCode.controls['barcode'].setValue('');
    this.productCode.controls['quantity'].setValue('');
    this.productCode.controls['barcode'].setValue(scannedData);

    for (let i = 0; i < this.notReviewed.length; i++) {
      const element = this.notReviewed[i];

      if (element.barcode == scannedData) {
        this.ProductId = element.Product_id;
        this.activeProductId = null;
        this.productCode.controls['batch_id'].setValue(element.batch_id);
        this.productCode.controls['price'].setValue(element.price);
        this.productCode.controls['cart_id'].setValue(element.cart_id);
        this.productCode.controls['barcode'].setValue(element.barcode);
        break;
      }
    }
    setTimeout(() => {
      this.activateQuatity();
    }, 50);
  }
  scannedProduct: any;
  barcodeFocus() {
    this.barCode.nativeElement.focus();
  }
  checkBarcodeExist(scannedData: any) {
    this.barcodeFocus();
    let param = {};
    param = {
      barcode: scannedData,
      order_id: this.order_id,
    };
    this.subs.add(
      this.http
        .getReq('products/view-by-barcode', { params: param })
        .subscribe({
          next: (res) => {
            this.scannedProduct = res.data;
            this.toastr.info(res.message);
          },
          complete: () => {
            if (this.scannedProduct.length != 0) {
              this.handleBarcodeScan(scannedData);
            } else {
              this.barcodeBuffer = '';
              this.productCode.controls['barcode'].setValue('');
              this.ProductId = '';
              this.getAllProducts();
              this.editBarcode.controls['barcode'].setValue(scannedData);
              setTimeout(() => {
                this.openCloseBarcode();
              }, 300);
            }
          },
        })
    );
  }

  ConfirmReviwed: any = [];
  ConfirmNotreviwed: any = [];
  confirmReview() {
    this.disableConfirmBtn();
    this.productCode.controls['quantity'].setValue(
      Number(this.productCode.controls['quantity'].value)
    );
    let addParams = false;
    let params: any = {};
    for (const key in this.productCode.value) {
      const value = this.productCode.value[key];
      if (key != 'barcode' && key != 'price') {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
          addParams = true;
        }
      }
    }
    this.subs.add(
      this.http.postReq('warehouses/orders/inventorying', params).subscribe({
        next: (res) => {
          this.ConfirmReviwed = res.data.inventoriedBatches;
          this.ConfirmNotreviwed = res.data.nonInventoriedBatches;
          this.baskets = [];
          res?.additional_data.baskets?.forEach((basket: any) => {
            this.baskets.push({
              number: basket?.number,
            });
          });
        },
        complete: () => {
          const index = this.notReviewed.findIndex(
            (row: any) =>
              row.batch_id == this.productCode.controls['batch_id'].value
          );
          if (index > -1) {
            if (
              this.notReviewed[index].order_quantity -
                this.productCode.controls['quantity'].value ==
              0
            ) {
              this.reviewed.push(this.data[index]);
              this.data.splice(index, 1);
            } else {
              const notReviwedIndex = this.notReviewed.findIndex(
                (element: any) =>
                  element.batch_id == this.ConfirmNotreviwed.batch_id
              );
              if (notReviwedIndex > -1) {
                this.reviewed.push({ ...this.notReviewed[notReviwedIndex] });
                this.reviewed[this.reviewed.length - 1].order_quantity =
                  this.ConfirmReviwed.quantity;
                this.notReviewed[notReviwedIndex].order_quantity =
                  this.ConfirmNotreviwed.quantity +
                  this.ConfirmNotreviwed.bonus;
                this.notReviewed[notReviwedIndex].cart_batch_id =
                  this.ConfirmNotreviwed.id;
              }
            }
          }

          this.notReviewed.forEach((element: any) => {
            if (element.barcode == this.productCode.controls['barcode'].value) {
              element.indexOfHighlight = element.indexOfHighlight - 1;
            }
          });

          this.activeProductId = '';
          this.productCode.reset();
          this.ProductId = '';
        },
      })
    );
  }

  changeBatchData() {
    let new_batch_id: any;
    if (this.editOrder.valid && this.editOrder.dirty) {
      let addParams = false;
      let params: any = {};
      for (const key in this.editOrder.value) {
        const value = this.editOrder.value[key];
        if (key != 'product_name') {
          if (value !== null && value !== undefined && value !== '') {
            if (key == 'expired_at') {
              params[key] = datePipe.transform(
                this.editOrder.controls['expired_at'].value,
                'yyyy-MM'
              );
            } else {
              params[key] = value;
            }
            addParams = true;
          }
        }
      }
      this.subs.add(
        this.http.postReq('warehouses/orders/duplicate', params).subscribe({
          next: (res) => {
            new_batch_id = res.data.id;
          },
          complete: () => {
            const index = this.data.findIndex(
              (row: any) =>
                row.batch_id == this.editOrder.controls['batch_id'].value
            );
            const index_allProducts = this.allProducts.findIndex(
              (row: any) =>
                row.batch_id == this.editOrder.controls['batch_id'].value
            );
            if (index > -1) {
              this.data[index].expired_at =
                datePipe.transform(
                  this.editOrder.controls['expired_at'].value,
                  'yyyy-MM'
                ) +
                ' ' +
                this.editOrder.controls['operating_number'].value;
              this.data[index].batch_id = new_batch_id;
            }
            if (index_allProducts > -1) {
              this.allProducts[index].expired_at = datePipe.transform(
                this.editOrder.controls['expired_at'].value,
                'yyyy-MM'
              );

              this.allProducts[index].operating_number =
                this.editOrder.controls['operating_number'].value;
              this.allProducts[index].batch_id = new_batch_id;
            }
            setTimeout(() => {
              let editConfigrationBtn: HTMLElement =
                this.openEditConfigrations.nativeElement;
              editConfigrationBtn.click();
            }, 400);
          },
        })
      );
    } else {
      this.editOrder.markAllAsTouched();
    }
  }
  products: any;
  changeBarecodeData() {
    let params: any = {};
    for (const key in this.editBarcode.value) {
      const value = this.editBarcode.value[key];
      if (key != 'product_id') {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      }
    }
    this.subs.add(
      this.http
        .postReq(
          `products/update/${this.editBarcode.controls['product_id'].value}`,
          params
        )
        .subscribe({
          next: (res) => {},
          complete: () => {
            const index = this.notReviewed.findIndex(
              (c: any) =>
                c.Product_id == this.editBarcode.controls['product_id'].value
            );
            if (index > -1) {
              this.notReviewed[index].barcode = String(
                this.editBarcode.controls['barcode'].value
              );
            }
            this.openCloseBarcode();
            this.barcodeBuffer = '';
            this.productCode.controls['barcode'].setValue('');
          },
        })
    );
  }
  getAllProducts() {
    this.subs.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );
  }

  downloadBoo = false;
  @ViewChild('downloadBtn') downloadBtn!: ElementRef<HTMLElement>;
  downloadPdfBtn() {
    let el: HTMLElement = this.downloadBtn.nativeElement;
    el.click();
  }

  @ViewChild('downloadSticker') downloadSticker!: ElementRef<HTMLElement>;
  @ViewChild('Sticker') Sticker!: QRCodeStickerComponent;
  @ViewChild('pharmacyInvoiceTemplate')
  pharmacyInvoiceTemplate!: PharmacyInvoiceTemplateComponent;
  PrintCount = 0;
  type = '';
  downloadStickerBoolean = false;

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
