import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { manufacturers } from '@models/manufacturers';
import { warehouses } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

export interface warehouses_discounts {
  warehouse_id: number;
  price: number;
  expected_discount: number;
  subtracted_from_weighted_discount: number;
  discount_tiers: discount_tiers[];
}

export interface discount_tiers {
  discount_tier_id: number;
  discount: number;
}

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  private subscription = new Subscription();
  tabs: boolean[] = Array(3).fill(false);
  productDataForm!: FormGroup;
  product_type: commonObject[] = [];
  shelves: commonObject[] = [];
  stands: commonObject[] = [];
  corridors: commonObject[] = [];
  Manufacturers: manufacturers[] = [];
  static_Manufacturers: manufacturers[] = [];
  warehouses: warehouses[] = [];
  allFixedData: any = [];
  activeIngredient: any = [];
  medicationAlternatives: any = [];
  monthes: commonObject[] = [];
  purchase_validity_warning: commonObject[] = [];
  product_normal_discount: commonObject[] = [];
  acceptReturn: any;
  product_id!: number;
  edit: boolean = false;
  warehouses_discounts_bulk: warehouses_discounts = {} as warehouses_discounts;
  warehouses_discounts_single: warehouses_discounts =
    {} as warehouses_discounts;
  supplier_idle_days: commonObject[] = [];
  discount_tiers: discount_tiers[] = [];

  constructor(
    private fb: FormBuilder,
    private generalService: GeneralService,
    private toastr: ToastrService,
    private auth: AuthService,
    private http: HttpService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.tabs[0] = true;
    this.getDiscountTiers();
    this.initForm();

    this.product_id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    if (this.product_id) {
      this.edit = true;
      this.getProductData();
    }

    this.getDropdownData();
  }
  initForm() {
    this.productDataForm = this.fb.group({
      name: this.fb.group({
        ar: [''],
        en: [''],
      }),
      manufacturer_id: ['', Validators.required],
      manufacturing_type: ['', Validators.required],
      active_ingredient_id: [''],
      ingredient_alternative_ids: [],
      type: ['', Validators.required],
      items_number_in_packet: ['', Validators.required],
      packets_number_in_package: ['', Validators.required],
      stand: ['', Validators.required],
      shelf: ['', Validators.required],
      corridor_id: ['', Validators.required],
      selling_status: ['', Validators.required],
      buying_status: ['', Validators.required],
      global_barcode: ['', Validators.required],
      local_barcode: ['', Validators.required],
      note: [''],
      price: ['', Validators.required],
      taxes: [''],
      normal_discount: [''],
      purchase_discount: [''],
      cash_discount: [''],
      accept_returns: [''],
      return_acceptance_period: [''],
      purchase_validity_warning: [''],
      limited_quantity: [''],
      minimum_quantity: [''],
      maximum_quantity: [''],
      idle_period: [''],
      distribution_company_id: [''],
      for_company_id: [''],
      parent_company_id: [''],
    });
  }

  initWarehouseDiscounts() {
    this.warehouses_discounts_bulk = {
      warehouse_id: this.warehouses[1].id,
      price: 0,
      expected_discount: 0,
      subtracted_from_weighted_discount: 0,
      discount_tiers: this.discount_tiers.map((tier: any) => ({
        discount_tier_id: tier.id,
        discount: tier.discount || 0,
      })),
    };
    this.warehouses_discounts_single = {
      warehouse_id: this.warehouses[0].id,
      price: 0,
      expected_discount: 0,
      subtracted_from_weighted_discount: 0,
      discount_tiers: this.discount_tiers.map((tier: any) => ({
        discount_tier_id: tier.id,
        discount: tier.discount || 0,
      })),
    };
  }

  changeActiveTab(tab_index: number) {
    this.tabs.fill(false);
    this.tabs[tab_index] = true;
  }
  getDropdownData() {
    //corridore
    this.subscription.add(
      this.http.getReq('warehouses/corridors/withoutMain').subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );

    //manufacturers
    this.subscription.add(
      this.generalService.getManufacturers().subscribe({
        next: (res) => {
          this.Manufacturers = res.data;
        },
      })
    );

    this.subscription.add(
      this.generalService.getDropdownData(['static_manufacturers']).subscribe({
        next: (res) => {
          this.static_Manufacturers = res.data.static_manufacturers;
        },
      })
    );

    //warehouse
    this.subscription.add(
      this.generalService
        .getWarehousesDropdown({ module: 'purchases' })
        .subscribe({
          next: (res) => {
            this.warehouses = res.data;
          },
          complete: () => {
            this.initWarehouseDiscounts();
          },
        })
    );
    //warehouse
    this.subscription.add(
      this.http.getReq('products/active-ingredients').subscribe({
        next: (res) => {
          this.activeIngredient = res.data;
        },
        complete: () => {
          this.initWarehouseDiscounts();
        },
      })
    );

    this.allFixedData = this.auth.getEnums();
    this.shelves = this.allFixedData.shelves.map((shelf: string) => ({
      number: shelf,
    }));
    this.stands = this.allFixedData.stands.map((stand: string) => ({
      number: stand,
    }));
    this.monthes = this.auth
      .getEnums()
      .idle_product_months.map((shelf: string) => ({ number: shelf }));
    this.purchase_validity_warning = this.auth
      .getEnums()
      .purchase_validity_warning.map((shelf: string) => ({ number: shelf }));
    this.product_normal_discount = this.auth
      .getEnums()
      .product_normal_discount.map((shelf: string) => ({ number: shelf }));
    this.supplier_idle_days = this.auth
      .getEnums()
      .supplier_idle_days.map((shelf: string) => ({ number: shelf }));
  }

  getProductData() {
    let params = {
      product_id: this.product_id,
    };
    this.subscription.add(
      this.http.getReq('products', { params: params }).subscribe({
        next: (res) => {
          this.productDataForm.patchValue({
            ...res.data[0],
            buying_status: res.data[0].buying_status.value,
            selling_status: res.data[0].selling_status.value,
            manufacturing_type: res.data[0].manufacturing_type.value,
            type: res.data[0].type.value,
            manufacturer_id: res.data[0].manufacture_company.id,
            stand: res.data[0].main_location.stand,
            shelf: res.data[0].main_location.shelf,
            corridor_id: res.data[0].main_location.corridor_id,
          });
          this.productDataForm.get('name')?.setValue({
            ar: res.data[0]?.name_ar,
            en: res.data[0]?.name_en,
          });
        },
        complete: () => {},
      })
    );
  }

  addProduct() {
    if (this.productDataForm.valid && this.productDataForm.touched) {
      let queryParams: any = {};
      for (const key in this.productDataForm.value) {
        let value = this.productDataForm.controls[key].value;
        if (
          value != null &&
          value != undefined &&
          (value === 0 || value !== '')
        ) {
          queryParams[key] = value;
        }
      }
      let message = '';
      this.subscription.add(
        this.http.postReq('products', queryParams).subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.productDataForm.reset();
            this.toastr.info(message);
          },
        })
      );
    } else {
      this.toastr.error('رجاء اكمال البيانات المطلوبة');
    }
  }

  updateProduct() {
    if (this.productDataForm.valid && this.productDataForm.touched) {
      let queryParams: any = {};
      for (const key in this.productDataForm.value) {
        let value = this.productDataForm.controls[key].value;
        if (
          value != null &&
          value != undefined &&
          (value === 0 || value !== '')
        ) {
          queryParams[key] = value;
        }
      }
      let warehouses_discounts: any = [];
      warehouses_discounts.push({
        warehouse_id: this.warehouses_discounts_bulk.warehouse_id,
        subtracted_from_weighted_discount:
          this.warehouses_discounts_bulk.subtracted_from_weighted_discount,
        discount_tiers: this.warehouses_discounts_bulk.discount_tiers,
      });
      warehouses_discounts.push({
        warehouse_id: this.warehouses_discounts_single.warehouse_id,
        subtracted_from_weighted_discount:
          this.warehouses_discounts_single.subtracted_from_weighted_discount,
        discount_tiers: this.warehouses_discounts_single.discount_tiers,
      });
      queryParams['warehouses_discounts'] = warehouses_discounts;

      let message = '';
      this.subscription.add(
        this.http.putReq(`products/${this.product_id}`, queryParams).subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.toastr.info(message);
          },
        })
      );
    } else {
    }
  }

  getDiscountTiers() {
    this.subscription.add(
      this.http.getReq('settings/discount-tiers').subscribe({
        next: (res) => {
          this.discount_tiers = res.data;
        },
      })
    );
  }
  setTierValue(warehouse_type: number) {
    if (warehouse_type == 1) {
      if (
        this.warehouses_discounts_bulk.subtracted_from_weighted_discount > 0
      ) {
        this.warehouses_discounts_bulk.discount_tiers.forEach(
          (control, index: number) => {
            let discount_value =
              Number(
                this.warehouses_discounts_bulk.subtracted_from_weighted_discount
              ) + Number(index);
            control.discount = discount_value;
          }
        );
      }
    } else {
      if (
        this.warehouses_discounts_single.subtracted_from_weighted_discount > 0
      ) {
        this.warehouses_discounts_single.discount_tiers.forEach(
          (control, index: number) => {
            let discount_value =
              Number(
                this.warehouses_discounts_single
                  .subtracted_from_weighted_discount
              ) + Number(index);
            control.discount = discount_value;
          }
        );
      }
    }
  }
}
