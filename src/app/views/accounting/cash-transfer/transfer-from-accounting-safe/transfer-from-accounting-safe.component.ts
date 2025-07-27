import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-transfer-from-accounting-safe',
  templateUrl: './transfer-from-accounting-safe.component.html',
  styleUrls: ['./transfer-from-accounting-safe.component.scss'],
})
export class TransferFromAccountingSafeComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  transferForm!: FormGroup;

  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  note: string = '';

  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  safes: supplier[] = [];
  cashSafes: supplier[] = [];
  tracks: supplier[] = [];
  created_by: supplier[] = [];
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
    this.columnsArray = [
      {
        name: 'المسلسل',
      },

      {
        name: 'اسم المندوب',
      },
      {
        name: 'إجمالي الدفتر',
      },

      {
        name: 'مشرف الحسابات',
      },
      {
        name: 'خط السير',
      },

      {
        name: 'التاريخ والوقت',
      },

      {
        name: 'أمر',
      },
    ];
    this.columnsName = [
      {
        name: 'serial',
        type: 'normal',
      },
      {
        name: 'delivery',
        type: 'normal',
      },

      {
        name: 'total',
        type: 'normal',
      },
      {
        name: 'supervisor',
        type: 'normal',
      },
      {
        name: 'track',
        type: 'multiple_values_array',
      },
      {
        name: 'created_at',
        type: 'normal',
      },

      {
        name: 'transfer_btn',
        type: 'transfer_btn',
      },
    ];
    this.initForm();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      safe_id: [''],
      track_id: [''],
      created_by: [''],
      date_from: [''],
      date_to: [''],
    });

    this.transferForm = this.fb.group({
      id: [''],
      amount_collected: [''],
      amount: [''],
      delivery: [''],
      safe_to_id: [''],
      notes: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.http.getReq('accounting/safes/accounting').subscribe({
        next: (res) => {
          this.safes = res.data;
          if (this.safes.length === 1) {
            this.searchForm.get('safe_id')!.setValue(this.safes[0].id);
          }
        },
        complete: () => {
          this.ConnectToParams();
        },
      })
    );

    this.subscription.add(
      this.http.getReq('accounting/safes/cash/edit').subscribe({
        next: (res) => {
          this.cashSafes = res.data;
          if (this.cashSafes.length === 1) {
            this.transferForm.get('safe_to_id')!.setValue(this.cashSafes[0].id);
          }
        },
      })
    );

    this.subscription.add(
      this.generalService
        .getDropdownData(['accounting_employees', 'tracks'])
        .subscribe({
          next: (res) => {
            this.created_by = res.data.accounting_employees;
            this.tracks = res.data.tracks;
          },
        })
    );
  }

  ConnectToParams() {
    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param).pipe(
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
              data['serial'] = index + 1 + res.meta.per_page * (this.page - 1);

              return data;
            });

            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.additional_data = res.additional_data;
          },
        })
    );
  }
  getAllData(filters: any) {
    let x: LooseObject = { safe_id: this.safes[0]?.id };
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    getUrl = 'accounting/accounting-safe';

    return this.http.getReq(getUrl, { params: x });
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
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
        if (key == 'date_from' || key == 'date_to') {
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

  @ViewChild('receiveOpen') receiveOpen!: ElementRef<HTMLElement>;

  openTransferModal(event: any) {
    let el: HTMLElement = this.receiveOpen.nativeElement;
    this.transferForm.patchValue(event);
    el.click();
  }

  transferMoney() {
    let message = '';

    this.subscription.add(
      this.http
        .postReq(
          `accounting/cash-transfers/create-from-collection/${this.transferForm.value.id}`,
          {
            amount: this.transferForm.value.amount,
            notes: this.transferForm.value.notes,
            safe_to_id: this.transferForm.value.safe_to_id,
          }
        )
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.transferForm.reset();

            this.toaster.info(message);
          },
          error: (err) => {
            this.transferForm.reset();
          },
        })
    );
  }
}
