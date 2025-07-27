import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { client } from '@models/client';
import { fixedData } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';

import { HttpService } from '@services/http.service';
import { invoiceService } from '@services/invoice.service';
import { Progress_barService } from '@services/progress_bar.service';
import * as moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Paginator } from 'primeng/paginator';
import { Subject, Subscription, debounceTime, switchMap } from 'rxjs';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  pharmaciesData: any = [];
  rows!: number;
  currentPageIndex: any;
  total!: any;
  activeButton!: number;
  clientsData: any = [];
  clientListFilter!: FormGroup;
  extraDiscountForm!: FormGroup;
  citiesData: any = [];
  areasData: any = [];
  cityID: any;
  trackData: any = [];
  morningShiftData: any = [];
  nightShiftData: any = [];
  @ViewChild('myModal') myModal!: ElementRef;
  @ViewChild('Listmodel') Listmodel!: ElementRef<HTMLElement>;
  @ViewChild('closePoPModal') closePoPModal!: ElementRef<HTMLElement>;
  clientCode: any;
  clientName: any;
  currentPage: any;
  @ViewChild('paginator') paginator!: Paginator;

  columnsArray: columnHeaders[] = [
    {
      name: ' اسم العميل',
    },
    {
      name: ' الكود',
    },
    {
      name: 'نوع العميل	',
    },
    {
      name: 'رقم الهاتف	',
    },
    {
      name: 'الدكتور',
    },
    {
      name: 'خط السير	',
    },
    {
      name: ' المحافظة ',
    },
    {
      name: ' المدينة ',
    },
    {
      name: 'نوع التعامل	',
    },
    {
      name: 'مندوب المبيعات',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'client_name',
      type: 'with_br_client',
    },
    {
      name: 'code',
      type: 'with_br_code',
    },
    {
      name: 'type',
      type: 'normal',
    },
    {
      name: 'phone',
      type: 'normal',
    },
    {
      name: 'doctor',
      type: 'normal',
    },
    {
      name: 'track',
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
      name: 'sales',
      type: 'with_br_sales',
    },
  ];

  constructor(
    private invoiceService: invoiceService,
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private generalService: GeneralService,
    private fixed_data: FixedDataService
  ) {
    this.router.navigate([], {
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  active: Array<object> = [];
  payment_type: commonObject[] = [];
  discount_slat: commonObject[] = [];
  status: commonObject[] = [];
  follow_up: commonObject[] = [];
  time: commonObject[] = [];
  extra_discount: commonObject[] = [];
  userType: any;

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    x['pagination_number'] = 10;

    return this.generalService.getPharmacies(x);
  }

  ngOnInit() {
    // this.subs.add(
    //   this.fixed_data.getAllFixedData().subscribe({
    //     next: (res) => {
    this.status = this.auth.getEnums().pharmacy_status;
    this.payment_type = this.auth.getEnums().payment_types;
    this.follow_up = this.auth.getEnums().pharmacy_follow_up;
    this.time = this.auth.getEnums().pharmacy_shifts;
    this.active = this.auth.getEnums().pharmacy_active;
    this.extra_discount = this.auth.getEnums().extra_discount;
    //   },
    // })
    // );

    this.router.navigate([], { queryParams: {} });
    this.userType = this.auth.getUserObj().role.id;

    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param);
          })
        )
        .subscribe({
          next: (res) => {
            this.pharmaciesData = [];
            res.data.forEach((client: any) => {
              this.pharmaciesData.push({
                client_name: client?.clients[0]?.name,
                pharmacy_name: client?.name,
                code: client?.clients[0]?.code,
                pharmacy_code: client?.code,
                type: client?.type?.name,
                phone: client?.phone_number,
                doctor: client?.doctor,
                track: client?.track?.name,
                city: client?.city?.name,
                area: client?.area?.name,
                payment_type: client?.payment_type?.name,
                sales: client?.lists[0]?.users[0]?.name,
                sales2: client.lists[1]?.users[0]?.name,
              });
            });
            if (res.meta.total) {
              this.total = res?.meta.total;
              this.rows = res.meta?.per_page;
            } else {
              this.rows = 1;
              this.total = 1;
            }
          },
          complete: () => {},
        })
    );

    this.extraDiscountForm = this.fb.group({
      extra_discount: [''],
      expiration_extra_discount: [''],
      minimum_for_extra_discount: [''],
    });
    this.clientListFilter = this.fb.group({
      client_code: [''],
      client_id: [''],
      name: [''],
      city_id: [''],
      area_id: [''],
      track_id: [''],
      active: [''],
      debt_limit: [''],
      payment_type: [''],
      payment_period: [''],
      status: [''],
      target: [''],
      discount_tier_id: [''],
      morning_sales_id: [''],
      minimum_target: [''],
      night_sales_id: [''],
      extra_discount: [''],
      follow_up: [''],
      call_shift: [''],
      iterate_available_quantity: [''],
      all: [''],
      pagination_number: [10],
    });
    this.getClients();
    this.getCities();
    this.getTracks();
    this.getMorningShift();
    this.getNightShift();
    this.getDiscountTier();
  }

  getDiscountTier() {
    this.subs.add(
      this.http.getReq('settings/discount-tiers').subscribe({
        next: (res) => {
          this.discount_slat = res.data;
        },
      })
    );
  }
  filteredTime: any;
  selectedShift?: number;
  shiftSwitchBasedOnTimeChosen(event: any) {
    this.selectedShift = event.value;

    this.filteredTime = this.time.filter((item) => {
      if (this.selectedShift === 0) {
        return item.value >= 0 && item.value <= 3;
      } else if (this.selectedShift === 1) {
        return item.value >= 4 && item.value <= 7;
      }
      return false;
    });
  }

  changeTab(btnNum: number) {
    this.activeButton = btnNum;
    this.openModal();
  }

  openModal() {
    let el: HTMLElement = this.Listmodel.nativeElement;
    if (!this.invoiceService.getInvoiceCart()) {
      el.click();
    }
  }
  closeModel() {
    let el: HTMLElement = this.Listmodel.nativeElement;
    el.click();
  }

  closeModal() {
    if (this.activeButton === 1) {
      this.closeModalElement(this.myModal);
    } else if (this.activeButton === 2) {
      this.closeModalElement(this.myModal);
    }
  }
  closeModalElement(modal: ElementRef) {
    modal.nativeElement.classList.remove('show');
    modal.nativeElement.style.display = 'none';
    this.clientListFilter.reset();
  }

  clients = [];

  changingPage(event: any) {
    this.currentPageIndex = event.page + 1;

    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  getClients() {
    let param = ['clients'];
    this.subs.add(
      this.generalService.getDropdownData(param).subscribe({
        next: (res) => {
          this.clientCode = res.data.clients;
          this.clientName = res.data.clients;
        },
      })
    );
    // this.subs.add(this.http.getReq('clients/dropdown').subscribe({
    //   next: res => {
    //     this.clientCode = res.data
    //     this.clientName = res.data
    //   }
    // }))
  }
  getCities() {
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.citiesData = res.data;
        },
      })
    );
  }
  canSearch: boolean = true;

  filterPharmacies() {
    // if (!this.canSearch) {
    //   return;
    // }
    // this.canSearch = false;
    // setTimeout(() => this.canSearch = true, 3000);

    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
    this.closeModel();
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.clientListFilter.value) {
      let value = this.clientListFilter.value[key];
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        queryParams[key] = value;
      }
    }
    if (this.currentPageIndex) {
      queryParams['page'] = this.currentPageIndex;
    }
    return queryParams;
  }

  getArea(event: any) {
    this.cityID = event.value;
    let param = {
      city_id: this.cityID,
    };
    this.subs.add(
      this.generalService.getCity(param).subscribe({
        next: (res) => {
          this.areasData = res.data[0]?.areas;
        },
      })
    );
  }

  getTracks() {
    this.subs.add(
      this.generalService.getTracks().subscribe({
        next: (res) => {
          this.trackData = res.data;
        },
      })
    );
  }
  getMorningShift() {
    this.subs.add(
      this.generalService.getUsers({ list_type: 0 }).subscribe({
        next: (res) => {
          this.morningShiftData = res.data;
        },
      })
    );
  }
  getNightShift() {
    this.subs.add(
      this.generalService.getUsers({ list_type: 1 }).subscribe({
        next: (res) => {
          this.nightShiftData = res.data;
        },
      })
    );
  }

  getclientDrop(param: string, dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.getClientidFromCode(param);
      dropdown?.close();
    }
  }
  client!: client;
  getClientidFromCode(param: string, e?: any) {
    let params;
    if (
      param == 'code' &&
      this.clientListFilter.controls['client_code'].value
    ) {
      params = {
        code: this.clientListFilter.controls['client_code'].value,
      };

      this.clientListFilter.controls['client_id'].setValue(null);
    } else if (
      param == 'clientId' &&
      this.clientListFilter.controls['client_id'].value
    ) {
      this.clientListFilter.controls['client_id'].setValue(
        this.clientListFilter.controls['client_id'].value
      );
      params = { id: this.clientListFilter.controls['client_id'].value };
      this.clientListFilter.controls['client_code'].setValue('');
    }
    if (params) {
      this.subs.add(
        this.generalService.getClients(params).subscribe({
          next: (res) => {
            this.client = res.data[0];

            if (
              param == 'code' &&
              this.clientListFilter.controls['client_code'].value
            ) {
              this.clientListFilter.controls['client_id'].setValue(
                res.data[0]?.id
              );
            }
            if (this.client?.code)
              this.clientListFilter.controls['client_code'].setValue(
                String(this.client?.code)
              );
            else this.clientListFilter.controls['client_id'].setValue(null);
          },
        })
      );
    } else {
      this.clientListFilter.controls['client_id'].setValue(null);
      this.clientListFilter.controls['client_code '].setValue('');
    }
  }

  addExtraDiscount() {
    let expirationExtraDiscount;
    if (this.extraDiscountForm.controls['expiration_extra_discount'].value) {
      expirationExtraDiscount = moment(
        this.extraDiscountForm.controls['expiration_extra_discount'].value
      ).format('YYYY-MM-D');
    }

    let param = {
      extra_discount: this.extraDiscountForm.controls['extra_discount'].value,
      expiration_extra_discount: expirationExtraDiscount,
      minimum_for_extra_discount:
        this.extraDiscountForm.controls['minimum_for_extra_discount'].value,
    };

    this.subs.add(
      this.http.putReq('pharmacies/add-extra-discount', param).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
        },
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.router.navigate([], { queryParams: {} });
  }
}
