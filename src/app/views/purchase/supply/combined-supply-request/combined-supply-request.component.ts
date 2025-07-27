import { DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { products, warehouses } from '@models/products';
import { purchase_cart } from '@models/purchase';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { NotesModalComponent } from '@modules/notes-modal/notes-modal.component';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Dropdown } from 'primeng/dropdown';
import { Paginator } from 'primeng/paginator';
import {
  BehaviorSubject,
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  of,
  subscribeOn,
  switchMap,
} from 'rxjs';
const datePipe = new DatePipe('en-EG');

export interface totals {
  total_products: number;
  total_public_price: number;
  total_taxes: number;
  total_supply_price: number;
}

@Component({
  selector: 'app-combined-supply-request',
  templateUrl: './combined-supply-request.component.html',
  styleUrls: ['./combined-supply-request.component.scss'],
})
export class CombinedSupplyRequestComponent implements OnInit {
  requestDataForm!: FormGroup;
  filterForm!: FormGroup;
  addProductForm!: FormGroup;
  statisticsForm!: FormGroup;
  DeleteWithQuantity!: FormGroup;
  private subscription = new Subscription();
  suppliers: supplier[] = [];
  warehouses: warehouses[] = [];
  supplier: supplier = {} as supplier;
  order_number: number = 0;
  searchInput$ = new BehaviorSubject('');
  supplyRequestTotals: totals = {
    total_products: 0,
    total_public_price: 0,
    total_taxes: 0,
    total_supply_price: 0,
  };
  activeURL!: string;
  pageType!: string;
  products: products[] = [];
  order_status!: number;
  calculateBonusAndTaxForm!: FormGroup;
  pharmacies: any;
  type: string = 'supplier';
  pharmacy: supplier = {} as supplier;

  // for first table (suppliers discount)
  columnsArray1: columnHeaders[] = [
    {
      name: 'اسم المورد',
      sort: true,
      direction: null,
    },
    {
      name: 'التاريخ',
    },
    {
      name: 'الخصم',
      sort: true,
      direction: null,
    },
    {
      name: 'السعر',
      sort: true,
      direction: null,
    },
  ];
  columnsName1: ColumnValue[] = [
    {
      name: 'supplier_name',
      type: 'clickOnSupplier',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'normal',
    },
  ];
  suppliersDiscount: any = [];

  //for calculate bonus and tax popup
  columnsArray3: columnHeaders[] = [
    {
      name: 'خصم مرجح',
    },
    {
      name: 'الضريبة',
    },
    {
      name: 'الكمية',
    },
    {
      name: 'البونص',
    },
    {
      name: 'الشركة',
    },
    {
      name: 'التاريخ',
    },
    {
      name: 'الكاتب',
    },
  ];
  columnsName3: ColumnValue[] = [
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'taxes',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'bonus',
      type: 'normal',
    },
    {
      name: 'company',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
  ];
  calculateBonusAndDiscount: any = [];

  cartData: purchase_cart[] = [];
  searchWord: string = '';
  direction!: string;
  purchase_id!: number;
  disableWarehouse: boolean = false;
  order_note!: string;
  total_discount: number = 0;

  //popup
  cancle_button_name!: string;
  ok_button_name!: string;
  popupMessage!: string;

