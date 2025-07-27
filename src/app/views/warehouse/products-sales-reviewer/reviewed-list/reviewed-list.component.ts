import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { inventoried_invoices, reviewedInvoices } from "@models/inventoried_invoices";
import { groupedPharmacy, pharmacie } from "@models/pharmacie";
import { receiversAuditor } from "@models/receiver-auditors.js";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { AuthService } from "@services/auth.service";
import { GeneralService } from "@services/general.service";
import { HttpService } from "@services/http.service";
import { ToggleModal } from "@services/toggleModal.service";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
const datePipe = new DatePipe('en-EG');



@Component({
  selector: 'app-reviewed-list',
  templateUrl: './reviewed-list.component.html',
  styleUrls: [ './reviewed-list.component.scss' ]
})

export class ReviewedListComponent implements OnInit {
  private subs = new Subscription()
  allData: inventoried_invoices[] = []
  @ViewChild('openInfoModel') openInfoModel!: ElementRef;
  singleProductReviewerFilter!: FormGroup
  TotalProductsCount: number = 0
  reviewedInvoices: reviewedInvoices[] = []

  columnsArray: columnHeaders[] = [
    {
      name: 'مسلسل ',
    },
    {
      name: 'التاريخ والوقت',
    },
    {
      name: ' اسم العميل',
    },
    {
      name: ' رقم الأذن',
    },
    {
      name: ' اجمالي عدد الأصناف',
    },
    {
      name: 'المراجع',
    },
    {
      name: 'عرض محتويات الطلب',
    }
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'serial',
      type: 'normal'
    },
    {
      name: 'date_and_time',
      type: 'normal'
    },
    {
      name: 'client_name',
      type: 'normal'
    },
    {
      name: 'order_number',
      type: 'normal'
    },
    {
      name: 'items_count',
      type: 'normal'
    },
    {
      name: 'reviewer',
      type: 'normal'
    },
    {
      name: 'reviewer',
      type: 'eyeIcon'
    }
  ]



  popUpColumns = [
    { field: 'type_name', header: ' اسم الصنف', type: 'normal' },
    { field: 'quantity', header: 'الكمية ', type: 'normal' },
    { field: 'price', header: 'السعر', type: 'normal' },
    { field: 'exp', header: ' التاريخ والتشغيلة', type: 'normal' },
  ];

  popUpData = []
  containsBulk: boolean;

  constructor(private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    public toggleModal: ToggleModal) {
    this.containsBulk = this.activatedRoute.snapshot.url.join('/').includes('bulk');

  }


  ngOnInit(): void {
    this.singleProductReviewerFilter = this.fb.group({
      invoice_number: [ '' ],
      created_at: [ '' ],
      pharmacy_id: [ '' ],
      auditor_id: [ '' ]
    })

    this.singleProductReviewerFilter.controls[ 'created_at' ].setValue(new Date, 'YYYY-MM-DD')
    const formattedDate = datePipe.transform(new Date(this.singleProductReviewerFilter.controls[ 'created_at' ].value), 'yyyy-MM-dd');
    this.getData()
    this.getReviewedInvoices(formattedDate)
  }



  openDetailsModal(invoice_id: any) {

    if (!this.containsBulk) {
      this.router.navigate([ '/warehouse/products-sales-reviewer/single-reviewed-details/', invoice_id ]);
    } else {
      this.router.navigate([ '/warehouse/products-sales-reviewer/bulk-reviewed-details/', invoice_id ]);
    }

  }

  getReviewedInvoices(date: any) {
    let url
    if (!this.containsBulk) {
      url = 'warehouses/orders/retail/listing-reviewed'
    } else {
      url = 'warehouses/orders/bulk/listing-reviewed'

    }
    let dateFilter = {
      created_at: date
    }

    this.subs.add(this.http.getReq(url, { params: dateFilter }).subscribe({
      next: res => {
        this.allData = res.data
        this.reviewedInvoices = []
        this.TotalProductsCount = 0
        this.serial = 1


      }, complete: () => {
        this.allData.forEach((element: any) => {
          this.TotalProductsCount = this.TotalProductsCount + element.total_quantity
          this.reviewedInvoices.push(
            {
              'serial': this.serial,
              'show_order_content': 'عرض محتويات الطلب',
              'items_count': element.total_quantity,
              'date_and_time': element.completed_at,
              'reviewer': element?.invoice?.printed_by?.name,
              'client_name': element?.pharmacy?.name,
              'order_number': element.order_number,
              'invoice_id': element.id

            }
          )
          this.serial++
        });
      }
    }))
  }
  reviewers: receiversAuditor[] = []
  pharmacies: pharmacie[] = []
  groupPharmacied: groupedPharmacy[] = []
  getData() {
    if (!this.containsBulk) {
      let tempArr:any=[
        'retail_sales_auditors',
       ]
  
    this.generalService.getDropdownData(tempArr).subscribe({
      next: res => {
        this.reviewers = res.data.retail_sales_auditors
      }
    })


    }


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
  serial: number = 1
  filter() {
    let addParams = false
    let params: any = {};
    for (const key in this.singleProductReviewerFilter.value) {
      const value = this.singleProductReviewerFilter.value[ key ];
      if (value !== null && value !== undefined && value !== '') {
        params[ key ] = value;
        addParams = true
      }
    }
    if (params[ 'created_at' ]) {
      params[ 'created_at' ] = datePipe.transform(this.singleProductReviewerFilter.controls[ 'created_at' ].value, 'yyyy-MM-dd')
    }

    let url = ''
    if (!this.containsBulk) {
      url = 'warehouses/orders/retail/listing-reviewed'
    } else {
      url = 'warehouses/orders/bulk/listing-reviewed'

    }
    this.subs.add(this.http.getReq(url, { params: params }).subscribe({
      next: res => {
        this.allData = res.data
        this.reviewedInvoices = []
        this.TotalProductsCount = 0
        this.serial = 1

      }, complete: () => {
        this.allData.forEach((element: any) => {
          this.TotalProductsCount = this.TotalProductsCount + element.total_quantity
          this.reviewedInvoices.push(
            {
              'serial': this.serial,
              'show_order_content': 'عرض محتويات الطلب',
              'items_count': element.total_quantity,
              'date_and_time': element.completed_at,
              'reviewer': element?.invoice?.printed_by.name,
              'client_name': element.pharmacy.name,
              'order_number': element.id,
              'invoice_id': element.id
            }
          )
          this.serial++
        });
      }
    }))

  }

}