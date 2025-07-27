import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city } from '@models/pharmacie';
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
@Component({
  selector: 'app-logbooks-archive',
  templateUrl: './logbooks-archive.component.html',
  styleUrls: ['./logbooks-archive.component.scss'],
})
export class LogbooksArchiveComponent {
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  tracks: supplier[] = [];
  deliveries: supplier[] = [];
  accounting_supervisors: supplier[] = [];
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
    this.columnsArray = [
      {
        name: 'المسلسل',
      },

      {
        name: 'اسم المندوب',
      },
      {
        name: 'خط السير',
      },

      {
        name: 'نوع الدفتر',
      },
      {
        name: 'أول رقم في الدفتر',
      },
      {
        name: 'أخر رقم في الدفتر',
      },
      {
        name: 'المستخدم',
      },
      {
        name: 'المتبقي',
      },
      {
        name: 'الكاتب',
      },
      {
        name: 'التاريخ والوقت',
      },
    ];
    this.columnsName = [
      {
        name: 'serial',
        type: 'normal',
      },
      {
        name: 'representative_name',
        type: 'normal',
      },

      {
        name: 'track_name',
        type: 'normal',
      },
      {
        name: 'type_name',
        type: 'normal',
      },
      {
        name: 'start',
        type: 'normal',
      },
      {
        name: 'end',
        type: 'normal',
      },
      {
        name: 'used_receipts',
        type: 'normal',
      },
      {
        name: 'remaining_receipts',
        type: 'normal',
      },
      {
        name: 'created_by_name',
        type: 'normal',
      },

      {
        name: 'created_at',
        type: 'normal',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      track_id: [''],
      area_id: [''],
      created_by: [''],
      supervisor_id: [''],
      representative_id: [''],
      receipt_number: [''],
      type: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData([
          'tracks',
          'deliveries',
          'accounting_supervisors',
          'super_admins',
        ])
        .subscribe({
          next: (res) => {
            this.deliveries = res.data.deliveries;
            this.tracks = res.data.tracks;
            this.accounting_supervisors = res.data.accounting_supervisors;
            this.created_by = res.data.super_admins;
          },
        })
    );

    this.types = this.auth.getEnums().log_book_type;
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
              data['representative_name'] = data.representative?.name;
              data['type_name'] = data.type?.name;
              data['created_by_name'] = data.created_by?.name;
              data['track_name'] = data.track?.name;
              data['serial'] = index + 1 + res.meta.per_page * (this.page - 1);
              return data;
            });
            console.log(this.data);

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
      getUrl = 'accounting/log-books/archived';
    } else {
      getUrl = 'accounting/log-books/archived/all';
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
            data['representative_name'] = data.representative?.name;
            data['type_name'] = data.type?.name;
            data['created_by_name'] = data.created_by?.name;
            data['track_name'] = data.track?.name;
            data['serial'] = index + 1 + res.meta.per_page * (this.page - 1);
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
