import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-index-deficit-and-surplus',
  templateUrl: './index-deficit-and-surplus.component.html',
  styleUrls: ['./index-deficit-and-surplus.component.scss'],
})
export class IndexDeficitAndSurplusComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  accounting_supervisors: supplier[] = [];
  accounting_custodian: supplier[] = [];
  tracks: supplier[] = [];
  deliveries: supplier[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private toaster: ToastrService,
    private generalService: GeneralService
  ) {}
  ngOnInit() {
    this.columnsArray = [
      {
        name: 'اسم المندوب',
      },

      {
        name: 'خط السير',
      },
      {
        name: 'تاريخ التسليم',
      },

      {
        name: 'رقم الدفتر',
      },
      {
        name: 'مبلغ الدفتر',
      },
      {
        name: 'مبلغ التسليم',
      },
      {
        name: 'مشرف الحسابات',
      },

      {
        name: 'أمين الخزنة',
      },
      {
        name: 'مبلغ العجز او الزيادة',
      },
      {
        name: 'أمر',
      },
    ];
    this.columnsName = [
      {
        name: 'delivery_name',
        type: 'normal',
      },
      {
        name: 'track_name',
        type: 'normal',
      },

      {
        name: 'transfer_date',
        type: 'normal',
      },
      {
        name: 'logbook_number',
        type: 'normal',
      },
      {
        name: 'logbook_amount',
        type: 'normal',
      },
      {
        name: 'transferred_amount',
        type: 'normal',
      },
      {
        name: 'supervisor_name',
        type: 'normal',
      },
      {
        name: 'safe_custodian_name',
        type: 'normal',
      },
      {
        name: 'deficit_or_surplus_amount',
        type: 'deficit_or_surplus_amount',
      },

      {
        name: 'deficit_or_surplus_btn',
        type: 'deficit_or_surplus_btn',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      track_id: [''],
      custodian_id: [''],
      supervisor_id: [''],
      delivery_id: [''],
      date_from: [''],
      date_to: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData([
          'deliveries',
          'tracks',
          'accounting_supervisors',
          'accounting_custodian',
        ])
        .subscribe({
          next: (res) => {
            this.deliveries = res.data.deliveries;
            this.tracks = res.data.tracks;
            this.accounting_supervisors = res.data.accounting_supervisors;
            this.accounting_custodian = res.data.accounting_custodian;
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
    getUrl = 'accounting/cash-transfers/deficit-and-surplus';

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

  saveDeficitAndSurplus(event: any) {
    let message = '';
    this.http
      .putReq(`accounting/cash-transfers/deficit-and-surplus/${event.id}`)
      .subscribe({
        next: (res) => {
          message = res.message;
        },
        complete: () => {
          this.toaster.info(message);
          let index = this.data.findIndex(
            (element: any) => element.id === event.id
          );
          if (index !== -1) {
            this.data[index].btn_status = 'confirm';
          } else {
            console.error(`Element with ID ${event.id} not found.`);
          }
        },
      });
  }
}
