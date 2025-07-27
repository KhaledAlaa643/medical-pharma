import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city } from '@models/pharmacie';
import { commonObject, FiltersObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';
@Component({
  selector: 'app-safe-list',
  templateUrl: './safe-list.component.html',
  styleUrls: ['./safe-list.component.scss'],
})
export class SafeListComponent {
  isActiveTapArray: boolean[] = Array(4).fill(false);
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  safe_employees: FiltersObject[] = [];
  super_admins: FiltersObject[] = [];
  safeTypes: commonObject[] = [];

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
    this.isActiveTapArray[0] = true;
    this.columnsArray = [
      {
        name: 'رقم الخزينة',
      },

      {
        name: 'اسم الخزينة',
      },

      {
        name: 'نوع الخزينة',
      },
      {
        name: 'الموظفين',
      },
      {
        name: 'الكاتب',
      },

      {
        name: 'أمر',
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
        name: 'users',
        type: 'safe_employees',
      },
      {
        name: 'created_by',
        type: 'normal',
      },

      {
        name: 'edit',
        type: 'edit_track',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      userId: [''],
      created_by: [''],
      type: [''],
    });
  }

  getDropdownData() {
    this.safeTypes = this.auth.getEnums().safe_type;
    this.subscription.add(
      this.generalService
        .getDropdownData(['safe_employees', 'super_admins'])
        .subscribe({
          next: (res) => {
            this.safe_employees = res.data.safe_employees;
            this.super_admins = res.data.super_admins;
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
      getUrl = 'accounting/safes';
    } else {
      getUrl = 'accounting/safes/all';
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
          this.allPrintData = res.data.map((item: any) => {
            return {
              ...item,
              type: item.type.name, // Assuming item.type is an object with a name property
              users: item.users.join(', '),
            };
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

  editSafe(event: any) {
    this.router.navigate(['accounting/safe/edit-safe', event.id]);
  }
}
