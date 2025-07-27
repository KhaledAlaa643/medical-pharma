import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-supervisor-clients-list',
  templateUrl: './supervisor-clients-list.component.html',
  styleUrls: ['./supervisor-clients-list.component.scss'],
})
export class SupervisorClientsListComponent {
  private subscription = new Subscription();
  filterForm!: FormGroup;

  columnsArray: columnHeaders[] = [
    {
      name: 'اسم القائمة',
    },
    {
      name: 'عدد عملاء القائمة',
    },
    {
      name: 'مشرف الحسابات',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'تعديل القائمة',
    },
    {
      name: 'حذف القائمة',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'pharmacies_count',
      type: 'normal',
    },
    {
      name: 'supervisor_name',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'edit',
      type: 'edit_track',
    },
    {
      name: 'delete',
      type: 'delete',
    },
  ];
  data: any = [];
  page: number = 1;
  additional_data: any = {};
  rows!: number;
  total!: number;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      list_name: [],
      supervisor_name: [],
    });
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
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.additional_data = res.additional_data;
            this.data = res.data;
            // this.data = res.data.map((data: any, index: number) => {

            //   return data;
            // });
            console.log(this.page);
          },
        })
    );
  }

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'accounting/client-lists';
    } else {
      getUrl = 'accounting/client-lists/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }
  changepage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  filter() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};

    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        queryParams[key] = value;
      }
    }

    return queryParams;
  }
  editButton(data: any) {
    console.log(data);
    if (data.type === 'edit') {
      this.router.navigate(['accounting/supervisor-clients/edit/' + data.id]);
    } else if (data.type === 'delete') {
      this.deleteList(data.id);
    }
  }

  deleteList(id: string) {
    let message: string = '';
    let product: any;
    this.subscription.add(
      this.http.deleteReq('accounting/client-lists/' + id).subscribe({
        next: (res) => {
          message = res.message;
          product = res.data;
        },
        complete: () => {
          this.toastrService.success(message);
          const index = this.data.findIndex((item: any) => item.id === id);
          if (index !== -1) {
            this.data.splice(index, 1);
          }
        },
      })
    );
  }
}
