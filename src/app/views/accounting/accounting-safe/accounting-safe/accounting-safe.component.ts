import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { fixedData } from '@models/products';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import {
  catchError,
  finalize,
  forkJoin,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
const datePipe = new DatePipe('en-EG');
interface CommonParams {
  from: string;
  to: string;
  pharmacy_id: any;
  safe_id: any;
  created_by: any;
  track_id: any;
  type?: any;
  pagination_number?: number;
  [key: string]: any;
}
@Component({
  selector: 'app-accounting-safe',
  templateUrl: './accounting-safe.component.html',
  styleUrls: ['./accounting-safe.component.scss'],
})
export class AccountingSafeComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArrayClient: columnHeaders[] = [
    {
      name: 'مسلسل',
    },
    {
      name: 'كود العميل',
    },
    {
      name: 'اسم العميل',
    },
    {
      name: 'المبلغ',
    },
    {
      name: 'خط السير',
    },
    {
      name: 'الكاتب',
    },
  ];
  columnsNameClient: ColumnValue[] = [
    {
      name: 'serial',
      type: 'normal',
    },
    {
      name: 'code',
      type: 'normal',
    },
    {
      name: 'pharmacy',
      type: 'normal.name',
    },
    {
      name: 'amount',
      type: 'normal',
    },
    {
      name: 'track',
      type: 'normal.name',
    },
    {
      name: 'created_by',
      type: 'normal.name',
    },
  ];
  columnsArrayDelivery: columnHeaders[] = [
    {
      name: 'مسلسل',
    },

    {
      name: 'اسم المندوب',
    },
    {
      name: 'إجمالي الدفتر',
    },
    {
      name: 'المبلغ المحول',
    },
    {
      name: 'الصافي',
    },
    {
      name: 'خط السير',
    },
  ];
  columnsNameDelivery: ColumnValue[] = [
    {
      name: 'serial',
      type: 'normal',
    },
    {
      name: 'delivery',
      type: 'normal.name',
    },
    {
      name: 'total_amount',
      type: 'normal',
    },
    {
      name: 'transfered',
      type: 'normal',
    },
    {
      name: 'net_amount',
      type: 'bg_dynamic_accounting_safe',
    },
    {
      name: 'track',
      type: 'multiple_values_array',
    },
  ];

  pageMapping: { [key: string]: { pageIndex: any; queryParam: string } } = {
    receipts: { pageIndex: 'receipts', queryParam: 'receipts_page' },
    collections: { pageIndex: 'collections', queryParam: 'collections_page' },
  };
  currentPageIndices: { [key: string]: number } = {
    receipts: 0,
    collections: 0,
  };
  currentPageIndexCollection: any;

  currentPageIndexReceipts: any;
  rowsReceipts!: number;
  rowsCollections!: number;
  totalReceipts!: number;
  totalCollections!: number;
  additional_data_receipts: any = {};
  additional_data_collections: any = {};
  receipts: any = [];
  collections: any = [];
  note: string = '';
  pharmacies: any = [];
  updatedPharmacyNames: any = [];
  tracks: supplier[] = [];
  clients: supplier[] = [];
  safes: supplier[] = [];
  employees: supplier[] = [];
  created_by: supplier[] = [];
  types: fixedData[] = [];
  reviewedIds: number[] = [];
  logBooksId: number[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private printService: PrintService,
    private generalService: GeneralService,
    private toaster: ToastrService
  ) {}
  ngOnInit() {
    this.initForm();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      safe_id: [''],
      track_id: [''],
      pharmacy_id: [''],
      created_by: [''],
      from: [''],
      to: [''],
    });
  }
  getDropdownData() {
    const requests = [
      this.generalService.getDropdownData([
        'deliveries',
        'tracks',
        'accounting_employees',
      ]),
      this.generalService.getClientsDropdown(),
    ];
    this.http.getReq('accounting/cash-receipts/user-safes').subscribe({
      next: (res) => {
        this.safes = res.data;
        this.searchForm.get('safe_id')!.setValue(this.safes[0]?.id);
      },
      complete: () => {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
          this.transactionCashPayment(params);
          this.transactionCashRecieved(params);
        });
      },
    }),
      this.subscription.add(
        forkJoin(requests)
          .pipe()
          .subscribe({
            next: ([dropdownRes, clientsDropdownRes]) => {
              // Handle clients response
              this.pharmacies = clientsDropdownRes.data;
              this.updatedPharmacyNames = this.pharmacies.flatMap(
                (client: any) =>
                  client.pharmacies.map((pharmacy: any) => ({
                    name: `${client.name}-${pharmacy.name}`,
                    id: pharmacy.id,
                  }))
              );

              console.log(clientsDropdownRes);
              // Handle dropdown data response
              this.tracks = dropdownRes.data.tracks;
              this.created_by = dropdownRes.data.accounting_employees;

              // Handle safes response
            },
            error: (err) => {
              console.error('Error fetching data:', err);
              // Handle error as needed
            },
          })
      );
  }

  transactionCashPayment(filter?: any) {
    let params = this.getCommonParams();
    if (filter && filter['receipts_page']) {
      params['page'] = filter['receipts_page'];
    }

    this.http
      .getReq('accounting/accounting-safe/receipts', { params })
      .subscribe({
        next: (res) => {
          if (res.data.length > 0) {
            this.receipts = res.data;
            this.receipts = res.data.map((data: any, index: number) => {
              data['serial'] = index + 1;
              return data;
            });
          }
          this.additional_data_receipts = res.additional_data;

          this.totalReceipts = res.meta.total;
          this.rowsReceipts = res.meta.per_page;
        },
      });
  }

  transactionCashRecieved(filter?: any, page?: number) {
    let params = this.getCommonParams();

    if (filter && filter['collections_page']) {
      params['page'] = filter['collections_page'];
    }

    this.http
      .getReq('accounting/accounting-safe/collections', { params })
      .subscribe({
        next: (res) => {
          if (res.data.length > 0) {
            this.collections = res.data;
            this.collections = res.data.map((data: any, index: number) => {
              data['serial'] = index + 1;
              data['apiName'] = 'collection';

              return data;
            });
          }

          this.additional_data_collections = res.additional_data;

          this.totalCollections = res.meta.total;
          this.rowsCollections = res.meta.per_page;
        },
      });
  }

  // filter() {
  //   this.page = 1;
  //   this.updateCurrentPage(this.page - 1);
  //   const queryParams = this.getUpdatedQueryParams();
  //   this.router.navigate([], { queryParams });
  // }

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  private getCommonParams(): CommonParams {
    let queryParams: any = {};

    // Iterate over each form control in searchForm
    for (const key in this.searchForm.controls) {
      if (this.searchForm.controls.hasOwnProperty(key)) {
        let value = this.searchForm.controls[key].value;
        if (value != null && value != undefined && value !== '') {
          if (key === 'from' || key === 'to') {
            const formattedDate = value
              ? datePipe.transform(new Date(value), 'yyyy-MM-dd')
              : null;
            queryParams[key] = formattedDate;
          } else if (key === 'safe_id') {
            queryParams[key] = value ? value : this.safes[0].id;
          } else {
            queryParams[key] = value;
          }
        }
      }
    }
    return queryParams as CommonParams;
  }

  changePage = (event: any, pageType: string): void => {
    let queryParam = this.pageMapping[pageType].queryParam;

    this.currentPageIndices[pageType] = event.page + 1;

    let queryParams: { [key: string]: any } = {};

    queryParams[queryParam] = this.currentPageIndices[pageType];

    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  };

  changeParam() {
    this.currentPageIndexReceipts = 1;
    this.currentPageIndexCollection = 1;
    let params: LooseObject = {
      receipts_page: this.currentPageIndexReceipts,
      collections_page: this.currentPageIndexCollection,
      pharmacy_id: this.searchForm.controls['pharmacy_id'].value,
      track_id: this.searchForm.controls['track_id'].value,
      safe_id: this.searchForm.controls['safe_id'].value,
      created_by: this.searchForm.controls['created_by'].value,
      from: this.searchForm.controls['from'].value,
      to: this.searchForm.controls['to'].value,
    };

    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  getCollectionDetails(event: any) {
    this.collections = this.collections.map((data: any, index: number) => {
      data['isSelected'] = false;

      return data;
    });
    this.http
      .getReq('accounting/accounting-safe/receipts', {
        collection_id: event.id,
      })
      .subscribe({
        next: (res) => {
          this.receipts = res.data;
          this.receipts = res.data.map((data: any, index: number) => {
            data['serial'] = index + 1;
            return data;
          });

          this.additional_data_receipts = res.additional_data;

          this.totalReceipts = res.meta.total;
          this.rowsReceipts = res.meta.per_page;
        },
        complete: () => {
          this.collections[event.index].isSelected = true;
        },
      });
  }
}
