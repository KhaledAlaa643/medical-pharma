import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { cart, cartData, order_data, totalData } from '@models/cart';
import { client } from '@models/client';
import { fixedData, offers, products, warehouses } from '@models/products';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { invoiceService } from '@services/invoice.service';
import { ToastrService } from 'ngx-toastr';
import { Dropdown } from 'primeng/dropdown';
import { pharmacyData } from '@models/pharmacie';
import { cart_number_data } from '@models/cart';
import {
  BehaviorSubject,
  Subject,
  Subscription,
  debounceTime,
  filter,
  of,
  retry,
  switchMap,
} from 'rxjs';
import { SkeletonLoadingService } from '@services/skeleton-loading.service';
import { GeneralService } from '@services/general.service';
import { commonObject } from '@models/settign-enums';

@Component({
  selector: 'app-register-request',
  templateUrl: './register-request.component.html',
  styleUrls: ['./register-request.component.scss'],
})
export class RegisterRequestComponent implements OnInit {
  private subs = new Subscription();
  filterForm!: FormGroup;
  selectedSortingOption!: string;
  sortArr = [
    { name: 'الاسم', value: 'name_ar' },
    { name: 'السعر', value: 'price' },
    { name: 'النوع', value: 'product_type' },
    { name: 'المصنع', value: 'manufacturer_ar' },
  ];
  productsType: commonObject[] = [];

  invoiceCart: cart = {} as cart;

  cart_number_data: cart_number_data = {} as cart_number_data;
  selectedValue!: any;
  searchWord: string = '';
  searchInput$ = new BehaviorSubject('');
  clients!: client[];
  options = [{ name: 'item1' }, { name: 'item1' }, { name: 'item1' }];
  isActiveTapArray: boolean[] = Array(8).fill(false);
  clientId!: number;
  clientCode = '';
  client!: any;
  waitingClients = 0;
  gotToPharmacies: boolean = false;
  SelectedClient: client = {} as client;
  loaderBooleans = {
    code: false,
    client_name: false,
    product_name: false,
    warehouses: false,
    quantity: false,
    search: false,
  };
  //products part
  products!: products[];
  selectedProduct!: products;

  //! here
  productID: any;

  addProductForm!: FormGroup;
  offers!: offers;
  productFixedData: fixedData = {
    exp_date: '',
    production_date: '',
    price: 0,
    tax: 0,
    totalAmount: 0,
    warehousesQuantity: null,
    salesDiscount: 0,
  };
  timerStart!: any;
  warehouses!: warehouses[];
  warehouseId!: number;
  product!: products;
  goFromQuantity = false;
  clientType = 0;
  previousQuantity: any;
  previousTotalQuantity: any;

  totalInvoiceData: totalData = {} as totalData;
  totalCartData: totalData = {} as totalData;
  subTotal = 0;
  creatOrderData: order_data = {
    client_id: 0,
    total_quantity: 0,
    total_price: 0,
    total_taxes: 0,
    total: 0,
    pharmacy_id: 9,
    extra_discount: 0,
    shipping_type: 0,
    total_after_extra_discount: 0,
    note: '',
    track_id: 0,
    shift_id: 0,
    city_id: 0,
    area_id: 0,
    order_id: 0,
    order_number: 0,
    current_balance: 0,
    last_balance: 0,
    extra_discount_condition: 0,
  };

  productsArr: any[] = [];
  cart_number: any;

  //!here
  SelectedID: any;
  PharmacyID: any;
  firstProductAdded = false;
  time: any;
  FirstProduct = true;
  disableWarehouse: boolean = false;
  constructor(
    private http: HttpService,
    private invoiceService: invoiceService,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService
  ) {
    this.router.navigate([], {
      queryParams: { name: null },
      queryParamsHandling: 'merge',
    });

    if (localStorage.getItem('pharmacyId'))
      localStorage.removeItem('pharmacyId');
  }

