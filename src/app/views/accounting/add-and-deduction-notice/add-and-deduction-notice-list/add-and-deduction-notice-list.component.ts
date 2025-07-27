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
import { Subscription, switchMap, catchError, of } from 'rxjs';
const datePipe = new DatePipe('en-EG');
@Component({
  selector: 'app-add-and-deduction-notice-list',
  templateUrl: './add-and-deduction-notice-list.component.html',
  styleUrls: ['./add-and-deduction-notice-list.component.scss'],
})
export class AddAndDeductionNoticeListComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  paymentForm!: FormGroup;
  note: string = '';

  accounts: supplier[] = [];
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  status: commonObject[] = [];
  accountTypes: commonObject[] = [];

  types: commonObject[] = [];
  pharmacies: any = [];
  updatedPharmacyNames: any = [];
  tracks: supplier[] = [];
  clients: supplier[] = [];
  deliveries: supplier[] = [];
  created_by: supplier[] = [];

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
        name: 'مسلسل',
      },

      {
        name: 'اسم الحساب',
      },

      {
        name: 'نوع الإشعار',
      },

      {
        name: 'قبمة الإشعار',
      },
      {
        name: 'كود العميل',
      },

      {
        name: 'الكاتب',
      },
      {
        name: 'التاريخ',
      },
      {
        name: 'الملاحظات',
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
        name: 'serial',
        type: 'normal',
      },

      {
        name: 'account',
        type: 'normal.name',
      },
      {
        name: 'type_name',
        type: 'add_deduction',
      },
      {
        name: 'amount',
        type: 'normal',
      },

      {
        name: 'code',
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
      {
        name: 'notes',
        type: 'notes_cash',
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
    this.ConnectToParams();

    this.initForm();
    this.getDropdownData();
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  initForm() {
    this.searchForm = this.fb.group({
      from: [],
      to: [],
      created_by: [],
      status: [],
      type: [],
      account_id: [],
      account_type: [],
    });
  }

  getDropdownData() {
    this.types = this.auth.getEnums().adjustment_note_type;
    this.status = this.auth.getEnums().adjustment_note_status;
    this.accountTypes = this.auth.getEnums().account_types;

    this.subscription.add(
      this.generalService
        .getDropdownData(['accounting_employees'])

        .subscribe((dropdownRes) => {
          // Handle dropdown data response

          this.created_by = dropdownRes.data.accounting_employees;
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
              data['status_name'] = data.status.name;
              data['type_name'] = data.type.name;
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
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    getUrl = 'accounting/adjustment-notes';

    return this.http.getReq(getUrl, { params: x });
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
          .putReq('accounting/adjustment-notes/' + event.id + '/accept', {})
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
          .putReq('accounting/adjustment-notes/' + event.id + '/reject', {})
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

  @ViewChild('noteModel') noteModel!: ElementRef<HTMLElement>;

  openNoteModal(data: any) {
    this.note = data;
    this.noteModel.nativeElement.click();
  }
}
