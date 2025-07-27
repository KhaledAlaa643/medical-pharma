import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { warehouses } from '@models/products';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';

const datePipe = new DatePipe('en-EG');
@Component({
  selector: 'app-return-products-list',
  templateUrl: './return-products-list.component.html',
  styleUrls: ['./return-products-list.component.scss'],
})
export class ReturnProductsListComponent implements OnInit {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم أذن المرتجع',
    },
    {
      name: 'موقع الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم المورد',
    },
    {
      name: 'الكمية',
    },
    {
      name: 'اسم المخزن',
      sort: true,
      direction: null,
    },
    {
      name: 'تصنيع شركة',
    },
    {
      name: 'التاريخ والتشغيلة',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'سبب الارتجاع',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'id',
      type: 'nameClickableBlue',
    },
    {
      name: 'location',
      type: 'normal',
    },
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'supplier_name',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'warehouse_name',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'expired_operation',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'reason',
      type: 'normal',
    },
  ];
  order_logs: any = [];
  totalOrders: number = 0;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private printService: PrintService
  ) {}

  ngOnInit() {
    this.getDropdownData();
    this.searchForm = this.fb.group({
      supplier_id: [''],
      warehouse_id: [''],
      created_at: [''],
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
            this.getData(res.data, true);
            // res.data.forEach((request: any) => {
            //   this.order_logs.push({
            //     'return_id':request.id,
            //     'number':request.id,
            //     'supplier_name':request.purchase.supplier.name,
            //     'created_at':request.created_at,
            //     'items_count':request.total_returned_items,
            //     'receiving_auditor':'',
            //     'created_by':request.created_by.name
            //   })
            // });
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.totalOrders = res.meta.total;
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
      getUrl = 'purchases/returns/products-report';
    } else {
      getUrl = 'purchases/returns/products-report/print';
    }

    return this.http.getReq(getUrl, { params: x });
  }
  suppliers: supplier[] = [];
  warehouses: warehouses[] = [];
  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['suppliers', 'purchases_employees'])
        .subscribe({
          next: (res) => {
            this.suppliers = res.data.suppliers;
            // this.warehouses = res.data.warehouses
          },
        })
    );

    this.subscription.add(
      this.generalService.getWarehouses({ purchases_return: 1 }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
        },
      })
    );
  }

  rows!: number;
  total!: number;
  page!: number;
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

  sortData: any;
  sort(sortData: any) {
    this.sortData = sortData;
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
    for (const key in this.searchForm.value) {
      let value = this.searchForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'created_at') {
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
            (column) => column.name.trim() !== 'eyeIcon'
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

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((request: any) => {
      tempArr.push({
        id: request.purchases_return_id,
        location:
          request.product_location.number +
          '/' +
          request.product_location.stand +
          '-' +
          request.product_location.shelf,
        product_name: request.product_name,
        supplier_name: request.supplier.name,
        quantity: request.quantity,
        warehouse_name: request.warehouse.name,
        manufacturer_name: request.manufacturer_name,
        expired_operation:
          datePipe.transform(request.expired_at, 'yyyy-MM-dd') +
          ' ' +
          request.operating_number,
        created_by: request.created_by.name,
        reason: request.reason.name,
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
        (column) => column.name.trim() !== 'eyeIcon'
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

  goToDetails(purchases_return_id: any) {
    this.router.navigate(['/purchases/returns/details/' + purchases_return_id]);
  }
}
