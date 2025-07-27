import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { manufacturers } from '@models/manufacturers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-manufacturers-list',
  templateUrl: './manufacturers-list.component.html',
  styleUrls: ['./manufacturers-list.component.scss'],
})
export class ManufacturersListComponent implements OnInit {
  manufacturers: manufacturers[] = [];
  private subscription = new Subscription();
  filterForm!: FormGroup;
  page: number = 1;

  columnsArray: columnHeaders[] = [
    {
      name: 'رقم الترتيب',
    },
    {
      name: 'اسم الشركة',
    },
    {
      name: 'رقم الهاتف',
    },
    {
      name: 'العنوان',
    },
    {
      name: 'المحافظة',
    },
    {
      name: 'المدينة',
    },
    {
      name: 'المدير المسئول',
    },
    {
      name: 'الكاتب',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'order',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'nameClickableBlue',
    },
    {
      name: 'phone_1',
      type: 'normal',
    },
    {
      name: 'address',
      type: 'normal',
    },
    {
      name: 'city_name',
      type: 'normal',
    },
    {
      name: 'area_name',
      type: 'normal',
    },
    {
      name: 'manager',
      type: 'normal',
    },
    {
      name: 'created_by_name',
      type: 'normal',
    },
  ];
  cities: any = [];
  areas: any = [];
  created_by: any = [];
  rows!: number;
  total!: number;
  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private router: Router,
    private generalService: GeneralService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // this.getCities();
    this.filterForm = this.fb.group({
      name: [''],
      order: [''],
      city_id: [''],
      area_id: [''],
      created_by: ['']
    });
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
            this.manufacturers = res.data;
            this.total = res.additional_data.total;
            this.rows = res.meta.per_page;
          },
        })
    );
    this.getCites();
    this.getAreas();
    this.getCreatedBy();
  }
  getCites() {
    this.generalService.getCity().subscribe((res) => {
      this.cities = res.data;
    });
  }

  getAreas() {
    this.generalService.getArea().subscribe((res) => {
      this.areas = res.data;
    });
  }

  getCreatedBy() {
    this.generalService.getDropdownData([ 'purchases_employees' ]).subscribe({
      next: res => {
        this.created_by = res.data.purchases_employees
      }
    })
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value && value != 0) x[key] = value;
    }
    let getUrl = 'products/manufacturers/index';

    return this.http.getReq(getUrl, { params: x });
  }
  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
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

    if (this.page) {
      queryParams['page'] = this.page;
    }
    return queryParams;
  }
  editManufacturer(id: any) {
    this.router.navigate(['/purchases/manufacturers/edit/' + id]);
  }
}
