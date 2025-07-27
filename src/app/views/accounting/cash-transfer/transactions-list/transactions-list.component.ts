import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Subscription, switchMap, catchError, of } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-transactions-list',
  templateUrl: './transactions-list.component.html',
  styleUrls: ['./transactions-list.component.scss'],
})
export class TransactionsListComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  data: any = [];
  columnsArrayPopup: columnHeaders[] = [];
  columnsNamePopup: ColumnValue[] = [];
  popupData: any = [];
  additional_data_popup: any = {};

  note: string = '';

  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  safes: supplier[] = [];
  cashSafes: supplier[] = [];
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
        name: 'المبلغ المحول',
      },
      {
        name: 'الخزينة المحول منها',
      },

      {
        name: 'الخزينة المحول إليها',
      },

      {
        name: 'التاريخ والوقت',
      },
      {
        name: 'الكاتب',
      },
      {
        name: 'الملاحظات',
      },
      {
        name: 'أمر',
      },
    ];
    this.columnsName = [
      {
        name: 'id',
        type: 'underlined_id',
      },
      {
        name: 'amount',
        type: 'normal',
      },

      {
        name: 'safe_from',
        type: 'normal.name',
      },
      {
        name: 'safe_to',
        type: 'normal.name',
      },
      {
        name: 'created_at',
        type: 'normal',
      },
      {
        name: 'created_by',
        type: 'normal.name',
      },
      {
        name: 'notes',
        type: 'notes_cash',
      },

      {
        name: 'edit_track',
        type: 'edit_track',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      safe_from_id: [''],
      safe_to_id: [''],
      created_by: [''],
      date_from: [''],
      date_to: [''],
      amount_from: [''],
      amount_to: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.http.getReq('accounting/safes/dropdown').subscribe({
        next: (res) => {
          this.safes = res.data;
          if (this.safes.length === 1) {
            this.searchForm.get('safe_from_id')!.setValue(this.safes[0].id);
          }
        },
      })
    );
    this.subscription.add(
      this.http.getReq('accounting/safes/dropdown/cash').subscribe({
        next: (res) => {
          this.cashSafes = res.data;
          if (this.cashSafes.length === 1) {
            this.searchForm.get('safe_to_id')!.setValue(this.cashSafes[0].id);
          }
        },
      })
    );
    this.subscription.add(
      this.generalService.getDropdownData(['super_admins']).subscribe({
        next: (res) => {
          this.created_by = res.data.super_admins;
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

            console.log(this.data);

            this.additional_data = res.additional_data;

            this.total = res.meta.total;
            this.rows = res.meta.per_page;
          },
        })
    );
  }

  index_to_update!: number;

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    getUrl = 'accounting/cash-transfers';
    return this.http.getReq(getUrl, { params: x });
  }

  @ViewChild('OpenDetailsPopup') OpenDetailsPopup!: ElementRef<HTMLElement>;
  openEditsLogModal(event: any) {
    this.columnsArrayPopup = [
      {
        name: 'المسلسل',
      },

      {
        name: 'المبلغ المحول',
      },
      {
        name: 'الخزينة المحول منها',
      },

      {
        name: 'الخزينة المحول إليها',
      },
      {
        name: 'الكاتب',
      },
      {
        name: 'التاريخ والوقت',
      },

      {
        name: 'الملاحظات',
      },
    ];
    this.columnsNamePopup = [
      {
        name: 'serial',
        type: 'normal',
      },
      {
        name: 'amount',
        type: 'normal',
      },

      {
        name: 'account_from',
        type: 'normal',
      },
      {
        name: 'account_to',
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
        type: 'normal',
      },
    ];
    this.getEditsLog(event);
  }

  getEditsLog(id: number) {
    this.subscription.add(
      this.http
        .getReq('accounting/cash-transfers/get-transactions/' + id)
        .subscribe({
          next: (res) => {
            this.popupData = res.data;
            this.popupData.forEach((element: any, i: number) => {
              element['serial'] = i + 1;
            });
            this.additional_data_popup = res.additional_data;
          },
          complete: () => {
            let el: HTMLElement = this.OpenDetailsPopup.nativeElement;
            el.click();
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

  @ViewChild('noteModel') noteModel!: ElementRef<HTMLElement>;

  openNoteModal(data: any) {
    this.note = data;
    this.noteModel.nativeElement.click();
  }

  navigateToEditPage(data: any) {
    this.router.navigate(['accounting/cash-transfer/edit', data.id]);
  }
}
