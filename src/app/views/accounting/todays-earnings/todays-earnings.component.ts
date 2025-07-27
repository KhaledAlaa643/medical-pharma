import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city } from '@models/pharmacie';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-todays-earnings',
  templateUrl: './todays-earnings.component.html',
  styleUrls: ['./todays-earnings.component.scss'],
})
export class TodaysEarningsComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  receiving_reviewer: supplier[] = [];
  warehouses: supplier[] = [];
  pharmacies: supplier[] = [];
  tracks: supplier[] = [];
  clients: supplier[] = [];
  deliveries: supplier[] = [];
  cities: city[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private printService: PrintService,
    private generalService: GeneralService
  ) {}
  ngOnInit() {
    this.columnsArray = [
      {
        name: 'كود العميل',
      },

      {
        name: 'اسم العميل',
      },
      {
        name: 'المدينة',
      },

      {
        name: 'نوع التعامل',
      },
      {
        name: 'رقم الهاتف',
      },
      {
        name: 'تاريخ التحصيل',
      },
      {
        name: 'الحساب السابق',
      },
      {
        name: 'مبالغ التحصيل',
      },
      {
        name: 'الرصيد الحالي',
      },
      {
        name: ' خط السير',
      },
    ];
    this.columnsName = [
      {
        name: 'id',
        type: 'normal',
      },
      {
        name: 'pharmacy_name',
        type: 'normal',
      },

      {
        name: 'area',
        type: 'normal',
      },
      {
        name: 'pahment_type',
        type: 'normal',
      },
      {
        name: 'phone_number',
        type: 'normal',
      },
      {
        name: 'next_payment_date',
        type: 'normal',
      },
      {
        name: 'balance_before',
        type: 'normal',
      },
      {
        name: 'collecting_balacne',
        type: 'normal',
      },
      {
        name: 'current_balance',
        type: 'normal',
      },
      {
        name: 'track_name',
        type: 'normal',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      track_id: [''],
      area_id: [''],
      client_id: [''],
      pharmacy_id: [''],
      delivery_id: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService.getDropdownData(['deliveries', 'tracks']).subscribe({
        next: (res) => {
          this.deliveries = res.data.deliveries;
          this.tracks = res.data.tracks;
        },
      })
    );

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
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
  }
  getPharmacies() {
    this.subscription.add(
      this.http
        .getReq(`clients?id=${this.searchForm.value.client_id}`)
        .subscribe({
          next: (res) => {
            this.pharmacies = res.data[0].pharmacies;
          },
        })
    );
  }

  ConnectToParams() {
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
            this.data = res.data.map((data: any, index: number) => {
              data['pahment_type'] = data.pahment_type.name;
              return data;
            });

            this.additional_data = res.additional_data;

            this.total = res.meta.total;
            this.rows = res.meta.per_page;
          },
        })
    );
  }

  index_to_update!: number;

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'accounting/collections';
    } else {
      getUrl = 'accounting/collections/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type);
    } else {
      this.printService.setColumnsArray(this.columnsArray);
      this.printService.setColumnsNames(this.columnsName);
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

  allPrintData: any = [];
  currentParams: any = {};
  getAllOrders(printType: any) {
    let params = {};
    params = this.currentParams;
    this.subscription.add(
      this.getAllData(params, false).subscribe({
        next: (res) => {
          this.allPrintData = res.data;
          this.allPrintData = res.data.map((data: any, index: number) => {
            data['pahment_type'] = data.pahment_type.name;
            return data;
          });
        },
        complete: () => {
          this.printService.setColumnsArray(this.columnsArray);
          this.printService.setColumnsNames(this.columnsName);
          this.printService.setRowsData(this.allPrintData);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
        },
      })
    );
  }

  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
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
        queryParams[key] = value;
      }
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }

    return queryParams;
  }

  changepage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }
}
