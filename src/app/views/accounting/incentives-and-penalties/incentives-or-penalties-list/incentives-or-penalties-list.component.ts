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
  selector: 'app-incentives-or-penalties-list',
  templateUrl: './incentives-or-penalties-list.component.html',
  styleUrls: ['./incentives-or-penalties-list.component.scss'],
})
export class IncentivesOrPenaltiesListComponent {
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
  tracks: supplier[] = [];
  accounting_employees: supplier[] = [];
  employees: supplier[] = [];
  created_by: supplier[] = [];
  types: fixedData[] = [];
  status: fixedData[] = [];
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
        name: 'اسم الموظف',
      },

      {
        name: 'نوع العملية',
      },
      {
        name: 'قيمة العملية',
      },
      {
        name: 'مبلغ العملية ',
      },

      {
        name: 'الكاتب',
      },
      {
        name: 'التاريخ',
      },
      {
        name: 'الحالة',
      },
      {
        name: 'ملاحظة',
      },
    ];
    this.columnsName = [
      {
        name: 'employee',
        type: 'normal.name',
      },

      {
        name: 'type',
        type: 'normal.name',
      },
      {
        name: 'transaction_value',
        type: 'normal.name',
      },
      {
        name: 'amount',
        type: 'normal',
      },

      {
        name: 'created_by',
        type: 'normal.name',
      },

      {
        name: 'created_at',
        type: 'normal',
      },
      {
        name: 'status',
        type: 'normal.name',
      },
      {
        name: 'note_incentives',
        type: 'note_incentives',
      },
    ];
    if (this.auth.getUserPermissions().includes('incentive_and_penalty')) {
      this.columnsName.push({
        name: 'incentiveAndPenalty',
        type: 'incentiveAndPenalty',
      });
      this.columnsArray.push({
        name: 'أمر',
      });
    }
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      user_id: [''],
      created_by: [''],
      from: [''],
      to: [''],
      type: [''],
      status: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['accounting_employees', 'employees'])
        .subscribe({
          next: (res) => {
            this.employees = res.data.employees;
            this.created_by = res.data.accounting_employees;
          },
        })
    );

    this.types = this.auth.getEnums().incentive_penalty;
    this.status = this.auth.getEnums().incentive_penalty_status;
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
              data['representative_name'] = data.representative?.name;
              data['type_name'] = data.type?.name;
              data['created_by_name'] = data.created_by?.name;
              data['track_name'] = data.track?.name;
              data['serial'] = index + 1;
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

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = 'accounting/incentives-penalties';

    return this.http.getReq(getUrl, { params: x });
  }

  // print(printData: any) {
  //   if (printData.amountOfPrint == 2) {
  //     this.getAllOrders(printData.type);
  //   } else {
  //     this.printService.setColumnsArray(this.columnsArray);
  //     this.printService.setColumnsNames(this.columnsName);
  //     this.printService.setRowsData(this.data);

  //     if (printData.type == 1) {
  //       this.printService.downloadPDF();
  //     } else {
  //       this.printService.downloadCSV();
  //     }
  //   }

  //   setTimeout(() => {
  //     this.openModal();
  //   }, 100);
  // }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  // allPrintData: any = [];
  // currentParams: any = {};
  // getAllOrders(printType: any) {
  //   let params = {};
  //   params = this.currentParams;
  //   this.subscription.add(
  //     this.getAllData(params, false).subscribe({
  //       next: (res) => {
  //         this.allPrintData = res.data;
  //         this.allPrintData = res.data.map((data: any, index: number) => {
  //           data['representative_name'] = data.representative?.name;
  //           data['type_name'] = data.type?.name;
  //           data['created_by_name'] = data.created_by?.name;
  //           data['track_name'] = data.track?.name;
  //           data['serial'] = index + 1;
  //           return data;
  //         });
  //       },
  //       complete: () => {
  //         this.printService.setColumnsArray(this.columnsArray);
  //         this.printService.setColumnsNames(this.columnsName);
  //         this.printService.setRowsData(this.allPrintData);
  //         if (printType == 1) {
  //           this.printService.downloadPDF();
  //         } else {
  //           this.printService.downloadCSV();
  //         }
  //       },
  //     })
  //   );
  // }

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
  confirmOperation(id: string) {
    let message = '';
    this.http.putReq(`accounting/incentives-penalties/${id}/accept`).subscribe({
      next: (res) => {
        message = res.message;
      },
      complete: () => {
        this.toaster.info(message);
        let index = this.data.findIndex((element: any) => element.id === id);
        if (index !== -1) {
          this.data[index].type_status = 'confirm';
        } else {
          console.error(`Element with ID ${id} not found.`);
        }
      },
    });
  }

  getProductId(event: any) {
    console.log(event);
    if (event.type === 'confirm') {
      this.confirmOperation(event.id);
    } else if (event.type === 'edit') {
      this.router.navigate([
        'accounting/incentives-or-penalties/edit',
        event.id,
      ]);
    }
  }
  @ViewChild('noteModel') noteModel!: ElementRef<HTMLElement>;

  openNoteModal(data: any) {
    this.note = data;
    this.noteModel.nativeElement.click();
  }
}
