import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city } from '@models/pharmacie';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import {
  Subscription,
  switchMap,
  catchError,
  of,
  finalize,
  forkJoin,
} from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-cash-receipts-list',
  templateUrl: './cash-receipts-list.component.html',
  styleUrls: ['./cash-receipts-list.component.scss'],
})
export class CashReceiptsListComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  accounts: supplier[] = [];
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  accountTypes: commonObject[] = [];
  pharmacies: any = [];
  updatedPharmacyNames: any = [];
  tracks: supplier[] = [];
  deliveries: supplier[] = [];
  created_by: supplier[] = [];
  safes: supplier[] = [];
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
        name: 'رقم الإذن',
      },
      {
        name: 'كود الحساب',
      },

      {
        name: 'اسم الحساب',
      },

      {
        name: 'إيصال رقم',
      },
      {
        name: 'المبلغ',
      },

      {
        name: ' خط السير',
      },

      {
        name: 'اسم المندوب',
      },
      {
        name: 'الكاتب',
      },
      {
        name: 'التاريخ',
      },
    ];
    this.columnsName = [
      {
        name: 'id',
        type: 'nameClickableBlue',
      },
      {
        name: 'account_id',
        type: 'normal',
      },

      {
        name: 'account_name',
        type: 'normal',
      },
      {
        name: 'receipt',
        type: 'normal',
      },

      {
        name: 'amount',
        type: 'normal',
      },
      {
        name: 'track',
        type: 'normal',
      },
      {
        name: 'delivery',
        type: 'normal',
      },
      {
        name: 'created_by',
        type: 'normal',
      },
      {
        name: 'created_at',
        type: 'normal',
      },
    ];

    this.initForm();
    this.getDropdownData();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  initForm() {
    this.searchForm = this.fb.group({
      track_id: [''],
      client_id: [''],
      pharmacy_id: [''],
      safe_id: [],
      delivery_id: [''],
      receipt: [''],
      driver_id: [],
      from: [],
      to: [],
      created_by: [],
      amount_from: [],
      amount_to: [],
      cash_receipt_from: [],
      cash_receipt_to: [],
      receipt_from: [],
      receipt_to: [],
      account_id: [],
      account_type: [],
    });
  }

  getDropdownData() {
    this.accountTypes = this.auth.getEnums().account_types;
    this.subscription.add(
      this.http.getReq('accounting/safes/view').subscribe({
        next: (res) => {
          this.safes = res.data;
          if (this.safes.length > 0) {
            this.searchForm.get('safe_id')!.setValue(this.safes[0].id);
          }
        },
        complete: () => {
          this.ConnectToParams();
        },
      })
    );
    const requests = [
      this.http.getReq('clients'),
      this.generalService.getDropdownData([
        'deliveries',
        'tracks',
        'accounting_employees',
      ]),
    ];

    this.subscription.add(
      forkJoin(requests)
        .pipe(
          finalize(() => {
            // Cleanup or additional logic after all requests complete
          })
        )
        .subscribe(([clientsRes, dropdownRes]) => {
          // Handle clients response
          this.pharmacies = clientsRes.data;
          this.updatedPharmacyNames = [];
          this.updatedPharmacyNames = this.pharmacies.flatMap((client: any) =>
            client.pharmacies.map((pharmacy: any) => ({
              name: `${client.name}-${pharmacy.name}`,
              id: pharmacy.id,
            }))
          );
          // Handle dropdown data response
          this.deliveries = dropdownRes.data.deliveries;
          this.tracks = dropdownRes.data.tracks;
          this.created_by = dropdownRes.data.accounting_employees;

          // Additional completion logic if needed
        })
    );
  }

  getAccountsDropdown() {
    let params = { type: this.searchForm.value.account_type };
    this.subscription.add(
      this.http.getReq('accounting/accounts/dropdown', { params }).subscribe({
        next: (res) => {
          this.accounts = res.data;
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
              data['delivery'] = data?.delivery?.name;
              data['track'] = data?.track?.name;
              data['account_id'] = data?.account?.id;
              data['account_name'] = data?.account?.name;
              data['created_by'] = data?.created_by?.name;

              return data;
            });

            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.additional_data = res.additional_data;
          },
        })
    );
  }

  getReceiptFromId(event: any) {
    console.log(event);
    this.router.navigate(['accounting/cash-receipts/show/', event]);
  }

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = { safe_id: this.safes[0]?.id };
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'accounting/cash-receipts';
    } else {
      getUrl = 'accounting/cash-receipts/all';
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
            data['delivery'] = data?.delivery?.name;
            data['track'] = data?.track?.name;
            data['pharmacy'] = data?.pharmacy?.name;
            data['created_by'] = data?.created_by?.name;

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
        if (key == 'from' || key == 'to') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
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
