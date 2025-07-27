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
  selector: 'app-create-shortage',
  templateUrl: './create-shortage.component.html',
  styleUrls: ['./create-shortage.component.scss'],
})
export class CreateShortageComponent implements OnInit {
  private subscription = new Subscription();
  addShortageForm!: FormGroup;
  updateShortageForm!: FormGroup;
  filterShortageForm!: FormGroup;
  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
    },
    {
      name: ' المخزن	',
    },
    {
      name: ' كمية الكوتة	',
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
      name: 'quota_quantity',
      type: 'normal',
    },
    {
      name: 'begin_at',
      type: 'normal',
    },
    {
      name: 'expired_at',
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
  discount_slat: commonObject[] = [];

  total!: number;
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
    this.addShortageForm = this.fb.group({
      warehouse_id: [''],
      product_id: [''],
      discount_tiers_ids: [''],
      public_price: [''],
      normal_discount: [''],
      max_tier_discount: [''],
      begin_at: [''],
      expired_at: [''],
      total_quantity: [''],
      quota_quantity: [''],
      untill_stock_finished: [false],
    });

    this.updateShortageForm = this.fb.group({
      product_name: [''],
      warehouse_name: [''],
      quota_quantity: [''],
      begin_at: [''],
      expired_at: [''],
      untill_stock_finished: [''],
    });
    this.filterShortageForm = this.fb.group({
      product_id: [''],
      manufactured_by: [''],
      status: [''],
      from: [''],
      to: [''],
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
      getUrl = 'products/shortage/index';
    } else {
      getUrl = 'products/shortage/index/all';
    }

    return this.http.getReq(getUrl, { params: x });
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
          `settings/discount-tiers?product_id=${this.addShortageForm.value.product_id}&warehouse_id=${this.addShortageForm.value.warehouse_id}`
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
    for (const key in this.addShortageForm.value) {
      let value = this.addShortageForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'begin_at' || key == 'expired_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          if (
            key == 'discount_tiers_ids' ||
            key == 'warehouse_id' ||
            key == 'product_id' ||
            key == 'quota_quantity'
          ) {
            queryParams[key] = value;
          } else if (key == 'untill_stock_finished') {
            value == true ? (queryParams[key] = 1) : (queryParams[key] = 0);
          }
        }
      }
    }
    let message: string = '';
    let product: any;
    this.subscription.add(
      this.http.postReq('products/shortage/create', queryParams).subscribe({
        next: (res) => {
          message = res.message;
          product = res.data;
        },
        complete: () => {
          if ((this.page = 1)) {
            this.shortageData.unshift(product);
          } else {
            this.page = 1;
            this.updateCurrentPage(this.page - 1);
            this.changepages({ page: 0 });
          }
          this.toastrService.success(message);
          this.addShortageForm.reset({ untill_stock_finished: false });
        },
      })
    );
  }
  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  getProductDetails() {
    if (
      this.addShortageForm.controls['product_id'].value &&
      this.addShortageForm.controls['warehouse_id'].value
    ) {
      let params = {
        product_id: this.addShortageForm.controls['product_id'].value,
        warehouse_id: this.addShortageForm.controls['warehouse_id'].value,
      };
      this.subscription.add(
        this.http
          .getReq('products/shortage/product', { params: params })
          .subscribe({
            next: (res) => {
              this.addShortageForm.patchValue(res.data);
            },
          })
      );
    }
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
    this.updateShortageForm.controls['untill_stock_finished'].setValue(
      this.shortageData[this.index_to_update].status.value == 1 ? true : false
    );
    let el: HTMLElement = this.updateShortageModelbtn.nativeElement;
    el.click();
  }

  updateShortage() {
    let queryParams: any = {};
    for (const key in this.updateShortageForm.value) {
      let value = this.updateShortageForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'expired_at' || key == 'begin_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else if (key == 'untill_stock_finished') {
          value == 'true' ? (queryParams[key] = 1) : (queryParams[key] = 0);
        } else if (key == 'quota_quantity') {
          queryParams[key] = value;
        }
      }
    }
    // this.shortageData[this.index_to_update].id
    this.subscription.add(
      this.http
        .postReq(`products/shortage/${1}/update`, queryParams)
        .subscribe({
          next: (res) => {
            this.addShortageForm.patchValue(res.data);
          },
        })
    );
  }

  filterShortage() {
    let queryParams: any = {};
    for (const key in this.filterShortageForm.value) {
      let value = this.filterShortageForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from' || key == 'to') {
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
        begin_at: request.begin_at,
        expired_at: request.expired_at,
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
          begin_at: request.begin_at,
          expired_at: request.expired_at,
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

  injectDiscountTierIntoDropDown() {
    if (
      this.addShortageForm.value.warehouse_id &&
      this.addShortageForm.value.product_id
    ) {
      this.getDiscountTier();
      this.getProductDetails();
    }
  }
}
