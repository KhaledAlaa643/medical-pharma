import { DatePipe } from '@angular/common';
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
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-transfer-balance-index',
  templateUrl: './transfer-balance-index.component.html',
  styleUrls: ['./transfer-balance-index.component.scss'],
})
export class TransferBalanceIndexComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  note: string = '';
  created_by: supplier[] = [];
  accounts: supplier[] = [];

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
        name: 'المبلغ',
      },
      {
        name: 'الحساب المحول منة',
      },

      {
        name: 'الرصيد الحالي',
      },
      {
        name: 'الحساب المحول إليه',
      },
      {
        name: 'الرصيد الحالي',
      },
      {
        name: 'الكاتب',
      },
      {
        name: 'التاريخ والوقت',
      },
      {
        name: 'ملاحظات',
      },
    ];
    this.columnsName = [
      {
        name: 'id',
        type: 'normal',
      },
      {
        name: 'amount',
        type: 'normal',
      },

      {
        name: 'from_account_name',
        type: 'normal',
      },
      {
        name: 'from_account_balance',
        type: 'normal',
      },
      {
        name: 'to_account_name',
        type: 'normal',
      },
      {
        name: 'to_account_balance',
        type: 'normal',
      },

      {
        name: 'created_by_name',
        type: 'normal',
      },
      {
        name: 'date',
        type: 'normal',
      },
      {
        name: 'notes_cash',
        type: 'notes_cash',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      created_by: [''],
      from_account_id: [''],
      to_account_id: [''],
      amount_from: [''],
      amount_to: [''],
      date_from: [''],
      date_to: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService.getDropdownData(['accounting_employees']).subscribe({
        next: (res) => {
          this.created_by = res.data.accounting_employees;
        },
      })
    );
    this.subscription.add(
      this.http.getReq('accounting/accounts').subscribe({
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
              data['from_account_name'] = data.from_account.name;
              data['from_account_balance'] = data.from_account.balance;
              data['created_by_name'] = data.created_by.name;
              data['to_account_name'] = data.to_account.name;
              data['to_account_balance'] = data.to_account.balance;
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
      getUrl = 'accounting/transfer-balance';
    } else {
      getUrl = 'accounting/transfer-balance/all';
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
            data['from_account_name'] = data.from_account.name;
            data['from_account_balance'] = data.from_account.balance;
            data['created_by_name'] = data.created_by.name;
            data['to_account_name'] = data.to_account.name;
            data['to_account_balance'] = data.to_account.balance;
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
        if (key === 'date_from' || key === 'date_to') {
          const formattedDate = value
            ? datePipe.transform(new Date(value), 'yyyy-MM-dd')
            : null;
          queryParams[key] = formattedDate;
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
  @ViewChild('noteModel') noteModel!: ElementRef<HTMLElement>;

  openNoteModal(data: any) {
    this.note = data;
    this.noteModel.nativeElement.click();
  }
}
