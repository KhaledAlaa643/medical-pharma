import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue, colSpanArray } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-customer-account-statement',
  templateUrl: './customer-account-statement.component.html',
  styleUrls: ['./customer-account-statement.component.scss'],
})
export class CustomerAccountStatementComponent {
  private subscription = new Subscription();
  pharmacies: supplier[] = [];
  pharmacy: supplier = {} as supplier;
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم القيد',
    },
    {
      name: 'البيان',
    },
    {
      name: 'التاريخ  ',
    },
    {
      name: 'مدين ',
    },
    {
      name: 'دائن',
    },
    {
      name: 'مدين',
    },
    {
      name: 'دائن',
    },
    {
      name: 'مدين',
    },
    {
      name: 'دائن',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'id',
      type: 'normal',
    },
    {
      name: 'type',
      type: 'ClickableBlueItem',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'amount_debit',
      type: 'normal',
    },
    {
      name: 'amount_credit',
      type: 'normal',
    },

    {
      name: 'balance_before_debit',
      type: 'normal',
    },
    {
      name: 'balance_before_credit',
      type: 'normal',
    },
    {
      name: 'balance_after_debit',
      type: 'normal',
    },
    {
      name: 'balance_after_credit',
      type: 'normal',
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
      name: 'name',
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
  columnsArrayPopup2: columnHeaders[] = [
    {
      name: ' رقم امر الشراء ',
    },
    {
      name: ' اسم المورد',
    },
    {
      name: 'تاريخ الطلب	',
    },
    {
      name: 'عدد الأصناف	',
    },
    {
      name: 'الاجمالي',
    },
    {
      name: 'الكاتب	',
    },
    {
      name: ' حالة الطلب ',
    },
    {
      name: ' رقم فاتورة التحويل ',
    },
  ];
  columnsNamePopup2: ColumnValue[] = [
    {
      name: 'name',
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
  ];
  colSpanArray: colSpanArray[] = [
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 2,
      name: 'الحركات الحالية',
    },
    {
      colSpan: 2,
      name: 'الحساب السابق',
    },
    {
      colSpan: 2,
      name: 'رصيد اخر المدة',
    },
  ];
  data: any;
  popupdata: any = [];
  popupdata2: any;

  rows!: number;
  page: number = 1;
  total!: number;
  filterForm!: FormGroup;
  pharmacy_id!: number;
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private generalService: GeneralService,
    private fb: FormBuilder,
    private http: HttpService,
    private printService: PrintService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getDropdownData();

    this.filterForm = this.fb.group({
      pharmacy_id: [''],
      code: [''],
      status: [false],
      from: [datePipe.transform(this.auth.getEnums().dates.from, 'yyyy-MM-dd')],
      to: [datePipe.transform(this.auth.getEnums().dates.to, 'yyyy-MM-dd')],
      type: [''],
    });
    this.pharmacy_id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    if (this.pharmacy_id) {
      this.filterForm.controls['pharmacy_id'].setValue(this.pharmacy_id);
      this.pharmacy.id = this.pharmacy_id;
      this.getUpdatedQueryParams(true);
    }
  }

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    this.getUpdatedQueryParams(true);
  }

  changeCurrentpage(event: any) {
    this.page = event.page + 1;
    this.getUpdatedQueryParams(true);
  }

  current_balance: number = 0;
  total_credit: number = 0;
  total_debit: number = 0;
  selected_types: [] = [];
  getUpdatedQueryParams(paginated?: boolean) {
    let queryParams: any = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from' || key == 'to') {
          if (this.filterForm.controls['status'].value != true) {
            queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
          }
        } else if (key != 'type' && key != 'status') {
          queryParams[key] = value;
        }
      }
    }

    if (this.selected_types) {
      this.selected_types.forEach((item: any, index: any) => {
        queryParams[`types[${index}]`] = item;
      });
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'accounting/client-volume';
    } else {
      getUrl = 'accounting/client-volume/all';
    }

    this.subscription.add(
      this.http.getReq(getUrl, { params: queryParams }).subscribe({
        next: (res) => {
          // this.data = []
          this.getData(res.data, Boolean(paginated));
          this.current_balance = res.additional_data.current_balance;
          this.total_credit = res.additional_data.total_credit;
          this.total_debit = res.additional_data.total_debit;

          this.total = res.meta.total;
          this.rows = res.meta.per_page;
        },
        complete: () => {},
      })
    );

    // return queryParams;
  }

  //printing
  allPrintData: any = [];
  currentParams: any = {};
  getAllOrders(printType: any) {
    this.getUpdatedQueryParams(false);
    let tempColumnsArray = this.columnsArray.filter(
      (column) => column.name.trim() !== 'أمر'
    );
    let tempColumnsName = this.columnsName.filter(
      (column) => column.name.trim() !== 'options'
    );
    this.printService.setColumnsArray(tempColumnsArray);
    this.printService.setColumnsNames(tempColumnsName);
    this.printService.setRowsData(this.allPrintData);
    if (printType == 1) {
      this.printService.downloadPDF();
    } else {
      this.printService.downloadCSV();
    }
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((request: any) => {
      tempArr.push({
        id: request.id,
        type: request.type.name,
        type_value: request.type.value,
        created_at: request.created_at,
        amount_debit: request.amount_debit,
        amount_credit: request.amount_credit,
        balance_before_debit: request.balance_before_debit,
        balance_before_credit: request.balance_before_credit,
        balance_after_debit: request.balance_after_debit,
        balance_after_credit: request.balance_after_credit,
        subject_id: request.subject_id,
      });
    });

    if (pagiated == true) {
      this.data = tempArr;
    } else {
      this.allPrintData = tempArr;
    }
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type);
    } else {
      let tempColumnsArray = this.columnsArray.filter(
        (column) => column.name.trim() !== 'أمر'
      );
      let tempColumnsName = this.columnsName.filter(
        (column) => column.name.trim() !== 'options'
      );
      this.printService.setColumnsArray(tempColumnsArray);
      this.printService.setColumnsNames(tempColumnsName);
      this.printService.setRowsData(this.data);

      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
    }

    setTimeout(() => {
      this.openModal();
    }, 100);
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
  types: commonObject[] = [];
  getDropdownData() {
    //suppliers
    this.subscription.add(
      this.generalService.getDropdownData(['pharmacies']).subscribe({
        next: (res) => {
          this.pharmacies = res.data.pharmacies;
        },
      })
    );
    //suppliers
    this.types = this.auth.getEnums().supplier_historiy_types;
  }
  popupType!: number;
  @ViewChild('OpendetailsPopup') OpendetailsPopup!: ElementRef<HTMLElement>;
  current_id!: number;
  openDetailsModal(event: any) {
    this.popupType = event.type;
    this.current_id = event.id;
    let el: HTMLElement = this.OpendetailsPopup.nativeElement;
    el.click();
    if (this.popupType == 1) {
      this.columnsArrayPopup = [
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
          name: ' خصم اضافي ',
        },
        {
          name: ' خصم المندوب ',
        },
        {
          name: ' فرق المندوب ',
        },
        {
          name: ' الصافي بعد الخصم ',
        },
        {
          name: ' الصافي ',
        },
      ];
      this.columnsNamePopup = [
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
          name: 'extra_discount',
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
          name: 'total_after_client_discount',
          type: 'normal',
        },
        {
          name: 'total',
          type: 'normal',
        },
      ];
      this.getSalesDetails(this.current_id);
    } else if (this.popupType == 2) {
      this.columnsArrayPopup = [
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
          name: ' الاجمالي ',
        },
        {
          name: ' سبب المرتجع ',
        },
        {
          name: ' حالة المرتجع ',
        },
      ];
      this.columnsNamePopup = [
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
          name: 'total',
          type: 'normal',
        },
        {
          name: 'reason',
          type: 'normal',
        },
        {
          name: 'status',
          type: 'status',
        },
      ];
      this.getReturnSalesDetails(this.current_id);
    } else if (this.popupType == 3) {
      this.columnsArrayPopup = [
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
          name: 'السعر',
        },
        {
          name: ' الخصم ',
        },
        {
          name: ' الضريبة ',
        },
        {
          name: ' الصافى ',
        },
        {
          name: ' الملاحظات ',
        },
        {
          name: ' الكاتب ',
        },
      ];
      this.columnsNamePopup = [
        {
          name: 'name_ar',
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
          name: 'price',
          type: 'highlight_price',
        },

        {
          name: 'discount',
          type: 'normal',
        },

        {
          name: 'taxes',
          type: 'normal',
        },
        {
          name: 'total',
          type: 'normal',
        },
        {
          name: 'note',
          type: 'normal',
        },
        {
          name: 'created_by',
          type: 'normal',
        },
      ];
      this.getPurchaseDetails(this.current_id);
    } else if (this.popupType == 4) {
      this.columnsArrayPopup = [
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
          name: 'السعر',
        },
        {
          name: ' الخصم ',
        },
        {
          name: ' الضريبة ',
        },
        {
          name: ' الصافى ',
        },
        {
          name: ' الملاحظات ',
        },
        {
          name: ' الكاتب ',
        },
        {
          name: 'سبب المرتجع ',
        },
      ];
      this.columnsNamePopup = [
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
          name: 'price',
          type: 'highlight_price',
        },

        {
          name: 'discount',
          type: 'normal',
        },

        {
          name: 'taxes',
          type: 'normal',
        },
        {
          name: 'total',
          type: 'normal',
        },
        {
          name: 'note',
          type: 'normal',
        },
        {
          name: 'created_by',
          type: 'normal',
        },
        {
          name: 'reason',
          type: 'normal',
        },
      ];
      this.getReturnPurchaseDetails(this.current_id);
    }
  }
  totals: any;
  getSalesDetails(id: number, sortData?: any) {
    let params: any = {
      id: id,
    };
    if (sortData) {
      params['sort_by'] = sortData.name;
      params['direction'] = sortData.direction;
    }
    this.subscription.add(
      this.http
        .getReq('accounting/client-volume/get-order', { params: params })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.popupdata = [];
            res.data.cart.forEach((cartItem: any) => {
              this.popupdata.push({
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
                extra_discount: cartItem.extra_discount,
                price_color: cartItem.price_color,
                total_after_client_discount:
                  cartItem.total_after_client_discount,
                rowColor: cartItem?.color,
              });
            });
            this.totals = res.additional_data.totals;
            // let ClientType = res?.data?.client?.type_value;
            // if (ClientType != 1) {
            //   this.columnsArrayPopup.splice(7, 1);
            //   this.columnsNamePopup.splice(7, 1);
            //   this.columnsArrayPopup.splice(7, 1);
            //   this.columnsNamePopup.splice(7, 1);
            // } else {
            //   let index = this.columnsNamePopup.findIndex(
            //     (c: any) => c.name == 'client_discount'
            //   );
            //   if (index == -1) {
            //     this.columnsArrayPopup.splice(7, 0, { name: ' خصم المندوب ' });
            //     this.columnsArrayPopup.splice(8, 0, {
            //       name: ' فرق خصم المندوب ',
            //     });
            //     this.columnsNamePopup.splice(7, 0, {
            //       name: 'client_discount',
            //       type: 'normal',
            //     });
            //     this.columnsNamePopup.splice(8, 0, {
            //       name: 'client_discount_difference',
            //       type: 'normal',
            //     });
            //   }
            // }
          },
        })
    );
  }
  getReturnSalesDetails(id: number, sortData?: any) {
    let params: any = {
      return_id: id,
    };
    if (sortData) {
      params['sort_by'] = sortData.name;
      params['direction'] = sortData.direction;
    }
    this.subscription.add(
      this.http
        .getReq('accounting/client-volume/get-return', { params: params })
        .subscribe({
          next: (res) => {
            this.totals = res.additional_data;
            console.log(this.totals);
            this.popupdata = [];
            res.data.returnables.forEach((returnable: any) => {
              this.popupdata.push({
                product_name: returnable?.product_name,
                expired_at: returnable?.expired_at,
                operating_number: returnable?.operating_number,
                quantity: returnable?.quantity,
                price: returnable?.price,
                discount: returnable?.discount,
                total: returnable?.total,
                taxes:
                  returnable?.price *
                  returnable?.quantity *
                  (returnable?.taxes / 100),
                bonus: res.data.cart_bonus,
                reason: returnable?.reason.name,
                status: returnable.status.name,
              });
            });
          },
        })
    );
  }
  getPurchaseDetails(id: number, sortData?: any) {
    let params: any = {
      purchase_id: id,
    };
    if (sortData) {
      params['sort_by'] = sortData.name;
      params['direction'] = sortData.direction;
    }
    this.subscription.add(
      this.http
        .getReq('accounting/client-volume/get-purchase', { params: params })
        .subscribe({
          next: (res) => {
            this.popupdata = [];
            this.totals = {
              last_balance: res.data.last_balance,
              total_price: res.data.total_price,
              current_balance: res.data.current_balance,
              ...res.additional_data,
            };
            res.additional_data;
            res.data.cart.forEach((cart: any) => {
              this.popupdata.push({
                name_ar: cart?.product.name,
                expired_at: cart?.expired_at,
                operating_number: cart?.operating_number,
                quantity: cart?.quantity,
                price: cart?.public_price,
                discount: cart?.discount,
                taxes: cart?.taxes,
                total: cart?.subtotal,
                note: cart?.note,
                created_by: cart?.created_by?.name,
              });
            });
          },
        })
    );
  }
  getReturnPurchaseDetails(id: number, sortData?: any) {
    let params: any = {
      purchases_return_id: id,
    };
    if (sortData) {
      params['sort_by'] = sortData.name;
      params['direction'] = sortData.direction;
    }
    this.subscription.add(
      this.http
        .getReq('accounting/client-volume/get-purchase-return', {
          params: params,
        })
        .subscribe({
          next: (res) => {
            this.totals = {
              total_products: res.data[0].total_returned_items,
              total_price: res.data[0].purchase.total_price,
              ...res.additional_data,
            };
            this.popupdata = [];
            res.data[0].returned_items.forEach((returnable: any) => {
              this.popupdata.push({
                product_name: returnable?.return[0].product_name,
                expired_at: returnable.expired_at,
                operating_number: returnable.operating_number,
                quantity: returnable?.return[0].quantity,
                discount: returnable?.discount,
                price: returnable?.public_price,
                total: returnable?.total,
                taxes: returnable?.taxes,
                note: returnable?.note,
                created_by: res.data[0].created_by?.name,
                reason: returnable?.return[0].reason.name,
              });
            });
          },
        })
    );
  }

  sort(event: any) {
    if (this.popupType == 1) {
      this.getSalesDetails(this.current_id, event);
    } else if (this.popupType == 2) {
      this.getReturnSalesDetails(this.current_id, event);
    } else if (this.popupType == 3) {
      this.getPurchaseDetails(this.current_id, event);
    } else if (this.popupType == 4) {
      this.getReturnPurchaseDetails(this.current_id, event);
    }
  }
}
