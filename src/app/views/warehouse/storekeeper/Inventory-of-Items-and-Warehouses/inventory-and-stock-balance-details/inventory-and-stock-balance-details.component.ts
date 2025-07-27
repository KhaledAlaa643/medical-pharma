import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { products, warehouses } from '@models/products';
import { NotesModalComponent } from '@modules/notes-modal/notes-modal.component';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-and-stock-balance-details',
  templateUrl: './inventory-and-stock-balance-details.component.html',
  styleUrls: ['./inventory-and-stock-balance-details.component.scss'],
})
export class InventoryAndStockBalanceDetailsComponent
  implements OnInit, OnDestroy
{
  product_id!: number;
  private subs = new Subscription();
  product: products = {} as products;
  productDataForm!: FormGroup;
  product_buying_status: any = [];
  product_selling_status: any = [];
  product_manufacturing_types: any = [];
  product_type: any = [];
  shelves: any = [];
  stands: any = [];
  corridors: any = [];
  Manufacturers: any = [];
  bulkId: any = [];
  retailId: any = [];
  formDataPayLoad = new FormData();
  activeIngredient: any = [];
  warehouses: warehouses[] = [];

  allFixedData: any = [];
  options = [{ name: 'new', value: 1 }];
  multiple_corridors_enabled!: string;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private fixedData: FixedDataService,
    private toastr: ToastrService,
    private generalService: GeneralService
  ) {}

  ngOnInit(): void {
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
    }

    this.productDataForm = this.fb.group({
      name: this.fb.group({
        ar: [''],
        en: [''],
      }),

      active_ingredient_id: [''],
      ingredient_alternative_ids: [''],

      manufacturer_id: [''],
      manufacturing_type: [''],

      type: [''],
      packets_number_in_package: [0],
      items_number_in_packet: [0],
      price: [''],
      corridor_id: [''],
      stand: [''],
      shelf: [''],

      buying_status: [''],
      selling_status: [''],

      global_barcode: [''],

      note: [''],
    });
    this.getDropdownData();

    //get All fixed data needed in dropdown
    this.fixedData.getAllFixedData().subscribe({
      next: (res) => {
        this.allFixedData = res.data;
        this.shelves = this.allFixedData.shelves.map((shelf: string) => ({
          number: shelf,
        }));
        this.stands = this.allFixedData.stands.map((stand: string) => ({
          number: stand,
        }));
      },
    });

    this.product_id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.getProductData();
  }

  getDropdownData() {
    //corridore
    this.subs.add(
      this.http.getReq('warehouses/corridors/withoutMain').subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );

    //manufacturers
    this.subs.add(
      this.generalService.getManufacturers().subscribe({
        next: (res) => {
          this.Manufacturers = res.data;
        },
      })
    );
    //active ingredients
    this.subs.add(
      this.http.getReq('products/active-ingredients').subscribe({
        next: (res) => {
          this.activeIngredient = res.data;
        },
      })
    );

    //warehouse
    // this.subs.add(
    //   this.generalService.getWarehouses({ inventory: 1 }).subscribe({
    //     next: (res) => {
    //       this.warehouses = res.data;
    //     },
    //     complete: () => {
    //       let bulkWrehouse = this.warehouses.find((c: any) => c.name == 'جملة');
    //       let retailWarehouse = this.warehouses.find(
    //         (c: any) => c.name == 'قطاعي'
    //       );
    //       if (bulkWrehouse) {
    //         this.bulkId = bulkWrehouse.id;
    //         this.productDataForm.get('warehouses_whole')?.setValue({
    //           warehouse_id: this.bulkId,
    //           corridor_id: [''],
    //           stand: [''],
    //           shelf: [''],
    //         });
    //       }
    //       if (retailWarehouse) {
    //         this.retailId = retailWarehouse.id;
    //         this.productDataForm.get('warehouses_retail')?.setValue({
    //           warehouse_id: this.retailId,
    //           corridor_id: [''],
    //           stand: [''],
    //           shelf: [''],
    //         });
    //       }
    //     },
    //   })
    // );
  }

  getProductData() {
    let params = {
      product_id: this.product_id,
    };
    this.subs.add(
      this.subs.add(
        this.http.getReq('products', { params: params }).subscribe({
          next: (res) => {
            this.productDataForm.patchValue(res.data);
            this.productDataForm.get('name')?.setValue({
              ar: res.data[0]?.name_ar,
              en: res.data[0]?.name_en,
            });

            this.productDataForm.controls['note'].setValue(res.data[0]?.note);

            let activeIngredient = res.data[0].id;
            // this.activeIngredient = res.data[0]?.activeIngredients.id;
            // res.data[0]?.activeIngredients?.forEach((element: any) => {
            //   activeIngredients.push(element?.id);
            // });
            this.productDataForm.controls['active_ingredient_id'].setValue(
              activeIngredient
            );

            this.productDataForm.controls['global_barcode'].setValue(
              res.data[0]?.global_barcode
            );
            this.productDataForm.controls['manufacturer_id'].setValue(
              res.data[0].manufacture_company?.id
            );
            this.productDataForm.controls['manufacturing_type'].setValue(
              res.data[0].manufacturing_type?.value
            );
            this.productDataForm.controls['type'].setValue(
              res.data[0].type?.value
            );
            this.productDataForm.controls['selling_status'].setValue(
              res.data[0].selling_status?.value
            );
            this.productDataForm.controls['buying_status'].setValue(
              res.data[0].buying_status?.value
            );
            this.productDataForm.controls['price'].setValue(res.data[0].price);
            this.productDataForm.controls['packets_number_in_package'].setValue(
              res.data[0].packets_number_in_package
            );
            this.productDataForm.controls['items_number_in_packet'].setValue(
              res.data[0].items_number_in_packet
            );

            let alternatives: any = [];
            res.data[0].activeIngredientsAlternatives?.forEach(
              (element: any) => {
                alternatives.push(element.id);
              }
            );
            this.productDataForm.controls[
              'ingredient_alternative_ids'
            ].setValue(alternatives);

            this.productDataForm
              .get('shelf')
              ?.setValue(res.data[0].main_location.shelf);
            this.productDataForm
              .get('stand')
              ?.setValue(res.data[0].main_location.stand);
            this.productDataForm
              .get('corridor_id')
              ?.setValue(res.data[0].main_location.corridor_id);
          },
        })
      )
    );
  }

  editProductData() {
    // let queryParams: any = {};

    // for (const key in this.productDataForm.value) {
    //   let value = this.productDataForm.value[key];

    // }

    this.subs.add(
      this.http
        .postReq(
          `products/update/${this.product_id}`,
          this.productDataForm.value
        )
        .subscribe({
          next: (res) => {},
          complete: () => {
            this.toastr.success('تم تعديل البيانات بنجاح');
            this.router.navigate([
              'warehouses/storekeeper/Inventory-of-Items-and-Warehouses/inventory-and-stock-balance',
            ]);
          },
        })
    );
  }

  setEditData() {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
