import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  Subscription,
  catchError,
  debounceTime,
  of,
  switchMap,
} from 'rxjs';
import { totals } from '../supply-request/supply-request.component';
import { LooseObject } from '@models/LooseObject';
import { HttpService } from '@services/http.service';
import * as bootstrap from 'bootstrap';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-supply-request-details',
  templateUrl: './supply-request-details.component.html',
  styleUrls: ['./supply-request-details.component.scss'],
})
export class SupplyRequestDetailsComponent implements OnInit {
  private subscription = new Subscription();
  direction!: string;
  searchWord!: string;
  searchInput$ = new BehaviorSubject('');
  supplyRequestTotals: totals = {} as totals;
  supply_request_id!: number;
  supply_request_data: any = {};
  supply_request_cart: any = [];
  editDiscountForm!: FormGroup;

  constructor(
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.supply_request_id = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );
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
            this.supply_request_data = res.data;
            this.supply_request_cart = res.data.cart;
            this.supplyRequestTotals = res.additional_data;
          },
        })
    );

    this.editDiscountForm = this.fb.group({
      name: [''],
      warehouse_name: [''],
      warehouse_id: [''],
      weighted_discount: [''],
      price: [''],
      quantity: [''],
      subtracted_from_weighted_discount: [''],
      bonus: [''],
      taxes: [''],
      manufacturer_name: [''],
      discount_tiers: this.fb.array([]),
      normal_discount: [''],
    });
  }
  get discount_tiers(): FormArray {
    return this.editDiscountForm.get('discount_tiers') as FormArray;
  }
  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    x['purchase_id'] = this.supply_request_id;
    let getUrl = 'purchases/supply-request/get-cart-items';
    return this.http.getReq(getUrl, { params: x });
  }

  sortByName() {
    this.direction = this.direction === 'asc' ? 'desc' : 'asc';
    setTimeout(() => {
      return this.router.navigate([], {
        queryParams: { sort_by: 'name_ar', direction: this.direction },
        queryParamsHandling: 'merge',
      });
    }, 50);
  }

  product_search() {
    this.subscription.add(
      this.searchInput$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          return this.router.navigate([], {
            queryParams: { product_name: this.searchWord },
            queryParamsHandling: 'merge',
          });
        },
      })
    );

    this.searchInput$.next(this.searchWord);
  }

  // @ViewChild('popupModalOpen') popupModalOpen!: ElementRef<HTMLElement>;

  // openModal() {
  //   let el: HTMLElement = this.popupModalOpen.nativeElement;
  //   el.click();
  // }
  addDiscountTier(discount_tier: any) {
    this.discount_tiers.push(
      this.fb.group({
        discount_tier_id: discount_tier.id,
        discount: discount_tier.discount,
      })
    );
  }

  @ViewChildren('discountInput') discountInputs!: QueryList<ElementRef>;
  @ViewChild('editBtn') editBtn!: ElementRef;

  focusNextInput(currentIndex: number) {
    setTimeout(() => {
      const inputsArray = this.discountInputs.toArray();
      if (inputsArray[currentIndex + 1]) {
        inputsArray[currentIndex + 1].nativeElement.focus();
      } else {
        this.editBtn.nativeElement.focus();
      }
    });
  }

  edited_product_data: any;
  editButton(data: any) {
    this.discount_tiers.clear();

    let params = {
      warehouse_id: data.warehouse_id,
      product_id: data.product_id,
    };
    this.subscription.add(
      this.http
        .getReq('products/discount-tiers', { params: params })
        .subscribe({
          next: (res) => {
            this.editDiscountForm.patchValue({
              ...res.data,
              manufacturer_name: res.data.manufacture_company.name,
              warehouse_name: data.warehouse_name,
              warehouse_id: data.warehouse_id,
              quantity: data.quantity,
            });
            res.data.discount_tiers.forEach((tier: any, index: any) => {
              this.addDiscountTier({
                id: tier.discount_tier.id,
                discount: tier.discount,
              });
            });
          },
          complete: () => {
            this.openEditDiscountPopup();
            this.edited_product_data = data;
          },
        })
    );
    //open edit discount popup
    // this.router.navigate([ `warehouse/storekeeper/Inventory-of-Items-and-Warehouses/inventory-and-stock-balance-details/${id}` ]);
  }

  edit() {
    // let params={
    //   warehouse_id:this.edited_product_data.warehouse_id,
    //   subtracted_from_weighted_discount:this.editDiscountForm.controls['subtracted_from_weighted_discount'].value,
    //   discount_tiers:this.editDiscountForm.controls['discount_tiers'].value
    // }
    const params = this.pick(this.editDiscountForm.value, [
      'discount_tiers',
      'warehouse_id',
      'subtracted_from_weighted_discount',
    ]);
    this.subscription.add(
      this.http
        .putReq(
          `products/update-discount-tiers/${this.edited_product_data.product_id}`,
          params
        )
        .subscribe({
          next: (res) => {},
          complete: () => {
            this.discount_tiers.clear();

            const nextData = this.supply_request_cart.findIndex(
              (product: any) => {
                return product.id == this.edited_product_data.id;
              }
            );
            //  { id: product.id,
            //     product_id: product.product.id,
            //       warehouse_id: supply_request_data.warehouse.id,
            //         warehouse_name: supply_request_data.warehouse.name,
            //           quantity: product.quantity
            // }
            if (nextData + 1 == this.supply_request_cart.length) return;

            this.editButton({
              id: this.supply_request_cart[nextData + 1].id,
              product_id: this.supply_request_cart[nextData + 1].product.id,
              warehouse_id: this.supply_request_data.warehouse.id,
              warehouse_name: this.supply_request_data.warehouse.name,
              quantity: this.supply_request_data.quantity,
            });
          },
        })
    );
  }

  @ViewChild('editDiscountModal') editDiscountModal!: ElementRef;
  openEditDiscountPopup() {
    const modalInstance = new bootstrap.Modal(
      this.editDiscountModal.nativeElement
    );
    modalInstance.show();
  }

  pick(obj: any, keys: string[]) {
    return keys.reduce((acc, key) => {
      if (obj[key] !== undefined) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as any);
  }
}
