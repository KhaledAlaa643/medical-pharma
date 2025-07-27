import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { area, city } from '@models/pharmacie';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { colSpanArray, columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-suppliers-list',
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.scss'],
})
export class SuppliersListComponent implements OnInit {
  columnsArray: columnHeaders[] = [
    {
      name: 'الكود',
    },
    {
      name: 'اسم المورد',
    },
    {
      name: 'نوع المورد  ',
    },
    {
      name: 'رقم الهاتف ',
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
      name: 'نوع التعامل',
    },
    {
      name: ' الأصناف',
    },
    {
      name: ' حالة المورد ',
    },
    {
      name: 'الكوتة',
    },
    {
      name: 'فترة السماح',
    },
    {
      name: 'الحد الائتماني ',
    },
    {
      name: 'شرائح الخصم ',
    },
    {
      name: 'رقم الرخصة  ',
    },
    {
      name: 'رقم بطاقة ضريبية   ',
    },
    {
      name: 'حالة المورد',
    },
    {
      name: 'زرار حذف',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'id',
      type: 'location',
    },
    {
      name: 'supplier_name',
      type: 'nameClickableBlue',
    },
    {
      name: 'supplier_type',
      type: 'normal',
    },
    {
      name: 'phone',
      type: 'normal',
    },
    {
      name: 'address',
      type: 'normal',
    },
    {
      name: 'city',
      type: 'normal',
    },
    {
      name: 'area',
      type: 'normal',
    },
    {
      name: 'payment_type',
      type: 'normal',
    },
    {
      name: 'products',
      type: 'normal',
    },
    {
      name: 'supplier_status',
      type: 'normal',
    },
    {
      name: 'quota_repeat',
      type: 'normal',
    },
    {
      name: 'grace_period',
      type: 'normal',
    },
    {
      name: 'credit_limit',
      type: 'normal',
    },
    {
      name: 'discount_tier',
      type: 'normal',
    },
    {
      name: 'licence_no',
      type: 'normal',
    },
    {
      name: 'tax_card_no',
      type: 'normal',
    },
    {
      name: 'status',
      type: 'normal',
    },
    {
      name: 'save',
      type: 'delete_button',
    },
  ];
  data: any = [];
  filterForm!: FormGroup;
  private subscription = new Subscription();
  page: number = 1;
  rows!: number;
  total!: number;
  total_suppliers: number = 0;
  supplier: supplier = {} as supplier;
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
    this.getDropdownData();
    this.filterForm = this.fb.group({
      id: [''],
      name: [''],
      city_id: [''],
      area_id: [''],
      type: [''],
      active: [''],
      payment_type: [''],
      grace_period: [''],
      status: [''],
      products_type: [''],
      discount_tier: [''],
      has_taxes: [''],
      quota_repeat: [''],
      quota_days: [''],
      call_shift: [''],
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
            this.data = [];
            res.data.forEach((supplier: any) => {
              this.data.push({
                id: supplier.id,
                supplier_name: supplier.name,
                supplier_type: supplier.type.name,
                phone: supplier.phone,
                address: supplier.address,
                city: supplier?.city_name,
                area: supplier?.area_name,
                payment_type: supplier?.payment_type?.name,
                products: supplier?.products_type?.name,
                supplier_status: supplier.status.name,
                quota_repeat: supplier.quota_repeat,
                grace_period: supplier.grace_period,
                credit_limit: supplier.credit_limit,
                discount_tier: supplier?.discount_tier?.title,
                licence_no: supplier.licence_no,
                tax_card_no: supplier.tax_card_no,
                status: supplier?.status?.name,
              });
            });

            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.total_suppliers = res.additional_data.total;
            //total clients is missing
          },
        })
    );
  }
  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = 'suppliers';

    return this.http.getReq(getUrl, { params: x });
  }
  suppliers: supplier[] = [];
  selected_supplier: supplier = {} as supplier;
  balance_status: commonObject[] = [];
  cities: city[] = [];
  areas: area[] = [];
  products_type: commonObject[] = [];
  discount_tier: commonObject[] = [];
  payment_type: commonObject[] = [];
  supplier_idle_days: commonObject[] = [];
  types: commonObject[] = [];
  has_taxes: commonObject[] = [];
  active: commonObject[] = [];
  payment_periods: commonObject[] = [];
  supplier_status: commonObject[] = [];
  call_shifts: commonObject[] = [];
  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['suppliers', 'purchases_employees', 'warehouses'])
        .subscribe({
          next: (res) => {
            this.suppliers = res.data.suppliers;
            // this.created_by = res.data.purchases_employees
            // this.warehouses = res.data.warehouses
          },
        })
    );
    this.subscription.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
    this.balance_status = this.auth.getEnums().balance_status;
    this.discount_tier = this.auth.getEnums().discount_slats;
    this.payment_type = this.auth.getEnums().payment_types;
    this.types = this.auth.getEnums().supplier_type;
    this.has_taxes = this.auth.getEnums().has_taxes;
    this.active = this.auth.getEnums().pharmacy_active;
    this.payment_periods = this.auth.getEnums().payment_periods;
    this.supplier_status = this.auth.getEnums().supplier_status;
    this.call_shifts = this.auth.getEnums().pharmacy_shifts;
    this.products_type = this.auth.getEnums().supplier_products_type;
    this.supplier_idle_days = this.auth
      .getEnums()
      .supplier_idle_days.map((shelf: string) => ({ number: shelf }));
  }

  getArea(dropdown: any) {
    if (!dropdown.overlayVisible) {
      if (this.filterForm.controls['city_id'].value) {
        let params = {
          city_id: this.filterForm.controls['city_id'].value,
        };
        this.subscription.add(
          this.generalService.getCity(params).subscribe({
            next: (res) => {
              this.areas = res.data[0].areas;
            },
          })
        );
      } else {
        this.areas = [];
      }
    }
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
    setTimeout(() => {
      this.closePopup();
    }, 300);
  }

  changepage(event: any) {
    this.page = event.page + 1;
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

  goToAccountStatement(id: any) {
    this.router.navigate([`/purchases/supply/account-statement/${id}`]);
  }

  @ViewChild('popupModalOpen') popupModalOpen!: ElementRef<HTMLElement>;
  @ViewChild('PopupModalClose') PopupModalClose!: ElementRef<HTMLElement>;
  popupMessage: string = '';
  cancle_button_name: string = '';
  delete_supplier_index!: number;
  ok_button_name: string = '';
  openModel(supplier_index?: number) {
    this.popupMessage = 'هل انت متأكد من حذف المورد !';
    this.cancle_button_name = 'الغاء';
    this.ok_button_name = 'حذف';
    this.delete_supplier_index = Number(supplier_index);

    let el: HTMLElement = this.popupModalOpen.nativeElement;
    el.click();
  }
  closePopup() {
    let el: HTMLElement = this.PopupModalClose.nativeElement;
    el.click();
  }

  Popupevent(event: any) {
    if (event.ok == true) {
      this.deleteSupplier();
    } else {
      this.closePopup();
    }
  }
  deleteSupplier() {
    let supplier_id = this.data[this.delete_supplier_index].id;
    this.subscription.add(
      this.http.deleteReq(`suppliers/${supplier_id}/delete`).subscribe({
        next: (res) => {},
        complete: () => {
          this.data.splice(this.delete_supplier_index, 1);
        },
      })
    );
  }

  editSupplier(id: any) {
    this.router.navigate(['/purchases/supply/edit/supplier/' + id]);
  }
}
