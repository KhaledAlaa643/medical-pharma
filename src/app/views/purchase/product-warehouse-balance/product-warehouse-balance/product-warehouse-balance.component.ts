import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { warehouses } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import * as bootstrap from 'bootstrap';
import { Paginator } from 'primeng/paginator';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { GeneralService } from '@services/general.service';
import { AuthService } from '@services/auth.service';
import { commonObject } from '@models/settign-enums';
import { ToastrService } from 'ngx-toastr';

const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-product-warehouse-balance',
  templateUrl: './product-warehouse-balance.component.html',
  styleUrls: ['./product-warehouse-balance.component.scss'],
})
export class ProductWarehouseBalanceComponent implements OnInit {
  private subs = new Subscription();
  searchInput$ = new BehaviorSubject('');

  columnsArray: columnHeaders[] = [
    {
      name: 'موقع الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم الصنف',
      sort: true,
      search: true,
      direction: null,
    },
    {
      name: 'السعر  ',
      sort: true,
      direction: null,
    },
    {
      name: 'الكمية ',
      sort: true,
      direction: null,
    },
    {
      name: 'خصم مرجح ',
      sort: true,
      direction: null,
    },
    {
      name: 'تكلفةالعبوة',
    },
    {
      name: 'اجمالي التكلفة',
      sort: true,
      direction: null,
    },
    {
      name: 'اخر خصم شراء',
    },
    {
      name: 'التاريخ   والتشغيلة',
    },
    {
      name: 'تصنيع شركة',
      sort: true,
      direction: null,
    },
    {
      name: ' اسم المخزن',
    },
    {
      name: 'تاريخ التوريد  ',
    },
    {
      name: ' تعديل',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'location',
      type: 'location',
    },
    {
      name: 'name_ar',
      type: 'nameClickableBlue',
    },
    {
      name: 'price',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'weighted_discount',
      type: 'normal',
    },
    {
      name: 'packet_price',
      type: 'normal',
    },
    {
      name: 'total_price',
      type: 'normal',
    },
    {
      name: 'last_discount',
      type: 'normal',
    },
    {
      name: 'batch_date',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'warehouse_name',
      type: 'normal',
    },
    {
      name: 'supply_date',
      type: 'normal',
    },
    {
      name: 'edit',
      type: 'edit',
    },
  ];
  productsData: any = [];

  columnsArrayPopup: columnHeaders[] = [
    {
      name: 'الموقع',
    },
    {
      name: 'اسم المورد',
    },
    {
      name: 'التاريخ   والتشغيلة',
    },
    {
      name: 'الكمية ',
    },
    {
      name: 'تاريخ التوريد  ',
    },
  ];
  columnsNamePopup: ColumnValue[] = [
    {
      name: 'location',
      type: 'location',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'batch_date',
      type: 'normal',
    },
    {
      name: 'amount',
      type: 'normal',
    },
    {
      name: 'supply_date',
      type: 'normal',
    },
  ];
  shelves: any = [];
  stands: any = [];
  allFixedData: any = [];
  productBatchesData: any = [];
  product_name: string = '';
  allPrintProduct: any = [];
  multiple_corridors_enabled!: string;
  quary: any = {};
  permissions: any = [];
  editDiscountForm!: FormGroup;

