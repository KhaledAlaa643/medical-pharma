import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { pharmacy_client } from '@models/pharmacie';
import { warehouses } from '@models/products';
import { returns } from '@models/returns';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-return-products-list',
  templateUrl: './return-products-list.component.html',
  styleUrls: ['./return-products-list.component.scss'],
})
export class ReturnProductsListComponent implements OnInit {
  private subs = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'موقع الصنف ',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم الصنف',
      sort: true,
      direction: null,
    },
    {
      name: ' اسم العميل	',
    },
    {
      name: ' الكمية	',
    },
    {
      name: ' اسم المخزن	',
      sort: true,
      direction: null,
    },
    {
      name: ' الشركة المصنعه	',
      sort: true,
      direction: null,
    },
    {
      name: ' التاريخ والتشغيلة	',
    },
    {
      name: ' الكاتب	',
    },
    {
      name: ' سبب المرتجع	',
    },
    {
      name: ' التاريخ والوقت	',
    },
    {
      name: ' حالة المرتجع	',
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
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'expired_at',
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
    {
      name: 'created_at',
      type: 'bg_palegreen',
    },
    {
      name: 'status',
      type: 'status',
    },
  ];
  returnsProductsData: returns[] = [];
  groupPharmacies: pharmacy_client[] = [];
  warehouses: warehouses[] = [];
  page: number = 1;
  quary: LooseObject = {};
  returnsFilter!: FormGroup;
  //pagination
  total!: number;
  rows!: number;
  constructor(
    private http: HttpService,
    private printService: PrintService,
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    localStorage.setItem('columnsArray', JSON.stringify(this.columnsArray));
    localStorage.setItem('columnsNames', JSON.stringify(this.columnsName));

    this.returnsFilter = this.fb.group({
      pharmacy_id: [''],
      warehouse_id: [''],
    });
    this.getDropdownData();
    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param, true);
          })
        )
        .subscribe({
          next: (res) => {
            this.returnsProductsData = [];
            this.getData(res.data, true);
            this.total = res?.meta.total;
            this.rows = res.meta?.per_page;
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
      getUrl = 'orders/returns/returnables';
    } else {
      getUrl = 'orders/returns/returnables/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownData() {
    //pharamcy
    let pharmacies: any = [];
    this.subs.add(
      this.generalService.getPharmacies().subscribe({
        next: (res) => {
          pharmacies = res.data;
        },
        complete: () => {
          pharmacies.forEach((element: any) => {
            this.groupPharmacies.push({
              name: element?.clients[0]?.name + '-' + element?.name,
              id: element?.id,
              client_id: element?.clients[0]?.name,
            });
          });
        },
      })
    );

    // //warehouse
    // this.subs.add(this.generalService.getWarehouses().subscribe({
    //   next: res => {
    //     this.warehouses = res.data
    //   }
    // }))

    let params = ['warehouses'];
    //warehouse
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.warehouses = res.data.warehouses;
        },
      })
    );
  }
  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  filterPharmacies() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
  }

  sorting(sortData?: any) {
    const queryParams = this.getUpdatedQueryParams(sortData);
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  getUpdatedQueryParams(sortData?: any) {
    let queryParams: any = {};
    for (const key in this.returnsFilter.value) {
      let value = this.returnsFilter.value[key];
      if (value != null && value != undefined && value != '') {
        queryParams[key] = value;
      }
    }
    if (this.page) {
      queryParams['page'] = this.page;
    }
    if (sortData) {
      queryParams['sort_by'] = sortData.name;
      queryParams['direction'] = sortData.direction;
    }
    return queryParams;
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllbatches(printData.type);
    } else {
      this.printService.setColumnsArray(this.columnsArray);
      this.printService.setColumnsNames(this.columnsName);
      this.printService.setRowsData(this.returnsProductsData);
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
        },
      })
    );
  }
  getData(data: any, paginated: boolean) {
    let temp: any = [];

    data.forEach((Return: any) => {
      temp.push({
        location:
          Return?.product_location?.number +
          '-' +
          Return?.product_location?.shelf +
          '/' +
          Return?.product_location?.stand,
        product_name: Return?.product_name,
        client_name: Return?.return?.pharmacy?.name,
        quantity: Return?.quantity,
        warehouse_name: Return?.return?.warehouse?.name,
        manufacturer_name: Return?.manufacturer_name,
        expired_at: Return?.expired_at + ' ' + Return?.operating_number,
        created_by: Return?.return?.created_by.name,
        created_at: Return?.return?.created_at,
        is_partial_rejected: Return?.is_partial_rejected,
        reason: Return?.reason?.name,
        status: Return?.status?.name,
      });
    });
    if (paginated) {
      this.returnsProductsData = temp;
    } else {
      this.allPrintBatches = temp;
    }
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
}
