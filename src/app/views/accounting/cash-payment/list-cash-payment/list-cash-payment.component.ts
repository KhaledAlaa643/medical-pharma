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
import { ArabicNumberConverterService } from '@services/convert-num-to-words.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
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
  selector: 'app-list-cash-payment',
  templateUrl: './list-cash-payment.component.html',
  styleUrls: ['./list-cash-payment.component.scss'],
})
export class ListCashPaymentComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  paymentForm!: FormGroup;
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
  clients: supplier[] = [];
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
    private generalService: GeneralService,
    private toasterService: ToastrService,
    private arabicConverter: ArabicNumberConverterService
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
        name: 'المبلغ',
      },

      {
        name: 'الكاتب',
      },
      {
        name: 'الملاحظات',
      },
      {
        name: 'التاريخ',
      },
      {
        name: 'الحالة',
      },
      {
        name: 'الأمر',
      },
    ];
    this.columnsName = [
      {
        name: 'id',
        type: 'nameClickableWithType',
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
        name: 'amount',
        type: 'normal',
      },

      {
        name: 'created_by',
        type: 'normal',
      },
      {
        name: 'note',
        type: 'normal',
      },
      {
        name: 'created_at',
        type: 'normal',
      },
      {
        name: 'status_name',
        type: 'status',
      },
      {
        name: 'accept_decline',
        type: 'accept_decline',
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
      safe_id: [],

      from: [],
      to: [],
      created_by: [],
      amount_from: [],
      amount_to: [],
      from_id: [],
      to_id: [],

      account_id: [],
      account_type: [],
    });
    this.paymentForm = this.fb.group({
      safe_id: [],
      safe: [],

      created_at: [],
      account_name: [],
      amount_in_words: [],
      amount: [],
      balance_after: [],
      balance: [],
      note: [],

      account_id: [],
      account_type: [],
    });
  }

  getDropdownData() {
    this.accountTypes = this.auth.getEnums().account_types;

    const requests = [
      this.generalService.getDropdownData(['accounting_employees']),
      this.http.getReq('accounting/safes/view'),
    ];

    this.subscription.add(
      forkJoin(requests)
        .pipe(
          finalize(() => {
            // Cleanup or additional logic after all requests complete
            this.ConnectToParams();
          })
        )
        .subscribe(([dropdownRes, safesRes]) => {
          // Handle dropdown data response

          this.created_by = dropdownRes.data.accounting_employees;

          // Handle safes response
          this.safes = safesRes.data;
          this.searchForm.get('safe_id')!.setValue(this.safes[0]?.id);
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
              data['status_name'] = data?.status?.name;
              data['account_id'] = data?.account?.id;
              data['account_name'] = data?.account?.name;

              return data;
            });

            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.additional_data = res.additional_data;
          },
        })
    );
  }

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = { safe_id: this.safes[0]?.id };
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'accounting/cash-payments';
    } else {
      getUrl = 'accounting/cash-payments/all';
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
            data['status_name'] = data?.status?.name;
            data['account_id'] = data?.account?.id;
            data['account_name'] = data?.account?.name;

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

  acceptOrDecline(event: any) {
    let message = '';
    if (event.type === 'accept') {
      this.subscription.add(
        this.http
          .putReq('accounting/cash-payments/accept/' + event.id, {})
          .subscribe({
            next: (res) => {
              message = res.message;
            },
            complete: () => {
              this.data[event.index]['type_status'] = 'confirm';
              this.data[event.index]['status_name'] = 'مقبول';
              this.data[event.index]['status'].value = 4;

              this.toasterService.success(message);
            },
          })
      );
    } else if (event.type === 'decline') {
      this.subscription.add(
        this.http
          .putReq('accounting/cash-payments/cancel/' + event.id, {})
          .subscribe({
            next: (res) => {
              message = res.message;
            },
            complete: () => {
              this.data[event.index]['type_status'] = 'confirm';
              this.data[event.index]['status_name'] = 'مرفوض';
              this.data[event.index]['status'].value = 4;
              this.toasterService.success(message);
            },
          })
      );
    }
  }

  getBalanceAfter() {
    if (this.paymentForm.value.amount == '') {
      return;
    } else {
      this.paymentForm
        .get('amount_in_words')!
        .setValue(this.arabicConverter.convert(this.paymentForm.value.amount));
    }
    if (this.paymentForm.value?.balance < 0) {
      return;
    } else {
      this.paymentForm
        .get('balance_after')!
        .setValue(
          this.paymentForm.value?.balance - this.paymentForm.value.amount
        );
    }
  }

  @ViewChild('detailsModal') detailsModal!: ElementRef<HTMLElement>;
  getPaymentFromId(event: any) {
    console.log(event);
    let selectedPayment = this.data[event.index];
    this.paymentForm.patchValue(selectedPayment);
    this.getBalanceAfter();
    this.detailsModal.nativeElement.click();
  }

  onPrintForm() {
    this.printService.printForm('print-section');
  }
}
