import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');


@Component({
  selector: 'app-prepared',
  templateUrl: './prepared.component.html',
  styleUrls: [ './prepared.component.scss' ]
})
export class PreparedComponent implements OnInit {
  private subs = new Subscription()
  allOrders: any = []
  allApiData: any = []
  orderContent: any = []
  cities: any = []
  orderContentData: any = []
  orderItemsCount: number = 0
  columnsArrayAll:columnHeaders[]= [
    {
     name:  ' مسلسل',
    },
    {
     name: ' التاريخ والوقت',
    },
    { 
      name:'  اسم العميل  ',
    },
    { 
      name:' رقم اذن ',
    },
    { 
      name:'عدد مرات الطباعه',
    },
    { 
      name:'محتويات الأذن '
    },
    { 
      name:'طباعة',
    },
   ]
   columnsNameAll:ColumnValue[]= [
    {
      name:'number',
      type:'normal'
    },
    {
      name:'closed_at',
      type:'normal'
    },
    {
      name:'PharmacyName',
      type:'normal'
    },
    {
      name:'order_number',
      type:'normal'
    },
    {
      name:'print_count',
      type:'normal'
    },
    {
      name:'order_contents',
      type:'blueTextOpen'
    },
    {
      name:'print',
      type:'printButton'
    },
   
   ]


columnsArrayPopup:columnHeaders[]= [
  {
   name:' مسلسل ',
  },
  { 
    name:'موقع الصنف',
    sort:true,
    direction:null
  },
  { 
    name: '  الاسم عربي ',
    sort:true,
    direction:null
  },
  { 
    name: '    الصلاحية والتشغيلة',
  },
  { 
    name: ' الكمية المطلوبة ',
  },
  { 
    name: 'السعر',
  },
  { 
    name: ' باكت ',
  },
  { 
    name: ' كرتونة ',
  },
  { 
    name: ' الشركة المصنعه',
    sort:true,
    direction:null
  },
 ]
 columnsNamePopup:ColumnValue[]= [
  {
    name:'number',
    type:'normal'
  },
  {
    name:'corridor',
    type:'normal'
  },
  {
    name:'product_name',
    type:'normal'
  },
  {
    name:'expired_at',
    type:'normal'
  },
  {
    name:'order_quantity',
    type:'highlight_quantity'
  },
  {
    name:'price',
    type:'highlight_price'
  },
  {
    name:'packet',
    type:'normal'
  },
  {
    name:'package',
    type:'normal'
  },
  {
    name:'manufacturer_name',
    type:'normal'
  },
 
 ]
//printing data
printingdata:any
urlToInvoice: any
//filter data
warehouseFilter!:FormGroup
groupPharmacied:any=[]
bulkId!:number
warehouses:any=[]
multiple_corridors_enabled!:string

 


  constructor(private http: HttpService, private router: Router, private fb: FormBuilder, private fixedData: FixedDataService, private generalService: GeneralService) { }

  ngOnInit() {
    if(localStorage.getItem('multiple_corridors_enabled')){
      this.multiple_corridors_enabled=String(localStorage.getItem('multiple_corridors_enabled'))
      if(this.multiple_corridors_enabled=='false'){
        const location_index_name= this.columnsNamePopup.findIndex((c:any)=>c.name=='corridor')
        const location_index_array= this.columnsArrayPopup.findIndex((c:any)=>c.name=='موقع الصنف')
        if(location_index_name>-1){
          this.columnsNamePopup.splice(location_index_name,1)
        }
        if(location_index_array>-1){
          this.columnsArrayPopup.splice(location_index_array,1)
        }
      }
    }
    this.subs.add(this.fixedData.getAllFixedData().subscribe({
      next: res => {
        this.warehouses = res.data.warehouse_type
        let bulkWrehouse = this.warehouses.find((c: any) => c.name == 'جملة')
        if (bulkWrehouse) {
          this.bulkId = bulkWrehouse.value
        }
      }, complete: () => {
        this.getInvoicesList()
        this.getFilterData()
      }
    }))

    this.warehouseFilter = this.fb.group({
      invoice_number: [ '' ],
      created_at: [ '' ],
      pharmacy_id: [ '' ],
    })
  }
  @ViewChild('openInfoModel') openInfoModel!: ElementRef<HTMLElement>;
  @ViewChild('filterOpenModel') filterOpenModel!: ElementRef<HTMLElement>;
  @ViewChild('validationOpen') validationOpen!: ElementRef<HTMLElement>;

  openModel(event: any) {

    let el: HTMLElement = this.openInfoModel.nativeElement;
    el.click();

    setTimeout(() => {
      this.getOrderContent(event)
    }, 200);


  }
  openFilterModel() {

    let el: HTMLElement = this.filterOpenModel.nativeElement;
    el.click();

  }
  order_id!: number
  openValidationModel(order_id: any) {
    this.order_id = order_id
    let el: HTMLElement = this.validationOpen.nativeElement;
    el.click();

  }
  closeValidationModel() {
    let el: HTMLElement = this.validationOpen.nativeElement;
    el.click();

  }

