import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { product_dropdown, warehouses } from '@models/products';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import { switchMap, catchError, of, Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-accept-return',
  templateUrl: './accept-return.component.html',
  styleUrls: ['./accept-return.component.scss'],
})
export class AcceptReturnComponent implements OnInit {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  rejectForm!: FormGroup;
  columnsArray: columnHeaders[] = [
    {
      name: 'موقع الصنف   ',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم الصنف ',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم العميل',
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
      name: 'التاريخ والتشغيلة   ',
    },
    {
      name: 'الكاتب',
    },
    {
      name: ' سبب الارتجاع ',
    },
    {
      name: 'أمر',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'product_location',
      type: 'normal',
    },
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'client_name',
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
      name: 'batch_number',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'reason',
      type: 'normal.name',
    },
    {
      name: 'options',
      type: 'two_btn',
    },
  ];
  data: any = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private printService: PrintService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getDropdownData();
    this.searchForm = this.fb.group({
      pharmacy_id: [''],
      product_id: [''],
    });

    this.rejectForm = this.fb.group({
      id: [''],
      client_name: [''],
      product_name: [''],
      quantity: [''],
      note: [''],
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
            this.data = res.data;

            this.total = res.meta.total;
            this.rows = res.meta.per_page;
          },
        })
    );
  }
  total!: number;
  page: number = 1;
  rows!: number;
  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'orders/returns/returnables/pending';
    } else {
      getUrl = 'orders/returns/returnables/pending/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }
  warehouses: warehouses[] = [];
  clients: supplier[] = [];
  products: product_dropdown[] = [];

  getDropdownData() {
    this.subscription.add(
      this.generalService.getClientsDropdown().subscribe({
        next: (res) => {
          this.clients = res.data;
        },
        complete: () => {
          // this.initWarehouseDiscounts();
        },
      })
    );
    this.subscription.add(
      this.generalService
        .getWarehousesDropdown({ purchases_return: 1, module: 'returns' })
        .subscribe({
          next: (res) => {
            this.warehouses = res.data;
          },
        })
    );
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
        ...request,
        reason: request.reason.name,
      });
    });

    if (pagiated == true) {
      this.data = tempArr;
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
      this.printService.setRowsData(this.data);

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

  acceptReturnProduct(event: any) {
    let message = '';
    this.subscription.add(
      this.http
        .putReq(`orders/returns/returnables/${event}/accept`)
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.toastrService.info(message);
            this.rejectForm.reset();
            this.data = this.data.filter((d: any) => d.id !== event);
          },
        })
    );
  }

  @ViewChild('rejectModel') rejectModel!: ElementRef<HTMLElement>;

  openRejectModal(event: any) {
    console.log(event);
    this.rejectForm.patchValue(event);
    let el: HTMLElement = this.rejectModel.nativeElement;
    el.click();
  }

  rejectReturn() {
    let message = '';

    this.subscription.add(
      this.http
        .putReq(
          `orders/returns/returnables/${this.rejectForm.value.id}/reject`,
          {
            rejected_quantity: this.rejectForm.value.quantity,
            note: this.rejectForm.value.note,
          }
        )
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.rejectForm.reset();
            this.data = this.data.filter(
              (d: any) => d.id !== this.rejectForm.value.id
            );

            this.toastrService.info(message);
          },
        })
    );
  }
}
