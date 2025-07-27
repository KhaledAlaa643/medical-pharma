import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { warehouses, product_dropdown } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-create-bonus',
  templateUrl: './create-bonus.component.html',
  styleUrls: ['./create-bonus.component.scss'],
})
export class CreateBonusComponent {
  private subscription = new Subscription();
  addBonusForm!: FormGroup;
  discount_slat: commonObject[] = [];
  updateBonusForm!: FormGroup;
  filterBonusForm!: FormGroup;
  profitPercent: string = '0%';
  lossPercent: string = '0%';
  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
    },
    {
      name: 'المخزن',
    },
    {
      name: 'الكمية',
    },
    {
      name: 'شرائح الخصم',
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
    this.addBonusForm = this.fb.group({
      warehouse_id: [''],
      product_id: [''],
      discount_tier_ids: [''],
      quantity: [''],
      total_quantity: [''],
      max_discount_tier: [''],
      avg_discount_percent: [''],
      supply_price: [''],
      avg_discount: [''],
      public_price: [''],
      normal_discount: [''],
      taxes: [''],
      quantity_profit: [''],
      bonus_cost: [''],
      net_profit: [''],
      // warehouse_quantity: [''],
      bonus: [''],
      start_date: [''],
      end_date: [''],
      till_finished: [false],
      quantity1: [''],
      bonus1: [''],
      quantity2: [''],
      bonus2: [''],
      quantity3: [''],
      bonus3: [''],
      quantity4: [''],
      bonus4: [''],
    });

    this.updateBonusForm = this.fb.group({
      warehouse_name: [''],
      product_name: [''],
      start_date: [''],
      end_date: [''],
      till_finished: [],
    });
    this.filterBonusForm = this.fb.group({
      product_id: [''],
      warehouse_id: [''],
      manufactured_by: [''],
      created_by: [''],
      status: [''],
      start: [''],
      end: [''],
      till_finished: [''],
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
            this.total = res.additional_data.offers_count;
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
      getUrl = 'products/bonus';
    } else {
      getUrl = 'products/bonus/all';
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

  checkBonus() {
    if (this.addBonusForm.value.quantity && this.addBonusForm.value.bonus) {
      this.addBonusForm.patchValue({
        bonus1: this.addBonusForm.value.bonus * 2,
        quantity1: this.addBonusForm.value.quantity * 2,
        bonus2: this.addBonusForm.value.bonus * 3,
        quantity2: this.addBonusForm.value.quantity * 3,
        bonus3: this.addBonusForm.value.bonus * 4,
        quantity3: this.addBonusForm.value.quantity * 4,
        bonus4: this.addBonusForm.value.bonus * 5,
        quantity4: this.addBonusForm.value.quantity * 5,
      });
      let params = new HttpParams()
        .set('product_id', this.addBonusForm.value.product_id)
        .set('warehouse_id', this.addBonusForm.value.warehouse_id)
        .set('quantity', this.addBonusForm.value.quantity)
        .set('bonus', this.addBonusForm.value.bonus);

      // Check if discount_tier_ids is an array before appending
      if (Array.isArray(this.addBonusForm.value.discount_tier_ids)) {
        this.addBonusForm.value.discount_tier_ids.forEach((id: number) => {
          params = params.append('discount_tiers[]', id.toString());
        });
      } else {
        console.error('discount_tier_ids is not an array');
      }

      this.subscription.add(
        this.http.getReq(`products/bonus/check`, { params }).subscribe({
          next: (res) => {
            this.lossPercent = res.data.loss_percent;
            this.profitPercent = res.data.profit_percent;
            this.addBonusForm.patchValue(res.data);
          },
        })
      );
    }
  }

  getDiscountTier() {
    this.subscription.add(
      this.http
        .getReq(
          `settings/discount-tiers?product_id=${this.addBonusForm.value.product_id}&warehouse_id=${this.addBonusForm.value.warehouse_id}`
        )
        .subscribe({
          next: (res) => {
            this.discount_slat = res.data;
          },
        })
    );
  }

  injectDiscountTierIntoDropDown() {
    if (
      this.addBonusForm.value.warehouse_id &&
      this.addBonusForm.value.product_id
    ) {
      this.getDiscountTier();
      this.getProductDetails();
    }
  }

  addBonus() {
    let queryParams: any = {};
    for (const key in this.addBonusForm.value) {
      let value = this.addBonusForm.controls[key].value;
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
      this.http.postReq('products/bonus', queryParams).subscribe({
        next: (res) => {
          message = res.message;
          product = res.data;
        },
        complete: () => {
          // if ((this.page = 1)) {
          //   this.shortageData.unshift(product);
          // } else {
          //   this.page = 1;
          //   this.updateCurrentPage(this.page - 1);
          //   this.changepages({ page: 0 });
          // }
          this.toastrService.success(message);
          this.addBonusForm.reset({ till_finished: false });
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
      product_id: this.addBonusForm.controls['product_id'].value,
      warehouse_id: this.addBonusForm.controls['warehouse_id'].value,
    };
    this.subscription.add(
      this.http.getReq('products/bonus/product', { params: params }).subscribe({
        next: (res) => {
          this.addBonusForm.patchValue(res.data);
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
    this.updateBonusForm.patchValue(this.shortageData[this.index_to_update]);
    console.log(this.shortageData[this.index_to_update]);
    let el: HTMLElement = this.updateShortageModelbtn.nativeElement;
    el.click();
  }

  updateShortage() {
    let queryParams: any = {};
    queryParams['id'] = this.shortageData[this.index_to_update].id;
    for (const key in this.updateBonusForm.value) {
      let value = this.updateBonusForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'end_date' || key == 'start_date') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else if (key == 'till_finished') {
          value == true ? (queryParams[key] = 1) : (queryParams[key] = 0);
        }
      }
    }

    this.subscription.add(
      this.http
        .putReq(
          `products/bonus/${this.shortageData[this.index_to_update].id}`,
          queryParams
        )
        .subscribe({
          next: (res) => {
            this.addBonusForm.patchValue(res.data);
            this.toastrService.success(res.message);
          },
        })
    );
  }

  filterShortage() {
    let queryParams: any = {};
    for (const key in this.filterBonusForm.value) {
      let value = this.filterBonusForm.controls[key].value;
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
        quantity: request.quantity,
        discount_tiers: request.discount_tiers.join(' , '),
        start_date: request.start_date,
        end_date: request.end_date,
        warehouse_name: request.warehouse_name,
        manufacturer_name: request.manufacturer_name,
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
        console.log(request);
        data.push({
          product_name: request.product_name,
          created_by: request.created_by,
          quantity: request.quantity,
          discount_tiers: request.discount_tiers.join(' , '),
          start_date: request.start_date,
          end_date: request.end_date,
          warehouse_name: request.warehouse_name,
          manufacturer_name: request.manufacturer_name,
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