  //get prepared orders
  getInvoicesList() {
    this.allOrders = []
    let params = {
      'warehouse_type': this.bulkId
    }
    this.subs.add(this.http.getReq('warehouses/orders/bulk/listing-prepared', { params: params }).subscribe({
      next: res => {
        this.allApiData = res.data

        this.allApiData?.forEach((element: any, index: number) => {

          this.allOrders.push(
            {
              'number': index + 1,
              'closed_at': element.closed_at,
              'completed_at': element?.completed_at,
              'PharmacyName': element?.pharmacy.name,
              'print_count': element?.invoice?.printed_num,
              'order_number': element?.order_number,
              'order_id': element?.id,
              'order_contents': 'محتويات الأذن',
              'print': 'طباعة'

            }

          )
        });
      }
    }))

  }

  //printing
  printInvoiceOnly() {
    let body = {
      'order_id': this.order_id
    }
    this.subs.add(this.http.postReq('warehouses/orders/bulk/print', body).subscribe({
      next: res => {
        this.printingdata = res
      }, complete: () => {
        this.closeValidationModel()
        this.navigateToInvoicePrint()
      }
    }))
  }

  navigateToInvoicePrint() {

    const serializedSalesInvoiceData = JSON.stringify(this.printingdata);
    localStorage.setItem('PharmacyInvoiceData', serializedSalesInvoiceData);

    if (this.printingdata.data.client.type_value == 0) {
      this.urlToInvoice = this.router.serializeUrl(this.router.createUrlTree([ 'ToPrint/pharmacy-invoice' ], { queryParams: { shouldPrint: 'true' } }));
    } else if (this.printingdata.data.client.type_value == 1) {
      this.urlToInvoice = this.router.serializeUrl(this.router.createUrlTree([ 'ToPrint/sales-invoice' ], { queryParams: { shouldPrint: 'true' } }));
    }
    setTimeout(() => {
      window.open(this.urlToInvoice, '_blank');
    }, 100);

  }

  //get filter dropdown data
  getFilterData() {
    //pharmacies
    // let pharmacies:any=[]
    // this.subs.add(this.http.getReq('pharmacies').subscribe({
    //   next: res => {
    //     pharmacies = res.data
    //   }, complete: () => {
    //     pharmacies.forEach((element:any) => {
    //       this.groupPharmacied.push({
    //         'name': element?.clients[ 0 ]?.name + '-' + element?.name,
    //         'id': element?.id
    //       })
    //     })
    //   }
    // }))

    let clients: any = []
    this.subs.add(this.http.getReq('clients/dropdown').subscribe({
      next: res => {
        clients = res.data
        clients.forEach((client: any) => {
          client.pharmacies.forEach((pharamcy: any) => {
            this.groupPharmacied.push({
              'name': client?.name + '-' + pharamcy.name,
              'id': pharamcy?.id,
            })
          });
        })

      }
    }))
  }



  //filter
  filter() {
    const params: any = {};
    for (const key in this.warehouseFilter.value) {
      let value = this.warehouseFilter.controls[ key ].value
      if (value != null && value != undefined && value != '') {
        if (key == 'created_at') {
          params[ key ] = datePipe.transform(this.warehouseFilter.controls[ 'created_at' ].value, 'yyyy-MM-dd');
        }
        else {
          params[ key ] = value;
        }
      }
    }
    this.subs.add(this.http.getReq('warehouses/orders/bulk/listing-prepared', { params: params }).subscribe({
      next: res => {
        this.allApiData = res.data
        this.allOrders = []

        res?.data?.forEach((element: any, index: number) => {
          this.allOrders.push(
            {
              'number': index + 1,
              'closed_at': element.closed_at,
              'completed_at': element.completed_at,
              'PharmacyName': element.pharmacy.name,
              'print_count': element?.invoice?.printed_num,
              'order_number': element.order_number,
              'order_id': element.id,
              'order_contents': 'محتويات الأذن',
              'print': 'طباعة'

            }
          )
        });

      }, complete: () => {

        this.openFilterModel()

      }
    }))
  }

  invoiceContentId!: number
  //get order content
  getOrderContent(data: any, sort_by?: string, direction?: string) {
    this.orderContentData = []
    let params: any
    this.invoiceContentId = data
    if (sort_by && direction) {
      params = {
        'invoice_id': data,
        'sort_by': sort_by,
        'direction': direction,
      }
    }
    else {
      params = {
        'invoice_id': data,
      }
    }

    this.subs.add(this.http.getReq('warehouses/orders/retail/view-prepared', { params: params }).subscribe({
      next: res => {
        let contentCount = 1
        this.orderContentData = []
        res?.data?.cart.forEach((cart: any) => {
            this.orderContentData.push(
              {
                'number': contentCount,
                'corridor': cart.location,
                'product_name': cart.product_name,
                'order_quantity': cart.quantity + cart.bonus,
                'price': cart.price,
                'expired_at': cart.expired_at + ' ' + cart.operating_number,
                'manufacturer_name': cart.manufacturer_name,
                'packet': cart.packet,
                'package': cart.package,
              }
            )
            contentCount++
  

        });

        this.orderItemsCount = res.data.total_quantity

      }
    }))

  }

  sortInvoiceContent(data: any) {
    let queryParams: any = {}
    queryParams[ 'sort_by' ] = data.name;
    queryParams[ 'direction' ] = data.direction;
    this.getOrderContent(this.invoiceContentId, queryParams.sort_by, queryParams.direction)
  }
}
