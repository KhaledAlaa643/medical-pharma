import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { product_dropdown, warehouses } from '@models/products';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { MenuItem } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Subscription, catchError, of, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-order-logs',
  templateUrl: './order-logs.component.html',
  styleUrls: ['./order-logs.component.scss'],
})
export class OrderLogsComponent implements OnInit {
  filterForm!: FormGroup;
  searchForm!: FormGroup;
  private subscription = new Subscription();
  suppliers: supplier[] = [];
  warehouses: warehouses[] = [];
  created_by: any[] = [];
  order_logs: any[] = [];
  status: LooseObject[] = [];
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم الطلب   ',
    },
    {
      name: 'اسم المورد',
      sort: true,
      direction: null,
    },
    {
      name: 'تاريخ الطلب ',
    },
    {
      name: 'تاريخ التوريد  ',
    },
    {
      name: 'عدد الأصناف  ',
    },
    {
      name: 'الاجمالي ',
    },
    {
      name: ' المخزن ',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'حالة الطلب',
      sort: true,
      direction: null,
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'order_num',
      type: 'normal',
    },
    {
      name: 'supplier_name',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'supplied_at',
      type: 'normal',
    },
    {
      name: 'products_num',
      type: 'normal',
    },
    {
      name: 'total',
      type: 'normal',
    },
    {
      name: 'warehouse_name',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'status',
      type: 'normal',
    },
  ];
  showActionsArray: boolean = true;
  items!: MenuItem[];

  // pagination data
  page: number = 1;
  rows!: number;
  total: number = 0;
  totalPriceSum: number = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    // private printService: PrintService,
    private generalService: GeneralService,
    private printService: PrintService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'Refresh',
            icon: 'pi pi-refresh',
          },
          {
            label: 'Export',
            icon: 'pi pi-upload',
          },
        ],
      },
    ];
    this.getDropdownData();
    this.filterForm = this.fb.group({
      product_id: [''],
      created_by: [''],
      status: [''],
      warehouse_id: [''],
      supplied_from: [''],
      supplied_to: [''],
      from: [''],
      to: [''],
    });
    this.searchForm = this.fb.group({
      supplier_id: [''],
      purchase_id: [''],
      from: [''],
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
            this.order_logs = [];
            res.data.forEach((request: any) => {
              this.order_logs.push({
                id: request.id,
                order_num: request.id,
                supplier_name: request.supplier.name,
                created_by: request.created_by.name,
                created_at: request.created_at,
                supplied_at: request.supplied_at,
                products_num: request.total_cart_items,
                total: request.total_supply_price,
                warehouse_name: request.warehouse.name,
                status: request.status.name,
                status_id: request.status.value,
              });
            });
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.totalPriceSum = res.additional_data.total_price_sum;
          },
        })
    );
  }
  products: product_dropdown[] = [];
  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'purchases/supply-request/index';
    } else {
      getUrl = 'purchases/supply-request/index/print';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['suppliers', 'purchases_employees'])
        .subscribe({
          next: (res) => {
            this.suppliers = res.data.suppliers;
            this.created_by = res.data.purchases_employees;
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
    //     this.status=res.data?.purchase_status
    //   }
    // }))
    this.status = this.auth.getEnums().purchase_status;
    this.subscription.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );
  }

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  changepage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (
          key == 'from' ||
          key == 'to' ||
          key == 'supplied_from' ||
          key == 'supplied_to'
        ) {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    for (const key in this.searchForm.value) {
      let value = this.searchForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }
    if (this.sortData) {
      queryParams['sort_by'] = this.sortData.name;
      queryParams['direction'] = this.sortData.direction;
    }
    return queryParams;
  }

  //printing
  allPrintOrders: any = [];
  currentParams: any = {};
  getAllOrders(printType: any) {
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
  sortData: any;
  sort(sortData: any) {
    this.sortData = sortData;
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((request: any) => {
      console.log(request);
      tempArr.push({
        order_num: request.id,
        supplier_name: request?.supplier?.name,
        created_by: request?.created_by?.name,
        created_at: request?.created_at,
        reviewed_at: request?.reviewed_at,
        products_num: request?.total_cart_items,
        total: request?.total_price,
        warehouse_name: request?.warehouse?.name,
        status: request?.status?.name,
      });
    });

    if (pagiated == true) {
      this.order_logs = tempArr;
    } else {
      this.allPrintOrders = tempArr;
    }
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type);
    } else {
      let tempColumnsArray = this.columnsArray.filter(
        (column) => column.name.trim() !== 'أمر'
      );
      let tempColumnsName = this.columnsName.filter(
        (column) => column.name.trim() !== 'options'
      );
      this.printService.setColumnsArray(tempColumnsArray);
      this.printService.setColumnsNames(tempColumnsName);
      this.printService.setRowsData(this.order_logs);

      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
    }

    setTimeout(() => {
      this.openModal();
    }, 100);
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
}
