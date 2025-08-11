import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { product_dropdown, warehouses } from '@models/products';
import { supplier } from '@models/suppliers';
import {
  BehaviorSubject,
  Subscription,
  catchError,
  debounceTime,
  of,
  switchMap,
} from 'rxjs';
import { totals } from '../supply-request/supply-request.component';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { ActivatedRoute, Router } from '@angular/router';
import { NotesModalComponent } from '@modules/notes-modal/notes-modal.component';
import { manufacturers } from '@models/manufacturers';
import { GeneralService } from '@services/general.service';
import { commonObject } from '@models/settign-enums';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { LooseObject } from '@models/LooseObject';
import { Dropdown } from 'primeng/dropdown';
import { purchase_cart } from '@models/purchase';
import { DatePipe } from '@angular/common';
import { AuthService } from '@services/auth.service';

const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-supply-request-edit',
  templateUrl: './supply-request-edit.component.html',
  styleUrls: ['./supply-request-edit.component.scss'],
})
export class SupplyRequestEditComponent implements OnInit {
  filterForm!: FormGroup;
  returnForm!: FormGroup;
  calculateBonusAndTaxForm!: FormGroup;
  private subscription = new Subscription();
  suppliers: supplier[] = [];
  warehouses: warehouses[] = [];
  Manufacturers: manufacturers[] = [];
  product_type: commonObject[] = [];
  supplier: supplier = {} as supplier;
  searchInput$ = new BehaviorSubject('');
  searchReturnInput$ = new BehaviorSubject('');
  supplyRequestTotals: totals = {} as totals;
  purchases_return_id!: number;
  activeURL!: string;
  pageType!: string;
  supply_request_id!: number;
  requestDataForm!: FormGroup;
  addProductForm!: FormGroup;
  purchase_id!: number;
  products: product_dropdown[] = [];
  //for calculate bonus and tax popup
  columnsArray3: columnHeaders[] = [
    {
      name: 'الخصم الصافي',
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

  cartData: any = [];
  returns: any = [];
  searchWord!: string;
  returnSearchWord!: string;
  direction!: string;
  returnDirection!: string;
  order_note!: string;
  return_product_name!: string;

  prevCartSearch: string = '';
  prevCartSort: string = '';
  prevCartDirection: string = '';

  prevReturnSearch: string = '';
  prevReturnSort: string = '';
  prevReturnDirection: string = '';

  cartUpdated: boolean = false;
  returnUpdated: boolean = false;
  
  hasStatusTwo: boolean = false;
  constructor(
    private http: HttpService,
    private auth: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    //get all products initialy
    this.requestDataForm = this.fb.group({
      supplier_id: [''],
      warehouse_id: [''],
      note: [''],
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

    this.returnForm = this.fb.group({
      cart_purchase_id: [''],
      quantity: [''],
      reason: [''],
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
    this.supply_request_id = Number(
      this.activeRoute.snapshot.paramMap.get('id')
    );
    this.getSupplyRequest(this.supply_request_id);

    let searchResult: any;
    this.subscription.add(
      this.activeRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            //search in cart
            if (
              this.prevCartSearch != JSON.stringify(param['product_name']) ||
              this.prevCartSort != JSON.stringify(param['sort_by']) ||
              this.prevCartDirection != JSON.stringify(param['direction'])
            ) {
              this.cartUpdated = true;
              this.prevCartSearch = JSON.stringify(param['product_name']);
              this.prevCartSort = JSON.stringify(param['sort_by']);
              this.prevCartDirection = JSON.stringify(param['direction']);
              if (this.searchWord || this.direction) {
                return this.getallData(false, param).pipe(
                  catchError((error) => {
                    return of({ data: [] });
                  })
                );
              } else {
                if (this.purchase_id) {
                  this.cartUpdated = true;
                  return this.getallData(false).pipe(
                    catchError((error) => {
                      return of({ data: [] });
                    })
                  );
                }
              }
            }

            //search in return

            if (
              this.prevReturnSearch != JSON.stringify(param['return_name']) ||
              this.prevReturnSort != JSON.stringify(param['sort_return_by']) ||
              this.prevReturnDirection !=
                JSON.stringify(param['return_direction'])
            ) {
              this.returnUpdated = true;
              this.prevReturnSearch = JSON.stringify(param['return_name']);
              this.prevReturnSort = JSON.stringify(param['sort_return_by']);
              this.prevReturnDirection = JSON.stringify(
                param['return_direction']
              );
              if (this.returnSearchWord || this.returnDirection) {
                return this.getallData(true, param).pipe(
                  catchError((error) => {
                    return of({ data: [] });
                  })
                );
              } else {
                if (this.purchase_id) {
                  this.returnUpdated = true;
                  return this.getallData(true).pipe(
                    catchError((error) => {
                      return of({ data: [] });
                    })
                  );
                }
              }
            }

            return [];
          })
        )
        .subscribe({
          next: (res) => {
            searchResult = res.data;

            if (this.cartUpdated) {
              this.cartData = [];
              this.cartData = searchResult.cart;
            }
            if (this.returnUpdated) {
              this.returns = [];
              searchResult.forEach((return_item: any) => {
                this.returns.push(return_item);

                // this.returns.push({
                //   'id':return_item.id,
                //   // 'purchases_return_id':return_item?.purchases_return_id,
                //   // 'cart_purchase_id':return_item?.id,
                //   'reason':return_item?.reason?.value,
                //   'product_name':return_item.product.name,
                //   'quantity':return_item.quantity_after,
                //   'price':return_item.price_after,
                //   'discount':return_item.discount_value,
                //   'taxes':return_item.taxes,
                //   'total':return_item.total,
                //   'created_by':return_item?.created_by?.name
                // })
              });
            }
            this.returnUpdated = false;
            this.cartUpdated = false;
          },
          complete: () => {},
        })
    );
  }
  returns_reasons: commonObject[] = [];
  getallData(return_data: boolean, filters?: any) {
    let x: LooseObject = {};
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (
          return_data &&
          key != 'product_name' &&
          key != 'sort_by' &&
          key != 'direction'
        ) {
          if (value) x[key] = value;
        }
        if (
          !return_data &&
          key != 'return_name' &&
          key != 'sort_return_by' &&
          key != 'return_direction'
        ) {
          if (value) x[key] = value;
        }
      }
    }
    let getUrl = '';
    if (return_data) {
      x['purchase_id'] = this.purchase_id;
      getUrl = 'purchases/returns/get-cart-items-returned';
    } else {
      x['purchase_id'] = this.purchase_id;
      getUrl = 'purchases/supply-request/get-cart-items';
    }
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
  product_return_search() {
    this.subscription.add(
      this.searchReturnInput$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          return this.router.navigate([], {
            queryParams: { return_name: this.returnSearchWord },
            queryParamsHandling: 'merge',
          });
        },
        complete: () => {},
      })
    );

