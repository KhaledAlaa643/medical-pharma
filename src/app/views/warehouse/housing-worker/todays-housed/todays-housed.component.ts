import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { corridors } from '@models/corridors';
import { manufacturers } from '@models/manufacturers';
import { warehouses } from '@models/products';
import { receiversAuditor } from '@models/receiver-auditors';
import { suppliers } from '@models/suppliers';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { GeneralService } from '@services/general.service';
import { ColumnValue, columnHeaders } from '@models/tableData';
const datePipe = new DatePipe('en-EG');

interface todaysHousedData {
  location: any,
  product_name: string,
  price: number,
  quantity_recieved: number,
  storage_name: string,
  amount_pre_import: number,
  amount_post_import: number,
  receiver_auditor: string,
  expiredAt_operatingNumber: string,
  order_number: number
  reciever: string,
  distributor_received_at: string
  supply_authorization_number: any,
  supply_authorization_name: any,
  supplied_at: string
  stored_at: string

}


@Component({
  selector: 'app-todays-housed',
  templateUrl: './todays-housed.component.html',
  styleUrls: [ './todays-housed.component.scss' ]
})
export class TodaysHousedComponent implements OnInit {
  private subs = new Subscription();

  TodaysHousedFilter!: FormGroup
  isActiveTapArray: boolean[] = Array(7).fill(false)
  @ViewChild('myModal') myModal!: ElementRef;
  @ViewChild('Listmodel') Listmodel!: ElementRef<HTMLElement>;
  todaysHousedData: todaysHousedData[] = []
  total: number = 0
  corridors!: corridors[];
  warehouses!: warehouses[]
  suppliers!: suppliers[]
  receiversAuditor!: receiversAuditor[]
  manufacturers!: manufacturers[]
  date!: string;
  activetab!: number




  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private generalService: GeneralService
  ) {

  }

  // todaysHousedHeader = [
  //   { field: 'location', header: 'موقع الصنف', type: 'normal' },
  //   { field: 'product_name', header: 'اسم الصنف', type: 'normal' },
  //   { field: 'price', header: 'السعر', type: 'normal' },
  //   { field: 'quantity_recieved', header: 'الكمية المستلمة', type: 'normal' },
  //   { field: 'storage_name', header: 'اسم المخزن', type: 'normal' },
  //   { field: 'amount_pre_import', header: 'الكمية قبل التوريد', type: 'normal' },
  //   { field: 'amount_post_import', header: 'الكمية بعد التوريد', type: 'normal' },
  //   { field: 'receiver_auditor', header: 'عامل توزيع الاستلامات', type: 'normal' },
  //   { field: 'expiredAt_operatingNumber', header: 'التاريخ والتشغيلة', type: 'normal' },
  //   { field: 'reciever', header: ' عامل التسكين ', type: 'normal' },
  //   { field: 'supply_authorization_number', header: 'رقم إذن التوريد ', type: 'normal' },
  //   { field: 'supply_authorization_name', header: 'إسم المورد ', type: 'normal' },
  //   { field: 'supplied_at', header: ' وقت وتاريخ التوريد ', type: 'normal' },
  //   { field: 'stored_at', header: ' وقت وتاريخ التسكين ', type: 'normal' }

  // ];
  columnsArray: columnHeaders[] = [
    {
      name: 'موقع الصنف',
      sort:true,
      direction:null
    },
    {
      name:  'اسم الصنف',
      sort:true,
      direction:null
    },
    {
      name: 'السعر',
    },
    {
      name:   'الكمية المستلمة',
    },
    {
      name:  'اسم المخزن',
    },
    {
      name:  'الكمية قبل التوريد',
    },
    {
      name:  'الكمية بعد التوريد',
    },
    {
      name:   'عامل توزيع الاستلامات',
    },
    {
      name:  'التاريخ والتشغيلة',
    },
    {
      name:  ' عامل التسكين ',
    },
    {
      name:  'رقم إذن التوريد ',
    },
    {
      name: 'إسم المورد ',
    },
    {
      name: ' وقت وتاريخ التوريد ',
    },
    {
      name: ' وقت وتاريخ التسكين ',
    },

  ]

  columnsName: ColumnValue[] = [
    {
      name: 'location',
      type: 'normal'
    },
    {
      name: 'product_name',
      type: 'normal'
    },
    {
      name: 'price',
      type: 'normal'
    },
    {
      name: 'quantity_recieved',
      type: 'normal'
    },
    {
      name: 'storage_name',
      type: 'normal'
    },
    {
      name: 'amount_pre_import',
      type: 'normal'
    },
    {
      name: 'amount_post_import',
      type: 'normal'
    },
    {
      name: 'receiver_auditor',
      type: 'normal'
    },
    {
      name: 'expiredAt_operatingNumber',
      type: 'normal'
    },
    {
      name: 'reciever',
      type: 'normal'
    },
    {
      name: 'supply_authorization_number',
      type: 'normal'
    },
    {
      name: 'supply_authorization_name',
      type: 'normal'
    },
    {
      name: 'supplied_at',
      type: 'normal'
    },
    {
      name: 'stored_at',
      type: 'normal'
    },
  ]
  productType = [
    { id: 0, name: "سائل", en: 'Liquid' },
    { id: 1, name: "قرص", en: 'Tablet' },
    { id: 2, name: "الحقن", en: "Injections" },
    { id: 3, name: "كبسولات", en: "Capsules" },
    { id: 4, name: "قطرة", en: "drops" },
    { id: 5, name: "لبوس", en: "suppository" },
  ]


  getCorridorData() {
    this.subs.add(this.generalService.getCorridor().subscribe({
      next: res => {
        this.corridors = res.data;
        this.corridors.unshift({ id: 0, number: ' كل' });
      }
    }))
  }
