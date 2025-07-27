import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Pipe,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cart, totalData } from '@models/cart';
import { HttpService } from '@services/http.service';
import { Subscription, catchError, find, of, switchMap } from 'rxjs';
import { invoiceService } from '@services/invoice.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { client } from '../../../core/models/client';
import { DatePipe } from '@angular/common';
import { LooseObject } from '@models/LooseObject';
import { Paginator } from 'primeng/paginator';
import { SkeletonLoadingService } from '@services/skeleton-loading.service';
import { GeneralService } from '@services/general.service';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { commonObject } from '@models/settign-enums';
import { FixedDataService } from '@services/fixed-data.service';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AllOrdersComponent implements OnInit {
  collectionsize = 12;
  page = 1;
  options = [
    { id: '0', name: 'نقدي' },
    { id: '1', name: 'أسبوعي' },
    { id: '2', name: 'شهري' },
  ];
  cartData: any = [];
  totals: totalData = {} as totalData;
  orders: any = [];
  data: any[] = [];

  columnsArray: columnHeaders[] = [
    {
      name: ' رقم الأذن ',
    },
    {
      name: 'تاريخ التسجيل',
    },
    {
      name: 'اسم العميل',
    },
    {
      name: 'الاجمالي',
    },
    {
      name: 'حالة الطلب',
    },
    {
      name: 'مندوب البيع',
    },
    {
      name: ' تاريخ الخروج ',
    },
    {
      name: ' الموزع ',
    },
    {
      name: ' المندوب الكاتب ',
    },
    {
      name: 'أمر',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'order_number',
      type: 'openInvoiceDetails',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'total',
      type: 'normal',
    },
    {
      name: 'status',
      type: 'normal',
    },
    {
      name: 'sales',
      type: 'normal',
    },
    {
      name: 'created_at1',
      type: 'normal',
    },
    {
      name: 'delivery_name',
      type: 'normal',
    },
    {
      name: 'created_by_name',
      type: 'normal',
    },
    {
      name: 'edit',
      type: 'blueEdit',
    },
  ];

  columnsArrayPopup: columnHeaders[] = [
    {
      name: ' الاسم عربي ',
      sort: true,
      direction: null,
    },
    {
      name: ' الصلاحية والتشغيلة',
    },
    {
      name: 'الكمية	',
    },
    {
      name: 'البونص	',
    },
    {
      name: 'السعر',
    },
    {
      name: 'الضريبة	',
    },
    {
      name: ' الخصم ',
    },
    {
      name: ' خصم المندوب ',
    },
    {
      name: ' فرق خصم المندوب ',
    },
    {
      name: ' الاجمالي ',
    },
  ];
  columnsNamePopup: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'expired_at',
      type: 'with_br_expiredAt',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'bonus',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'highlight_price',
    },
    {
      name: 'taxes',
      type: 'normal',
    },
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'client_discount',
      type: 'normal',
    },
    {
      name: 'client_discount_difference',
      type: 'normal',
    },
    {
      name: 'total',
      type: 'normal',
    },
  ];

  constructor(
    private http: HttpService,
    private router: Router,
    private invoiceService: invoiceService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private fixed_data: FixedDataService
  ) {
    this.router.navigate([], {
      queryParams: { page: 1 },
      queryParamsHandling: 'merge',
    });
  }
  ngOnInit() {
    this.filterForm = this.fb.group({
      order_number: [''],
      from: [''],
      to: [''],
      code: [''],
      pharmacy_id: [''],
      created_by: [''],
      city_id: [''],
      area_id: [''],
      track_id: [''],
      warehouse_id: [''],
      payment_type: [''],
      delivery_id: [''],
      sales_id: [''],
    });

    this.getallFilterData();

    this.subs.add(
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
            this.allOrdersArray = res.data;
            this.data = [];
            this.fillData();
            this.invoiceCart = res.data;
            this.totalItems = res.meta.total;
            this.rows = res.meta.per_page;
          },
        })
    );
  }
  paginateOrders(event: any) {}
  fillData() {
    this.data = [];
    this.allOrdersArray.forEach((element: any) => {
      this.data.push({
        order_number: element.order_number,
        id: element.id,
        pharmacy_id: element.pharmacy.id,
        order_status: element.order_status,
        created_at: element.created_at,
        name: element?.client?.name + ' ' + element?.pharmacy?.name,
        total: element?.total_price,
        status: element?.status.name,
        sales: element?.sales?.name,
        created_at1: element?.delivery_received_at,
        delivery_name: element?.delivery?.name,
        created_by_name: element?.created_by?.name,
        edit: 'تعديل',
      });
    });
  }
  sortData: any;
  sortEvent(sortData: any) {
    this.sortData = sortData;
    this.getInvoiceData(
      this.selectedPharmacyId,
      this.selectedInvoiceId,
      this.sortData
    );
  }

  clientsId: any;
  clientCode: any;
  citiesID: any;
  areaID: any;
  tracksID: any;
  warehousesId: any;
  deliveryID: any;
  salesID: any;
  clientName: any;
  date: any;
  time: any;
  formattedDateTo: any;
  formattedDateFrom: any;
  groupPharmacied: any = [];
  payment_type: commonObject[] = [];
  getallFilterData() {
    let clients: any = [];
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          this.clientCode = res.data;
          this.clientName = res.data;
          clients = res.data;
          clients.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacied.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
                client_id: client?.name,
              });
            });
          });
        },
      })
    );

    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.citiesID = res.data;
        },
      })
    );

    this.subs.add(
      this.generalService.getTracks().subscribe({
        next: (res) => {
          this.tracksID = res.data;
        },
      })
    );
    let params = ['warehouses', 'deliveries'];
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.warehousesId = res.data.warehouses;
          this.deliveryID = res.data.deliveries;
        },
      })
    );

    // this.subs.add(this.http.getReq('users/delivers').subscribe({
    //   next: res => {
    //     this.deliveryID = res.data
    //   }
    // }))

    this.subs.add(
      this.fixed_data.getAllFixedData().subscribe({
        next: (res) => {
          this.payment_type = res.data.payment_types;
        },
      })
    );

    this.subs.add(
      this.generalService.getUsers().subscribe({
        next: (res) => {
          this.salesID = res.data;
        },
      })
    );
  }
  areaDataID: any;
  getArea(event: any) {
    this.areaDataID = event.value;
    let param = {
      city_id: this.areaDataID,
    };
    if (this.areaDataID) {
      this.subs.add(
        this.generalService.getCity(param).subscribe({
          next: (res) => {
            this.areaID = res.data[0].areas;
          },
        })
      );
    } else {
      this.areaID = [];
    }
  }
  clientID: any;
  clientCodeNumber: any;
  client: client = {} as client;

  getclientCode(event: any) {
    this.clientID = event.value;

    this.clientCodeNumber = this.clientCode[this.clientID - 1];
    this.filterForm.controls['code'].setValue(this.clientCodeNumber);
  }

  clientCodeText: string = '';
  clientIDSelect: any;
  SelectedID: any;

  getclientDrop(param: string, dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.getClientidFromCode(param);
      dropdown?.close();
    }
  }

  getClientidFromCode(param: string, e?: any) {
    let params;
    if (param == 'code' && this.filterForm.controls['code'].value) {
      let clientCode: string = String(this.filterForm.controls['code'].value);
      params = {
        code: clientCode,
      };
      this.filterForm.controls['pharmacy_id'].setValue(null);
    } else if (
      param == 'clientId' &&
      this.filterForm.controls['pharmacy_id'].value
    ) {
      params = { id: this.filterForm.controls['pharmacy_id'].value };
      this.filterForm.controls['code'].setValue('');
    }
    if (params) {
      this.subs.add(
        this.http.getReq('pharmacies/view', { params: params }).subscribe({
          next: (res) => {
            this.client = res.data;
            if (param == 'code' && this.filterForm.controls['code'].value) {
              this.filterForm.controls['pharmacy_id'].setValue(res.data.id);
            }
            if (this.client?.code)
              this.filterForm.controls['code'].setValue(
                String(this.client?.code)
              );
            else this.filterForm.controls['pharmacy_id'].setValue(null);
          },
        })
      );
    } else {
      this.filterForm.controls['pharmacy_id'].setValue(null);
      this.filterForm.controls['code '].setValue('');
    }
  }

  submitForm() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
    this.allOrdersArray = [];
    this.invoiceCart = [];
    this.data = [];
    this.fillData();
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from' || key == 'to') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }

    if (this.currentPageIndex) {
      queryParams['page'] = this.currentPageIndex;
    }
    if (this.sortData) {
      queryParams['sort_by'] = this.sortData.name;
      queryParams['direction'] = this.sortData.direction;
    }
    return queryParams;
  }
  @ViewChild('paginator') paginator!: Paginator;

  resetForm() {
    this.filterForm.reset();
    this.allOrdersArray = [];
    this.paginator.changePage(0);
    this.paginator.updatePageLinks();
    this.getAllOrdersData();
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  private subs = new Subscription();
  filterForm!: FormGroup;
  allOrdersArray: any[] = [];
  items = [];
  currentPage: any;
  totalPages: any[] = [];

  currentPageIndex!: number;
  rows: any;
  totalItems: any;

  invoiceCart: cart[] = [];

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    x['sort_by'] = 'created_at';
    x['direction'] = 'DESC';
    const formValue = this.filterForm.value;

    for (const key in formValue) {
      const value = this.filterForm.value[key];
      if (
        formValue.hasOwnProperty(key) &&
        value != '' &&
        value != null &&
        value != undefined
      ) {
        if (key == 'from' || key == 'to') {
          x[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          x[key] = value;
        }
      }
    }

    let getUrl = 'orders';

    return this.http.getReq(getUrl, { params: x });
  }

  getAllOrdersData() {
    let getUrl = 'orders';

    this.subs.add(
      this.http.getReq(getUrl).subscribe({
        next: (res) => {
          this.allOrdersArray = [];
          this.invoiceCart = [];

          this.allOrdersArray = res.data;
          this.fillData();
          this.invoiceCart = res.data;
          this.totalItems = res.meta.total;
          this.rows = res.meta.per_page;
        },
      })
    );
  }

  @ViewChild('invoiceDetailsModel')
  invoiceDetailsModel!: ElementRef<HTMLElement>;
  selectedPharmacyId!: number;
  selectedInvoiceId!: number;
  openInvoiceDetailsModel(pharmacyId: number, invoiceId: number) {
    let el: HTMLElement = this.invoiceDetailsModel.nativeElement;
    el.click();
    this.selectedPharmacyId = pharmacyId;
    this.selectedInvoiceId = invoiceId;
    this.getInvoiceData(pharmacyId, invoiceId);
  }

  extra_discount: any;
  ClientType: any;
  getInvoiceData(pharmacyId: number, invoiceId: number, sortData?: any) {
    let body: any = {
      id: invoiceId,
      pharmacy_id: pharmacyId,
      direction: 'DESC',
    };
    if (sortData) {
      body['sort_by'] = this.sortData.name;
      body['direction'] = this.sortData.direction;
    }
    this.subs.add(
      this.http.getReq('orders/invoice-content', { params: body }).subscribe({
        next: (res) => {
          this.cartData = [];
          res.data.cart.forEach((cartItem: any) => {
            this.cartData.push({
              product_name: cartItem.product_name,
              expired_at: cartItem.expired_at,
              operating_number: cartItem.operating_number,
              quantity: cartItem.quantity,
              bonus: cartItem.bonus,
              price: cartItem.price,
              taxes: cartItem.taxes,
              discount: cartItem.discount,
              client_discount_difference: cartItem.client_discount_difference,
              client_discount:
                cartItem.client_discount_difference == 0
                  ? 0
                  : cartItem.discount - cartItem.client_discount_difference,
              total: cartItem.total,
              price_color: cartItem.price_color,
              rowColor: cartItem?.color,
            });
          });
          this.extra_discount = res.data.extra_discount;
          this.totals = res.additional_data.totals;
          this.ClientType = res?.data?.client?.type_value;
          if (this.ClientType != 1) {
            this.columnsArrayPopup.splice(7, 1);
            this.columnsNamePopup.splice(7, 1);
            this.columnsArrayPopup.splice(7, 1);
            this.columnsNamePopup.splice(7, 1);
          } else {
            let index = this.columnsNamePopup.findIndex(
              (c: any) => c.name == 'client_discount'
            );
            if (index == -1) {
              this.columnsArrayPopup.splice(7, 0, { name: ' خصم المندوب ' });
              this.columnsArrayPopup.splice(8, 0, {
                name: ' فرق خصم المندوب ',
              });
              this.columnsNamePopup.splice(7, 0, {
                name: 'client_discount',
                type: 'normal',
              });
              this.columnsNamePopup.splice(8, 0, {
                name: 'client_discount_difference',
                type: 'normal',
              });
            }
          }
        },
      })
    );
  }

  changePage(event: any) {
    this.currentPageIndex = event.page + 1;
    this.allOrdersArray = [];
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }
  goToInvoice(i: number) {
    const index = this.allOrdersArray.findIndex((c) => c.id === i);
    if (index > -1) {
      this.invoiceService.setInvoiceCart(this.invoiceCart[index]);
    }
    setTimeout(() => {
      this.router.navigate(['/sales-admin/orders/register-request']);
    }, 1000);
  }

  openInvoiceDetails(event: any) {
    this.openInvoiceDetailsModel(event.pharmacyId, event.orderNumber);
  }
  editOrder(event: any) {
    this.goToInvoice(event);
  }
}