  constructor(
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private http: HttpService,
    private authService: AuthService,
    private router: Router,
    private generalService: GeneralService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) {}
  supply_request_id!: number;
  ngOnInit() {
    let fromDate = new Date();
    let toDate = new Date();
    fromDate.setDate(toDate.getDate() - 30);

    //get all products initialy
    this.requestDataForm = this.fb.group({
      supplier_id: [''],
      warehouse_id: [''],
      from: [datePipe.transform(fromDate, 'yyyy-MM-dd')],
      to: [datePipe.transform(toDate, 'yyyy-MM-dd')],
      pharmacy_id: [''],
    });
    this.filterForm = this.fb.group({
      manufactured_by: [''],
      product_type: [''],
      quantity_more_that_zero: [''],
      supply_file_product: [''],
      discount_from: [''],
      discount_to: [''],
      price_from: [''],
      price_to: [''],
      sort_by: [''],
      direction: [''],
    });
    this.addProductForm = this.fb.group({
      expired_at: [''],
      operating_number: [''],
      product_id: ['', Validators.required],
      quantity: ['', Validators.required],
      discount: [''],
      price: ['', Validators.required],
      taxes: ['', Validators.required],
      note: [''],
      purchase_id: [''],
    });
    this.statisticsForm = this.fb.group({
      total_quantity_sold: [''],
      total_quantity_returned: [''],
      total_quantity_cleared_sold: [''],
      total_warehouses_quantity: [''],
      warehouse_quantity: [''],
      total_quantity_purchase: [''],
      manufacturer_name: [''],
      last_invoice: [''],
      last_notInvoiced: [''],
      highest_discount: [''],
      public_price: [''],
      after_discount_price: [''],
      items_number_in_packet: [''],
      packets_number_in_package: [''],
      note: [''],
      suggested_discount: [''],
      last_discount: [''],
    });
    this.DeleteWithQuantity = this.fb.group({
      quantity: ['', Validators.required],
      purchase_id: [''],
    });

    this.calculateBonusAndTaxForm = this.fb.group({
      product_id: [''],
      quantity: ['', Validators.required],
      bonus: [''],
      taxes: ['', Validators.required],
      discount: ['', Validators.required],
      additional_discount1: [''],
      additional_discount2: [''],
      additional_discount3: [''],
      total_discount: [''],
    });
    this.getDropdownData();
    this.getProducts();

    let searchResult: any;
    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            if (this.searchWord || this.direction) {
              return this.getallData(param).pipe(
                catchError((error) => {
                  return of({ data: [] });
                })
              );
            } else {
              if (this.purchase_id) {
                return this.getallData().pipe(
                  catchError((error) => {
                    return of({ data: [] });
                  })
                );
              }
            }
            return [];
          })
        )
        .subscribe({
          next: (res) => {
            searchResult = res.data;
            this.cartData = [];
            this.cartData = searchResult.cart;
          },
          complete: () => {},
        })
    );

    this.activeURL = this.router.url;
    if (this.activeURL.includes('/edit')) {
      this.editOrder = true;
      this.supply_request_id = Number(
        this.activatedRoute.snapshot.paramMap.get('id')
      );
      this.getSupplyRequest(this.supply_request_id);
      this.disableWarehouse = true;
    }
  }
  editOrder: boolean = false;
  Manufacturers: commonObject[] = [];
  product_type: commonObject[] = [];
  supply_file_product: boolean = false;
  sort_by: commonObject[] = [];

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['suppliers', 'static_manufacturers'])
        .subscribe({
          next: (res) => {
            this.suppliers = res.data.suppliers;
            this.Manufacturers = res.data.static_manufacturers;
          },
        })
    );

    this.subscription.add(
      this.generalService.getWarehouses({ purchases: 1 }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
        },
      })
    );

    this.subscription.add(
      this.http.getReq('pharmacies/dropdown').subscribe({
        next: (res) => {
          this.pharmacies = res.data;
        },
      })
    );
    // this.subscription.add(this.generalService.getSettingsEnum().subscribe({
    //   next:res=>{
    //     this.product_type=res.data.product_type
    //     this.sort_by=res.data.sortArr
    //   }
    // }))
    this.product_type = this.auth.getEnums().product_type;
    this.sort_by = this.auth.getEnums().sortArr;
  }

  //api that get all products or products with filter
  @ViewChild('CloseFilterBtn') CloseFilterBtn!: ElementRef<HTMLElement>;

  getProducts() {
    let all_params: LooseObject = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'supply_file_product') {
          if (value == true) {
            all_params[key] = 1;
          } else {
            all_params[key] = 0;
          }
        } else {
          all_params[key] = value;
        }
      }
    }
    let supplier_id = this.requestDataForm.controls['supplier_id'].value;
    if (
      supplier_id != null &&
      supplier_id != undefined &&
      supplier_id != '' &&
      all_params['supply_file_product']
    ) {
      all_params['supplier_id'] = supplier_id;
    }
    this.subscription.add(
      this.http
        .getReq('purchases/supply-request/dropdown-products', {
          params: all_params,
        })
        .subscribe({
          next: (res) => {
            this.products = res.data;
            this.CloseFilterBtn.nativeElement.click();
          },
          complete: () => {
            if (
              all_params['supplier_id'] &&
              all_params['supply_file_product']
            ) {
              this.supply_file_product = true;
              this.resetAddProductForm();
            } else {
              this.supply_file_product = false;
            }
            if (this.direction || this.searchWord) {
              this.router.navigate([], {
                queryParams: {},
                queryParamsHandling: 'merge',
              });
            }
          },
        })
    );
  }

  calcTotal(index?: any) {
    if (index != undefined) {
      if (
        this.cartData[index].public_price > 0 &&
        this.cartData[index].quantity > 0
      ) {
        this.cartData[index].subtotal =
          this.cartData[index].public_price * this.cartData[index].quantity;
      } else {
        this.cartData[index].subtotal = 0;
      }

      if (
        this.cartData[index].discount &&
        this.cartData[index].discount < 100 &&
        this.cartData[index].discount >= 0 &&
        this.cartData[index].public_price > 0 &&
        this.cartData[index].quantity > 0
      ) {
        this.cartData[index].subtotal =
          this.cartData[index].subtotal -
          this.cartData[index].subtotal * (this.cartData[index].discount / 100);
      } else {
        this.cartData[index].subtotal =
          this.cartData[index].public_price * this.cartData[index].quantity;
      }
    }

    this.supplyRequestTotals.total_public_price = 0;
    this.supplyRequestTotals.total_supply_price = 0;
    this.cartData.forEach((cart_product: any) => {
      this.supplyRequestTotals.total_public_price = Number(
        this.supplyRequestTotals.total_public_price + cart_product.public_price
      );
      this.supplyRequestTotals.total_supply_price =
        this.supplyRequestTotals.total_supply_price + cart_product.subtotal;
    });
    let total_supply_price: any = this.supplyRequestTotals.total_supply_price;
    let total_public_price: any = this.supplyRequestTotals.total_public_price;
    let rounded_total_supply_price: number =
      Math.round(total_supply_price * 100) / 100;
    let rounded_total_public_price: number =
      Math.round(total_public_price * 100) / 100;
    this.supplyRequestTotals.total_supply_price = rounded_total_supply_price;
    this.supplyRequestTotals.total_public_price = rounded_total_public_price;
  }

  // calcTotal(index:any){
  //   if(this.cartData[index].public_price>0 && this.cartData[index].quantity>0){
  //     this.cartData[index].subtotal=this.cartData[index].public_price * this.cartData[index].quantity
  //   }
  //   else{
  //     this.cartData[index].subtotal=0
  //   }

  //   if(this.cartData[index].discount && this.cartData[index].discount<100 && this.cartData[index].discount>=0 && this.cartData[index].public_price>0 && this.cartData[index].quantity>0){
  //     this.cartData[index].subtotal=this.cartData[index].subtotal - (this.cartData[index].subtotal*(this.cartData[index].discount/100))
  //   }
  //   else{
  //     this.cartData[index].subtotal=this.cartData[index].public_price * this.cartData[index].quantity
  //   }
  //   this.supplyRequestTotals.total_public_price=0
  //   this.supplyRequestTotals.total_supply_price=0
  //   this.cartData.forEach((cart_product:any)=>{
  //     this.supplyRequestTotals.total_public_price=Number(this.supplyRequestTotals.total_public_price+cart_product.public_price)
  //     this.supplyRequestTotals.total_supply_price=this.supplyRequestTotals.total_supply_price+cart_product.subtotal
  //   })
  //   let total_supply_price:any=this.supplyRequestTotals.total_supply_price
  //   let total_public_price:any=this.supplyRequestTotals.total_public_price
  //   let rounded_total_supply_price:number=Math.round(total_supply_price * 100) / 100
  //   let rounded_total_public_price:number=Math.round(total_public_price * 100) / 100
  //   this.supplyRequestTotals.total_supply_price=rounded_total_supply_price
  //   this.supplyRequestTotals.total_public_price=rounded_total_public_price
  // }

  productChangeEvent(dropdown?: any) {
    if (!dropdown.overlayVisible) {
      this.firstTime = true;
      this.getProductDetails();
      dropdown?.close();
    }
  }
  @ViewChild('productsDropdown') private productsDropdown!: Dropdown;

  focus(next: string, event?: any) {
    const nextInput = document.getElementById(next) as HTMLElement;
    if (next != 'productsDropdown') {
      if (nextInput) {
        event?.preventDefault();
        nextInput.focus();
      }
    } else {
      this.productsDropdown?.focus();
    }
  }
  selectedProduct: any;
  getProductDetails() {
    let product_id = this.addProductForm.controls['product_id'].value;
    if (product_id) {
      let all_params: LooseObject = {
        product_id: product_id,
      };
      if (this.supply_file_product != false) {
        all_params['supplier_id'] =
          this.requestDataForm.controls['supplier_id'].value;
        all_params['supply_file_product'] =
          this.filterForm.controls['supply_file_product'].value == true ? 1 : 0;
      }
      if (!all_params['supplier_id']) {
        all_params['warehouse_id'] =
          this.requestDataForm.controls['warehouse_id'].value;
      }
      let product: any = {};
      this.subscription.add(
        this.http
          .getReq('purchases/supply-request/product-details', {
            params: all_params,
          })
          .subscribe({
            next: (res) => {
              this.selectedProduct = res.data[0];
            },
            complete: () => {
              this.addProductForm.patchValue(this.selectedProduct);
              this.focus('quantity');
            },
          })
      );
    } else {
      this.resetAddProductForm();
      // setTimeout(() => {
      //   this.focus('productsDropdown')
      // }, 100);
    }
  }

  // addProductToCart(){
  //   let body:LooseObject={}
  //   for (const key in this.addProductForm.value) {
  //     let value = this.addProductForm.controls[ key ].value;
  //     if (value != null && value != undefined && (value === 0 || value !== '')) {
  //       if(key!='expired_at' && key!='operating_number'){
  //         body[ key ] = value;
  //       }
  //     }
  //   }
  //   if(this.requestDataForm.controls['warehouse_id'].value && this.requestDataForm.controls['supplier_id'].value){
  //     body['warehouse_id'] = this.requestDataForm.controls['warehouse_id'].value
  //   }
  //   if(this.requestDataForm.controls['supplier_id'].value){
  //     body['supplier_id'] = this.requestDataForm.controls['supplier_id'].value
  //   }
  //   let cartProduct:LooseObject={}
  //   this.subscription.add(this.http.postReq('purchases/supply-request/add-to-cart',body).subscribe({
  //     next:res=>{
  //       cartProduct=res
  //     },complete:()=>{
  //       this.addProductForm.controls['purchase_id'].setValue(cartProduct.data.id)
  //       this.purchase_id=cartProduct.data.id
  //       // this.cartData=cartProduct.data.cart
  //       this.cartData.push(cartProduct.data.cart[cartProduct.data.cart.length-1])
  //       this.order_status=cartProduct.data.status.value
  //       this.disableWarehouse=true
  //       this.supplyRequestTotals=cartProduct.additional_data
  //       this.resetAddProductForm()
  //       this.focus('productsDropdown')
  //       }

  //   }))
  // }

  addProductToCart(table: any) {
    let cartProduct: purchase_cart = {} as purchase_cart;
    if (
      !this.requestDataForm.controls['warehouse_id'].value &&
      !this.requestDataForm.controls['supplier_id'].value
    ) {
      this.toastr.error('حقل اسم المخزن مطلوب (and 1 more error)');
      return;
    }
    if (!this.requestDataForm.controls['warehouse_id'].value) {
      this.toastr.error('حقل اسم المخزن مطلوب');
      return;
    }
    if (
      !this.requestDataForm.controls['supplier_id'].value &&
      this.type === 'supplier'
    ) {
      this.toastr.error('حقل المورد مطلوب');
      return;
    }
    if (
      !this.requestDataForm.controls['pharmacy_id'].value &&
      this.type === 'client'
    ) {
      this.toastr.error('حقل العميل مطلوب');
      return;
    }

    console.log(this.cartData);
    if (this.type === 'supplier') {
      const index = this.cartData.findIndex(
        (cart_item: any) =>
          cart_item.product_id === this.selectedProduct.product_id &&
          cart_item.supplier_id ===
            this.requestDataForm.controls['supplier_id'].value
      );
      if (index > -1) {
        this.toastr.error('هذا الصنف تم إضافته من قبل');
        return;
      }
      cartProduct.supplier_id =
        this.requestDataForm.controls['supplier_id'].value;
      cartProduct.is_supplier = 1;
    } else if (this.type === 'client') {
      console.log(this.requestDataForm.controls['pharmacy_id'].value);
      const index = this.cartData.findIndex(
        (cart_item: any) =>
          cart_item.product_id === this.selectedProduct.product_id &&
          cart_item.pharmacy_id ===
            this.requestDataForm.controls['pharmacy_id'].value
      );
      if (index > -1) {
        this.toastr.error('هذا الصنف تم إضافته من قبل');
        return;
      }
      cartProduct.pharmacy_id =
        this.requestDataForm.controls['pharmacy_id'].value;
      cartProduct.is_supplier = 0;
    }

    cartProduct.warehouse_id =
      this.requestDataForm.controls['warehouse_id'].value;

    cartProduct.product_id = this.selectedProduct.product_id;
    cartProduct.expired_at = '';
    cartProduct.operating_number = '';
    cartProduct.quantity = this.addProductForm.controls['quantity'].value;
    cartProduct.note = this.addProductForm.controls['note'].value;
    cartProduct.public_price = this.addProductForm.controls['price'].value;
    cartProduct.discount = this.addProductForm.controls['discount'].value;
    cartProduct.taxes = this.selectedProduct.taxes;
    cartProduct.product_name = this.selectedProduct.product_name;
    cartProduct.subtotal = cartProduct.public_price * cartProduct.quantity;
    if (this.selectedProduct.discount && this.selectedProduct.discount < 100) {
      cartProduct.subtotal =
        cartProduct.subtotal -
        cartProduct.subtotal * (cartProduct.discount / 100);
    }
    cartProduct.created_by = this.authService.getUserObj().name;

    this.cartData = [...this.cartData, cartProduct];

    this.disableWarehouse = true;

    this.supplyRequestTotals.total_taxes =
      this.supplyRequestTotals.total_taxes + cartProduct.taxes;

    this.calcTotal();

    this.resetAddProductForm();
    this.focus('productsDropdown');

    table.clear();
    this.cdr.detectChanges();
  }
  updateWarehouse(dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.disableWarehouse = false;
      dropdown?.close();
    }
  }
  deleteQuantity() {
    let index_to_remove: any = [];
    this.cartData.forEach((cart_item: any, index: number) => {
      if (
        cart_item.quantity ==
        Number(this.DeleteWithQuantity.controls['quantity'].value)
      ) {
        this.supplyRequestTotals.total_products =
          this.supplyRequestTotals.total_products - 1;
        this.supplyRequestTotals.total_public_price =
          this.supplyRequestTotals.total_public_price -
          cart_item.public_price * cart_item.quantity;
        this.supplyRequestTotals.total_taxes =
          this.supplyRequestTotals.total_taxes -
          cart_item.taxes * cart_item.quantity;
        let total_supply_price: any =
          this.supplyRequestTotals.total_supply_price - cart_item.subtotal;
        let rounded: number = Math.round(total_supply_price * 100) / 100;
        this.supplyRequestTotals.total_supply_price = rounded;
        index_to_remove.push(index);
      }
    });

    this.cartData = this.cartData.filter(
      (_, index) => !index_to_remove.includes(index)
    );

    this.toastr.info('تم بنجاح');
    this.closeDeleteQuantity();
    this.DeleteWithQuantity.reset();
    if (this.searchWord) {
      this.searchWord = '';
      this.direction = '';
      this.router.navigate([], {
        queryParams: {},
        queryParamsHandling: 'merge',
      });
    }
  }

  // goToNext(currentIndex:number,next_type:string) {
  //   let nextIndex=currentIndex+1
  //       const next = document.getElementById(String(`${next_type}${nextIndex}`)) as HTMLElement;
  //       if (next) {
  //         const hiddenInput = next.querySelector('input') as HTMLElement;
  //         if (hiddenInput) {
  //           hiddenInput.focus();
  //         }
  //   }
  //  }

  goToNext(currentIndex: number, next_type: string) {
    let nextIndex = currentIndex + 1;
    if (next_type == 'operating_number') {
      const next = document.getElementById(
        `${next_type}-${currentIndex}`
      ) as HTMLElement;
      if (next) {
        next.focus();
      }
    } else {
      const next = document.getElementById(
        `${next_type}-${nextIndex}`
      ) as HTMLElement;
      if (next) {
        next.focus();
      }
    }
  }

  resetAddProductForm() {
    for (const key in this.addProductForm.value) {
      if (key != 'purchase_id') {
        this.addProductForm.controls[key].reset();
      }
    }
  }

  getallData(filters?: any) {
    let x: LooseObject = {};
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value) x[key] = value;
      }
    }
    x['purchase_id'] = this.purchase_id;
    let getUrl = 'purchases/supply-request/get-cart-items';
    return this.http.getReq(getUrl, { params: x });
  }

  product_search() {
    this.subscription.add(
      this.searchInput$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          return this.router.navigate([], {
            queryParams: { product_name: this.searchWord },
            queryParamsHandling: 'merge',
          });
        },
        complete: () => {},
      })
    );

    this.searchInput$.next(this.searchWord);
  }

  sortByName() {
    if (this.cartData.length > 0) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
      setTimeout(() => {
        return this.router.navigate([], {
          queryParams: { sort_by: 'name_ar', direction: this.direction },
          queryParamsHandling: 'merge',
        });
      }, 50);
    }
  }

  deleteProduct(product_index: number) {
    this.supplyRequestTotals.total_products =
      this.supplyRequestTotals.total_products - 1;
    this.supplyRequestTotals.total_public_price =
      this.supplyRequestTotals.total_public_price -
      this.cartData[product_index].public_price *
        this.cartData[product_index].quantity;
    this.supplyRequestTotals.total_taxes =
      this.supplyRequestTotals.total_taxes -
      this.cartData[product_index].taxes *
        this.cartData[product_index].quantity;
    let total_supply_price: any =
      this.supplyRequestTotals.total_supply_price -
      this.cartData[product_index].subtotal;
    let rounded: number = Math.round(total_supply_price * 100) / 100;
    this.supplyRequestTotals.total_supply_price = rounded;
    this.cartData.splice(product_index, 1);

    this.toastr.info('تم بنجاح');
  }

  deleteSupplyRequest() {
    let message: string = 'تم بنجاح';
    this.toastr.info(message);
    this.resetPage();
    this.closePopup();
  }

  parseDateString(dateString: string): Date | null {
    const regex1 = /^(\d{2})-(\d{4})$/; // matches "07-2024"
    const regex2 = /^(\d{4})-(\d{2})$/; // matches "2024-07"

    let dateParts;

    if (regex1.test(dateString)) {
      dateParts = dateString.match(regex1);
      if (dateParts) {
        return new Date(+dateParts[2], +dateParts[1] - 1); // new Date(year, monthIndex)
      }
    } else if (regex2.test(dateString)) {
      dateParts = dateString.match(regex2);
      if (dateParts) {
        return new Date(+dateParts[1], +dateParts[2] - 1); // new Date(year, monthIndex)
      }
    }

    return null;
  }

  saveSupplyRequest() {
    let message: string = '';
    let formDataPayLoad = new FormData();
    console.log(this.cartData);
    this.cartData.forEach((cart_item: purchase_cart, index: number) => {
      if (
        cart_item.operating_number != undefined &&
        cart_item.operating_number != null &&
        cart_item.operating_number != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][operating_number]`,
          String(cart_item.operating_number)
        );
      }
      if (
        cart_item.warehouse_id != undefined &&
        cart_item.warehouse_id != null &&
        String(cart_item.warehouse_id) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][warehouse_id]`,
          String(cart_item.warehouse_id)
        );
      }
      if (
        cart_item.supplier_id != undefined &&
        cart_item.supplier_id != null &&
        this.type === 'supplier' &&
        String(cart_item.supplier_id) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][supplier_id]`,
          String(cart_item.supplier_id)
        );
        formDataPayLoad.set(
          `purchases[${index}][is_supplier]`,
          String(cart_item.is_supplier)
        );
      }
      console.log(cart_item.pharmacy_id);
      if (
        cart_item.pharmacy_id != undefined &&
        cart_item.pharmacy_id != null &&
        this.type === 'client' &&
        String(cart_item.pharmacy_id) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][pharmacy_id]`,
          String(cart_item.pharmacy_id)
        );
        formDataPayLoad.set(
          `purchases[${index}][is_supplier]`,
          String(cart_item.is_supplier)
        );
      }
      if (
        cart_item.product_id != undefined &&
        cart_item.product_id != null &&
        String(cart_item.product_id) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][product_id]`,
          String(cart_item.product_id)
        );
      }
      if (
        cart_item.discount != undefined &&
        cart_item.discount != null &&
        String(cart_item.discount) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][discount]`,
          String(cart_item.discount)
        );
      }
      if (
        cart_item.public_price != undefined &&
        cart_item.public_price != null &&
        String(cart_item.public_price) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][price]`,
          String(cart_item.public_price)
        );
      }
      if (
        cart_item.quantity != undefined &&
        cart_item.quantity != null &&
        String(cart_item.quantity) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][quantity]`,
          String(cart_item.quantity)
        );
      }
      if (
        cart_item.taxes != undefined &&
        cart_item.taxes != null &&
        String(cart_item.taxes) != ''
      ) {
        formDataPayLoad.set(
          `purchases[${index}][taxes]`,
          String(cart_item.taxes)
        );
      }
      if (
        cart_item.expired_at != undefined &&
        cart_item.expired_at != null &&
        cart_item.expired_at != ''
      ) {
        const dateString = cart_item.expired_at;
        const formattedDate = datePipe.transform(
          this.parseDateString(dateString),
          'yyyy-MM'
        );
        formDataPayLoad.set(
          `purchases[${index}][expired_at]`,
          String(formattedDate)
        );
      }
      if (cart_item.note != null && cart_item.note != undefined) {
        formDataPayLoad.set(
          `purchases[${index}][note]`,
          String(cart_item.note)
        );
      }
    });

    let url = 'purchases/supply-request/submit-combined-request';

    this.subscription.add(
      this.http.postReq(url, formDataPayLoad).subscribe({
        next: (res) => {
          message = res.message;
          this.closeSaveModal();
        },
        complete: () => {
          this.toastr.info(message);
          // if(status==4){
          //   this.resetPage()
          // }
          this.resetPage();
        },
        error: () => {
          this.closeSaveModal();
        },
      })
    );
  }
  supplierNameClick(supplier_data: any) {
    if (this.addProductForm.controls['product_id'].value) {
      this.addProductForm.controls['price'].setValue(supplier_data.price);
      this.addProductForm.controls['discount'].setValue(supplier_data.discount);
      this.requestDataForm.controls['supplier_id'].setValue(supplier_data.id);
    } else {
      this.toastr.error('اختر الصنف اولا');
    }
  }
  filter() {
    let all_params: LooseObject = {};
    for (const key in this.requestDataForm.value) {
      let value = this.requestDataForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from' || key == 'to') {
          all_params[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          all_params[key] = value;
        }
      }
    }

    let product_id = this.addProductForm.controls['product_id'].value;
    if (product_id != null && product_id != undefined && product_id != '') {
      all_params['product_id'] = product_id;
    }

    this.subscription.add(
      this.http
        .getReq('purchases/supply-request/searching', { params: all_params })
        .subscribe({
          next: (res) => {
            this.statisticsForm.patchValue(res.data);
          },
        })
    );

    this.suppliersDiscountSort();
  }

  suppliersDiscountSort(event?: any) {
    let all_params: LooseObject = {};
    if (event) {
      all_params['sort_by'] = event.name;
      all_params['direction'] = event.direction;
    }

    let product_id = this.addProductForm.controls['product_id'].value;
    if (product_id == null || product_id == undefined || product_id == '') {
      return;
    }
    all_params['product_id'] = product_id;
    this.subscription.add(
      this.http
        .getReq('purchases/supply-request/get-suppliers-discount', {
          params: all_params,
        })
        .subscribe({
          next: (res) => {
            this.suppliersDiscount = [];
            if (res.data) {
              res.data.forEach((discount: any) => {
                this.suppliersDiscount.push({
                  supplier_name: discount.supplier.name,
                  supplier_id: discount.supplier.supplier_id,
                  created_at: discount.created_at,
                  discount: discount.discount,
                  price: discount.price,
                });
              });
            }
          },
        })
    );
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement.value;
    const dt = (document.querySelector('#dt') as any)?.dt;
    dt?.filter(value, 'product_name', 'contains');
  }
  finishSupplyRequest() {}

  resetPage() {
    this.addProductForm.reset();
    this.filterForm.reset();
    this.DeleteWithQuantity.reset();
    this.requestDataForm.reset();
    this.statisticsForm.reset();
    this.suppliersDiscount = [];
    this.cartData = [];
    this.supplyRequestTotals = {
      total_products: 0,
      total_public_price: 0,
      total_taxes: 0,
      total_supply_price: 0,
    };
    this.purchase_id = 0;
    this.disableWarehouse = false;
    let fromDate = new Date();
    let toDate = new Date();
    fromDate.setDate(toDate.getDate() - 30);
    this.requestDataForm.controls['from'].setValue(fromDate);
    this.requestDataForm.controls['to'].setValue(toDate);
  }

  @ViewChild(NotesModalComponent)
  private notesModalComponent!: NotesModalComponent;
  product_Index: number = -1;
  productNote!: string | null;
  showEditNoteModal(product_Index: number) {
    this.productNote = this.cartData[product_Index].note;
    // console.log(this.productNote)
    this.product_Index = product_Index;
    setTimeout(() => {
      this.notesModalComponent.openModal();
    }, 100);
  }

  editNote(newNote: any) {
    this.cartData[this.product_Index].note = newNote;
    // let successMessage:string=''
    // let params={
    //   note:newNote
    // }
    // this.subscription.add(this.http.getReq('',{params:params}).subscribe({
    //   next:res=>{
    //    successMessage=res.message
    //   },complete:()=>{
    //     this.toastr.info(successMessage)
    //   }
    // }))
  }
  navigateToEditProduct() {
    if (this.addProductForm.controls['product_id'].value) {
      const productId = this.addProductForm.controls['product_id'].value;
      const url = `/warehouse/storekeeper/Inventory-of-Items-and-Warehouses/inventory-and-stock-balance-details/${productId}`;
      window.open(url, '_blank');
      // this.router.navigate(['/warehouse/storekeeper/Inventory-of-Items-and-Warehouses/inventory-and-stock-balance-details/'+this.addProductForm.controls['product_id'].value])
    } else {
      this.toastr.error('اختر الصنف اولا');
    }
  }
  @ViewChild('openCalculateBonusAndTaxModal')
  private openCalculateBonusAndTaxModal!: ElementRef;
  page: number = 1;
  total!: number;
  rows!: number;
  firstTime: boolean = true;
  openCalculateBonusAndTax() {
    let product_id: number = this.addProductForm.controls['product_id'].value;
    if (product_id) {
      // this.updateCurrentPage(0)
      this.openCalculateBonusAndTaxModal.nativeElement.click();
    } else {
      this.toastr.error('اختر الصنف اولا');
    }
  }
  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }
  getcalculateBonusAndTax(event: any) {
    this.page = event.page + 1;
    let product_id: number = this.addProductForm.controls['product_id'].value;
    if (product_id) {
      this.calculateBonusAndTaxForm.controls['product_id'].setValue(product_id);
      //get data in table
      let params: any = {
        product_id: product_id,
        page: this.page,
      };
      this.subscription.add(
        this.http
          .getReq('purchases/supply-request/get-calculate-bonus-history', {
            params: params,
          })
          .subscribe({
            next: (res) => {
              this.calculateBonusAndDiscount = [];
              res.data.forEach((bonus: any) => {
                this.calculateBonusAndDiscount.push({
                  discount: bonus.total_net_discount,
                  taxes: bonus.taxes,
                  bonus: bonus.bonus,
                  quantity: bonus.quantity,
                  created_at: bonus.created_at,
                  created_by: bonus.created_by.name,
                  company: bonus?.manufacturer_name,
                });
              });
              this.total = res.meta.total;
              this.rows = res.meta.per_page;
            },
            complete: () => {},
          })
      );
      // this.openCalculateBonusAndTaxModal.nativeElement.click()
    }
  }
  submitType!: string;
  @ViewChild('closeSavebtn') private closeSavebtn!: ElementRef;
  closeSaveModal() {
    this.closeSavebtn.nativeElement.click();
  }

  @ViewChild('closeDeleteQuantityBtn')
  private closeDeleteQuantityBtn!: ElementRef;
  closeDeleteQuantity() {
    this.closeDeleteQuantityBtn.nativeElement.click();
  }

  popupType!: number;
  @ViewChild('popupModalOpen') popupModalOpen!: ElementRef<HTMLElement>;
  @ViewChild('PopupModalClose') PopupModalClose!: ElementRef<HTMLElement>;
  delete_product_index!: number;
  openModel(type: number, product_index?: number) {
    if (type == 1) {
      this.popupType = 1;
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'حذف';
      this.popupMessage = 'هل انت متأكد من حذف الطلب !';
    } else if (type == 2) {
      this.popupType = 2;
      this.popupMessage = 'هل انت متأكد من حذف الصنف !';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'حذف';
      this.delete_product_index = Number(product_index);
    }
    let el: HTMLElement = this.popupModalOpen.nativeElement;
    el.click();
  }
  closePopup() {
    let el: HTMLElement = this.PopupModalClose.nativeElement;
    el.click();
  }

  Popupevent(event: any) {
    if (this.popupType == 1) {
      if (event.ok == true) {
        this.deleteSupplyRequest();
      } else {
        this.closePopup();
      }
    } else {
      if (event.ok == true) {
        this.deleteProduct(this.delete_product_index);
      } else {
        this.closePopup();
      }
    }
  }

  formatDataInput(product_index: number) {
    let value = this.cartData[product_index].expired_at;

    // Remove all non-digit characters
    value = value.replace(/\D/g, '');
    let firstDigit = Number(value[0]);

    if (
      value.length > 0 &&
      value.length < 2 &&
      firstDigit != 0 &&
      firstDigit >= 2
    ) {
      value = '0' + value;
    }

    // Format the input as MM-YYYY
    if (value.length > 2) {
      value = value.slice(0, 2) + '-' + value.slice(2, 6);
    }

    this.cartData[product_index].expired_at = value;
  }

  getSupplyRequest(supply_request_id: number) {
    let param = {
      purchase_id: supply_request_id,
    };
    let supply_request: any;
    this.subscription.add(
      this.http
        .getReq('purchases/supply-request/get-cart-items', { params: param })
        .subscribe({
          next: (res) => {
            supply_request = res;
          },
          complete: () => {
            this.cartData = [];
            this.addProductForm.controls['purchase_id'].setValue(
              supply_request.data.id
            );
            this.purchase_id = supply_request.data.id;
            this.requestDataForm.controls['supplier_id'].setValue(
              supply_request.data.supplier.id
            );
            this.requestDataForm.controls['warehouse_id'].setValue(
              supply_request.data.warehouse.id
            );
            this.disableWarehouse = true;
            this.supplyRequestTotals = supply_request.additional_data;
            supply_request.data.cart.forEach((item: any) => {
              this.cartData.push(item);
            });
          },
        })
    );
  }

  calculateDiscount(next_input: any, event: any, formControlName: string) {
    let data: any;
    let body: LooseObject = {};
    let additional_discounts_temp = [];
    for (const key in this.calculateBonusAndTaxForm.value) {
      let value = this.calculateBonusAndTaxForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'additional_discount1') {
          body[`additional_discounts[${0}]`] = value;
        } else if (key == 'additional_discount2') {
          body[`additional_discounts[${1}]`] = value;
        } else if (key == 'additional_discount3') {
          body[`additional_discounts[${2}]`] = value;
        } else {
          body[key] = value;
        }
      }
    }
    if (next_input) {
      event.preventDefault();
      next_input.focus();
      // next_input.preventDefault()
    }
    if (
      this.calculateBonusAndTaxForm.valid &&
      this.calculateBonusAndTaxForm.controls[formControlName].value
    ) {
      this.subscription.add(
        this.http
          .getReq('purchases/supply-request/get-net-discount', { params: body })
          .subscribe({
            next: (res) => {
              data = res.data;
            },
            complete: () => {
              this.total_discount = data.total_net_discount;
            },
          })
      );
    } else {
      this.calculateBonusAndTaxForm.markAllAsTouched();
    }
  }
  saveDiscount(quantity_input: any) {
    let data: any;
    let body: LooseObject = {};
    let additional_discounts_temp = [];
    for (const key in this.calculateBonusAndTaxForm.value) {
      let value = this.calculateBonusAndTaxForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (
          key == 'additional_discount1' ||
          key == 'additional_discount2' ||
          key == 'additional_discount3'
        ) {
          additional_discounts_temp.push(value);
          body['additional_discounts'] = additional_discounts_temp;
        } else {
          body[key] = value;
        }
      }
    }

    if (this.calculateBonusAndTaxForm.valid) {
      this.subscription.add(
        this.http
          .postReq('purchases/supply-request/calculate-bonus', body)
          .subscribe({
            next: (res) => {
              data = res.data;
            },
            complete: () => {
              if (this.page == 1) {
                let new_bonuse = {
                  discount: data.total_net_discount,
                  taxes: data.taxes,
                  bonus: data.bonus,
                  quantity: data.quantity,
                  created_at: data.created_at,
                  created_by: data.created_by.name,
                  company: data?.manufacturer_name,
                };
                this.calculateBonusAndDiscount.pop();
                this.calculateBonusAndDiscount.splice(0, 0, new_bonuse);
              }

              this.calculateBonusAndTaxForm.reset();
              this.total_discount = 0;
              quantity_input.focus();
            },
          })
      );
    } else {
      this.calculateBonusAndTaxForm.markAllAsTouched();
    }
  }

  @ViewChild('typeModel') typeModel!: ElementRef<HTMLElement>;

  openClinetPopup() {
    this.typeModel.nativeElement.click();
  }
}
