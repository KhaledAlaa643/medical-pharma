import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { product_dropdown, warehouses } from '@models/products';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { catchError, of, Subscription, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import { commonObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { PrintService } from '@services/print.service';
const datePipe = new DatePipe('en-EG');
@Component({
  selector: 'app-create-offers-on-products',
  templateUrl: './create-offers-on-products.component.html',
  styleUrls: ['./create-offers-on-products.component.scss'],
})
export class CreateOffersOnProductsComponent implements OnInit {
  private subscription = new Subscription();
  addOfferForm!: FormGroup;
  updateShortageForm!: FormGroup;
  filterOfferForm!: FormGroup;
  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
    },
    {
      name: 'المخزن',
    },
    {
      name: 'كمية العرض',
    },
    {
      name: 'شرائح الخصم',
    },
    {
      name: 'يضاف الخصم',
    },

    {
      name: 'تاريخ البدء',
    },
    {
      name: 'تاريخ الانتهاء',
    },
    {
      name: 'تصنيع شركة',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'الحالة',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'warehouse_name',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'discount_tiers',
      type: 'multiple_values_array',
    },
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'start_date',
      type: 'normal',
    },
    {
      name: 'end_date',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'status',
      type: 'normal.name',
    },
  ];
  shortageData: any[] = [];
  rows!: number;
  total!: number;
  discount_slat: commonObject[] = [];

  page: number = 1;
  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private toastrService: ToastrService,
    private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private router: Router,
    private printService: PrintService
  ) {}

  ngOnInit() {
    this.getDropdownData();
    this.addOfferForm = this.fb.group({
      warehouse_id: [''],
      id: [''],
      product_id: [''],
      public_price: [''],
      normal_discount: [''],
      max_discount_tier: [''],
      discount: [''],
      start_date: [''],
      quantity: [''],
      end_date: [''],
      discount_tier_ids: [],
      total_quantity: [''],
      quota_quantity: [''],
      till_finished: [false],
    });

    this.updateShortageForm = this.fb.group({
      product_name: [''],
      warehouse_name: [''],
      start_date: [''],
      end_date: [''],
      till_finished: [''],
    });
    this.filterOfferForm = this.fb.group({
      product_id: [''],
      manufactured_by: [''],
      status: [''],
      start: [''],
      end: [''],
      created_by: [''],
    });
    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param, true).pipe(
              catchError((error) => {
                return of({ data: [] });
              })
            );
          })
        )
        .subscribe({
          next: (res) => {
            this.shortageData = res.data;
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
          },
        })
    );
  }

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'products/offers';
    } else {
      getUrl = 'products/offers/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  injectDiscountTierIntoDropDown() {
    if (
      this.addOfferForm.value.warehouse_id &&
      this.addOfferForm.value.product_id
    ) {
      this.getDiscountTier();
      this.getProductDetails();
    }
  }

  warehouses: warehouses[] = [];
  manufacturers: commonObject[] = [];
  status: commonObject[] = [];
  products: product_dropdown[] = [];
  created_by: commonObject[] = [];

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['static_manufacturers', 'purchases_managers'])
        .subscribe({
          next: (res) => {
            this.manufacturers = res.data.static_manufacturers;
            this.created_by = res.data.purchases_managers;
          },
        })
    );

    this.subscription.add(
      this.generalService.getWarehousesDropdown({ module: 'all' }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
        },
      })
    );
    this.status = this.authService.getEnums().shortage_status;
    this.subscription.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );
  }

  getDiscountTier() {
    this.subscription.add(
      this.http
        .getReq(
          `settings/discount-tiers?product_id=${this.addOfferForm.value.product_id}&warehouse_id=${this.addOfferForm.value.warehouse_id}`
        )
        .subscribe({
          next: (res) => {
            this.discount_slat = res.data;
          },
        })
    );
  }
  addShortage() {
    let queryParams: any = {};
    for (const key in this.addOfferForm.value) {
      let value = this.addOfferForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'start_date' || key == 'end_date') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          if (
            key == 'warehouse_id' ||
            key == 'product_id' ||
            key == 'discount_tier_ids' ||
            key == 'quantity' ||
            key == 'discount' ||
            key == 'bonus'
          ) {
            queryParams[key] = value;
          } else if (key == 'till_finished') {
            value == true ? (queryParams[key] = 1) : '';
          }
        }
      }
    }
    let message: string = '';
    let product: any;
    this.subscription.add(
      this.http.postReq('products/offers', queryParams).subscribe({
        next: (res) => {
          message = res.message;
          product = res.data;
        },
        complete: () => {
          this.toastrService.success(message);
          this.addOfferForm.reset({ till_finished: false });
        },
      })
    );
  }
  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  getProductDetails() {
    let params = {
      product_id: this.addOfferForm.controls['product_id'].value,
      warehouse_id: this.addOfferForm.controls['warehouse_id'].value,
    };
    this.subscription.add(
      this.http
        .getReq('products/offers/product', { params: params })
        .subscribe({
          next: (res) => {
            this.addOfferForm.patchValue(res.data);
          },
        })
    );
  }

  changepages(event: any) {
    this.page = event.page + 1;
    this.router.navigate([], {
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
  }
  index_to_update!: number;
  @ViewChild('updateShortageModelbtn')
  updateShortageModelbtn!: ElementRef<HTMLElement>;

  openModal(event: any) {
    this.index_to_update = event.index;
    this.updateShortageForm.patchValue(this.shortageData[this.index_to_update]);
    console.log(this.shortageData[this.index_to_update]);

    let el: HTMLElement = this.updateShortageModelbtn.nativeElement;
    el.click();
  }

  updateShortage() {
    let queryParams: any = { id: this.shortageData[this.index_to_update].id };
    for (const key in this.updateShortageForm.value) {
      let value = this.updateShortageForm.controls[key].value;
      // queryParams['id'] = this.shortageData[this.index_to_update].id;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'start_date' || key == 'end_date') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else if (key == 'till_finished') {
          console.log(value);
          value == true ? (queryParams[key] = 1) : (queryParams[key] = 0);
        }
      }
    }

    this.subscription.add(
      this.http
        .putReq(
          `products/offers/${this.shortageData[this.index_to_update].id}`,
          queryParams
        )
        .subscribe({
          next: (res) => {
            this.addOfferForm.patchValue(res.data);
            this.toastrService.success(res.message);
          },
        })
    );
  }

  filterOffer() {
    let queryParams: any = {};
    for (const key in this.filterOfferForm.value) {
      let value = this.filterOfferForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'start' || key == 'end') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }

    this.page = 1;
    queryParams['page'] = this.page;
    this.updateCurrentPage(this.page - 1);
    this.router.navigate([], { queryParams });
  }

  currentParams: any = {};
  allPrintOrders: any = [];

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((request: any) => {
      tempArr.push({
        product_name: request.product_name,
        created_by: request.created_by,
        start_date: request.start_date,
        end_date: request.end_date,
        discount_tiers: request.discount_tiers.join(' , '),
        discount: request.discount,
        manufacturer_name: request.manufacturer_name,
        quota_quantity: request.quota_quantity,
        warehouse_name: request.warehouse_name,
        status: request.status.name,
      });
    });

    if (pagiated == true) {
      this.shortageData = tempArr;
    } else {
      this.allPrintOrders = tempArr;
    }
  }
  getAllShortage(printType: any) {
    let params = {};
    params = this.currentParams;
    this.subscription.add(
      this.getAllData(params, false).subscribe({
        next: (res) => {
          this.allPrintOrders = [];
          this.getData(res.data, false);
        },
        complete: () => {
          let tempColumnsArray = this.columnsArray.filter(
            (column) => column.name.trim() !== 'أمر'
          );
          let tempColumnsName = this.columnsName.filter(
            (column) => column.name.trim() !== 'options'
          );
          this.printService.setColumnsArray(tempColumnsArray);
          this.printService.setColumnsNames(tempColumnsName);
          this.printService.setRowsData(this.allPrintOrders);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
        },
      })
    );
  }

  print(printData: any) {
    console.log(printData);
    if (printData.amountOfPrint == 2) {
      this.getAllShortage(printData.type);
    } else {
      let tempColumnsArray = this.columnsArray.filter(
        (column) => column.name.trim() !== 'أمر'
      );
      let tempColumnsName = this.columnsName.filter(
        (column) => column.name.trim() !== 'options'
      );
      this.printService.setColumnsArray(tempColumnsArray);
      this.printService.setColumnsNames(tempColumnsName);
      let data: any[] = [];
      this.shortageData.forEach((request: any) => {
        data.push({
          product_name: request.product_name,
          created_by: request.created_by,
          start_date: request.start_date,
          end_date: request.end_date,
          discount_tiers: request.discount_tiers.join(' , '),
          discount: request.discount,
          manufacturer_name: request.manufacturer_name,
          quota_quantity: request.quota_quantity,
          warehouse_name: request.warehouse_name,
          status: request.status.name,
        });
      });
      this.printService.setRowsData(data);

      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
    }

    setTimeout(() => {
      this.openPrintModal();
    }, 100);
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openPrintModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
}
