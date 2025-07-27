import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { area, city } from '@models/pharmacie';
import { commonObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-supplier',
  templateUrl: './add-supplier.component.html',
  styleUrls: ['./add-supplier.component.scss'],
})
export class AddSupplierComponent implements OnInit {
  ClientDataForm!: FormGroup;
  private subscription = new Subscription();
  edit: boolean = false;
  supplier_id!: number;
  registration_images_deleted_ids: any[] = [];

  constructor(
    private router: Router,
    private toastService: ToastrService,
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private fb: FormBuilder,
    private generalService: GeneralService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    if (this.router.url.includes('edit')) {
      this.supplier_id = Number(
        this.activatedRoute.snapshot.paramMap.get('id')
      );
      this.getSupplierData(this.supplier_id);
      this.edit = true;
    }
    this.getDropdownData();
    this.ClientDataForm = this.fb.group({
      name: ['', Validators.required],
      email: [''],
      phone_1: ['', Validators.required],
      phone_2: [''],
      phone_3: [''],
      phone_4: [''],
      active: [false],
      city_id: [''],
      area_id: [''],
      address: [''],
      location_url: [''],
      national_id: [''],
      licence_no: [''],
      tax_card_no: [''],
      commercial_registration_no: [''],
      type: [''],
      payment_type: [''],
      credit_limit: [0],
      grace_period: [''],
      status: [''],
      products_type: [''],
      discount_tier: [''],
      has_taxes: [''],
      quota_repeat: [''],
      quota_days: [''],
      call_shift: [''],
      notes: [''],
    });
  }
  handleCheckboxClick(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

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
  active_value: boolean = false;
  payment_periods: commonObject[] = [];
  supplier_status: commonObject[] = [];
  call_shifts: commonObject[] = [];
  getDropdownData() {
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
  }

  getArea(dropdown: any) {
    if (!dropdown.overlayVisible) {
      if (this.ClientDataForm.controls['city_id'].value) {
        let params = {
          city_id: this.ClientDataForm.controls['city_id'].value,
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

  setAllow() {
    const index = this.payment_type.findIndex(
      (c) => c.value == this.ClientDataForm.controls['payment_type'].value
    );
    if (index > -1) {
      this.ClientDataForm.controls['grace_period'].setValue(
        this.payment_type[index].payment_period
      );
    }
  }

  @ViewChild('imagesModal') imagesModal!: ElementRef<HTMLElement>;
  openImagesModal() {
    let el: HTMLElement = this.imagesModal.nativeElement;
    el.click();
  }

  files: File[] = [];
  filesUrl: any[] = [];
  imagesCount: any;
  formDataPayLoad = new FormData();
  uploadedFiled: File[] = [];
  validateImage(event: any) {
    if (event.target.files) {
      console.log(event.target.files);
      for (let i = 0; i < this.files?.length; i++) {
        this.formDataPayLoad.delete(`files[${i}]`);
      }
      const file: File = event.target.files[0];
      this.files.push(event.target.files[0]);
      let uploadedFile = event.target.files[0];
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
        // for (let i = 0; i < this.files.length; i++) {
        this.formDataPayLoad.append(`files[0]`, uploadedFile);
        // }
        this.uploadFile();
      }
    }
  }

  uploadFile() {
    let Uploaded_files: any = [];
    this.subscription.add(
      this.generalService.uploadFile(this.formDataPayLoad).subscribe({
        next: (res) => {
          this.toastService.success(res.message);
          Uploaded_files = res.data.files;
        },
        complete: () => {
          console.log(this.files);
          Uploaded_files.forEach((file: any) => {
            this.uploadedFiled.push(file);
          });
        },
      })
    );
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
  removeImage(index: any, type: any, id?: any) {
    // if (this.formDataPayLoad.has(`files[${index}]`)) {
    //   this.formDataPayLoad.delete(`files[${index}]`)

    this.filesUrl.splice(index, 1);
    this.files.splice(index, 1);
    this.uploadedFiled.splice(index, 1);
    console.log(id);
    if (id) {
      this.registration_images_deleted_ids.push(id);
    }
    console.log(this.registration_images_deleted_ids);

    // }
  }

  addSupplier() {
    let queryParams: any = {};
    this.toggleActive();
    for (const key in this.ClientDataForm.value) {
      let value = this.ClientDataForm.controls[key].value;
      if (key != 'active') {
        if (
          value != null &&
          value != undefined &&
          (value === 0 || value !== '')
        ) {
          queryParams[key] = value;
        }
      } else {
        queryParams[key] = value == true ? 0 : 1;
      }
    }
    if (this.uploadedFiled.length > 0) {
      queryParams['registration_images'] = this.uploadedFiled;
    }
    if (this.ClientDataForm.valid && this.ClientDataForm.touched) {
      this.subscription.add(
        this.http.postReq('suppliers/create', queryParams).subscribe({
          next: (res) => {},
          complete: () => {
            this.router.navigate(['/purchases/supply/suppliers']);
          },
        })
      );
    } else {
      this.ClientDataForm.markAllAsTouched();
    }
  }
  getSupplierData(supplier_id: number) {
    this.subscription.add(
      this.http.getReq(`suppliers/${supplier_id}`).subscribe({
        next: (res) => {
          const formData = {
            name: res.data.name,
            email: res.data.email,
            phone_1: res.data.phone_1,
            phone_2: res.data?.phone_2,
            phone_3: res.data?.phone_3,
            phone_4: res.data?.phone_4,
            address: res.data?.address,
            national_id: res.data?.national_id,
            licence_no: res.data?.licence_no,
            tax_card_no: res.data?.tax_card_no,
            commercial_registration_no: res.data?.commercial_registration_no,
            type: res.data?.type?.value,
            payment_type: res.data?.payment_type?.value,
            credit_limit:
              res.data?.credit_limit != null ? res.data?.credit_limit : 0,
            grace_period: res?.data?.grace_period,
            status: res.data?.status?.value,
            products_type: res.data?.products_type?.value,
            discount_tier: res.data?.discount_tier?.value,
            city_id: res.data?.city.id,
            area_id: res.data?.area.id,
            has_taxes: String(res.data?.has_taxes),
            quota_repeat: res.data?.quota_repeat,
            quota_days: res.data?.quota_days,
            call_shift: res.data?.call_shift?.value,
            notes: res.data?.notes,
          };
          this.files = res.data?.registration_images || [];
          this.filesUrl = this.files.map((file: any) => {
            return {
              name: file.original_url,
              id: file.id,
              type: 'file',
            };
          });
          this.ClientDataForm.patchValue(formData);
          this.getArea({});
        },
      })
    );
  }

  editSupplier() {
    this.toggleActive();

    if (this.ClientDataForm.valid && this.ClientDataForm.touched) {
      this.subscription.add(
        this.http
          .patchReq(`suppliers/${this.supplier_id}/update`, {
            ...this.ClientDataForm.value,
            registration_images: this.uploadedFiled,
            registration_images_deleted_ids:
              this.registration_images_deleted_ids,
          })
          .subscribe({
            next: (res) => {},
            complete: () => {
              this.router.navigate(['/purchases/supply/suppliers']);
            },
          })
      );
    } else {
      this.ClientDataForm.markAllAsTouched();
    }
  }
  checkValue: boolean = false;
  toggleActive() {
    this.ClientDataForm.controls['active']?.setValue(
      this.active_value == true ? 0 : 1
    );
  }
}