  @Input() item = '';
  salesEmplyeeWarehouse = 'قطاعي';
  private quantityInput$ = new Subject<{
    quantity: number;
    product_id: number;
    warehouse_id: number;
  }>();
  permissions: any = [];
  ngOnInit() {
    this.isActiveTapArray[0] = true;
    this.permissions = this.auth.getUserPermissions();
    console.log(this.permissions);
    if (!localStorage.getItem('noProduct')) {
      localStorage.setItem('noProduct', '1');
    } else {
      localStorage.removeItem('noProduct');
      localStorage.setItem('noProduct', '1');
    }
    this.getAllData();
    this.getAllProducts();
    if (this.permissions.includes('sales_employee')) {
      this.getWaitingNumber();
    }
    this.timerStart = Date.now();

    this.selectedSortingOption = 'asc';

    this.addProductForm = this.fb.group({
      pharmacy_id: [''],
      client_id: [''],
      product_id: [''],
      discount: [],
      client_discount_difference: [0],
      quantity: [''],
      bonus: [],
      note: [''],
      order_note: [''],
      status: [''],
      order_sales_id: [''],
      order_shipping_type: [''],
      warehouse_id: [''],
      track_id: [],
      shift_id: [],
    });
    //filter form
    this.filterForm = this.fb.group({
      manufactured_by: [''],
      product_type: [''],
      quantity_more_than_zero: [true],
      price_from: [],
      price_to: [],
      discount_from: [],
      discount_to: [],
      sort_data: [''],
      sort_key: [],
    });
    this.time = setInterval(() => {
      this.timerStart = new Date();
    }, 100);

    if (this.invoiceService.getInvoiceCart()) {
      this.invoiceCart = this.invoiceService.getInvoiceCart();
      setTimeout(() => {
        this.editOrder();
        this.disableUserDropdown();
      }, 1000);
    }

    this.quantityInput$
      .pipe(
        debounceTime(1000), // Add a 300ms debounce delay
        switchMap((data) => {
          this.addProductForm.controls['bonus'].setValue(0);
          let params = {
            quantity: data.quantity,
            product_id: data.product_id,
            warehouse_id: this.warehouseId,
            pharmacy_id: this.pharmacy_id,
            bonus: this.addProductForm.controls['bonus'].value,
          };
          console.log(this.warehouseId);

          this.loaderBooleans['quantity'] = true;

          // Make the API request to check offers and discounts
          if (this.addProductForm.controls['quantity'].value) {
            return this.http.getReq('products/offers/check', {
              params: params,
            });
          } else {
            this.productFixedData.warehousesQuantity = this.previousQuantity;
            this.productFixedData.totalAmount = this.previousTotalQuantity;
            this.addProductForm.controls['discount'].reset;
            this.addProductForm.controls['bonus'].reset;
            this.loaderBooleans['quantity'] = false;
          }
          return of({});
        })
      )
      .subscribe({
        next: (res) => {
          this.offers = res.data;
          this.handleDiscountsAndOffers();
          this.loaderBooleans['quantity'] = false;
        },
        complete: () => {
          this.loaderBooleans['quantity'] = false;
        },
        error: () => {
          this.loaderBooleans['quantity'] = false;
        },
      });
  }
  getAllProducts() {
    this.subs.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
        complete: () => {
          this.selectedSortingOption = '';
          this.filterForm.reset();
          this.filterForm.controls['quantity_more_than_zero'].setValue(1);
        },
      })
    );
  }
  getAllData() {
    //get all clients
    this.subs.add(
      this.http.getReq('clients/dropdown', { observe: 'response' }).subscribe({
        next: (res) => {
          this.clients = res.body.data;
        },
      })
    );

    this.productsType = this.auth.getEnums().product_type;

    let params = ['static_manufacturers'];
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.Manufacturers = res.data.static_manufacturers;
        },
      })
    );

    this.subs.add(
      this.generalService.getWarehousesDropdown({ module: 'sales' }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
        },
      })
    );
  }
  getclient(dropdown: any, param: string, e?: any) {
    if (!this.disableClient) {
      if (!dropdown.overlayVisible) {
        this.getClient(param, e);
      }
    }
  }

  getClient(param: string, e?: any, dropdown?: any) {
    this.changeActiveTap(0);
    let params;
    if (param == 'code' && this.clientCode) {
      this.loaderBooleans['code'] = true;

      if (
        /^[Gg](0*[1-9]\d*)$/.test(this.clientCode) ||
        /^[1-9]\d*$/.test(this.clientCode)
      ) {
        this.isActiveTapArray[0] = true;
      } else {
        this.loaderBooleans['code'] = false;
        this.isActiveTapArray[0] = false;
        this.toastr.error('يجب أن يكن أول حرف "G" ويليه رقم أكثر من 0');
        return;
      }

      params = {
        code: this.clientCode,
      };
      this.SelectedID = null;
    } else if (param == 'clientId' && this.SelectedID) {
      this.loaderBooleans['client_name'] = true;
      this.SelectedID = e;
      params = { id: this.SelectedID };
      this.clientCode = '';
      this.addProductForm.controls['client_id'].setValue(this.SelectedID);
    }
    if (params) {
      localStorage.removeItem('pharmacyId');
      if (
        ((this.clientCode[0] == 'G' || this.clientCode[0] == 'g') &&
          param == 'code' &&
          this.clientCode) ||
        (param == 'clientId' && this.SelectedID)
      ) {
        this.subs.add(
          this.http.getReq('clients', { params: params }).subscribe({
            next: (res) => {
              this.client = res.data[0];
              this.clientType = res.data[0]?.type_value;
              if (param == 'code' && this.clientCode) {
                this.SelectedID = res.data[0]?.id;
                this.addProductForm.controls['client_id'].setValue(
                  this.SelectedID
                );
              }
              if (this.client?.code)
                this.clientCode = String(this.client?.code);
              else this.SelectedID = null;
            },
            complete: () => {
              if (!this.invoiceService.getInvoiceCart()) {
                this.gotToPharmacies = false;
              } else {
                this.disablePharmacy = true;
              }

              this.loaderBooleans['client_name'] = false;
              this.loaderBooleans['code'] = false;
            },
          })
        );
      } else {
        this.subs.add(
          this.http.getReq('pharmacies/view', { params: params }).subscribe({
            next: (res) => {
              localStorage.setItem('pharmacyId', res.data.id);
              this.client = res.data.clients[0];
              this.client['pharmacies'] = [res.data];
              this.clientType = res.data?.clients[0]?.type_value;
              this.SelectedID = res.data.clients[0]?.id;
              this.addProductForm.controls['client_id'].setValue(
                this.SelectedID
              );
            },
            complete: () => {
              if (!this.invoiceService.getInvoiceCart()) {
                this.gotToPharmacies = false;
              } else {
                this.disablePharmacy = true;
              }
              this.FocusProducts();
              this.loaderBooleans['client_name'] = false;
              this.loaderBooleans['code'] = false;
            },
          })
        );
      }
    } else {
      this.SelectedID = null;
      this.clientCode = '';
    }
  }

  orderDetails: any = {};
  getOrdersData(id: number) {
    this.subs.add(
      this.http.getReq(`orders/${id}`).subscribe({
        next: (res) => {
          this.client.shipping_type = res.data.shipping_type?.value;
          this.client.sales = res.data.sales?.id;
          this.client.note = res.data.note;
          this.orderDetails = {
            shipping_type: res.data.shipping_type?.value,
            sales: res.data.sales?.id,
            note: res.data.note,
          };
        },
        complete: () => {},
      })
    );
  }

  direction!: string;

  onDropdownKeydown(event: any, dropdown: any) {
    if (!dropdown.overlayVisible) {
      // this.getWarehouse()
      setTimeout(() => {
        this.getProduct();
        dropdown?.close();
      }, 100);
    }
  }
  goFromCodeToPharmacy() {
    setTimeout(() => {
      this.gotToPharmacies = true;
    }, 1000);
  }

  getIdToShortBonus: any;
  haseOffer = false;
  hasBonus = false;
  is_limited = 0;
  maxQuantity = 0;
  normal_discount = 0;
  Offers: any;
  getProduct() {
    if (this.productID) {
      this.addProductForm.controls['product_id'].setValue(this.productID);
      let params: any = {
        product_id: this.addProductForm.controls['product_id'].value,
        pharmacy_id: this.addProductForm.controls['pharmacy_id'].value,
        warehouse_id: this.addProductForm.controls['warehouse_id'].value,
      };
      if (this.discount_tier_id != '') {
        params['discount_tier_id'] = this.discount_tier_id;
      }

      this.loaderBooleans['product_name'] = true;
      if (this.productID) {
        let message = '';
        this.subs.add(
          this.http.getReq('products/cart-item', { params: params }).subscribe({
            next: (res) => {
              message = res.message;
              this.product = res.data;
              this.haseOffer = res.data.has_offer;
              this.hasBonus = res.data.has_bonus;
              this.is_limited = res.data.is_limited;
              this.maxQuantity = res.data.limited_quantity;
              this.Offers = res.data.offers;
            },
            complete: () => {
              // if (this.haseOffer || this.hasBonus || this.is_limited == 1) {
              this.toastr.info(message);
              // }
              if (this.product) {
                if (this.product.batches.length > 0) {
                  const formattedDate = String(
                    this.product.batches[0]?.expired_at
                  ).slice(0, 10);
                  this.productFixedData.exp_date = formattedDate;
                  this.productFixedData.production_date =
                    this.product.batches[0].operating_number;
                } else {
                  this.productFixedData.exp_date = '';
                  this.productFixedData.production_date = '';
                }
                this.addProductForm.controls['discount'].setValue(
                  this.product?.current_discount_tier
                );

                this.normal_discount = this.product?.current_discount_tier;

                this.productFixedData.price = Number(
                  this.product.batches[0]?.batch_price
                );
                // if(this.addProductForm.controls['quantity'].value)
                // this.productFixedData.tax = this.product.taxes
                this.updateTaxes();
                this.productFixedData.totalAmount = Number(
                  this.product.quantity_sum_in_warehouses
                );
                console.log(this.warehouseId);
                if (this.addProductForm.controls['quantity'].value) {
                  this.getoffersAndDiscount(
                    this.addProductForm.controls['quantity'].value,
                    this.product.id,
                    this.warehouseId
                  );
                }
                if (this.warehouseId) {
                  // if (!dropdown?.overlayVisible) {
                  this.setWarehouseQuantity(this.product, this.warehouseId);
                  //   dropdown?.close();
                  // }
                }
              } else {
                this.productFixedData = {
                  exp_date: '',
                  production_date: '',
                  price: 0,
                  tax: 0,
                  totalAmount: 0,
                  warehousesQuantity: null,
                  salesDiscount: 0,
                };
              }
              this.openProduct = false;
              this.loaderBooleans['product_name'] = false;
              setTimeout(() => {
                this.activateQuatity();
              }, 100);
            },
          })
        );
      }
    } else {
      this.productFixedData.exp_date = ' ';

      this.addProductForm.controls['discount'].setValue(0);

      this.normal_discount = 0;

      this.productFixedData.production_date = '';
      this.productFixedData.price = 0;
      this.productFixedData.tax = 0;
      this.productFixedData.totalAmount = 0;
      this.productFixedData.warehousesQuantity = 0;
    }
  }

  setWarehouseQuantity(product: any, warehouseId: number) {
    const index = product.warehouses_details.findIndex(
      (warehouse: any) => warehouse.id == warehouseId
    );
    if (index > -1) {
      this.productFixedData.warehousesQuantity =
        product.warehouses_details[index].quantity;
      let quatityToString = String(this.productFixedData.warehousesQuantity);
      this.quantityDigitsNumber = quatityToString.length;
      this.previousQuantity = this.productFixedData.warehousesQuantity;
      this.previousTotalQuantity = this.productFixedData.totalAmount;
      if (this.addProductForm.controls['quantity'].value) {
        this.productFixedData.warehousesQuantity =
          product.warehouses_details[index].quantity > 0
            ? this.product.warehouses_details[index].quantity -
              this.addProductForm.controls['quantity'].value
            : 0;
      }
    } else {
      this.productFixedData.warehousesQuantity = 0;
    }

    this.loaderBooleans['warehouses'] = false;
  }
  quantityDigitsNumber = 0;

  getwarehouse(dropdown?: any) {
    if (!dropdown.overlayVisible) {
      if (!this.disableWarehouse) {
        this.loaderBooleans['warehouses'] = true;
        this.setWarehouseQuantity(this.product, this.warehouseId);
        dropdown?.close();
      }
    }
  }

  MainDiscountValue = 0;
  // Modified function to be called on input event
  getoffersAndDiscount(
    quantity: number,
    product_id: number,
    warehouse_id: number
  ) {
    // Emit the input values through the Subject for debouncing
    if (quantity == null) {
      this.MainDiscountValue = this.normal_discount;
      this.addProductForm.controls['discount'].setValue(this.MainDiscountValue);
      this.productFixedData.salesDiscount =
        this.addProductForm.controls['discount'].value;
    }
    this.quantityInput$.next({ quantity, product_id, warehouse_id });
  }

  updateTaxes() {
    if (
      this.addProductForm.controls['quantity'].value &&
      this.addProductForm.controls['quantity'].value > 0
    ) {
      this.productFixedData.tax =
        this.product.taxes * this.addProductForm.controls['quantity'].value;
    } else {
      this.productFixedData.tax = this.product.taxes;
    }
  }
  private handleDiscountsAndOffers() {
    this.MainDiscountValue = 0;

    if (this.offers.percentage != null || this.offers.quantity != null) {
      if (this.offers?.percentage != null) {
        this.MainDiscountValue = this.normal_discount;
        this.addProductForm.controls['discount'].setValue(
          this.MainDiscountValue + this.offers.percentage
        );
        if (this.addProductForm.controls['client_discount_difference'].value) {
          this.productFixedData.salesDiscount =
            Number(this.addProductForm.controls['discount'].value) -
            this.addProductForm.controls['client_discount_difference'].value;
        } else {
          this.productFixedData.salesDiscount = Number(
            this.addProductForm.controls['discount'].value
          );
        }
      } else {
        this.MainDiscountValue = this.normal_discount;
        this.addProductForm.controls['discount'].setValue(
          this.MainDiscountValue
        );
        if (this.addProductForm.controls['client_discount_difference'].value) {
          this.productFixedData.salesDiscount =
            Number(this.addProductForm.controls['discount'].value) -
            this.addProductForm.controls['client_discount_difference'].value;
        } else {
          this.productFixedData.salesDiscount = Number(
            this.addProductForm.controls['discount'].value
          );
        }
      }

      if (this.offers?.quantity != null) {
        this.addProductForm.controls['bonus'].setValue(this.offers.quantity);
      }
    } else {
      this.MainDiscountValue = this.normal_discount;
      this.addProductForm.controls['discount'].setValue(this.MainDiscountValue);
      this.productFixedData.salesDiscount =
        this.addProductForm.controls['discount'].value;
      if (this.addProductForm.controls['client_discount_difference'].value) {
        this.productFixedData.salesDiscount -=
          this.addProductForm.controls['client_discount_difference'].value;
      }
      this.addProductForm.controls['discount'].setValue(
        this.addProductForm.controls['discount'].value
      );
      this.addProductForm.controls['bonus'].setValue(0);
    }

    this.loaderBooleans['quantity'] = false;
  }

  updateWarehousesTotals() {
    if (this.addProductForm.controls['quantity'].value) {
      this.productFixedData.totalAmount =
        this.previousTotalQuantity -
        this.addProductForm.controls['quantity'].value;
      this.productFixedData.warehousesQuantity =
        Number(this.previousQuantity) -
        this.addProductForm.controls['quantity'].value;
    } else {
      this.productFixedData.totalAmount = this.previousTotalQuantity;
      this.productFixedData.warehousesQuantity = Number(this.previousQuantity);
    }
  }

  changeActiveTap(index: number) {
    this.router.navigate([], {
      queryParams: {
        search_offer_one: null,
        search_offer_two: null,
        slat_one_page: null,
        slat_two_page: null,
        created_at: null,
      },
      queryParamsHandling: 'merge',
    });
    if (index != 6) {
      this.isActiveTapArray.fill(false);
      this.isActiveTapArray[index] = true;
    } else {
      this.isActiveTapArray.fill(false);
    }
  }
  getSalesDifference() {
    this.productFixedData.salesDiscount =
      this.addProductForm.controls['discount'].value;
    if (this.addProductForm.controls['client_discount_difference'].value) {
      this.productFixedData.salesDiscount =
        this.addProductForm.controls['discount'].value -
        this.addProductForm.controls['client_discount_difference'].value;
    }
  }

  setNote(note: string) {
    this.addProductForm.controls['note'].setValue(note);
    this.addProductForm.controls['order_note'].setValue(note);
  }
  @ViewChild('clientNoteModel') clientNoteModel!: ElementRef<HTMLElement>;

  @ViewChild('closeNoteModal') closeNoteModal!: ElementRef<HTMLElement>;

  openNoteModel() {
    let el: HTMLElement = this.clientNoteModel.nativeElement;
    el.click();

    setTimeout(() => {
      this.closeNoteModal.nativeElement.focus();
    }, 800);
  }

  closeModal() {
    let el: HTMLElement = this.closeNoteModal.nativeElement;
    el.click();
    if (this.cartExist) {
      setTimeout(() => {
        this.openModal();
      }, 80);
    } else {
      this.onEnterProducts();
    }
  }
  callCount = 0;
  extra_discount_value = 0;
  mainProducts: any[] = [];
  extra_discount_condation: number = 0;
  cartExist = false;
  pharmacy_note!: string;
  pharmacy_id!: number;
  discount_tier_id: any;

  setPharmacieId(Pharmacy: pharmacyData) {
    console.log(Pharmacy);
    localStorage.getItem('opened_notes_id');
    this.addProductForm.controls['pharmacy_id'].setValue(Pharmacy.PharmacyId);
    this.pharmacy_id = Pharmacy.PharmacyId;
    this.addProductForm.controls['track_id'].setValue(Pharmacy.trackId);
    this.addProductForm.controls['shift_id'].setValue(Pharmacy.shiftId);
    this.creatOrderData.track_id = Pharmacy.trackId;
    this.creatOrderData.shift_id = Pharmacy.shiftId;
    this.creatOrderData.city_id = Pharmacy.cityId;
    this.creatOrderData.area_id = Pharmacy.areaId;
    this.pharmacy_note = Pharmacy.pharmacy_note;
    this.discount_tier_id = Pharmacy.discount_tier_id;

    console.log(this.pharmacy_note);
    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getallData(param);
          })
        )
        .subscribe({
          next: (res) => {
            if (res.data) {
              if (res.data.length > 0 && this.callCount == 0) {
                this.order_id = res.additional_data.order_id;
                this.callCount++;
                this.disableUserDropdown();
                if (!this.searchWord && !this.direction) {
                  this.cartExist = true;
                  this.disableWarehouse = true;
                  if (this.pharmacy_note && this.pharmacy_note != 'null') {
                    // &&
                    // this.checkOpenNotes(Pharmacy.PharmacyId)\
                    console.log(this.pharmacy_note, '1');

                    this.openNoteModel();
                    this.openModal();
                  } else {
                    console.log(this.pharmacy_note, '2');

                    this.openModal();
                  }
                }
                if (!localStorage.getItem('noProduct')) {
                  localStorage.setItem('noProduct', '0');
                } else {
                  localStorage.removeItem('noProduct');
                  localStorage.setItem('noProduct', '0');
                }
                clearTimeout(this.time);
                this.timerStart = res.data[0]?.created_at;
              }
              //  else {
              //   if (this.pharmacy_note != 'null') {
              //     console.log(this.pharmacy_note, '3');

              //     // &&
              //     // !this.searchWord &&
              //     // !this.direction &&
              //     // this.checkOpenNotes(Pharmacy.PharmacyId)
              //     this.openNoteModel();
              //   }
              // }

              this.getProductData(res.data, this.searchWord);

              if (res.additional_data.cart_number != 0) {
                this.cart_number = res.additional_data.cart_number;
              } else {
                this.cart_number = '';
              }
            } else {
              this.productsArr = [];
              if (!localStorage.getItem('noProduct')) {
                localStorage.setItem('noProduct', '1');
              }
            }
            if (res?.additional_data?.totals) {
              this.totalCartData = res.additional_data.totals;
              this.extra_discount_condation =
                res.additional_data.totals.extra_discount_condition;
              this.extra_discount_value =
                res.additional_data.totals.extra_discount_value;
              if (this.extra_discount_value != null) {
                this.creatOrderData.total_after_extra_discount =
                  this.extra_discount_value;
              } else {
                this.creatOrderData.total_after_extra_discount = 0;
              }
              this.subTotal = res.additional_data.totals.subtotal;
            }
            if (this.order_id) {
              this.getOrdersData(this.order_id);
            }
          },
          complete: () => {
            this.loaderBooleans['search'] = false;
          },
        })
    );
  }

  checkOpenNotes(pharmacy_id: number) {
    let opened_notes_id: any = [];
    if (localStorage.getItem('opened_notes_id')) {
      let temp: any = localStorage.getItem('opened_notes_id');
      opened_notes_id = JSON.parse(temp);
      const index = opened_notes_id.findIndex((c: any) => c.id == pharmacy_id);
      if (index > -1) {
        return false;
      } else {
        opened_notes_id.push({ id: pharmacy_id });
        localStorage.setItem(
          'opened_notes_id',
          JSON.stringify(opened_notes_id)
        );
        return true;
      }
    } else {
      opened_notes_id.push({ id: pharmacy_id });
      localStorage.setItem('opened_notes_id', JSON.stringify(opened_notes_id));
    }
    return true;
  }

  setSalesId(salesId: number) {
    if (salesId) {
      this.creatOrderData.sales_id = salesId;
      this.addProductForm.controls['order_sales_id'].setValue(salesId);
    }
  }
  setShippingType(shippingType: boolean) {
    this.creatOrderData.shipping_type = Number(shippingType);
    this.addProductForm.controls['order_shipping_type'].setValue(
      Number(shippingType)
    );

    console.log(this.addProductForm.value);
  }

  openPharmacyNoteModel(note: string) {
    if (note) {
      this.pharmacy_note = note;
      this.openNoteModel();
    }
  }

  order_id: any;
  disablePharmacy = false;
  singleProductAddCount = 0;
  disableaddBtn = false;
  addproduct() {
    this.addProductForm.controls['status'].setValue(0);
    if (this.addProductForm.controls['discount'].value == 0) {
      this.addProductForm.controls['discount'].setValue(null);
    }

    let productData: any = {};
    for (const key in this.addProductForm.value) {
      let value = this.addProductForm.value[key];
      if (value != null && value != undefined && value != '') {
        productData[key] = value;
      }
    }
    productData['status'] = 0;
    if (!productData['client_discount_difference']) {
      productData['client_discount_difference'] = 0;
    }
    if (!productData['order_shipping_type']) {
      productData['order_shipping_type'] = 0;
    }

    this.disableaddBtn = true;
    this.subs.add(
      this.http.postReq('carts/create', productData).subscribe({
        next: (res) => {
          this.productsArr = [];
          this.mainProducts = [];

          //loop on batches
          this.getProductData(res.data, '');

          this.totalCartData = res.additional_data.totals;
          this.extra_discount_condation =
            res.additional_data.totals.extra_discount_condition;
          this.extra_discount_value =
            res.additional_data?.totals.extra_discount_value;
          if (this.extra_discount_value != null) {
            this.creatOrderData.total_after_extra_discount =
              this.extra_discount_value;
          } else {
            this.creatOrderData.total_after_extra_discount = 0;
          }
          this.subTotal = res.additional_data.totals.subtotal;

          this.cart_number = res.additional_data.cart_number;
          this.order_id = res.additional_data.order_id;
        },
        complete: () => {
          this.productFixedData = {
            exp_date: '',
            production_date: '',
            price: 0,
            tax: 0,
            totalAmount: 0,
            warehousesQuantity: 0,
            salesDiscount: 0,
          };
          this.disableaddBtn = false;
          this.disableWarehouse = true;
          this.addProductForm.controls['product_id'].reset();
          this.addProductForm.controls['client_discount_difference'].reset();
          this.addProductForm.controls['discount'].reset();
          this.addProductForm.controls['quantity'].reset();
          this.addProductForm.controls['bonus'].reset();
          this.productID = '';
          this.productFixedData.warehousesQuantity = null;
          this.disableUserDropdown();
          this.disablePharmacy = true;
          this.disableCode();
          clearTimeout(this.time);
          setTimeout(() => {
            this.scrollToBottom();
            this.onEnterProducts();
          }, 100);
          if (!localStorage.getItem('noProduct')) {
            localStorage.setItem('noProduct', '0');
          } else {
            localStorage.removeItem('noProduct');
            localStorage.setItem('noProduct', '0');
          }
        },
        error: () => {
          this.disableaddBtn = false;
        },
      })
    );
  }
  getProductData(data: any, search_word: string) {
    this.productsArr = [];
    this.mainProducts = [];
    data.forEach((cartItem: any) => {
      this.productsArr.push({
        product_name: cartItem.product_name,
        product_id: cartItem.product_id,
        expired_at: cartItem.expired_at,
        operating_number: cartItem.operating_number,
        quantity: cartItem.quantity,
        bonus: cartItem.bonus,
        price: cartItem.price,
        taxes: cartItem.taxes,
        discount: cartItem.discount,
        total: cartItem.total,
        id: cartItem.id,
        total_after_client_discount: cartItem.total_after_client_discount,
        batch_id: cartItem.batch_id,
        color: cartItem.color,
        cart_id: cartItem.cart_id,
      });
      if (!search_word) {
        this.mainProducts.push({
          product_name: cartItem.product_name,
          product_id: cartItem.product_id,
          expired_at: cartItem.expired_at,
          operating_number: cartItem.operating_number,
          quantity: cartItem.quantity,
          bonus: cartItem.bonus,
          price: cartItem.price,
          taxes: cartItem.taxes,
          discount: cartItem.discount,
          total: cartItem.total,
          id: cartItem.id,
          batch_id: cartItem.batch_id,
          color: cartItem.color,
          cart_id: cartItem.cart_id,
        });
      }
    });
    this.loaderBooleans['search'] = false;
  }
  deleteProduct(cart_id: number, batch_id: number) {
    let message = '';
    this.subs.add(
      this.http
        .deleteReq(`carts/${cart_id}/batches/${batch_id}/delete`)
        .subscribe({
          next: (res) => {
            this.totalCartData = res.data;
            this.extra_discount_value = res.data.extra_discount_value;
            this.subTotal = res.data.subtotal;
            message = res.message;
          },
          complete: () => {
            this.toastr.info(message);
            const index = this.productsArr.findIndex(
              (c) => c.batch_id == batch_id
            );
            if (index > -1) {
              this.productsArr.splice(index, 1);
              this.mainProducts.splice(index, 1);
            }
            if (this.productsArr.length == 0) {
              this.cart_number = '';
              this.disableClient = false;
              this.setNoProducts('1');
              this.enableUserDropdown();
              this.enableCode();
              this.disableWarehouse = false;
            } else {
              this.setNoProducts('0');
            }
          },
        })
    );
  }
  setNoProducts(value: string) {
    if (!localStorage.getItem('noProduct')) {
      localStorage.setItem('noProduct', value);
    } else {
      localStorage.removeItem('noProduct');
      localStorage.setItem('noProduct', value);
    }
  }
  deleteAllProducts(clientId: number) {
    let body = {
      pharmacy_id: this.pharmacy_id,
    };

    let message = '';
    this.subs.add(
      this.http.postReq('carts/delete-all', body).subscribe({
        next: (res) => {
          message = res.message;
        },
        complete: () => {
          this.productsArr = [];
          this.totalCartData = {
            price: 0,
            quantity: 0,
            taxes: 0,
            total: 0,
            items_number: 0,
            extra_discount: 0,
            previous_balance: 0,
            current_balance: 0,
            net_price: 0,
          };
          this.disableWarehouse = false;
          this.extra_discount_value = 0;
          this.subTotal = 0;

          this.toastr.info(message);

          setTimeout(function () {
            window.location.reload();
          }, 1000);
        },
      })
    );
  }
  finishInvoice() {
    if (this.addProductForm.controls['client_id'].value) {
      this.creatOrderData.client_id =
        this.addProductForm.controls['client_id'].value;
    }
    this.creatOrderData.total_quantity = this.totalCartData.items_number;
    this.creatOrderData.total = this.subTotal;
    this.creatOrderData.total_price = this.totalCartData.total;
    this.creatOrderData.total_taxes = this.totalCartData.taxes;
    this.creatOrderData.extra_discount = this.totalCartData.extra_discount;
    this.creatOrderData.current_balance = this.totalCartData.current_balance;
    this.creatOrderData.last_balance = this.totalCartData.previous_balance;
    this.creatOrderData.order_id = this.order_id;
    this.creatOrderData.extra_discount_condition =
      this.extra_discount_condation;
    this.creatOrderData.order_number = this.cart_number;
    this.creatOrderData.pharmacy_id =
      this.addProductForm.controls['pharmacy_id'].value;
    if (!this.addProductForm.controls['note'].value) {
      this.creatOrderData.note = ' ';
    } else {
      this.creatOrderData.note = this.addProductForm.controls['note'].value;
    }
    let message = '';
    this.subs.add(
      this.http.postReq('orders/create', this.creatOrderData).subscribe({
        next: (res) => {
          message = res.message;
        },
        complete: () => {
          this.totalCartData = {
            price: 0,
            quantity: 0,
            taxes: 0,
            total: 0,
            items_number: 0,
            extra_discount: 0,
            previous_balance: 0,
            current_balance: 0,
            net_price: 0,
          };
          this.extra_discount_value = 0;
          this.subTotal = 0;
          this.addProductForm.reset();
          this.productsArr = [];
          this.toastr.info(message);

          setTimeout(function () {
            window.location.reload();
          }, 1300);
        },
      })
    );
  }

  firstTimeCount = 0;
  firstTimeBoolean = true;
  getallData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    x['client_id'] = this.addProductForm.controls['client_id'].value;
    x['pharmacy_id'] = this.addProductForm.controls['pharmacy_id'].value;
    let getUrl = 'carts';
    return this.http.getReq(getUrl, { params: x });
  }

  search() {
    this.loaderBooleans['search'] = true;

    this.subs.add(
      this.searchInput$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          return this.router.navigate([], {
            queryParams: { product_name: this.searchWord },
            queryParamsHandling: 'merge',
          });
        },
        complete: () => {
          this.loaderBooleans['search'] = false;
        },
      })
    );

    this.searchInput$.next(this.searchWord);
  }

  sortByName() {
    if (this.productsArr.length > 0) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
      setTimeout(() => {
        return this.router.navigate([], {
          queryParams: { sort_by: 'product_name', direction: this.direction },
          queryParamsHandling: 'merge',
        });
      }, 50);
    }
  }

  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop =
        this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  showCartExistModle: boolean = false;
  @ViewChild('ProductDropdown') private ProductDropdown!: Dropdown;
  onEnterProducts() {
    this.ProductDropdown?.focus();
  }
  openProduct = false;
  FocusProducts() {
    if (this.openProduct == true) {
      this.ProductDropdown?.focus();
    }
  }

  onDropdownFocus(event: any) {
    event.target.addEventListener('keydown', (keydownEvent: KeyboardEvent) => {
      if (keydownEvent.key === 'Enter') {
        keydownEvent.preventDefault();
      }
    });
  }
  setOpenProduct(event: any) {
    this.openProduct = true;
    this.FocusProducts();
  }

  @ViewChild('addBtn') private addBtn!: ElementRef;
  activateAdd(event: any) {
    this.addBtn.nativeElement?.focus();
    event.preventDefault();
  }

  @ViewChild('code') private codeInput!: ElementRef;
  disableCode() {
    this.codeInput.nativeElement.disabled = true;
  }
  enableCode() {
    this.codeInput.nativeElement.disabled = false;
  }
  focusCode() {
    this.codeInput.nativeElement.focus = true;
  }

  getWaitingClientNumber(number: any) {
    console.log('waiting number', number);
    this.waitingClients = number;
  }
  getWaitingNumber() {
    this.subs.add(
      this.http.getReq('waiting-list').subscribe({
        next: (res) => {
          this.waitingClients = res.data.waiting_list_number;
        },
      })
    );
  }

  waitingPharmacyClient?: number;
  getClickedWaitingClient(event: { client_id: number; pharmacy_id: number }) {
    console.log(event);
    this.SelectedID = event.client_id;
    this.waitingPharmacyClient = event.pharmacy_id;
    // this.changeActiveTap(0);
    this.getclient(this.usersDropdown, 'clientId', this.SelectedID);
    // this.goToPharmacy(this.usersDropdown);
    // localStorage.setItem('pharmacyId', event.pharmacy_id.toString());
  }

  disableClient = false;
  @ViewChild('userDropdown') private usersDropdown!: Dropdown;
  disableUserDropdown() {
    this.disableClient = true;
    this.usersDropdown.disabled = true;
  }

  goToPharmacy(dropdown: any) {
    if (!this.invoiceService.getInvoiceCart()) {
      if (!this.disableClient) {
        if (!dropdown.overlayVisible) {
          this.gotToPharmacies = true;
          dropdown?.close();
        }
      }
    }
  }

  @ViewChild('closePoPModal') closePoPModal!: ElementRef<HTMLElement>;

  @ViewChild('quatityInput') private quatityInput!: ElementRef;
  activateQuatity() {
    this.quatityInput.nativeElement?.focus();
  }

  @ViewChild('clientInfoModel') clientInfoModel!: ElementRef<HTMLElement>;

  openModal() {
    let el: HTMLElement = this.clientInfoModel.nativeElement;
    if (!this.invoiceService.getInvoiceCart()) {
      el.click();
    }

    setTimeout(() => {
      this.closePoPModal.nativeElement.focus();
    }, 800);
  }

  closeModalClick() {
    let el: HTMLElement = this.closePoPModal.nativeElement;
    this.disableUserDropdown();
    this.disableCode();
    this.disablePharmacy = true;
    el.click();
  }

  enableUserDropdown() {
    this.usersDropdown.disabled = false;
    this.disablePharmacy = false;
  }

  @ViewChild('closeFilterModal') closeFilterModal!: ElementRef<HTMLElement>;
  @ViewChild('filterModel') filterModel!: ElementRef<HTMLElement>;

  closeFilterModalClick() {
    let el: HTMLElement = this.filterModel.nativeElement;
    el.click();
  }
  openFilterModal() {
    let el: HTMLElement = this.filterModel.nativeElement;
    el.click();
  }

  filter() {
    this.filterForm.controls['sort_key'].setValue(this.selectedSortingOption);
    const params: any = {};

    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'quantity_more_than_zero') {
          params[key] = value == true ? 1 : 0;
        } else {
          params[key] = value;
        }
      }
    }

    this.subs.add(
      this.http.getReq('products', { params: params }).subscribe({
        next: (res) => {
          this.products = res.data;
        },
        complete: () => {
          this.closeFilterModalClick();
          this.ProductDropdown?.show();
        },
      })
    );
  }
  Manufacturers: { name: string; id: number }[] = [];

  onItemChange(value: any) {
    this.selectedSortingOption = value.value;
  }

  setNewProductId(ProductId: any) {
    this.productID = ProductId;
    this.getProduct();
  }
  displayPharmacy = false;
  editOrder() {
    this.SelectedID = this.invoiceCart.client.id;
    this.clientCode = String(this.invoiceCart.client.code);
    this.getclient(this.usersDropdown, 'clientId', this.invoiceCart.client.id);
    this.disablePharmacy = true;
    let pharamacy: pharmacyData = {
      PharmacyId: this.invoiceCart.pharmacy.id,
      trackId: this.invoiceCart.track.id,
      shiftId: this.invoiceCart.shift.id,
      cityId: this.invoiceCart.city.id,
      areaId: this.invoiceCart.area.id,
      pharmacy_note: String(this.invoiceCart.pharmacy.note),
    };
    console.log(this.invoiceCart);
    if (this.invoiceCart.pharmacy.discount_tier?.id) {
      pharamacy['discount_tier_id'] =
        this.invoiceCart.pharmacy.discount_tier.id;
    }
    this.setPharmacieId(pharamacy);
  }

  @ViewChild('ProductDropdown') productDropdown!: Dropdown;

  activateDropdown() {
    if (this.productDropdown) {
      this.productDropdown.focus();
    }
  }
  @ViewChild('openConfirmationModel')
  openConfirmationModel!: ElementRef<HTMLElement>;
  deleteConfirm() {
    let confirmationModel: HTMLElement =
      this.openConfirmationModel.nativeElement;
    confirmationModel.click();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.router.navigate([], {
      queryParams: {
        search_offer_one: null,
        search_offer_two: null,
        slat_one_page: null,
        slat_two_page: null,
        name: null,
        created_at: null,
      },
      queryParamsHandling: 'merge',
    });

    localStorage.removeItem('pharmacyId');
    console.log(localStorage.getItem('pharmacyId'));
    console.log('Component destroyed');
  }
}
