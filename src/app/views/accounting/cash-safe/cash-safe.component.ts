import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
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
import { finalize, forkJoin, Subscription } from 'rxjs';
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
  selector: 'app-cash-safe',
  templateUrl: './cash-safe.component.html',
  styleUrls: ['./cash-safe.component.scss'],
})
export class CashSafeComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  activeTab: number = 0;

  columnsArrayReceipt: columnHeaders[] = [
    {
      name: 'رقم الإذن ',
    },
    {
      name: 'الأسم',
    },

    {
      name: 'المبلغ',
    },
    {
      name: 'ملاحظات',
    },
    {
      name: 'الكاتب',
    },
  ];
  columnsNameReceipt: ColumnValue[] = [
    {
      name: 'id',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'amount',
      type: 'normal',
    },

    {
      name: 'notes',
      type: 'notes_cash',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
  ];
  columnsArrayPayment: columnHeaders[] = [
    {
      name: 'رقم الإذن ',
    },
    {
      name: 'الأسم',
    },

    {
      name: 'المبلغ',
    },
    {
      name: 'ملاحظات',
    },
    {
      name: 'الكاتب',
    },
  ];
  columnsNamePayment: ColumnValue[] = [
    {
      name: 'id',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'amount',
      type: 'normal',
    },

    {
      name: 'notes',
      type: 'notes_cash',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
  ];
  columnsArrayTransferFrom: columnHeaders[] = [
    {
      name: 'رقم الإذن ',
    },
    {
      name: 'التاريخ',
    },

    {
      name: 'الخزنة المحول إليها',
    },
    {
      name: 'إجمالي المبلغ',
    },
    {
      name: 'الكاتب',
    },
  ];
  columnsNameTransferFrom: ColumnValue[] = [
    {
      name: 'id',
      type: 'normal',
    },
    {
      name: 'date',
      type: 'normal',
    },
    {
      name: 'safe',
      type: 'normal',
    },
    {
      name: 'amount',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
  ];
  columnsArrayTransferTo: columnHeaders[] = [
    {
      name: 'رقم الإذن ',
    },
    {
      name: 'التاريخ',
    },

    {
      name: 'الخزنة المحول منها',
    },
    {
      name: 'إجمالي المبلغ',
    },
    {
      name: 'الكاتب',
    },
  ];
  columnsNameTransferTo: ColumnValue[] = [
    {
      name: 'id',
      type: 'normal',
    },
    {
      name: 'date',
      type: 'normal',
    },
    {
      name: 'safe',
      type: 'normal',
    },
    {
      name: 'amount',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
  ];

  pageMapping: { [key: string]: { pageIndex: any; queryParam: string } } = {
    receipts: { pageIndex: 'receipts', queryParam: 'receipts_page' },
    payment: { pageIndex: 'payment', queryParam: 'payment_page' },
    transfer_from: {
      pageIndex: 'transfer_from',
      queryParam: 'transfer_from_page',
    },
    transfer_to: { pageIndex: 'transfer_to', queryParam: 'transfer_to_page' },
  };
  currentPageIndices: { [key: string]: number } = {
    receipts: 0,
    payment: 0,
    transfer_from: 0,
    transfer_to: 0,
  };
  currentPageIndexPayment: any;
  currentPageIndexReceipts: any;
  currentPageIndexTransferFrom: any;
  currentPageIndexTransferTo: any;
  rowsReceipts!: number;
  rowsPayments!: number;
  rowsTransferFrom!: number;
  rowsTransferTo!: number;
  totalReceipts!: number;
  totalPayments!: number;
  totalTransferFrom!: number;
  totalTransferTo!: number;
  additional_data_receipts: any = {};
  additional_data_Payments: any = {};
  additional_data_transfer_from: any = {};
  additional_data_transfer_to: any = {};
  receipts: any = [];
  payments: any = [];
  transfersFrom: any = [];
  transfersTo: any = [];
  note: string = '';
  pharmacies: any = [];
  updatedPharmacyNames: any = [];
  tracks: supplier[] = [];
  clients: supplier[] = [];
  safes: supplier[] = [];
  employees: supplier[] = [];
  created_by: supplier[] = [];
  types: fixedData[] = [];
  accountType: fixedData[] = [];
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
      account_id: [''],
      account_type: [''],
      safe_from_to_id: [''],
      created_by: [''],
      date_from: [''],
      date_to: [''],
    });
  }
  getDropdownData() {
    const requests = [
      this.generalService.getDropdownData([
        'deliveries',
        'tracks',
        'accounting_employees',
      ]),
      this.http.getReq('accounting/safes/cash'),
    ];

    this.subscription.add(
      forkJoin(requests)
        .pipe(
          finalize(() => {
            // Cleanup or additional logic after all requests complete
            this.activatedRoute.queryParams.subscribe((params: Params) => {
              if (this.activeTab === 1) {
                this.transactionCashReceipt(params);
                this.transactionCashPayment(params);
              } else if (this.activeTab === 2) {
                this.transactionTransferFrom(params);
                this.transactionTransferTo(params);
              }
            });
          })
        )
        .subscribe(([dropdownRes, safesRes]) => {
          // Handle dropdown data response
          this.tracks = dropdownRes.data.tracks;
          this.created_by = dropdownRes.data.accounting_employees;

          // Handle safes response
          this.safes = safesRes.data;
          this.searchForm.get('safe_id')!.setValue(this.safes[0]?.id);
        })
    );
    this.accountType = this.auth.getEnums().account_types;
  }

  getAccounts(dropdown: any) {
    if (this.searchForm.value.account_type == null) {
      return;
    }
    let params = {
      type: this.searchForm.value.account_type,
    };
    this.subscription.add(
      this.http.getReq('accounting/accounts', { params }).subscribe({
        next: (res) => {
          this.updatedPharmacyNames = res.data;
        },
        complete: () => {},
      })
    );
  }

  transactionCashReceipt(filter?: any) {
    let params = this.getCommonParams();
    if (filter && filter['receipts_page']) {
      params['page'] = filter['receipts_page'];
    }

    this.http
      .getReq('accounting/cash-safes/cash-receipt', { params })
      .subscribe({
        next: (res) => {
          if (res.data.length > 0) {
            this.receipts = res.data;
          }
          this.additional_data_receipts = res.additional_data;

          this.totalReceipts = res.meta.total;
          this.rowsReceipts = res.meta.per_page;
        },
      });
  }

  transactionCashPayment(filter?: any, page?: number) {
    let params = this.getCommonParams();

    if (filter && filter['payment_page']) {
      params['page'] = filter['payment_page'];
    }

    this.http
      .getReq('accounting/cash-safes/cash-payment', { params })
      .subscribe({
        next: (res) => {
          if (res.data.length > 0) {
            this.payments = res.data;
          }

          this.additional_data_Payments = res.additional_data;

          this.totalPayments = res.meta.total;
          this.rowsPayments = res.meta.per_page;
        },
      });
  }

  transactionTransferFrom(filter?: any, page?: number) {
    let params = this.getCommonParams();

    if (filter && filter['transfer_from_page']) {
      params['page'] = filter['transfer_from_page'];
    }

    this.http
      .getReq('accounting/cash-safes/transfers-from', { params })
      .subscribe({
        next: (res) => {
          if (res.data.length > 0) {
            this.transfersFrom = res.data;
          }

          this.additional_data_transfer_from = res.additional_data;

          this.totalTransferFrom = res.meta.total;
          this.rowsTransferFrom = res.meta.per_page;
        },
      });
  }

  transactionTransferTo(filter?: any, page?: number) {
    let params = this.getCommonParams();

    if (filter && filter['transfer_to_page']) {
      params['page'] = filter['transfer_to_page'];
    }

    this.http
      .getReq('accounting/cash-safes/transfers-to', { params })
      .subscribe({
        next: (res) => {
          if (res.data.length > 0) {
            this.transfersTo = res.data;
          }

          this.additional_data_transfer_to = res.additional_data;

          this.totalTransferTo = res.meta.total;
          this.rowsTransferTo = res.meta.per_page;
        },
      });
  }

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
          if (key === 'date_from' || key === 'date_to') {
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
    if (this.activeTab === 1) {
      this.currentPageIndexReceipts = 1;
      this.currentPageIndexPayment = 1;
      this.currentPageIndexTransferFrom = null;
      this.currentPageIndexTransferTo = null;
    } else if (this.activeTab === 2) {
      this.currentPageIndexTransferFrom = 1;
      this.currentPageIndexTransferTo = 1;
      this.currentPageIndexReceipts = null;
      this.currentPageIndexPayment = null;
    }

    const rawParams: LooseObject = {
      receipts_page: this.currentPageIndexReceipts,
      payment_page: this.currentPageIndexPayment,
      transfer_from: this.currentPageIndexTransferFrom,
      transfer_to: this.currentPageIndexTransferTo,
      account_id: this.searchForm.controls['account_id'].value,
      account_type: this.searchForm.controls['account_type'].value,
      track_id: this.searchForm.controls['track_id'].value,
      safe_id: this.searchForm.controls['safe_id'].value,
      safe_from_to_id: this.searchForm.controls['safe_from_to_id'].value,
      created_by: this.searchForm.controls['created_by'].value,
      date_from: this.searchForm.controls['date_from'].value,
      date_to: this.searchForm.controls['date_to'].value,
      activeTab: this.activeTab,
    };

    const params: LooseObject = {};
    for (const [key, value] of Object.entries(rawParams)) {
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value;
      }
    }

    this.router.navigate([], {
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  changeTab(id: number) {
    this.activeTab = id;
  }

  @ViewChild('noteModel') noteModel!: ElementRef<HTMLElement>;

  openNoteModal(data: any) {
    this.note = data;
    this.noteModel.nativeElement.click();
  }
}
