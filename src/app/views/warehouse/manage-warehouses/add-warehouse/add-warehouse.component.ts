import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { city } from '@models/pharmacie';
import { commonObject, enums } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { __values } from 'tslib';

@Component({
  selector: 'app-add-warehouse',
  templateUrl: './add-warehouse.component.html',
  styleUrls: ['./add-warehouse.component.scss'],
})
export class AddWarehouseComponent implements OnInit {
  private subscription = new Subscription();
  cities: city[] = [];
  area: commonObject[] = [];
  EnumData: enums = {} as enums;
  warehouseForm!: FormGroup;
  discount_slat: commonObject[] = [];
  warehouse_id!: number;
  edit: boolean = false;
  screensTypes = [
    { name: 'مبيعات', value: 1 },
    { name: 'مردود مبيعات', value: 2 },
    { name: 'مشتريات', value: 3 },
    { name: 'مردود مشتريات', value: 4 },
    { name: 'تحويلات', value: 5 },
    { name: 'جرد', value: 6 },
  ];
  warehouseSatatus = [
    { name: 'اخفاء', value: 1 },
    { name: 'ظهور', value: 0 },
  ];
  constructor(
    private activatedRoute: ActivatedRoute,
    private toastService: ToastrService,
    private router: Router,
    private http: HttpService,
    private auth: AuthService,
    private generalService: GeneralService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    if (this.router.url.includes('edit')) {
      this.warehouse_id = Number(
        this.activatedRoute.snapshot.paramMap.get('id')
      );
      this.getSupplierData(this.warehouse_id);
      this.edit = true;
    }
    this.getDropdownData();
    this.getDiscountTier();

    this.warehouseForm = this.fb.group({
      name: [''],
      type: [],
      city_id: [],
      area_id: [],
      retail_sales: [false],
      bulk_sales: [false],
      is_main: [false],
      sales_return: [false],
      purchases: [false],
      purchases_return: [false],
      transfers: [false],
      inventory: [false],
      status: [],
      address: [],
      phone_number: [],
      phone_number_2: [],
      location: [],
      license_number: [],
      tax_number: [],
      registration_number: [],
      notes: [],
      subtracted_from_weighted_discount: [],
      discount_tiers: this.fb.array([]),
    });
  }

  get discountTiers(): FormArray {
    return this.warehouseForm.get('discount_tiers') as FormArray;
  }

  addDiscountTier(tier: any): void {
    this.discountTiers.push(
      this.fb.group({
        discount_tier_id: [tier.id], // Pre-fill with data from API
        discount_value: [], // Empty field for user input
      })
    );
  }
  setTierValue() {
    if (
      this.warehouseForm.controls['subtracted_from_weighted_discount'].value > 0
    ) {
      this.discountTiers.controls.forEach((control, index: number) => {
        let discount_value =
          Number(
            this.warehouseForm.controls['subtracted_from_weighted_discount']
              .value
          ) + Number(index);
        control.get('discount_value')?.setValue('-' + ' ' + discount_value);
      });
    }
  }
  removeNigative() {
    this.discountTiers.controls.forEach((control, index: number) => {
      let discount_value = control.get('discount_value')?.value;
      if (typeof discount_value === 'string' && discount_value.includes('-')) {
        discount_value = discount_value.replace('-', '');
        control.get('discount_value')?.setValue(Number(discount_value));
      }
    });
  }

  getDiscountTier() {
    this.subscription.add(
      this.http.getReq('settings/discount-tiers').subscribe({
        next: (res) => {
          this.discount_slat = res.data;
          this.discount_slat.forEach((tier: any) => {
            this.addDiscountTier(tier);
          });
        },
      })
    );
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
    //   this.subscription.add(this.generalService.getSettingsEnum().subscribe({
    //     next: res => {
    //         this.EnumData = res.data
    //     }
    // }))
    this.EnumData = this.auth.getEnums();
  }

