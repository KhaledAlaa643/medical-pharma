import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { client } from '@models/client';
import { products, warehouses } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, pipe } from 'rxjs';
import { Dropdown } from 'primeng/dropdown';
import { ValidationService } from '@services/validation.service';
import { GeneralService } from '@services/general.service';
import { returns } from '@models/returns';
import { pharmacy_client } from '@models/pharmacie';

const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-register-return-without-permission',
  templateUrl: './register-return-without-permission.component.html',
  styleUrls: [ './register-return-without-permission.component.scss' ]
})
export class RegisterReturnWithoutPermissionComponent implements OnInit {

  returnList: returns[] = []
  private subs = new Subscription()
  columnsArray: columnHeaders[] = [
    {
      name: 'اسم الصنف ',
    },
    {
      name: 'الكمية',
    },
    {
      name: ' السعر	',
    },
    {
      name: ' الخصم	',
    },
    {
      name: ' التاريخ والتشغيلة	',
    },
    {
      name: ' الاجمالي	',
    },
    {
      name: ' أمر	',
    },
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal'
    },
    {
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'price',
      type: 'normal'
    },
    {
      name: 'discount',
      type: 'normal'
    },
    {
      name: 'expired_at',
      type: 'expired_at/operating_number'
    },
    {
      name: 'total',
      type: 'normal'
    },
    {
      name: 'delete',
      type: 'trachIconDelete'
    },

  ]
  reasons: { name: string, value: number }[] = []
  rows!: number
  order_id!: number
  pharmacy_id!: number
  total!: number
  OrderDetailsForm!: FormGroup
  orderProducts: any = []
  addReturnProductForm!: FormGroup
  warehouse_id!: number
  groupPharmacies: pharmacy_client[] = []
  products: products[] = []
  warehouses: warehouses[] = []
  constructor(private http: HttpService,
    private fixedDataService: FixedDataService,
    private validators: ValidationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private fb: FormBuilder,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.OrderDetailsForm = this.fb.group({
      code: [ '' ],
      pharmacy_id: [ '' ],
      warehouse_id: [ '' ],
      sales_id: [ '' ],
    })
    this.addReturnProductForm = this.fb.group({
      expired_at: [ '', Validators.required ],
      operating_number: [ '', Validators.required ],
      quantity: [ '', Validators.compose([ Validators.required, Validators.min(1) ]) ],
      price: [ '' ],
      discount: [ '', Validators.required ],
      reason: [ '', Validators.required ],
      total: [ '' ],
      product_name: [ '' ],
      returnable_id: [ '', Validators.required ],
      returnable_type: [ '' ],
    })
    this.getDropdownData()
    setTimeout(() => {
      this.focusClints()
    }, 100);

  }
  selectedPharmacy:pharmacy_client={} as pharmacy_client
  getDropdownData() {
    //pharamcy
    let pharmacies: any = []
    this.subs.add(this.http.getReq('clients/dropdown').subscribe({
      next: res => {
        pharmacies=res.data
        pharmacies.forEach((client:any)=>{
          client.pharmacies.forEach((pharamcy:any) => {
            this.groupPharmacies.push({
             'name':client?.name +'-'+pharamcy.name,
             'id':pharamcy?.id,
             'code':pharamcy?.code,
             'client_id':client?.name
            })
          });
        })

   }
    }))

    //warehouse
    // this.subs.add(this.generalService.getDropdownData(['warehouses']).subscribe({
    //   next: res => {
    //     this.warehouses = res.data.warehouses
    //   }
    // }))
    this.subs.add(this.generalService.getWarehouses({ 'sales_return': 1}).subscribe({
      next: res => {
        this.warehouses = res.data
      }
    }))
    //products
    this.subs.add(this.http.getReq('products/dropdown').subscribe({
      next: res => {
        this.products = res.data

        this.products = this.products.map((product: any) => ({
          ...product,
          disabled: false
        }));

      }
    }))
    //returns
    this.subs.add(this.fixedDataService.getAllFixedData().subscribe({
      next: res => {
        this.reasons = res.data.returns_reasons
      }
    }))
  }

  @ViewChild('productsDropdown') private productsDropdown!: Dropdown;
  focudProducts(dropdown?: any) {
    if (!dropdown?.overlayVisible) {
      if (this.productsDropdown) {
        this.productsDropdown?.focus();
      }

    }
    if (!dropdown) {
      if (this.productsDropdown) {
        this.productsDropdown?.focus();
      }
    }
  }
  @ViewChild('clients') private clients!: Dropdown;
  focusClints() {
    if (this.clients) {
      this.clients?.focus();
    }
  }
  @ViewChild('warehouseDropdown') private warehouseDropdown!: Dropdown;
  focusWarehouse(dropdown: any) {
    if (!dropdown.overlayVisible) {
      if (this.warehouseDropdown) {
        this.warehouseDropdown?.focus();
      }

    }
  }
  @ViewChild('reasonDropdown') private reasonDropdown!: Dropdown;
  focusReason() {
    if (this.reasonDropdown) {
      this.reasonDropdown?.focus();
    }
  }
  @ViewChild('submitbtn') submitbtn!: ElementRef<HTMLElement>;
  focusSubmit(dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.submitbtn?.nativeElement.focus();
    }
  }
  @ViewChild('quantity') quantity!: ElementRef<HTMLElement>;

  focusQuantity(event: any) {
    setTimeout(() => {
      this.quantity.nativeElement.focus();
      event.preventDefault();
    }, 100);
  }
  @ViewChild('discount') discount!: ElementRef<HTMLElement>;

  focusDiscount(event: any) {
    setTimeout(() => {
      this.discount.nativeElement.focus();
      event.preventDefault();
    }, 100);
  }
  @ViewChild('expired_at') expired_at!: ElementRef<HTMLElement>;

  focusExpiedAt() {
    setTimeout(() => {
      this.expired_at.nativeElement.focus();
    }, 100);
  }
  @ViewChild('operating_num') operating_num!: ElementRef<HTMLElement>;

  focusOperatingNum(event: any) {
    setTimeout(() => {
      this.operating_num.nativeElement.focus();
      event.preventDefault();
    }, 100);
  }

  client!: client
  // getClientidFromCode(param: string) {

  //   let params;
  //   if (param == 'code' && this.OrderDetailsForm.controls[ 'code' ].value) {
  //     params = {
  //       "code": this.OrderDetailsForm.controls[ 'code' ].value
  //     }

  //     this.OrderDetailsForm.controls[ 'pharmacy_id' ].setValue(null)
  //   } else if (param == 'clientId' && this.OrderDetailsForm.controls[ 'pharmacy_id' ].value) {
  //     this.OrderDetailsForm.controls[ 'pharmacy_id' ].setValue(this.OrderDetailsForm.controls[ 'pharmacy_id' ].value)
  //     params = { "pharmacy_id": this.OrderDetailsForm.controls[ 'pharmacy_id' ].value }
  //     this.OrderDetailsForm.controls[ 'code' ].setValue('')


  //   }
  //   if (params) {

  //     this.subs.add(this.generalService.getPharmacies(params).subscribe({
  //       next: res => {
  //         this.client = res.data[ 0 ]

  //         if (param == 'code' && this.OrderDetailsForm.controls[ 'code' ].value) {

  //           this.OrderDetailsForm.controls[ 'pharmacy_id' ].setValue(res.data[ 0 ]?.id)
  //         }
  //         if (this.client?.code) this.OrderDetailsForm.controls[ 'code' ].setValue(String(this.client?.code))
  //         else this.OrderDetailsForm.controls[ 'pharmacy_id' ].setValue(null)
  //       }
  //     }))
  //   }
  //   else {
  //     this.OrderDetailsForm.controls[ 'pharmacy_id' ].setValue(null)
  //     this.OrderDetailsForm.controls[ 'code ' ].setValue('')
  //   }
  // }


  findProduct(id: number, disable_value: boolean) {
    const index = this.products.findIndex((c: any) => c.id == id)
    if (index > -1) {
    }
  }


  getClientData(type:string){
     if(type=='code'){
     const code_index=  this.groupPharmacies.findIndex((c: any) => c.code == this.selectedPharmacy.code)
     if(code_index>-1){
      this.OrderDetailsForm.controls['pharmacy_id'].setValue(this.groupPharmacies[code_index].id) 
     }
     }
     else{
      const id_index=  this.groupPharmacies.findIndex((c: any) => c.id == this.OrderDetailsForm.controls['pharmacy_id'].value)
      if(id_index>-1){
        this.selectedPharmacy.code=this.groupPharmacies[id_index].code
      }
     }
  }

  checkSelectedClient(type:string){
    if(type=='code'){
      if(this.selectedPharmacy.code=='' || this.selectedPharmacy.code==null || this.selectedPharmacy.code==undefined){
        this.selectedPharmacy={} as pharmacy_client
        this.OrderDetailsForm.controls['pharmacy_id'].reset()
      }
    }
    else{
      let pharmacy_id= this.OrderDetailsForm.controls['pharmacy_id'].value
      if(pharmacy_id=='' || pharmacy_id==null || pharmacy_id==undefined){
       this.selectedPharmacy={} as pharmacy_client
      }
    }
  }