//   getWarehouseData() {
//     this.subs.add(this.generalService.getWarehouses().subscribe({
//       next: res => {
//         this.warehouses = res.data

//       }
//     }))
//   }
//   getSupplierData() {
//     this.subs.add(this.generalService.getSuppliers().subscribe({
//       next: res => {
//         this.suppliers = res.data

//       }
//     }))
//   }
//   getReceiverAuditorData() {
//     this.subs.add(this.generalService.getReceiverAuditor().subscribe({
//       next: res => {
//         this.receiversAuditor = res.data

//       }
//     }))
//   }
//   getManufactuereData() {
//     this.subs.add(this.generalService.getManufacturers().subscribe({
//       next: res => {
//         this.manufacturers = res.data

//     }
//   }))
// }

getDropdownData(){
  let params=['warehouses','suppliers','manufacturers','receiving_reviewer']
  this.subs.add(this.generalService.getDropdownData(params).subscribe({
      next:res=>{
        this.warehouses = res.data.warehouses
        this.suppliers = res.data.suppliers
        this.manufacturers = res.data.manufacturers
        this.receiversAuditor=res.data.receiving_reviewer
      }
  }))
}

multiple_corridors_enabled!:string

  ngOnInit() {
    this.multiple_corridors_enabled=String(localStorage.getItem('multiple_corridors_enabled'))
    if(this.multiple_corridors_enabled=='false'){
      const location_index_array= this.columnsArray.findIndex((c:any)=>c.name=='موقع الصنف')
      const location_index_name= this.columnsName.findIndex((c:any)=>c.name=='location')
      if(location_index_array>-1){
        this.columnsArray.splice(location_index_array,1)
      }
      if(location_index_name>-1){
        this.columnsName.splice(location_index_name,1)
      }
    }
    this.getAllCorridores()
    this.getFilterDropdownData()
    this.isActiveTapArray[ 0 ] = true

    this.TodaysHousedFilter = this.fb.group({
      product_name: [ '' ],
      corridor_id: [ '' ],
      receiver_auditor_id: [ '' ],
      price: [ '' ],
      manufacturer_id: [ '' ],
      warehouse_id: [ '' ],
      supplier_id: [ '' ],
      quantity_before_supplying: [ '' ],
      quantity: [ '' ],
      quantity_after_supplying: [ '' ],
      code: [ '' ],
      date: [ '' ],
      date_inventory: [ '' ],
      product_type: [ '' ],
    })
    this.TodaysHousedFilter.controls[ 'date_inventory' ].setValue(new Date())
    this.TodaysHousedFilter.controls[ 'corridor_id' ].setValue(Number(localStorage.getItem('activeTab')))
  }

  getFilterDropdownData() {
    // this.getReceiverAuditorData()
    // this.getSupplierData()
    // this.getWarehouseData()
    // this.getManufactuereData()
    this.getDropdownData()
    this.getCorridorData()

  }


  lastClickedTab: number | null = null;
  clickedTabs: boolean[] = [];
  disableCorridorsDropdown = false

  changeActiveTap(index: number) {
    this.setActiveTabNumber(index)
    this.activetab = index
    this.clickedTabs[ index ] = true;
    this.lastClickedTab = index;

    localStorage.setItem('activeTab', String(index))
    if (index != 6) {
      this.isActiveTapArray.fill(false);
      this.isActiveTapArray[ index ] = true;
    } else {
      this.isActiveTapArray.fill(false);
    }


    const corridor = this.corridorsUsed.findIndex((c: any) => c.number == Number(index))

    if (corridor > -1) {
      if (this.corridorsUsed[ corridor ].id != this.allCorridorId) {
        this.disableCorridorsDropdown = true
      }
      else {
        this.disableCorridorsDropdown = false
      }
      this.getTodaysHousedData(this.corridorsUsed[ corridor ].id);
      this.TodaysHousedFilter?.controls[ 'corridor_id' ]?.setValue(this.corridorsUsed[ corridor ].id)
    }
  }
  setActiveTabNumber(index: any) {
    localStorage.setItem('activeTab', index)
  }



  getTodaysHousedFilteredData(sortData?:any) {

    let formatteddate = datePipe.transform(this.TodaysHousedFilter.controls[ 'date' ].value, 'yyyy-MM-dd')
    let formatteddate_inventory = datePipe.transform(this.TodaysHousedFilter.controls[ 'date_inventory' ].value, 'yyyy-MM-dd')

    const params: any = {};

    for (const key in this.TodaysHousedFilter.value) {
      const value = this.TodaysHousedFilter.value[ key ];
      if (value !== null && value !== undefined && value !== '') {
        if (key != 'corridor_id') {
          if (key == 'date') {
            params[ key ] = formatteddate;
          }
          else if (key == 'date_inventory') {
            params[ key ] = formatteddate_inventory;
          }
          else {
            params[ key ] = value;
          }
        }
        else {
          if (Number(value) != Number(this.allCorridorId)) {
            params[ key ] = value;

          }
        }
      }
    }

    if(sortData){
      params['sort_by']=sortData.name
      params['direction']=sortData.direction
    }



    this.subs.add(this.http.getReq('warehouses/batches/stored', { params: params }).subscribe({
      next: res => {
        this.todaysHousedData = []

        res?.data?.forEach((element: any) => {
          this.todaysHousedData.push(
            {
              'location': `${element?.corridor?.number} / ${element?.stand} - ${element?.shelf}`,
              'product_name': element?.product?.name,
              'price': element.batch_price,
              'quantity_recieved': element.quantity,
              'storage_name': element.warehouse?.name,
              'amount_pre_import': element?.quantity_before_supplying,
              'amount_post_import': element.quantity + element?.quantity_before_supplying,
              'receiver_auditor': element.receiver_auditor.name,
              'expiredAt_operatingNumber': `${element.expired_at} - ${element.operating_number}`,
              'order_number': element.code,
              'reciever': element.storing_worker?.name,
              'distributor_received_at': element.distributor_received_at,
              'supply_authorization_number': element.purchase.purchase_number,
              'supply_authorization_name': element.purchase.purchase_number,
              'supplied_at': element.supplied_at,
              'stored_at': element.stored_at,

            }
          )
        });
        this.total = this.todaysHousedData.length
      }, complete: () => {
        this.lastClickedTab = this.TodaysHousedFilter?.controls?.[ 'corridor_id' ]?.value;

        const corridor_index = this.corridorsDropDownData.findIndex((c: any) => c.id == this.TodaysHousedFilter?.controls?.[ 'corridor_id' ]?.value)
        if (corridor_index > -1) {
          this.isActiveTapArray.fill(false)
          this.isActiveTapArray[ corridor_index ] = true
          this.activetab = corridor_index
        }
        setTimeout(() => {
          this.closeModalClick()
        }, 200);
        setTimeout(() => {
          this.closeModalClick()
        }, 200);
      }
    }))
  }

  sortEvent(sortData: any) {
    
  }

  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }

  getTodaysHousedData(corridorNum?: any) {
    let params = {}
    let corridorsCount: any = []
    if (corridorNum != this.allCorridorId) {
      params = {
        'corridor_id': corridorNum
      }
    }
    else {
      params = {}
    }
    this.subs.add(this.http.getReq('warehouses/batches/stored', { params: params }).subscribe({
      next: res => {
        corridorsCount = res.additional_data.counts
        this.todaysHousedData = []

        res?.data?.forEach((element: any) => {
          this.todaysHousedData.push(
            {
              'location': `${element?.corridor?.number} / ${element?.stand} - ${element?.shelf}`,
              'product_name': element?.product?.name,
              'price': element.batch_price,
              'quantity_recieved': element.quantity,
              'storage_name': element.warehouse?.name,
              'amount_pre_import': element?.quantity_before_supplying,
              'amount_post_import': element.quantity + element?.quantity_before_supplying,
              'receiver_auditor': element.receiver_auditor.name,
              'expiredAt_operatingNumber': `${element.expired_at} - ${element.operating_number}`,
              'order_number': element.code,
              'reciever': element.storing_worker?.name,
              'distributor_received_at': element.distributor_received_at,
              'supply_authorization_number': element.purchase.purchase_number,
              'supply_authorization_name': element.purchase.purchase_number,
              'supplied_at': element.supplied_at,
              'stored_at': element.stored_at,
            }
          )
        });
        this.total = this.todaysHousedData.length
      }, complete: () => {
        this.corridorsUsed.map((item1: any) => {
          let match = corridorsCount.find((item2: any) => item2.corridor_id == item1.id);
          if (match) {
            item1.count = match?.count
          }
        });
      }
    }))

  }


  corridorsUsed: any = []
  allCorridorId!: number
  corridorsDropDownData: corridors[] = []
  getAllCorridores() {
    this.subs.add(this.generalService.getCorridor().subscribe({
      next: res => {
        this.corridorsUsed = res.data
        this.isActiveTapArray = new Array(res.data.length).fill(false)
        let corridors = res.data
        res.data.forEach((c: any) => {
          if (c.is_main_corridor) {
            this.corridorsDropDownData.push(
              {
                name: 'كل',
                id: c.id,
                number: c.number,
                is_main_corridor: c.is_main_corridor
              }
            )
          }
          else {
            this.corridorsDropDownData.push({
              name: c.number,
              id: c.id,
              number: c.number,
              is_main_corridor: c.is_main_corridor
            })
          }
        })
        const index = corridors.findIndex((c: any) => c.is_main_corridor)
        if (index > -1) {
          this.allCorridorId = Number(corridors[ index ].id)
        }
      }, complete: () => {
        if (localStorage.getItem('activeTab')) {
          this.changeActiveTap(Number(localStorage.getItem('activeTab')))
        }
        else {
          this.changeActiveTap(0)
        }
      }
    }))
  }

}