  getArea(dropdown?: any) {
    if (!dropdown || !dropdown.overlayVisible) {
      let params = {
        city_id: this.warehouseForm.controls['city_id'].value,
      };

      this.subscription.add(
        this.generalService.getCity(params).subscribe({
          next: (res) => {
            this.area = res.data[0].areas;
          },
        })
      );
    }
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
            this.filesUrl.push({
              name: reader.result,
              type: 'image',
              old: false,
            });
          } else {
            this.filesUrl.push({
              name: reader.result,
              type: 'file',
              old: false,
            });
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
  removeImage(index: any, type: any) {
    // if (this.formDataPayLoad.has(`files[${index}]`)) {
    //   this.formDataPayLoad.delete(`files[${index}]`)
    console.log(this.uploadedFiled);

    this.filesUrl.splice(index, 1);
    this.files.splice(index, 1);
    this.uploadedFiled.splice(index, 1);
    // }

    console.log(this.uploadedFiled);
  }

  @ViewChild('imagesModal') imagesModal!: ElementRef<HTMLElement>;
  openImagesModal() {
    let el: HTMLElement = this.imagesModal.nativeElement;
    el.click();
  }

  addWarehouse() {
    let queryParams: any = {};
    this.removeNigative();
    for (const key in this.warehouseForm.value) {
      let value = this.warehouseForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (
          key === 'bulk_sales' ||
          key === 'inventory' ||
          key === 'is_main' ||
          key === 'purchases' ||
          key === 'purchases_return' ||
          key === 'retail_sales' ||
          key === 'sales_return' ||
          key === 'transfers'
        ) {
          queryParams[key] = value == true ? 1 : 0;
        } else {
          queryParams[key] = value;
        }
      }
    }
    if (this.uploadedFiled.length > 0) {
      queryParams['warehouse_media'] = this.uploadedFiled;
    }
    // if(this.warehouseForm.valid && this.warehouseForm.touched){
    this.subscription.add(
      this.http.postReq('warehouses', queryParams).subscribe({
        next: (res) => {},
        complete: () => {
          this.router.navigate([
            '/warehouse/manage-warehouses/warehouses-list',
          ]);
        },
        error: () => {
          this.setTierValue();
        },
      })
    );
    // }
    // else{
    //   this.warehouseForm.markAllAsTouched()
    // }
  }
  getSupplierData(warehouse_id: number) {
    this.subscription.add(
      this.http
        .getReq(`warehouses`, { params: { id: warehouse_id } })
        .subscribe({
          next: (res) => {
            this.warehouseForm.patchValue({
              ...res.data[0],
              type: res.data[0].type?.value,
              city_id: res.data[0].city?.id,
              area_id: res.data[0].area?.id,
              status: res.data[0].status?.value,
            });
            res.data[0].warehouse_media.forEach((file: any) => {
              this.files.push(file.original_url);
              if (file.type.startsWith('image/')) {
                this.filesUrl.push({
                  name: file.original_url,
                  type: 'image',
                  old: true,
                });
              } else {
                this.filesUrl.push({
                  name: file.original_url,
                  type: 'file',
                  old: true,
                });
              }
            });
            // this.files = res.data[0].warehouse_media;
            this.getArea();
          },
          complete: () => {
            setTimeout(() => {
              this.setTierValue();
            }, 500);
          },
        })
    );
  }

  editWarehouse() {
    let queryParams: any = {};
    this.removeNigative();
    for (const key in this.warehouseForm.value) {
      let value = this.warehouseForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (
          key === 'bulk_sales' ||
          key === 'inventory' ||
          key === 'is_main' ||
          key === 'purchases' ||
          key === 'purchases_return' ||
          key === 'retail_sales' ||
          key === 'sales_return' ||
          key === 'transfers'
        ) {
          queryParams[key] = value == true ? 1 : 0;
        } else {
          queryParams[key] = value;
        }
      }
    }
    if (this.uploadedFiled.length > 0) {
      queryParams['warehouse_media'] = this.uploadedFiled;
    }

    this.subscription.add(
      this.http
        .putReq(`warehouses/${this.warehouse_id}`, queryParams)
        .subscribe({
          next: (res) => {},
          complete: () => {
            this.router.navigate([
              '/warehouse/manage-warehouses/warehouses-list',
            ]);
          },
          error: () => {
            this.setTierValue();
          },
        })
    );
  }
}