  total!: number;
  rows!: number;
  page: number = 1;
  productsFilterForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private fixedData: FixedDataService,
    private printService: PrintService,
    private auth: AuthService,
    private generalService: GeneralService,
    private toastr: ToastrService
  ) {}

  @ViewChild('paginator') paginator!: Paginator;
  has_bonus: commonObject[] = [];
  has_location: commonObject[] = [];
  has_offer: commonObject[] = [];
  is_limited: commonObject[] = [];
  productSettlementType: commonObject[] = [];
  discount_slats: commonObject[] = [];
  extra_discount: commonObject[] = [];
  ngOnInit(): void {
    this.permissions = this.auth.getUserPermissions();
    if (!this.permissions.includes('update_product_discounts_data')) {
      this.columnsArray.pop();
      this.columnsName.pop();
    }
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
      if (this.multiple_corridors_enabled === 'false') {
        const location_index_header = this.columnsArray.findIndex(
          (c: any) => c.name == 'موقع الصنف'
        );
        const location_index_value = this.columnsName.findIndex(
          (c: any) => c.name == 'location'
        );
        const location_index_popup_header = this.columnsArrayPopup.findIndex(
          (c: any) => c.name == 'الموقع'
        );
        const location_index_popup_value = this.columnsNamePopup.findIndex(
          (c: any) => c.name == 'location'
        );
        if (location_index_header > -1) {
          this.columnsArray.splice(location_index_header, 1);
        }
        if (location_index_value > -1) {
          this.columnsName.splice(location_index_value, 1);
        }
        if (location_index_popup_header > -1) {
          this.columnsArrayPopup.splice(location_index_popup_header, 1);
        }
        if (location_index_popup_value > -1) {
          this.columnsNamePopup.splice(location_index_popup_value, 1);
        }
      }
    }

    // this.router.navigate([], {
    //   queryParams: {},
    //   replaceUrl: true
    // });
    this.subs.add(
      this.fixedData.getAllFixedData().subscribe({
        next: (res) => {
          this.allFixedData = res.data;
          this.shelves = this.allFixedData.shelves.map((shelf: string) => ({
            number: shelf,
          }));
          this.stands = this.allFixedData.stands.map((stand: string) => ({
            number: stand,
          }));
          this.has_bonus = res.data.has_bonus;
          this.has_location = res.data.has_location;
          this.has_offer = res.data.has_offer;
          this.is_limited = res.data.is_limited;
          this.productSettlementType = res.data.productSettlementType;
          this.discount_slats = res.data.discount_slats;
          this.extra_discount = res.data.extra_discount;
        },
      })
    );

    this.getDropdownDataFilter();

    this.productsFilterForm = this.fb.group({
      warehouse_id: [''],
      corridor_id: [''],
      stand: [''],
      shelf: [''],
      manufactured_by: [''],
      product_type: [''],
      supplied_at: [''],
      quantity_more_than_zero: [''],
      buying_status: [''],
      selling_status: [''],
      price_from: [''],
      price_to: [''],
      discount_from: [''],
      discount_to: [''],
      is_limited: [''],
      has_bonus: [''],
      has_offer: [''],
      has_location: [''],
      has_settlement: [''],
      discount_slats: [''],
      extra_discount: [''],
    });

    this.subs.add(
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
            this.productsData = [];
            res.data.forEach((batch: any) => {
              this.productsData.push({
                id: batch?.last_batch?.id,
                warehouse_id: batch?.last_batch?.warehouse?.id,
                product_id: batch?.id,
                location: batch.location,
                name_ar: batch?.name,
                weighted_discount: batch.weighted_discount,
                price: batch?.last_batch?.batch_price,
                packet_price: batch?.market_price,
                last_discount: batch?.last_batch?.discount,
                total_price: batch.total_cost_for_warehouse_quantity,
                quantity: batch?.total_warehouse_quantity,
                quantity_sum_in_warehouses: batch?.total_warehouse_quantity,
                warehouse_name: batch.last_batch?.warehouse?.name,
                manufacturer_name: batch.manufactured_by?.name,
                supply_date: batch.last_batch?.supplied_at,
                batch_date:
                  batch.last_batch?.operating_number +
                  ' ' +
                  batch.last_batch?.expired_at,
                edit: 'تعديل',
                batches: batch?.batches,
              });
            });
            this.total = res?.meta?.total;
            this.rows = res?.meta?.per_page;
          },
          complete: () => {
            const modalInstance = new bootstrap.Modal(this.modal.nativeElement);
            modalInstance.hide();
          },
          error: (err: any) => {
            this.router.navigate([], { queryParams: {} });
          },
        })
    );

    this.editDiscountForm = this.fb.group({
      name: [''],
      warehouse_name: [''],
      warehouse_id: [''],
      weighted_discount: [''],
      price: [''],
      quantity: [''],
      subtracted_from_weighted_discount: [''],
      bonus: [''],
      taxes: [''],
      manufacturer_name: [''],
      discount_tiers: this.fb.array([]),
      normal_discount: [''],
    });
  }
  warehouses: warehouses[] = [];
  corridors: any = [];
  Manufacturers: any = [];
  type = [
    { name_ar: 'سائل', name_en: 'Liquid', id: 0 },
    { name_ar: 'الحقن', name_en: 'Injections', id: 2 },
    { name_ar: 'قرص', name_en: 'Tablet', id: 1 },
    { name_ar: 'كبسولات', name_en: 'Capsules', id: 3 },
  ];
  getDropdownDataFilter() {
    this.subs.add(
      this.generalService.getDropdownData(['static_manufacturers']).subscribe({
        next: (res) => {
          this.Manufacturers = res.data.static_manufacturers;
        },
      })
    );

    this.subs.add(
      this.generalService.getWarehouses({ purchases: 1 }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
        },
      })
    );

    //corridore
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );
  }

  get discount_tiers(): FormArray {
    return this.editDiscountForm.get('discount_tiers') as FormArray;
  }

  addDiscountTier(discount_tier: any) {
    this.discount_tiers.push(
      this.fb.group({
        discount_tier_id: discount_tier.id,
        discount: discount_tier.discount,
      })
    );
  }
  getAllData(filters: any, getPaginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (getPaginated) {
      getUrl = 'purchases/products-balance';
    } else {
      getUrl = 'purchases/products-balance/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  changePage(event: any) {
    this.page = event.page + 1;
    return this.router.navigate([], {
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
  }

  @ViewChild('operatingAndDateDetailsModal') modal!: ElementRef;
  openModal(product_id: any) {
    const modalInstance = new bootstrap.Modal(this.modal.nativeElement);
    modalInstance.show();
    this.getSingleProductBatches(product_id);
  }
  productQuantitySum: number = 0;
  getSingleProductBatches(product_id: any) {
    this.productBatchesData = [];
    this.productQuantitySum = 0;
    const product = this.productsData.find(
      (product: any) => product.id === product_id
    );
    this.product_name = product.name_ar;
    product.batches.forEach((batch: any) => {
      this.productBatchesData.push({
        id: batch?.id,
        location:
          batch?.corridor?.number + '/' + batch?.stand + '-' + batch?.shelf,
        name: batch?.supplier?.name,
        supply_date: batch?.supplied_at,
        batch_date: batch?.operating_number + '/' + batch?.expired_at,
        amount: batch?.real_quantity,
      });
      this.productQuantitySum = product.quantity_sum_in_warehouses;
    });
  }

  @ViewChildren('discountInput') discountInputs!: QueryList<ElementRef>;
  @ViewChild('editBtn') editBtn!: ElementRef;

  edited_product_data: any;
  editButton(data: any) {
    this.discount_tiers.clear();
    let params = {
      warehouse_id: data.warehouse_id,
      product_id: data.product_id,
    };
    this.subs.add(
      this.http
        .getReq('products/discount-tiers', { params: params })
        .subscribe({
          next: (res) => {
            this.editDiscountForm.patchValue({
              ...res.data,
              manufacturer_name: res.data.manufactured_by?.name,
              warehouse_name: data.warehouse_name,
              warehouse_id: data.warehouse_id,
              quantity: data.quantity,
            });
            res.data.discount_tiers.forEach((tier: any, index: any) => {
              this.addDiscountTier({
                id: tier.discount_tier.id,
                discount: tier.discount,
              });
            });
          },
          complete: () => {
            this.openEditDiscountPopup();
            this.edited_product_data = data;
          },
        })
    );
    //open edit discount popup
    // this.router.navigate([ `warehouse/storekeeper/Inventory-of-Items-and-Warehouses/inventory-and-stock-balance-details/${id}` ]);
  }

  focusNextInput(currentIndex: number) {
    setTimeout(() => {
      const inputsArray = this.discountInputs.toArray();
      if (inputsArray[currentIndex + 1]) {
        inputsArray[currentIndex + 1].nativeElement.focus();
      } else {
        this.editBtn.nativeElement.focus();
      }
    });
  }

  edit() {
    // let params={
    //   warehouse_id:this.edited_product_data.warehouse_id,
    //   subtracted_from_weighted_discount:this.editDiscountForm.controls['subtracted_from_weighted_discount'].value,
    //   discount_tiers:this.editDiscountForm.controls['discount_tiers'].value
    // }
    const params = pick(this.editDiscountForm.value, [
      'discount_tiers',
      'warehouse_id',
      'subtracted_from_weighted_discount',
    ]);
    this.subs.add(
      this.http
        .putReq(
          `products/update-discount-tiers/${this.edited_product_data.product_id}`,
          params
        )
        .subscribe({
          next: (res) => {
            this.toastr.info(res.message);
          },
          complete: () => {
            this.discount_tiers.clear();
            const nextData = this.productsData.findIndex((product: any) => {
              return product.id == this.edited_product_data.id;
            });
            console.log(nextData);
            this.editButton(this.productsData[nextData + 1]);
          },
        })
    );
  }

  @ViewChild('editDiscountModal') editDiscountModal!: ElementRef;
  openEditDiscountPopup() {
    const modalInstance = new bootstrap.Modal(
      this.editDiscountModal.nativeElement
    );
    modalInstance.show();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getUpdatedQueryParams(sortData?: any) {
    let queryParams: any = {};
    for (const key in this.productsFilterForm.value) {
      let value = this.productsFilterForm.value[key];
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'supplied_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    queryParams['page'] = 1;
    this.paginator.changePage(this.page - 1);

    if (sortData) {
      queryParams['sort_by'] = sortData.name;
      queryParams['direction'] = sortData.direction;
    }

    this.quary = queryParams;

    return queryParams;
  }

  filter() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
    this.toggleFilterModal();
  }
  getAllproducts(printType: any) {
    this.subs.add(
      this.getAllData(this.quary, false).subscribe({
        next: (res) => {
          this.allPrintProduct = [];
          res.data.forEach((batch: any) => {
            this.allPrintProduct.push({
              id: batch?.id,
              location:
                batch.main_location?.number +
                '/' +
                batch?.main_location.stand +
                '-' +
                batch?.main_location.shelf,
              name_ar: batch?.name,
              return_discount: batch?.last_batch?.discount,
              price:
                batch?.batches?.length - 1 >= 0
                  ? batch?.batches[batch?.batches?.length - 1]?.batch_price
                  : '',
              packet_price: batch?.market_price,
              total_price: batch.total_cost_for_warehouse_quantity,
              quantity: batch?.total_warehouse_quantity,
              quantity_sum_in_warehouses: batch?.quantity_sum_in_warehouses,
              warehouse_name:
                batch?.batches?.length - 1 >= 0
                  ? batch?.batches[batch?.batches?.length - 1]?.warehouse?.name
                  : '',
              manufacturer_name: batch.manufactured_by?.name,
              supply_date:
                batch?.batches?.length - 1 >= 0
                  ? batch?.batches[batch?.batches?.length - 1]?.supplied_at
                  : '',
              batch_date:
                batch?.batches?.length - 1 >= 0
                  ? batch?.batches[batch?.batches?.length - 1]
                      ?.operating_number +
                    ' ' +
                    batch?.batches[batch?.batches?.length - 1]?.expired_at
                  : '',
              edit: 'تعديل',
              batches: batch?.batches ? batch?.batches : [],
            });
          });
        },
        complete: () => {
          let tempColumnsArray: any = [];
          let tempColumnsName: any = [];
          tempColumnsArray = this.columnsArray.filter(
            (column) => column.name.trim() !== 'تعديل'
          );
          tempColumnsName = this.columnsName.filter(
            (column) => column.name.trim() !== 'edit'
          );
          this.printService.setColumnsArray(tempColumnsArray);
          this.printService.setColumnsNames(tempColumnsName);
          this.printService.setRowsData(this.allPrintProduct);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
        },
      })
    );
  }

  sorting(sortData?: any) {
    const queryParams = this.getUpdatedQueryParams(sortData);
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
  printType: string = '';
  printMain(printData: any) {
    if (printData.amountOfPrint == 2) {
      if (this.printType == 'main') {
        this.getAllproducts(printData.type);
      } else {
        this.printService.setColumnsArray(this.columnsArrayPopup);
        this.printService.setColumnsNames(this.columnsNamePopup);
        this.printService.setRowsData(this.productBatchesData);
        if (printData.type == 1) {
          this.printService.downloadPDF();
        } else {
          this.printService.downloadCSV();
        }
      }
    } else {
      if (this.printType == 'main') {
        let tempColumnsArray = this.columnsArray.filter(
          (column) => column.name.trim() !== 'تعديل'
        );
        let tempColumnsName = this.columnsName.filter(
          (column) => column.name.trim() !== 'edit'
        );
        this.printService.setColumnsArray(tempColumnsArray);
        this.printService.setColumnsNames(tempColumnsName);
        this.printService.setRowsData(this.productsData);
      } else {
        this.printService.setColumnsArray(this.columnsArrayPopup);
        this.printService.setColumnsNames(this.columnsNamePopup);
        this.printService.setRowsData(this.productBatchesData);
      }

      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
    }
  }

  paginated!: boolean;

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openOptionsModal(type: string, paginated: boolean) {
    this.paginated = paginated;
    this.printType = type;
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  @ViewChild('toggleFilter') toggleFilter!: ElementRef<HTMLElement>;
  toggleFilterModal() {
    let el: HTMLElement = this.toggleFilter.nativeElement;
    el.click();
  }
}
function pick(obj: any, keys: string[]) {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as any);
}
