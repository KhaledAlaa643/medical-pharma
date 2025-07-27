import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { client } from '@models/client';
import { area, city, pharmacie, track } from '@models/pharmacie';
import { FiltersObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { exactLengthValidator } from 'app/core/validators/exact-length.validator';
import { ToastrService } from 'ngx-toastr';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
interface fixed_data {
  name: string;
  value: number;
  payment_period?: number;
}

@Component({
  selector: 'app-edit-client-info',
  templateUrl: './edit-client-info.component.html',
  styleUrls: ['./edit-client-info.component.scss'],
})
export class EditClientInfoComponent implements OnInit {
  salesAdmin = 'sales_admin';
  generalManager = 'super_admin';
  accountantManager = 'accountant_manager';
  arr: any[] = [];
  editPharmacyForm!: FormGroup;
  private subs = new Subscription();
  clientType = '';
  pharmacies: any[] = [];
  groupPharmacied: any[] = [];
  files: File[] = [];
  filesUrl: any[] = [];
  imagesCount: any;
  formDataPayLoad = new FormData();
  cities: city[] = [];
  area: area[] = [];
  clients: client[] = [];
  client: client = {} as client;
  Distributor: any;
  supervisor_pharamcies: FiltersObject[] = [];
  warehouses: FiltersObject[] = [];
  status: fixed_data[] = [];
  payment_type: fixed_data[] = [];
  payment_period: fixed_data[] = [];
  payment_days: number[] = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
  follow_up: fixed_data[] = [];
  time: fixed_data[] = [];
  pharmacy_shift: fixed_data[] = [];
  extra_discount: fixed_data[] = [];
  discount_slat: fixed_data[] = [];
  tracks: track[] = [];
  track!: track;
  salesMorning: any = [];
  salesEvening: any[] = [];
  v = '';
  v1 = '';
  images: [] = [];
  roleId!: number;
  permissions: any = [];
  constructor(
    private activeRoute: ActivatedRoute,
    private fixed_data: FixedDataService,
    private auth: AuthService,
    private generalService: GeneralService,
    private fb: FormBuilder,
    private http: HttpService,
    private toastr: ToastrService
  ) {}
  userType: any = 'sales_employee';
  ngOnInit() {
    this.permissions = this.auth.getUserPermissions();
    this.roleId = this.auth.getUserObj().role.id;

    this.getDiscountTier();
    this.getDropdownData();
    this.editPharmacyForm = this.fb.group({
      name: ['', Validators.required],
      doctor: ['', Validators.required],
      phone_number: ['', Validators.required],
      optional_phone_number: [''],
      active: [''],
      email: [''],
      address: [''],
      city_id: [''],
      area_id: [''],
      location_url: [''],
      ads_employee: [''],
      license_no: [''],
      tax_card_no: [''],
      commercial_registration_no: [''],
      status: [''],
      debt_limit: [''],
      payment_type: [''],
      payment_period: [''],
      activity_no: [''],
      can_buy_with_bonus: [''],
      first_balance_debit: [''],
      first_balance_credit: [''],
      whatsapp_number: [''],
      payment_days: ['', exactLengthValidator(this.maxLength)],
      track_id: [''],
      supervisor_pharmacy_id: [''],
      delivery_id: [''],
      delivery_name: [''],
      extra_discount: [''],
      target: [''],
      minimum_target: [''],
      iterate_available_quantity: [''],
      all: [''],
      follow_up: [''],
      free_deligate_diffrence: [''],
      call_shift: [''],
      client_phone_number: [''],
      note: [''],
      default_sales_warehouse_id: [''],
      id: ['', Validators.required],
      code: [''],
      discount_tier_id: [''],
      morning_sales_id: [''],
      morning_list_id: [''],
      night_sales_id: [''],
      night_list_id: [''],
    });

    this.userType = this.auth.getUserObj().role[0];
  }
  getDropdownData() {
    this.subs.add(
      this.generalService.getDropdownData(['supervisor_pharmacies']).subscribe({
        next: (res) => {
          this.supervisor_pharamcies = res.data?.supervisor_pharmacies;
        },
      })
    );

    this.subs.add(
      this.generalService.getWarehousesDropdown({ module: 'sales' }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
        },
      })
    );

    this.subs.add(
      this.fixed_data.getAllFixedData().subscribe({
        next: (res) => {
          this.status = res.data.pharmacy_status;
          this.payment_type = res.data.payment_types;
          this.follow_up = res.data.pharmacy_follow_up;
          this.payment_period = res.data.payment_periods;
          this.time = res.data.pharmacy_shifts;
          this.extra_discount = res.data?.extra_discount;
        },
        complete: () => {
          this.getData();
        },
      })
    );
  }

  @ViewChild('imagesModal') imagesModal!: ElementRef<HTMLElement>;
  openImagesModal() {
    let el: HTMLElement = this.imagesModal.nativeElement;
    el.click();
  }

  @ViewChild('deleteImagesModal') deleteImagesModal!: ElementRef<HTMLElement>;
  openDeleteImagesModal() {
    let el: HTMLElement = this.deleteImagesModal.nativeElement;
    el.click();
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

  getData() {
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          this.pharmacies = res.data;
        },
        complete: () => {
          this.pharmacies.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacied.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
              });
            });
          });
        },
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

  initializeData() {
    const creationTime = new Date(); // Replace this with actual creation time
    const hours = creationTime.getHours();

    if (hours < 17) {
      // Before 5 PM
      this.editPharmacyForm.controls['follow_up'].setValue(0); // Assuming 'morning' is one of your options
      this.shiftSwitchBasedOnTimeChosen({ value: 0 });
    } else {
      this.editPharmacyForm.controls['follow_up'].setValue(1); // Assuming 'evening' is one of your options
      this.shiftSwitchBasedOnTimeChosen({ value: 1 });
    }
    console.log(this.follow_up);
    this.editPharmacyForm.controls['discount_tier_id'].setValue(1);
    //set extra_discount
    this.editPharmacyForm.controls['extra_discount'].setValue(0);
    //set status
    this.editPharmacyForm.controls['status'].setValue(0);
    this.editPharmacyForm.controls['default_sales_warehouse_id'].setValue(1);
    //set payment_type
    this.editPharmacyForm.controls['payment_type'].setValue(7);
    //set payment_period
    const paymentTypeIndex = this.payment_type.findIndex((c) => c.value == 7);
    if (paymentTypeIndex > -1) {
      this.editPharmacyForm.controls['payment_period'].setValue(
        this.payment_type[paymentTypeIndex].payment_period
      );
    }

    //set debt_limit
    this.editPharmacyForm.controls['debt_limit'].setValue(10000);
    // if (this.userType !== 1) {
    this.editPharmacyForm.patchValue({
      target: 0,
      minimum_target: 0,
      iterate_available_quantity: 1,
      all: 0,
      first_balance_debit: 0,
      first_balance_credit: 0,
    });
    // }

    if (this.permissions.includes('create_client_accounting_fields')) {
      this.editPharmacyForm.get('status')?.setValidators([Validators.required]);
      this.editPharmacyForm.get('status')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('debt_limit')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm.get('debt_limit')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('payment_type')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm.get('payment_type')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('payment_period')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm.get('payment_period')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('discount_tier_id')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm.get('discount_tier_id')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('free_deligate_diffrence')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm
        .get('free_deligate_diffrence')
        ?.updateValueAndValidity();

      this.editPharmacyForm
        .get('track_id')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm.get('track_id')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('first_balance_debit')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm
        .get('first_balance_debit')
        ?.updateValueAndValidity();

      this.editPharmacyForm
        .get('first_balance_credit')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm
        .get('first_balance_credit')
        ?.updateValueAndValidity();
    }

    if (this.permissions.includes('create_client_sales_fields')) {
      this.editPharmacyForm.get('target')?.setValidators([Validators.required]);
      this.editPharmacyForm.get('target')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('minimum_target')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm.get('minimum_target')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('iterate_available_quantity')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm
        .get('iterate_available_quantity')
        ?.updateValueAndValidity();

      this.editPharmacyForm.get('all')?.setValidators([Validators.required]);
      this.editPharmacyForm.get('all')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('follow_up')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm.get('follow_up')?.updateValueAndValidity();

      this.editPharmacyForm
        .get('default_sales_warehouse_id')
        ?.setValidators([Validators.required]);
      this.editPharmacyForm
        .get('default_sales_warehouse_id')
        ?.updateValueAndValidity();
    }

    if (this.pharmacy?.clients[0]?.type.value != 1) {
      this.editPharmacyForm.get('free_deligate_diffrence')?.setValidators(null);
      this.editPharmacyForm
        .get('free_deligate_diffrence')
        ?.updateValueAndValidity();
    }
  }
  maxLength: number = 0;
  setAllow() {
    const type = this.editPharmacyForm.controls['payment_type'].value;
    if (type === 10) this.maxLength = 3;
    else if (type === 11) this.maxLength = 2;
    else if (type === 12) this.maxLength = 1;
    else this.maxLength = 0;

    const control = this.editPharmacyForm.get('payment_days');

    control?.setValidators(exactLengthValidator(this.maxLength));
    control?.updateValueAndValidity();
  }

  getArea(dropdown?: any) {
    if (this.editPharmacyForm.controls['city_id'].value) {
      let params = {
        city_id: this.editPharmacyForm.controls['city_id'].value,
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
  getAreawithoutDropdown() {
    let params = {
      city_id: this.editPharmacyForm.controls['city_id'].value,
    };
    this.subs.add(
      this.generalService.getCity(params).subscribe({
        next: (res) => {
          this.area = res.data[0].areas;
        },
      })
    );
  }

  getPharmacyData(dropdown: any) {
    if (!dropdown.overlayVisible) {
      let params = {
        pharmacy_id: this.editPharmacyForm.controls['id'].value,
      };
      this.subs.add(
        this.generalService.getPharmacies(params).subscribe({
          next: (res) => {
            this.area = res.data.data[0].areas.data;
          },
        })
      );
    }
  }

  getDistributor(dropdown?: any) {
    if (dropdown) {
      if (!dropdown.overlayVisible) {
        let Index = this.tracks.findIndex((track) => {
          return track.id == this.editPharmacyForm.controls['track_id'].value;
        });

        this.track = this.tracks[Index];
        this.Distributor = this.track.delivery[0];
      }
    } else {
      let Index = this.tracks.findIndex((track) => {
        return track.id == this.editPharmacyForm.controls['track_id'].value;
      });

      this.track = this.tracks[Index];
      this.Distributor = this.track.delivery[0];
    }
  }

  getPharmacyDrop(param: string, dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.getPharmacyidFromCode(param);
      dropdown?.close();
    }
  }
  pharmacy!: any;
  filesLength: any;
  prevPharmacy: any;
  daysOfCreation: any;
  @ViewChildren('toDisable') toDisable!: QueryList<ElementRef>;
  @ViewChild('city') private city!: Dropdown;
  @ViewChild('country') private country!: Dropdown;

  getPharmacyidFromCode(param: string) {
    let params;
    if (param == 'code' && this.editPharmacyForm.controls['code'].value) {
      params = {
        code: this.editPharmacyForm.controls['code'].value,
      };

      this.editPharmacyForm.controls['id'].setValue(null);
    } else if (param == 'Id' && this.editPharmacyForm.controls['id'].value) {
      this.editPharmacyForm.controls['id'].setValue(
        this.editPharmacyForm.controls['id'].value
      );
      params = { pharmacy_id: this.editPharmacyForm.controls['id'].value };
      this.editPharmacyForm.controls['code'].setValue('');
    }
    if (params) {
      this.subs.add(
        this.generalService.getPharmacies(params).subscribe({
          next: (res) => {
            this.pharmacy = res.data[0];
            this.editPharmacyForm.patchValue(this.pharmacy);
            this.daysOfCreation = this.pharmacy.days_of_creation;
            if (this.daysOfCreation >= 7 && this.roleId != 1) {
              this.toDisable.forEach((input) => {
                input.nativeElement.disabled = true;
              });
              this.city.disabled = true;
              this.country.disabled = true;
            } else {
              this.toDisable.forEach((input) => {
                input.nativeElement.disabled = false;
              });
              this.city.disabled = false;
              this.country.disabled = false;
            }
            this.editPharmacyForm.controls['city_id'].setValue(
              this.pharmacy.city.id
            );
            this.editPharmacyForm.controls['payment_type'].setValue(
              this.pharmacy.payment_type.value
            );
            this.setAllow();
            this.editPharmacyForm.controls['area_id'].setValue(
              this.pharmacy.area.id
            );
            this.editPharmacyForm.controls['status'].setValue(
              this.pharmacy?.status.value
            );
            this.pharmacy.lists.forEach((list: any) => {
              if (list.type_value == 0) {
                //sba7y
                this.editPharmacyForm.controls['morning_sales_id'].setValue(
                  list.users[0].id
                );
              } else {
                this.editPharmacyForm.controls['night_sales_id'].setValue(
                  list.users[0].id
                );
              }
            });
            if (this.pharmacy.track) {
              console.log(this.pharmacy.track);
              this.editPharmacyForm.controls['track_id'].setValue(
                this.pharmacy.track?.id
              );
              this.Distributor = this.pharmacy.track?.delivery[0];
              this.editPharmacyForm.controls['delivery_id'].setValue(
                this.pharmacy.track?.delivery[0]?.id
              );
              this.editPharmacyForm.controls['delivery_name'].setValue(
                this.pharmacy.track?.delivery[0]?.name
              );
            }

            if (this.pharmacy.night_sales) {
              this.editPharmacyForm.controls['night_sales_id'].setValue(
                this.pharmacy.night_sales?.id
              );
            }

            if (this.pharmacy.payment_period) {
              this.editPharmacyForm.controls['payment_period'].setValue(
                this.pharmacy.payment_period?.value
              );
            }
            if (this.pharmacy.default_sales_warehouse) {
              this.editPharmacyForm.controls[
                'default_sales_warehouse_id'
              ].setValue(this.pharmacy.default_sales_warehouse.id);
            }

            if (this.pharmacy.morning_sales) {
              this.editPharmacyForm.controls['morning_sales_id'].setValue(
                this.pharmacy.morning_sales?.id
              );
            }
            if (this.pharmacy.payment_days) {
              this.editPharmacyForm.controls['payment_days'].setValue(
                this.pharmacy.payment_days
              );
              console.log(this.pharmacy.payment_days);
            }

            if (this.pharmacy.discount_tier) {
              this.editPharmacyForm.controls['discount_tier_id'].setValue(
                this.pharmacy.discount_tier.id
              );
            } else {
              this.editPharmacyForm.controls['discount_tier_id'].setValue(1);
            }

            this.editPharmacyForm.controls['active'].setValue(
              this.pharmacy.active.value
            );

            if (this.pharmacy?.follow_up?.value >= 0) {
              console.log(this.pharmacy.follow_up);
              this.editPharmacyForm.controls['follow_up'].setValue(
                this.pharmacy?.follow_up?.value
              );

              this.shiftSwitchBasedOnTimeChosen({
                value: this.pharmacy?.follow_up?.value,
              });

              this.editPharmacyForm.controls['call_shift'].setValue(
                this.pharmacy?.call_shift?.value
              );
            }

            // this.Distributor = this.pharmacy.track?.delivery;
            this.editPharmacyForm.controls['payment_type'].setValue(
              this.pharmacy.payment_type.value
            );
            this.prevPharmacy = this.editPharmacyForm.value;

            if (this.pharmacy?.pharmacy_media) {
              this.filesLength = this.pharmacy.pharmacy_media.length;
              this.pharmacy?.pharmacy_media.forEach((element: any) => {
                const parts = element?.original_url?.split('.');
                if (parts[parts.length - 1] == 'pdf') {
                  this.filesUrl.push({
                    url: element,
                    type: 'file',
                    name: 'new',
                    new: false,
                  });
                } else {
                  this.filesUrl.push({
                    url: element,
                    type: 'image',
                    name: 'new',
                    new: false,
                  });
                }
              });
            }

            this.getAreawithoutDropdown();
            if (
              param == 'code' &&
              this.editPharmacyForm.controls['code'].value
            ) {
              this.editPharmacyForm.controls['id'].setValue(res.data[0].id);
            }
            if (this.pharmacy?.code)
              this.editPharmacyForm.controls['code'].setValue(
                String(this.pharmacy?.code)
              );
            else this.editPharmacyForm.controls['id'].setValue(null);
          },
          complete: () => {
            this.setAllow();
          },
        })
      );
    } else {
      this.editPharmacyForm.controls['id'].setValue(null);
      this.editPharmacyForm.controls['code '].setValue('');
    }
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
          this.filesUrl.push({
            url: reader.result,
            type: 'image',
            new: true,
            name: event.target.files[0].name,
          });
        } else {
          this.filesUrl.push({
            url: reader.result,
            type: 'file',
            new: true,
            name: event.target.files[0].name,
          });
        }
      };

      this.imagesCount++;
      for (let i = 0; i < this.files.length; i++) {
        this.formDataPayLoad.append(`pharmacy_media[${i}]`, this.files[i]);
      }
    }
  }
  removedImageUrl: any;
  removedImageIndex: any;
  removeImage(index: any, type: any, checkNew: boolean, url: any) {
    if (checkNew == true) {
      if (
        this.formDataPayLoad.has(`pharmacy_media[${index - this.filesLength}]`)
      ) {
        this.formDataPayLoad.delete(
          `pharmacy_media[${index - this.filesLength}]`
        );
        this.filesUrl.splice(index, 1);
        this.files.splice(index, 1);
      }
    } else {
      this.openDeleteImagesModal();
      this.removedImageUrl = url;
      this.removedImageIndex = index;
    }
  }

  deleteOldImages() {
    let params = {
      pharmacy_id: this.editPharmacyForm.controls['id'],
      media_id: this.removedImageIndex,
    };
    this.subs.add(
      this.http
        .deleteReq('pharmacies/delete-media', { params: params })
        .subscribe({
          next: (res) => {},
          complete: () => {
            const index = this.filesUrl.findIndex((c: any) => {
              c.url == this.removedImageUrl;
            });
            if (index > -1) {
              this.filesUrl.splice(index, 1);
            }
            this.openImagesModal();
          },
        })
    );
  }
  currentCode: any;
  submitAddSubClientForm() {
    this.formDataPayLoad = new FormData();
    if (!this.editPharmacyForm.controls['delivery_id'].value) {
      this.editPharmacyForm.controls['delivery_id'].setValue('');
      this.editPharmacyForm.controls['delivery_name'].setValue('');
    }
    if (!this.editPharmacyForm.controls['track_id'].value) {
      this.editPharmacyForm.controls['track_id'].setValue('');
    }
    if (
      this.editPharmacyForm.controls['target'].value == '' ||
      this.editPharmacyForm.controls['target'].value == null
    ) {
      this.editPharmacyForm.controls['target'].setValue(0);
    }
    if (
      this.editPharmacyForm.controls['minimum_target'].value == '' ||
      this.editPharmacyForm.controls['minimum_target'].value == null
    ) {
      this.editPharmacyForm.controls['minimum_target'].setValue(0);
    }

    const morningSalesId =
      this.editPharmacyForm.controls['morning_sales_id'].value;
    const salesMorning = this.salesMorning.find(
      (sale: any) => sale.id === morningSalesId
    );

    if (salesMorning) {
      const morningList = salesMorning.lists.find(
        (list: any) => list.type_value === 0
      );
      if (morningList) {
        this.editPharmacyForm.controls['morning_list_id'].setValue(
          morningList.id
        );
      }
    }

    const nightSalesId = this.editPharmacyForm.controls['night_sales_id'].value;
    const salesNight = this.salesEvening.find(
      (sale: any) => sale.id === nightSalesId
    );

    if (salesNight) {
      const nightList = salesNight.lists.find(
        (list: any) => list.type_value === 1
      );
      if (nightList) {
        this.editPharmacyForm.controls['night_list_id'].setValue(nightList.id);
      }
    }
    console.log(this.editPharmacyForm.value);
    this.editPharmacyForm.markAllAsTouched();
    this.editPharmacyForm.updateValueAndValidity();
    if (this.editPharmacyForm.valid && this.editPharmacyForm.dirty) {
      if (
        JSON.stringify(this.editPharmacyForm.value) !=
          JSON.stringify(this.prevPharmacy) ||
        this.formDataPayLoad.has(`pharmacy_media[${0}]`)
      ) {
        if (this.editPharmacyForm.controls['active'].value == true) {
          this.editPharmacyForm.controls['active'].setValue(1);
        } else {
          this.editPharmacyForm.controls['active'].setValue(0);
        }
        if (
          this.editPharmacyForm.controls['can_buy_with_bonus'].value == true
        ) {
          this.editPharmacyForm.controls['can_buy_with_bonus'].setValue(1);
        } else {
          this.editPharmacyForm.controls['can_buy_with_bonus'].setValue(0);
        }
        this.currentCode = this.editPharmacyForm.controls['code'].value;
        this.editPharmacyForm.removeControl('code');

        const formValue = this.editPharmacyForm.value;
        console.log(formValue);
        delete formValue.first_balance_debit;
        delete formValue.first_balance_credit;
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

        if (this.daysOfCreation > 7 && this.roleId != 1) {
          delete formValue.client_phone_number;
          delete formValue.doctor;
          delete formValue.active;
          delete formValue.name;
          delete formValue.phone_number;
          delete formValue.optional_phone_number;
          delete formValue.whatsapp_number;
          delete formValue.address;
          delete formValue.city_id;
          delete formValue.email;
          delete formValue.area_id;
          delete formValue.location_url;
          delete formValue.default_sales_warehouse_id;
          delete formValue.license_no;
          delete formValue.commercial_registration_no;
          delete formValue.tax_card_no;
        }

        if (this.pharmacy?.clients[0]?.type.value != 1) {
          delete formValue.free_deligate_diffrence;
        }
        console.log(formValue);
        for (const key in formValue) {
          let value = this.editPharmacyForm.controls[key].value;
          if (typeof value === 'string') {
            value = value.trim();
          }
          if (value !== null && value !== undefined && value !== '') {
            if (key == 'payment_days') {
              this.editPharmacyForm.controls['payment_days'].value.forEach(
                (element: string, i: number) => {
                  this.formDataPayLoad.append(`payment_days[${i}]`, element);
                }
              );
            } else {
              this.formDataPayLoad.append(key, value);
            }
          }
        }
        console.log(this.formDataPayLoad.getAll);
        let messages = '';
        this.subs.add(
          this.http
            .postReq(
              `pharmacies/update/${this.editPharmacyForm.controls['id'].value}`,
              this.formDataPayLoad
            )
            .subscribe({
              next: (res) => {
                messages = res.message;
              },
              complete: () => {
                this.editPharmacyForm.reset();
                const newFormControl = new FormControl('');
                this.filesUrl = [];
                this.editPharmacyForm.addControl('code', newFormControl);
                this.toastr.info(messages);
              },
              error: () => {
                const newFormControl = new FormControl('');
                this.editPharmacyForm.addControl('code', newFormControl);
                this.editPharmacyForm.controls['code'].setValue(
                  this.currentCode
                );
              },
            })
        );
      } else {
        this.toastr.error('برجاء تعديل البيانات اولا قبل الضغط على زر تأكيد');
      }
    } else {
      this.editPharmacyForm.markAllAsTouched();
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

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLElement>;
  openFile() {
    let el: HTMLElement = this.fileInput.nativeElement;
    if (
      this.userType == 'sales_admin' ||
      this.userType == 'accountant_manager'
    ) {
    } else {
      el.click();
    }
  }
  handleCheckboxClick(event: Event) {
    if (
      (!this.permissions.includes('create_client_accounting_fields') &&
        !this.permissions.includes('create_client_sales_fields')) ||
      (this.daysOfCreation > 7 && this.roleId != 1)
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  handleCheckboxClickBonus(event: Event) {
    if (!this.permissions.includes('create_client_accounting_fields')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
