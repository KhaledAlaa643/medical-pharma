import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { client } from '@models/client';
import { city, track } from '@models/pharmacie';
import { FiltersObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { exactLengthValidator } from 'app/core/validators/exact-length.validator';
import { ToastrService } from 'ngx-toastr';
import { Dropdown } from 'primeng/dropdown';
import { Subscription, distinctUntilChanged, map } from 'rxjs';
interface fixed_data {
  name: string;
  value: number;
  payment_period?: number;
}

@Component({
  selector: 'app-Add-sub-client',
  templateUrl: './Add-sub-client.component.html',
  styleUrls: ['./Add-sub-client.component.scss'],
})
export class AddSubClientComponent implements OnInit {
  salesAdmin = 'sales_admin';
  generalManager = 'super_admin';
  accountantManager = 'accountant_manager';
  private subs = new Subscription();
  clientType = '';
  files: File[] = [];
  filesUrl: any[] = [];
  imagesCount: any;
  formDataPayLoad = new FormData();
  arr: any[] = [];
  cities: city[] = [];
  area: any[] = [];
  clients: client[] = [];
  client: client = {} as client;
  Distributor?: FiltersObject;
  roleId!: number;
  status: fixed_data[] = [];
  payment_type: fixed_data[] = [];
  warehouses: FiltersObject[] = [];
  payment_period: fixed_data[] = [];
  supervisor_pharamcies: FiltersObject[] = [];

  payment_days: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
  follow_up: fixed_data[] = [];
  time: fixed_data[] = [];
  extra_discount: fixed_data[] = [];
  discount_slat: fixed_data[] = [];
  tracks: track[] = [];
  salesMorning: any[] = [];
  salesEvening: any[] = [];
  addSubClinetForm!: FormGroup;
  v = '';
  v1 = '';
  images: [] = [];
  userType: any = 'sales_employee';
  permissions: any = [];
  isDebitInputDisabled: boolean = false;
  isCreditInputDisabled: boolean = false;
  constructor(
    private fix_data: FixedDataService,
    private auth: AuthService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private generalService: GeneralService,
    private http: HttpService
  ) {}

  ngOnInit() {
    this.permissions = this.auth.getUserPermissions();

    this.addSubClinetForm = this.fb.group({
      name: ['', Validators.required],
      doctor: ['', Validators.required],
      phone_number: ['', Validators.required],
      optional_phone_number: [''],
      active: [''],
      email: ['', Validators.compose([Validators.email])],
      address: [''],
      city_id: ['', Validators.required],
      area_id: ['', Validators.required],
      location_url: [''],
      default_sales_warehouse_id: [''],
      activity_no: [''],
      license_no: [''],
      tax_card_no: [''],
      commercial_registration_no: [''],
      payment_days: ['', exactLengthValidator(this.maxLength)],
      supervisor_pharmacy_id: [''],
      ads_employee: [''],
      first_balance_credit: [''],
      first_balance_debit: [''],
      can_buy_with_bonus: [''],
      status: [0, ''],
      debt_limit: [''],
      payment_type: [''],
      payment_period: [''],
      track_id: [''],
      delivery_id: [''],
      extra_discount: [''],
      target: [''],
      minimum_target: [''],
      iterate_available_quantity: [''],
      all: [''],
      follow_up: [''],
      call_shift: [''],
      free_deligate_diffrence: [''],
      note: [''],
      client_id: ['', Validators.required],
      client_code: [''],
      discount_tier_id: [''],
      morning_sales_id: [''],
      morning_list_id: [''],
      night_sales_id: [''],
      night_list_id: [''],
    });
    this.userType = this.auth.getUserObj().role.id;
    this.roleId = this.auth.getUserObj().role.id;
    this.status = this.auth.getEnums().pharmacy_status;
    this.payment_type = this.auth.getEnums().payment_types;
    this.follow_up = this.auth.getEnums().pharmacy_follow_up;
    this.time = this.auth.getEnums().pharmacy_shifts;
    this.payment_period = this.auth.getEnums().payment_periods;

    this.extra_discount = this.auth.getEnums()?.extra_discount;

    this.getData();
    this.getDiscountTier();
    // Subscribe to value changes to enable/disable inputs
    this.addSubClinetForm
      .get('first_balance_debit')!
      .valueChanges.pipe(
        distinctUntilChanged() // Ensure the value changes before updating
      )
      .subscribe((value) => {
        if (value) {
          this.addSubClinetForm
            .get('first_balance_credit')!
            .disable({ emitEvent: false });
          this.isDebitInputDisabled = true;
        } else {
          this.addSubClinetForm
            .get('first_balance_credit')!
            .enable({ emitEvent: false });
          this.isDebitInputDisabled = false;
        }
      });

    this.addSubClinetForm
      .get('first_balance_credit')!
      .valueChanges.pipe(
        distinctUntilChanged() // Ensure the value changes before updating
      )
      .subscribe((value) => {
        if (value) {
          this.addSubClinetForm
            .get('first_balance_debit')!
            .disable({ emitEvent: false });
          this.isCreditInputDisabled = true;
        } else {
          this.addSubClinetForm
            .get('first_balance_debit')!
            .enable({ emitEvent: false });
          this.isCreditInputDisabled = false;
        }
      });
  }

  getData() {
    this.subs.add(
      this.generalService.getDropdownData(['supervisor_pharmacies']).subscribe({
        next: (res) => {
          this.supervisor_pharamcies = res.data?.supervisor_pharmacies;
        },
      })
    );
    //get clients

    this.subs.add(
      this.generalService.getWarehousesDropdown({ module: 'sales' }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
        },
      })
    );
    let params = ['clients'];
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.clients = res.data.clients;
          if (this.auth.getUserObj().role[0] == 'client') {
            this.addSubClinetForm.controls['client_id'].setValue(
              res.data[0].id
            );
            this.userDropdown.disabled = true;
          }
        },
        complete: () => {},
      })
    );
    //get cities
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
    //git track
    this.subs.add(
      this.generalService.getTracks().subscribe({
        next: (res) => {
          this.tracks = res.data;
        },
      })
    );
    //get morning sales
    this.subs.add(
      this.generalService.getUsers({ list_type: 0 }).subscribe({
        next: (res) => {
          this.salesMorning = res.data;
        },
      })
    );
    //get evening sales
    this.subs.add(
      this.generalService.getUsers({ list_type: 1 }).subscribe({
        next: (res) => {
          this.salesEvening = res.data;
        },
      })
    );
    this.initializeData();
    //----------------------------
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
  @ViewChild('imagesModal') imagesModal!: ElementRef<HTMLElement>;
  openImagesModal() {
    let el: HTMLElement = this.imagesModal.nativeElement;
    el.click();
  }

  filteredTime: any;
  selectedShift?: number;
  shiftSwitchBasedOnTimeChosen(event: any) {
    this.selectedShift = event.value;

    this.filteredTime = this.time.filter((item) => {
      if (this.selectedShift === 0) {
        this.addSubClinetForm.controls['call_shift'].setValue(0);

        return item.value >= 0 && item.value <= 3;
      } else if (this.selectedShift === 1) {
        this.addSubClinetForm.controls['call_shift'].setValue(4);

        return item.value >= 4 && item.value <= 7;
      }
      return false;
    });
  }
  maxLength: number = 0;
  setAllow() {
    const type = this.addSubClinetForm.controls['payment_type'].value;
    if (type === 10) this.maxLength = 3;
    else if (type === 11) this.maxLength = 2;
    else if (type === 12) this.maxLength = 1;
    else this.maxLength = 0;

    const control = this.addSubClinetForm.get('payment_days');

    control?.setValidators(exactLengthValidator(this.maxLength));
    control?.updateValueAndValidity();
  }
  @ViewChild('userDropdown') private userDropdown!: Dropdown;

  initializeData() {
    const creationTime = new Date(); // Replace this with actual creation time
    const hours = creationTime.getHours();

    if (hours < 17) {
      // Before 5 PM
      this.addSubClinetForm.controls['follow_up'].setValue(0); // Assuming 'morning' is one of your options
      this.shiftSwitchBasedOnTimeChosen({ value: 0 });
    } else {
      this.addSubClinetForm.controls['follow_up'].setValue(1); // Assuming 'evening' is one of your options
      this.shiftSwitchBasedOnTimeChosen({ value: 1 });
    }
    console.log(this.follow_up);
    this.addSubClinetForm.controls['discount_tier_id'].setValue(1);
    //set extra_discount
    this.addSubClinetForm.controls['extra_discount'].setValue(0);
    //set status
    this.addSubClinetForm.controls['status'].setValue(0);
    this.addSubClinetForm.controls['default_sales_warehouse_id'].setValue(1);
    //set payment_type
    this.addSubClinetForm.controls['payment_type'].setValue(7);
    //set payment_period
    const paymentTypeIndex = this.payment_type.findIndex((c) => c.value == 7);
    if (paymentTypeIndex > -1) {
      this.addSubClinetForm.controls['payment_period'].setValue(
        this.payment_type[paymentTypeIndex].payment_period
      );
    }

    //set debt_limit
    this.addSubClinetForm.controls['debt_limit'].setValue(10000);
    // if (this.userType !== 1) {
    this.addSubClinetForm.patchValue({
      target: 0,
      minimum_target: 0,
      iterate_available_quantity: 1,
      all: 0,
      first_balance_debit: 0,
      first_balance_credit: 0,
    });
    // }

    if (this.permissions.includes('create_client_accounting_fields')) {
      this.addSubClinetForm.get('status')?.setValidators(Validators.required);
      this.addSubClinetForm.get('status')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('debt_limit')
        ?.setValidators(Validators.required);
      this.addSubClinetForm.get('debt_limit')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('payment_type')
        ?.setValidators(Validators.required);
      this.addSubClinetForm.get('payment_type')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('payment_period')
        ?.setValidators(Validators.required);
      this.addSubClinetForm.get('payment_period')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('discount_tier_id')
        ?.setValidators(Validators.required);
      this.addSubClinetForm.get('discount_tier_id')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('free_deligate_diffrence')
        ?.setValidators(Validators.required);
      this.addSubClinetForm
        .get('free_deligate_diffrence')
        ?.updateValueAndValidity();

      this.addSubClinetForm.get('track_id')?.setValidators(Validators.required);
      this.addSubClinetForm.get('track_id')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('first_balance_debit')
        ?.setValidators(Validators.required);
      this.addSubClinetForm
        .get('first_balance_debit')
        ?.updateValueAndValidity();

      this.addSubClinetForm
        .get('first_balance_credit')
        ?.setValidators(Validators.required);
      this.addSubClinetForm
        .get('first_balance_credit')
        ?.updateValueAndValidity();
    }

    if (this.permissions.includes('create_client_sales_fields')) {
      this.addSubClinetForm.get('target')?.setValidators(Validators.required);
      this.addSubClinetForm.get('target')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('minimum_target')
        ?.setValidators(Validators.required);
      this.addSubClinetForm.get('minimum_target')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('iterate_available_quantity')
        ?.setValidators(Validators.required);
      this.addSubClinetForm
        .get('iterate_available_quantity')
        ?.updateValueAndValidity();

      this.addSubClinetForm.get('all')?.setValidators(Validators.required);
      this.addSubClinetForm.get('all')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('follow_up')
        ?.setValidators(Validators.required);
      this.addSubClinetForm.get('follow_up')?.updateValueAndValidity();

      this.addSubClinetForm
        .get('default_sales_warehouse_id')
        ?.setValidators(Validators.required);
      this.addSubClinetForm
        .get('default_sales_warehouse_id')
        ?.updateValueAndValidity();
    }

    if (this.client?.type?.value != 1) {
      this.addSubClinetForm.get('free_deligate_diffrence')?.setValidators(null);
      this.addSubClinetForm
        .get('free_deligate_diffrence')
        ?.updateValueAndValidity();
    }
  }

  getArea(dropdown: any) {
    if (!dropdown.overlayVisible) {
      let params = {
        city_id: this.addSubClinetForm.controls['city_id'].value,
      };
      this.subs.add(
        this.generalService.getCity(params).subscribe({
          next: (res) => {
            this.area = res.data[0].areas;
          },
        })
      );
    }
  }

  getTrack() {
    if (this.userType == 'sales_employee' || this.userType == 'super_admin') {
      const index = this.area.findIndex(
        (c) => c.id === this.addSubClinetForm.controls['area_id'].value
      );
      if (index > -1) {
        this.addSubClinetForm.controls['track_id'].setValue(
          this.area[index].areas.data[0].id
        );
        this.getDistributor();
        this.addSubClinetForm.controls['delivery_id'].setValue(
          this.area[index].areas.data[0].delivers[0].id
        );
      }
    }
  }

  getDistributor(dropdown?: any) {
    if (this.permissions.includes('track_id')) {
      this.subs.add(
        this.http
          .getReq(`tracks/${this.addSubClinetForm.controls['track_id'].value}`)
          .subscribe({
            next: (res) => {
              this.Distributor = res.data.delivery;
              this.addSubClinetForm.controls['delivery_id'].setValue(
                this.Distributor?.id
              );
            },
          })
      );
    }
  }
  getclientDrop(param: string, dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.getClientidFromCode(param);
      dropdown?.close();
    }
  }

  getClientidFromCode(param: string) {
    let params;
    if (
      param == 'code' &&
      this.addSubClinetForm.controls['client_code'].value
    ) {
      // if (
      //   /^[Gg](0*[1-9]\d*)$/.test(
      //     this.addSubClinetForm.controls['client_code'].value
      //   )
      // ) {
      params = {
        code: this.addSubClinetForm.controls['client_code'].value,
      };
      // } else {
      //   this.toastr.error('يجب أن يكن أول حرف "G" ويليه رقم أكثر من 0');
      //   return;
      // }
      this.addSubClinetForm.controls['client_id'].setValue(null);
    } else if (
      param == 'clientId' &&
      this.addSubClinetForm.controls['client_id'].value
    ) {
      this.addSubClinetForm.controls['client_id'].setValue(
        this.addSubClinetForm.controls['client_id'].value
      );
      params = { id: this.addSubClinetForm.controls['client_id'].value };
      this.addSubClinetForm.controls['client_code'].setValue('');
    }
    if (params) {
      this.subs.add(
        this.generalService.getClients(params).subscribe({
          next: (res) => {
            this.client = res.data[0];
            if (
              param == 'code' &&
              this.addSubClinetForm.controls['client_code'].value
            ) {
              this.addSubClinetForm.controls['client_id'].setValue(
                res.data[0].id
              );
            }
            if (this.client?.code)
              this.addSubClinetForm.controls['client_code'].setValue(
                String(this.client?.code)
              );
            else this.addSubClinetForm.controls['client_id'].setValue(null);
          },
        })
      );
    } else {
      this.addSubClinetForm.controls['client_id'].setValue(null);
      this.addSubClinetForm.controls['client_code '].setValue('');
    }
  }

  validateImage(event: any) {
    for (let i = 0; i < this.files?.length; i++) {
      this.formDataPayLoad.delete(`pharmacy_media[${i}]`);
    }
    const file: File = event.target.files[0];
    this.files.push(event.target.files[0]);
    let reader = new FileReader();
    if (this.files) {
      reader.readAsDataURL(file);
      // When file uploads set it to file formcontrol
      reader.onload = () => {
        if (event.target.files[0].type.startsWith('image/')) {
          this.filesUrl.push({ name: reader.result, type: 'image' });
        } else {
          this.filesUrl.push({ name: reader.result, type: 'file' });
        }
      };

      this.imagesCount++;
      for (let i = 0; i < this.files.length; i++) {
        this.formDataPayLoad.append(`pharmacy_media[${i}]`, this.files[i]);
      }
    }
  }
  removeImage(index: any, type: any) {
    if (this.formDataPayLoad.has(`pharmacy_media[${index}]`)) {
      this.formDataPayLoad.delete(`pharmacy_media[${index}]`);
      this.filesUrl.splice(index, 1);
      this.files.splice(index, 1);
    }
  }

  submitAddSubClientForm() {
    this.formDataPayLoad = new FormData();
    if (
      this.addSubClinetForm.controls['target'].value == '' ||
      this.addSubClinetForm.controls['target'].value == null
    ) {
      this.addSubClinetForm.controls['target'].setValue(0);
    }
    if (
      this.addSubClinetForm.controls['minimum_target'].value == '' ||
      this.addSubClinetForm.controls['minimum_target'].value == null
    ) {
      this.addSubClinetForm.controls['minimum_target'].setValue(0);
    }

    // const morningSalesId =
    //   this.addSubClinetForm.controls['morning_sales_id'].value;
    // const salesMorning = this.salesMorning.find(
    //   (sale: any) => sale.id === morningSalesId
    // );
    // if (salesMorning) {
    //   const morningList = salesMorning.lists.find(
    //     (list: any) => list.type_value === 0
    //   );
    //   if (morningList) {
    //     this.addSubClinetForm.controls['morning_list_id'].setValue(
    //       morningList.id
    //     );
    //   }
    // }

    // const nightSalesId = this.addSubClinetForm.controls['night_sales_id'].value;
    // const salesNight = this.salesEvening.find(
    //   (sale: any) => sale.id === nightSalesId
    // );

    // if (salesNight) {
    //   const nightList = salesNight.lists.find(
    //     (list: any) => list.type_value === 1
    //   );
    //   if (nightList) {
    //     this.addSubClinetForm.controls['night_list_id'].setValue(nightList.id);
    //   }
    // }

    if (this.addSubClinetForm.valid && this.addSubClinetForm.dirty) {
      if (this.addSubClinetForm.controls['active'].value == true) {
        this.addSubClinetForm.controls['active'].setValue(1);
      } else {
        this.addSubClinetForm.controls['active'].setValue(0);
      }
      if (this.addSubClinetForm.controls['can_buy_with_bonus'].value == true) {
        this.addSubClinetForm.controls['can_buy_with_bonus'].setValue(1);
      } else {
        this.addSubClinetForm.controls['can_buy_with_bonus'].setValue(0);
      }
      this.addSubClinetForm.removeControl('client_code');
      const formValue = this.addSubClinetForm.value;
      if (!this.permissions.includes('create_client_accounting_fields')) {
        delete formValue.status;
        delete formValue.debt_limit;
        delete formValue.payment_type;
        delete formValue.payment_days;
        delete formValue.payment_period;
        delete formValue.supervisor_pharmacy_id;
        delete formValue.discount_tier_id;
        delete formValue.extra_discount;
        delete formValue.free_deligate_diffrence;
        delete formValue.can_buy_with_bonus;
        delete formValue.track_id;
        delete formValue.delivery_id;
        delete formValue.first_balance_debit;
        delete formValue.first_balance_credit;
      }
      if (this.client?.type.value != 1) {
        delete formValue.free_deligate_diffrence;
      }

      if (!this.permissions.includes('create_client_sales_limited')) {
        delete formValue.morning_sales_id;
        delete formValue.night_sales_id;
        delete formValue.ads_employee;
      }

      if (!this.permissions.includes('create_client_sales_fields')) {
        delete formValue.morning_sales_id;
        delete formValue.target;
        delete formValue.minimum_target;
        delete formValue.night_sales_id;
        delete formValue.iterate_available_quantity;
        delete formValue.all;
        delete formValue.follow_up;
        delete formValue.default_sales_warehouse_id;
        delete formValue.call_shift;
        delete formValue.morning_sales_id;
        delete formValue.night_sales_id;
        delete formValue.ads_employee;
      }
      for (const key in formValue) {
        let value = this.addSubClinetForm.controls[key].value;
        if (typeof value === 'string') {
          value = value.trim();
        }
        if (value !== null && value !== undefined && value !== '') {
          console.log(key, value);
          // value = value.trim;

          if (key == 'payment_days') {
            this.addSubClinetForm.controls['payment_days'].value.forEach(
              (element: string, i: number) => {
                this.formDataPayLoad.append(`payment_days[${i}]`, element);
              }
            );
          } else {
            this.formDataPayLoad.append(key, value);
          }
        }
      }
      let message = '';
      this.subs.add(
        this.http
          .postReq('pharmacies/add-pharmacy-to-client', this.formDataPayLoad)
          .subscribe({
            next: (res) => {
              message = res.message;
            },
            complete: () => {
              this.addSubClinetForm.reset();
              this.toastr.info(message);

              this.initializeData();
            },
          })
      );
    } else {
      this.addSubClinetForm.markAllAsTouched();
    }
  }

  openPdf(index: any) {
    if (this.filesUrl[index]?.name) {
      const link = document.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute('href', this.filesUrl[index].name);
      link.setAttribute('download', `data.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }
  handleCheckboxClick(event: Event) {
    if (
      !this.permissions.includes('create_client_accounting_fields') &&
      !this.permissions.includes('create_client_sales_fields')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
