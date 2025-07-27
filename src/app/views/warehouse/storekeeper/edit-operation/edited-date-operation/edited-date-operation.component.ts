import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { batch, warehouses } from '@models/products';
import { receiversAuditor } from '@models/receiver-auditors';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import * as bootstrap from 'bootstrap';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-edited-date-operation',
  templateUrl: './edited-date-operation.component.html',
  styleUrls: ['./edited-date-operation.component.scss'],
})
export class EditedDateOperationComponent implements OnInit {
  private subs = new Subscription();
  batchesFilter!: FormGroup;
  total_products: number = 0;
  total_quantity: number = 0;
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
      name: 'مراجع الاستلامات',
    },
    {
      name: 'مراجع البيع',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'التاريخ والتشغيلة القديم',
    },
    {
      name: 'التاريخ والتشغيلة الجديد',
    },
    {
      name: ' اسم المورد  ',
    },
    {
      name: 'تاريخ التوريد  ',
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
      name: 'عامل التسكين',
    },
    {
      name: ' المحضر',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'location',
      type: 'normal',
    },
    {
      name: 'product_name',
      type: 'normal',
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
      name: 'reciving_reviewer',
      type: 'normal',
    },
    {
      name: 'selling_reviewer',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'old_operation',
      type: 'normal',
    },
    {
      name: 'new_operation',
      type: 'normal',
    },
    {
      name: 'supplied_by',
      type: 'normal',
    },
    {
      name: 'supplied_at',
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
      name: 'housing_worker',
      type: 'normal',
    },
    {
      name: 'preparer',
      type: 'normal',
    },
  ];
  batches: batch[] = [];

  shelves: { number: string }[] = [];
  stands: { number: string }[] = [];
  allFixedData: any = [];
  product_name: string = '';
  receiversAuditor!: receiversAuditor[];
  quantity = [
    { name: 'الكل', value: null },
    { name: 'الكمية تساوي صفر', value: '0' },
    { name: 'الكمية اكبر من صفر', value: '1' },
  ];

  total!: number;
  rows!: number;
  page: number = 1;
  productsFilterForm!: FormGroup;
  multiple_corridors_enabled!: string;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private fixedData: FixedDataService,
    private printService: PrintService,
    private generalService: GeneralService
  ) {}

  @ViewChild('paginator') paginator!: Paginator;

  ngOnInit(): void {
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
        if (location_index_header > -1) {
          this.columnsArray.splice(location_index_header, 1);
        }
        if (location_index_value > -1) {
          this.columnsName.splice(location_index_value, 1);
        }
      }
    }
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
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
        },
      })
    );

    this.getDropdownDataFilter();

    this.productsFilterForm = this.fb.group({
      warehouse_id: [''],
      corridor_id: [''],
      stand: [''],
      shelf: [''],
      manufacturer_id: [''],
      supplier_id: [''],
      supplied_at: [''],
      quantity_more_than_zero: [''],
      receiver_auditor_id: [''],
      storing_worker_id: [''],
      //two remaining preparer selling auditor

      reviewed_by_id: [''],
      prepared_by_id: [''],

      price_from: [''],
      price_to: [''],
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
            this.batches = [];
            this.getData(res.data, true);
            this.total = res?.meta?.total;
            this.total_quantity = res?.meta?.total_quantity;
            this.rows = res?.meta?.per_page;
          },
        })
    );
  }
  warehouses: warehouses[] = [];
  corridors: any = [];
  preparers: any = [];
  reviewers: any = [];
  suppliers: any = [];
  StoringWorker: any = [];
  Manufacturers: any = [];
  type = [
    { name_ar: 'سائل', name_en: 'Liquid', id: 0 },
    { name_ar: 'الحقن', name_en: 'Injections', id: 2 },
    { name_ar: 'قرص', name_en: 'Tablet', id: 1 },
    { name_ar: 'كبسولات', name_en: 'Capsules', id: 3 },
  ];
  getDropdownDataFilter() {
    //corridore
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );

    let params = [
      'manufacturers',
      'warehouses',
      'receiving_reviewer',
      'retail_preparations',
      'suppliers',
      'retail_sales_auditors',
      'storing_workers',
    ];
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.Manufacturers = res.data.manufacturers;
          this.warehouses = res.data.warehouses;
          this.receiversAuditor = res.data.receiving_reviewer;
          this.preparers = res.data.retail_preparations;
          this.suppliers = res.data.suppliers;
          this.reviewers = res.data.retail_sales_auditors;
          this.StoringWorker = res.data.storing_workers;
        },
      })
    );
  }

  quary: any = {};

  getAllData(filters: any, getPaginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';

    this.quary = x;

    if (getPaginated) {
      getUrl = 'products/batches/updated-operations';
    } else {
      getUrl = 'products/batches/updated-operations/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((product: any) => {
      tempArr.push({
        location: product?.location,
        product_name: product?.product_name,
        price: product?.price,
        quantity: product?.quantity,
        reciving_reviewer: product?.receiver_reviewer_name,
        selling_reviewer: product?.reviewed_by_name,
        created_by: product?.created_by_name,
        old_operation:
          product?.old_expired_at + ' ' + product?.old_operating_number,
        new_operation: product?.expired_at + ' ' + product?.operating_number,
        supplied_by: product?.supplier_name,
        supplied_at: product?.supplied_at,
        warehouse_name: product?.warehouse_name,
        manufacturer_name: product?.manufacturer_name,
        housing_worker: product?.storing_worker_name,
        preparer: product?.prepared_by_name,
      });
    });
    if (pagiated == true) {
      this.batches = tempArr;
    } else {
      this.allPrintBatches = tempArr;
    }
  }

  changePage(event: any) {
    this.page = event.page + 1;
    return this.router.navigate([], {
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
  }

  //open filter modal
  @ViewChild('openFilterModel') openFilterModel!: ElementRef<HTMLElement>;
  @ViewChild('closefilterModel') closeFilterModel!: ElementRef<HTMLElement>;

  openfilterModel() {
    let openFilterModel: HTMLElement = this.openFilterModel.nativeElement;
    openFilterModel.click();
  }
  closefilterModel() {
    let closeFilterModel: HTMLElement = this.closeFilterModel.nativeElement;
    closeFilterModel.click();
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

    if (sortData) {
      queryParams['sort_by'] = sortData.name;
      queryParams['direction'] = sortData.direction;
    }

    return queryParams;
  }

  filter() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
    this.closefilterModel();
  }

  sorting(sortData?: any) {
    const queryParams = this.getUpdatedQueryParams(sortData);
    this.router.navigate([], {
      queryParams,
    });
  }
  allPrintBatches: any = [];
  getAllbatches(printType: any) {
    this.subs.add(
      this.getAllData(this.quary, false).subscribe({
        next: (res) => {
          this.allPrintBatches = [];
          this.getData(res.data, false);
        },
        complete: () => {
          this.printService.setColumnsArray(this.columnsArray);
          this.printService.setColumnsNames(this.columnsName);
          this.printService.setRowsData(this.allPrintBatches);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
          setTimeout(() => {
            this.openOptionsModal();
          }, 100);
        },
      })
    );
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllbatches(printData.type);
    } else {
      localStorage.setItem('RowsData', JSON.stringify(this.batches));
      localStorage.setItem('columnsArray', JSON.stringify(this.columnsArray));
      localStorage.setItem('columnsNames', JSON.stringify(this.columnsName));
      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
      setTimeout(() => {
        this.openOptionsModal();
      }, 100);
    }
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openOptionsModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
}