    this.searchReturnInput$.next(this.returnSearchWord);
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['suppliers', 'static_manufacturers'])
        .subscribe({
          next: (res) => {
            this.suppliers = res.data.suppliers;
            // this.warehouses=res.data.warehouses
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
    // this.subscription.add(this.generalService.getSettingsEnum().subscribe({
    //   next:res=>{
    //     this.product_type=res.data.product_type
    //     this.returns_reasons=res.data.returns_reasons
    //   }
    // }))
    this.product_type = this.auth.getEnums().product_type;
    this.returns_reasons = this.auth.getEnums().returns_reasons;
  }
  sortByName() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    setTimeout(() => {
      return this.router.navigate([], {
        queryParams: { sort_by: 'name_ar', direction: this.direction },
        queryParamsHandling: 'merge',
      });
    }, 50);
  }
  sortReturnByName() {
    this.returnDirection = this.returnDirection === 'asc' ? 'desc' : 'asc';
    setTimeout(() => {
      return this.router.navigate([], {
        queryParams: {
          sort_return_by: 'name_ar',
          return_direction: this.returnDirection,
        },
        queryParamsHandling: 'merge',
      });
    }, 50);
  }

  popupType!: number;
  @ViewChild('popupModalOpen') popupModalOpen!: ElementRef<HTMLElement>;
  @ViewChild('PopupModalClose') PopupModalClose!: ElementRef<HTMLElement>;
  delete_product_index!: number;
  cancle_button_name!: string;
  ok_button_name!: string;
  popupMessage!: string;
  openModel(type: number, product_index?: number) {
    if (type == 1) {
      this.popupType = 1;
      this.popupMessage = 'هل انت متأكد من حذف الصنف !';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'حذف';
      this.delete_product_index = Number(product_index);
    }
    if (type == 2) {
      this.popupType = 2;
      this.popupMessage = 'هل انت متأكد من حفظ الطلب ؟';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'حفظ';
    }
    if (type == 3) {
      this.popupType = 3;
      this.popupMessage = 'هل انت متأكد من تحويل الطلب الي فتورة شراء؟';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'تأكيد';
    }
    if (type == 4) {
      this.popupType = 4;
      this.popupMessage = 'هل انت متأكد من تعديل المورد؟';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'تعديل';
    }
    if (type == 5) {
      this.popupType = 5;
      this.popupMessage = 'هل انت متأكد من تعديل المخزن ؟';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'تعديل';
    }

    let el: HTMLElement = this.popupModalOpen.nativeElement;
    el.click();
  }
  closePopup() {
    let el: HTMLElement = this.PopupModalClose.nativeElement;
    el.click();
  }

  tempWarehouse!: number;
  temSupplier!: number;
  Popupevent(event: any) {
    alert;
    if (this.popupType == 1) {
      if (event.ok == true) {
        this.deleteProduct(this.delete_product_index);
      } else {
        this.closePopup();
      }
    }
    if (this.popupType == 2) {
      if (event.ok == true) {
        this.saveSupplyRequest(2);
      } else {
        this.closePopup();
      }
    }
    if (this.popupType == 3) {
      if (event.ok == true) {
        this.saveSupplyRequest(4);
      } else {
        this.closePopup();
      }
    }
    if (this.popupType == 4) {
      if (event.cancle == true) {
        this.requestDataForm.controls['supplier_id'].setValue(this.temSupplier);
      } else {
        this.temSupplier = this.requestDataForm.controls['supplier_id'].value;
      }
      this.closePopup();
    }
    if (this.popupType == 5) {
      if (event.cancle == true) {
        this.requestDataForm.controls['warehouse_id'].setValue(
          this.tempWarehouse
        );
      } else {
        this.tempWarehouse =
          this.requestDataForm.controls['warehouse_id'].value;
      }
      this.closePopup();
    }
  }

  deleteProduct(product_index: number) {
    let message: string = '';
    let additional_data: any = {};
    let all_params = {
      cart_purchase_id: this.cartData[product_index].id,
    };
    this.subscription.add(
      this.http
        .deleteReq('purchases/supply-request/delete-item', {
          params: all_params,
        })
        .subscribe({
          next: (res) => {
            message = res.message;
            additional_data = res.additional_data;
          },
          complete: () => {
            this.supplyRequestTotals = additional_data;
            this.toastr.info(message);
            this.cartData.splice(product_index, 1);
            if (this.cartData.length == 0) {
              this.disableWarehouse = false;
              this.purchase_id = 0;
            }
          },
          error: () => {
            this.closePopup();
          },
        })
    );
  }

  @ViewChild(NotesModalComponent)
  private notesModalComponent!: NotesModalComponent;
  product_Index: number = -1;
  productNote!: string;
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

  supply_request_details: any = {};
  getSupplyRequest(supply_request_id: number) {
    let param = {
      purchase_id: supply_request_id,
    };

    this.subscription.add(
      this.http
        .getReq('purchases/supply-request/get-cart-items', { params: param })
        .subscribe({
          next: (res) => {
            this.cartData = [];
            this.returns = [];
            this.order_note = res.data.note;
            this.addProductForm.controls['purchase_id'].setValue(res.data.id);
            this.purchase_id = res.data.id;
            this.temSupplier = res.data.supplier.id;
            this.tempWarehouse = res.data.warehouse.id;
            this.requestDataForm.controls['supplier_id'].setValue(
              res.data.supplier.id
            );
            this.requestDataForm.controls['warehouse_id'].setValue(
              res.data.warehouse.id
            );
            this.requestDataForm.controls['note'].setValue(res.data.note);
            this.supplyRequestTotals = res.additional_data;
            this.supply_request_details = {
              supplier: res.data.supplier.id,
              warehouse: res.data.warehouse.id,
              total_cart_items: res.additional_data.total_products,
              total_price: res.additional_data.total_public_price,
              total_taxes: res.additional_data?.total_taxes,
              total_supply_price: res.additional_data.total_supply_price,
              order_note: res.data.note,
            };
            this.hasStatusTwo = res.data.status.value === 2 || res.data.status.value === 3
            
            if (this.hasStatusTwo) {
              this.supply_request_details.total_returns = res.additional_data.total_returns;
            }
            res.data.cart.forEach((item: any) => {
              if (item.status.value == 2) {
                this.returns.push(item);
              } else {
                this.cartData.push(item);
              }
              // item.return.forEach((return_item:any) => {
              // this.returns.push({
              //   'id':return_item.id,
              //   'purchases_return_id':return_item?.purchases_return_id,
              //   'cart_purchase_id':return_item?.cart_purchase_id,
              //   'reason':return_item?.reason?.value,
              //   'product_name':item.product_name,
              //   'quantity':return_item.quantity,
              //   'price':item.public_price,
              //   'discount':item.discount,
              //   'taxes':item.taxes,
              //   'total':return_item.total,
              //   'created_by':return_item?.created_by?.name
              // })
              // })
            });
            // if(this.returns.length!=0){
            //   this.purchases_return_id=this.returns[0].purchases_return_id

            // }
          },
          complete: () => {
            this.disableSupplier = true;
            this.disableWarehouse = true;
          },
        })
    );
  }

  navigateToEditProduct() {
    if (this.addProductForm.controls['product_id'].value) {
      this.router.navigate([
        '/warehouse/storekeeper/Inventory-of-Items-and-Warehouses/inventory-and-stock-balance-details/' +
          this.addProductForm.controls['product_id'].value,
      ]);
    } else {
      this.toastr.error('اختر الصنف اولا');
    }
  }

  getProductDetails() {
    let product_id = this.addProductForm.controls['product_id'].value;
    if (product_id) {
      let all_params: LooseObject = {
        product_id: product_id,
      };
      if (this.supply_file_product) {
        all_params['supplier_id'] =
          this.requestDataForm.controls['supplier_id'].value;
        all_params['supply_file_product'] =
          this.filterForm.controls['supply_file_product'].value == true ? 1 : 0;
      }
      let product: any = {};
      this.subscription.add(
        this.http
          .getReq('purchases/supply-request/product-details', {
            params: all_params,
          })
          .subscribe({
            next: (res) => {
              product = res.data[0];
            },
            complete: () => {
              this.addProductForm.patchValue(product);
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
  disableWarehouse: boolean = false;
  disableSupplier: boolean = false;
  addProductToCart() {
    let body: LooseObject = {};
    for (const key in this.addProductForm.value) {
      let value = this.addProductForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key != 'expired_at' && key != 'operating_number') {
          body[key] = value;
        }
      }
    }
    if (this.requestDataForm.controls['warehouse_id'].value) {
      body['warehouse_id'] =
        this.requestDataForm.controls['warehouse_id'].value;
    }
    if (this.requestDataForm.controls['supplier_id'].value) {
      body['supplier_id'] = this.requestDataForm.controls['supplier_id'].value;
    }
    let cartProduct: any = {};
    let message: string = '';
    this.subscription.add(
      this.http
        .postReq('purchases/supply-request/add-to-cart', body)
        .subscribe({
          next: (res) => {
            cartProduct = res;
            message = res.message;
          },
          complete: () => {
            this.addProductForm.controls['purchase_id'].setValue(
              cartProduct.data.id
            );
            this.purchase_id = cartProduct.data.id;
            // this.cartData=cartProduct.data.cart
            this.cartData.push(
              cartProduct.data.cart[cartProduct.data.cart.length - 1]
            );
            this.disableWarehouse = true;
            this.supplyRequestTotals = cartProduct.additional_data;
            this.resetAddProductForm();
            this.focus('productsDropdown');
            this.toastr.info(message);
          },
        })
    );
  }
  resetAddProductForm() {
    for (const key in this.addProductForm.value) {
      if (key != 'purchase_id') {
        this.addProductForm.controls[key].reset();
      }
    }
  }

  productChangeEvent(dropdown?: any) {
    if (!dropdown.overlayVisible) {
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

  //api that get all products or products with filter
  @ViewChild('CloseFilterBtn') CloseFilterBtn!: ElementRef<HTMLElement>;
  supply_file_product: boolean = false;

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

  calcTotal(index: any) {
    if (
      this.cartData[index].public_price > 0 &&
      this.cartData[index].quantity > 0
    ) {
      this.cartData[index].total =
        this.cartData[index].public_price * this.cartData[index].quantity;
    } else {
      this.cartData[index].total = 0;
    }

    if (
      this.cartData[index].discount &&
      this.cartData[index].discount < 100 &&
      this.cartData[index].discount >= 0 &&
      this.cartData[index].public_price > 0 &&
      this.cartData[index].quantity > 0
    ) {
      this.cartData[index].total =
        this.cartData[index].total -
        this.cartData[index].total * (this.cartData[index].discount / 100);
    } else {
      this.cartData[index].total =
        this.cartData[index].public_price * this.cartData[index].quantity;
    }
  }

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
  saveSupplyRequest(status: number) {
    let message: string = '';
    let formDataPayLoad = new FormData();
    this.cartData.forEach((cart_item: purchase_cart, index: number) => {
      formDataPayLoad.set(
        `cart[${index}][cart_purchases_id]`,
        String(cart_item.id)
      );
      if (
        cart_item.operating_number != undefined &&
        cart_item.operating_number != null &&
        cart_item.operating_number != ''
      ) {
        formDataPayLoad.set(
          `cart[${index}][operating_number]`,
          String(cart_item.operating_number)
        );
      }
      if (
        cart_item.discount != undefined &&
        cart_item.discount != null &&
        String(cart_item.discount) != ''
      ) {
        formDataPayLoad.set(
          `cart[${index}][discount]`,
          String(cart_item.discount)
        );
      }
      if (
        cart_item.public_price != undefined &&
        cart_item.public_price != null &&
        String(cart_item.public_price) != ''
      ) {
        formDataPayLoad.set(
          `cart[${index}][price]`,
          String(cart_item.public_price)
        );
      }
      if (
        cart_item.quantity != undefined &&
        cart_item.quantity != null &&
        String(cart_item.quantity) != ''
      ) {
        formDataPayLoad.set(
          `cart[${index}][quantity]`,
          String(cart_item.quantity)
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
          `cart[${index}][expired_at]`,
          String(formattedDate)
        );
      }
      if (cart_item.note != null && cart_item.note != undefined) {
        formDataPayLoad.set(`cart[${index}][note]`, String(cart_item.note));
      }
    });

    formDataPayLoad.set('status', String(status));
    formDataPayLoad.set('purchase_id', String(this.purchase_id));
    if (
      this.requestDataForm.controls['note'].value != undefined &&
      this.requestDataForm.controls['note'].value != null &&
      this.requestDataForm.controls['note'].value != ''
    ) {
      formDataPayLoad.set(
        'order_note',
        String(this.requestDataForm.controls['note'].value)
      );
    }

    this.subscription.add(
      this.http
        .postReq('purchases/supply-request/update-request', formDataPayLoad)
        .subscribe({
          next: (res) => {
            message = res.message;
            this.closePopup();
          },
          complete: () => {
            this.toastr.info(message);
            if (status == 4) {
              this.resetPage();
            }
          },
          error: () => {
            this.closePopup();
          },
        })
    );
  }

  resetPage() {
    this.addProductForm.reset();
    this.filterForm.reset();
    this.requestDataForm.reset();
    this.cartData = [];
    this.supplyRequestTotals = {} as totals;
    this.purchase_id = 0;
    this.disableWarehouse = false;
  }

  setReturnData(product: any) {
    this.return_product_name = product.product_name;
    this.returnForm.controls['cart_purchase_id'].setValue(product.id);
  }

  resetReturnForm() {
    this.requestDataForm.reset();
    this.return_product_name = '';
  }
  addReturn() {
    let body = {
      reason: this.returnForm.controls['reason'].value,
      quantity: this.returnForm.controls['quantity'].value,
      cart_purchase_id: this.returnForm.controls['cart_purchase_id'].value,
    };
    let new_cart_item: any = {};
    let message: string = '';
    let old_cart_purchase_id: number;
    this.subscription.add(
      this.http.postReq('purchases/returns/supply-request', body).subscribe({
        next: (res) => {
          new_cart_item = res.data;
          message = res.message;
          old_cart_purchase_id = res.additional_data.old_cart_purchase_id;
        },
        complete: () => {
          // this.purchases_return_id=new_cart_item.return[0].purchases_return_id

          let cart_item_index = this.cartData.findIndex(
            (item: any) => item.id == old_cart_purchase_id
          );
          if (cart_item_index != -1) {
            if (
              this.cartData[cart_item_index].quantity -
                new_cart_item.quantity !=
              0
            ) {
              this.cartData[cart_item_index].quantity =
                this.cartData[cart_item_index].quantity -
                new_cart_item.quantity;
            } else {
              this.cartData.splice(cart_item_index, 1);
            }
          }
          this.returns.push(new_cart_item);
          this.toastr.success(message);
          this.closeReturnPopup();
        },
        error: (err) => {
          this.toastr.error(err.message);
          this.closeReturnPopup();
        },
      })
    );
  }
  cancleReturn(cart_purchase_id: number, index: number) {
    let message: string = '';
    let return_cart: any = {};
    let params = {
      cart_purchase_id: cart_purchase_id,
    };
    this.subscription.add(
      this.http
        .postReq('purchases/returns/supply-request/cancel', params)
        .subscribe({
          next: (res) => {
            message = res.message;
            return_cart = res.data;
          },
          complete: () => {
            this.returns.splice(index, 1);
            this.cartData.forEach((item: any, index: number) => {
              if (
                item.product.id == return_cart.product.id &&
                !item.operating_number &&
                !item.expired_at
              ) {
                this.cartData.splice(index, 1);
              }
            });
            this.cartData.push(return_cart);

            this.toastr.success(message);
          },
        })
    );
  }
  @ViewChild('closeReturnbtn') closeReturnbtn!: ElementRef<HTMLElement>;

  closeReturnPopup() {
    let el: HTMLElement = this.closeReturnbtn.nativeElement;
    el.click();
  }

  @ViewChild('openCalculateBonusAndTaxModal')
  private openCalculateBonusAndTaxModal!: ElementRef;
  total_discount: number = 0;
  page: number = 1;
  total!: number;
  rows!: number;
  firstTime: boolean = true;

  openCalculateBonusAndTax() {
    let product_id: number = this.addProductForm.controls['product_id'].value;
    if (product_id) {
      this.openCalculateBonusAndTaxModal.nativeElement.click();
    } else {
      this.toastr.error('اختر الصنف اولا');
    }
  }

  getcalculateBonusAndTax(event?: any) {
    if (event) {
      this.page = event.page + 1;
    } else {
      this.page = 1;
    }

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
  opencalculateBonusAndTax() {
    let product_id: number = this.addProductForm.controls['product_id'].value;
    if (product_id) {
      this.calculateBonusAndTaxForm.controls['product_id'].setValue(product_id);
      //get data in table
      let params: any = {
        product_id: product_id,
      };
      this.subscription.add(
        this.http
          .getReq('purchases/supply-request/get-calculate-bonus-history', {
            params: params,
          })
          .subscribe({
            next: (res) => {
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
            },
            complete: () => {
              this.openCalculateBonusAndTaxModal.nativeElement.click();
            },
          })
      );
      // this.openCalculateBonusAndTaxModal.nativeElement.click()
    } else {
      this.toastr.error('اختر الصنف اولا');
    }
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
                //  if(this.calculateBonusAndDiscount.length==5){
                //    this.calculateBonusAndDiscount.pop()
                //    this.calculateBonusAndDiscount.splice(0,0,new_bonuse)
                //  }
                //  else{
                //   this.calculateBonusAndDiscount.splice(0,0,new_bonuse)
                // }
                this.getcalculateBonusAndTax();
              }
              const productIdValue =
                this.calculateBonusAndTaxForm.controls['product_id']?.value;

              this.calculateBonusAndTaxForm.reset();

              this.calculateBonusAndTaxForm.controls['product_id']?.setValue(
                productIdValue
              );

              this.total_discount = 0;
              quantity_input.focus();
            },
          })
      );
    } else {
      this.calculateBonusAndTaxForm.markAllAsTouched();
    }
  }
}
