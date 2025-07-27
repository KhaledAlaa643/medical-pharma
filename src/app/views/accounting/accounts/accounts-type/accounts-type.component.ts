import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { fixedData } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { colSpanArray, columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';

@Component({
  selector: 'app-accounts-type',
  templateUrl: './accounts-type.component.html',
  styleUrls: ['./accounts-type.component.scss'],
})
export class AccountsTypeComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  colSpanArray: colSpanArray[] = [
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 2,
      name: 'رصيد أول المدة',
    },
  ];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  types: commonObject[] = [];
  dealing: commonObject[] = [];
  display: commonObject[] = [];
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
    this.columnsArray = [
      {
        name: 'رقم الحساب',
      },

      {
        name: 'اسم الحساب',
      },
      {
        name: 'نوع الحساب',
      },

      {
        name: 'حالة التعامل',
      },

      {
        name: 'حالة الظهور',
      },
      {
        name: 'مدين',
      },
      {
        name: 'دائن',
      },
    ];
    this.columnsName = [
      {
        name: 'id',
        type: 'normal',
      },
      {
        name: 'name',
        type: 'normal',
      },

      {
        name: 'type',
        type: 'normal.name',
      },
      {
        name: 'is_disabled',
        type: 'normal.name',
      },
      {
        name: 'is_hidden',
        type: 'normal.name',
      },
      {
        name: 'initial_debit',
        type: 'normal',
      },
      {
        name: 'initial_credit',
        type: 'normal',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      name: [''],
      account_number: [''],
      is_disabled: [''],
      is_hidden: [''],
      type: [''],
    });
  }

  getDropdownData() {
    this.types = this.auth.getEnums().account_types;
    this.dealing = this.auth.getEnums().account_status_enums;
    this.display = this.auth.getEnums().account_appearance_enums;
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
    getUrl = 'accounting/accounts';

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