selected_product:products={} as products
  setProductData(dropdown: any) {
    if (!dropdown.overlayVisible) {
      // const product: any = this.products.find((product: any) => product.id === this.addReturnProductForm.controls[ 'returnable_id' ].value);
      // this.addReturnProductForm.patchValue(product)
      // this.addReturnProductForm.controls[ 'product_name' ].setValue(product.name)
      // this.addReturnProductForm.controls[ 'returnable_type' ].setValue('Product')
      // this.focusExpiedAt()
      let params_data:any={id:this.addReturnProductForm.controls[ 'returnable_id' ].value}
      this.subs.add(this.http.getReq('products',{params:params_data}).subscribe({
        next: res => {
          this.selected_product = res.data[0]
        },complete: () => {
          this.addReturnProductForm.patchValue(this.selected_product)
          this.addReturnProductForm.controls[ 'product_name' ].setValue(this.selected_product.name)
          this.addReturnProductForm.controls[ 'returnable_type' ].setValue('Product')
          this.focusExpiedAt()

        }
      }))
    }

  }
  setNewTotal() {
    if (this.selected_product) {
      if (this.addReturnProductForm.controls[ 'quantity' ].value > 0) {
        let price_without_discount = this.addReturnProductForm.controls[ 'quantity' ].value * Number(this.selected_product.price)
        this.addReturnProductForm.controls[ 'total' ].setValue(price_without_discount - (price_without_discount * (this.addReturnProductForm.controls[ 'discount' ].value / 100)))
      }
    }
    else {
      this.toastr.error('اختر الصنف اولا')
    }
  }

  addReturn() {
    if (this.addReturnProductForm.valid) {
      let body: any = {
        'cart_batch_id': this.addReturnProductForm.controls[ 'returnable_id' ].value,
        'quantity': Number(this.addReturnProductForm.controls[ 'quantity' ].value),
        'operating_number': this.addReturnProductForm.controls[ 'operating_number' ].value,
        'expired_at': this.addReturnProductForm.controls[ 'expired_at' ].value,
        'reason': this.addReturnProductForm.controls[ 'reason' ].value

      }
      if (this.addReturnProductForm.controls[ 'quantity' ].value) {
        body[ 'discount' ] = this.addReturnProductForm.controls[ 'discount' ].value
      }
      this.subs.add(this.http.postReq('orders/returns/validate-returns', body).subscribe({
        next: res => {

        }, complete: () => {
          this.returnList.push(this.addReturnProductForm.value)
          this.findProduct(this.addReturnProductForm.controls[ 'returnable_id' ].value, true)
          this.addReturnProductForm.reset()

          setTimeout(() => {
            this.focudProducts()
          }, 50);
        }
      }))

    }
    else {
      this.addReturnProductForm.markAllAsTouched()
    }

  }
  deleteReturn(product_id: any) {
    this.returnList.findIndex
    const index = this.returnList.findIndex((c: any) => c.returnable_id == product_id)
    if (index > -1) {
      this.returnList.splice(index, 1)
      this.findProduct(product_id, false)
    }
  }
  deleteAll() {
    this.returnList = []
  }

  finishReturnPermission() {
    let products = this.returnList.map((product: any) => {
      const { id, product_name, expired_at, ...rest } = product;
      const [ year, month ] = expired_at.split('-');
      let new_date = new Date(year, month - 1, 1)
      const expirationDate = datePipe.transform(new_date, 'yyyy-MM-dd')

      return {
        ...rest,
        expired_at: expirationDate,
      };
    });

    let body = {
      'pharmacy_id': this.OrderDetailsForm.controls[ 'pharmacy_id' ].value,
      'warehouse_id': this.OrderDetailsForm.controls[ 'warehouse_id' ].value,
      'products': products,
    }
    this.subs.add(this.http.postReq('orders/returns/create', body).subscribe({
      next: res => {

      }, complete: () => {
        this.router.navigate([ `/warehouse/storekeeper/customer-returns/register-return-permission` ])
      }
    }))
  }



}
