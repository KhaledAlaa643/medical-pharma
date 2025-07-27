import { DatePipe } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { supplier } from '@models/suppliers';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface CommonParams {
  from: string;
  to: string;
  client_code: any;
  supplier_code: any;
  client_id: any;
  supplier_id: any;
  pharmacy_id: any;
  type?: any;
  pagination_number?: number;
  [key: string]: any;
}

@Component({
  selector: 'app-transaction-volume-cash',
  templateUrl: './transaction-volume-cash.component.html',
  styleUrls: ['./transaction-volume-cash.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class TransactionVolumeCashComponent implements OnInit, OnDestroy {
  clientID: any;
  clientCode: any;

  clientDataForm!: FormGroup;
  isDataAvailable: boolean = true;
  activeTab: number = 0;
  isActiveTapArray: boolean[] = Array(6).fill(false);
  private subs = new Subscription();
  clientsData: any = [];
  pharmaciesData: any = [];
  cashPaymentData: any = [];
  cashRecievedData: any = [];
  balanceRecievedData: any = [];
  balanceTransferredData: any = [];

  formattedDateTo: any;
  formattedDateFrom: any;
  dateTo: any;
  datefrom: any;

  reportData: any = [];
  ReportDataLowerArea: any = [];

  ReportOweData: any = [];
  ReportOweDataLowerArea: any = [];
  currentPageIndexCashPayment: any;

  currentPageIndexCashRecieve: any;
  currentPageIndexSales: any;
  currentPageIndexSalesReturns: any;
  salesData: any = [];
  returnsSalesData: any = [];

  currentPageIndexPurchases: any;

  currentPageIndexReturnPurchases!: number;
  purchaseData: any;

  currentPageIndexPurchasesReturns: any;
  purchaseReturnData!: any;
  purchaseReturnCurrentPage!: number;
  currentPageIndexNotificationDiscount!: number;
  currentPageIndexNotificationAddition!: number;
  notificationDisountData: any;
  NotifiationAdditionData!: any;
  client!: any;

  BalanceReceivedData: any;
  currentPageIndexBalanceTransferred: any;
  currentPageIndexBalanceRecieved: any;
  pharmacies: any;
  selectedPharmacy: any;
  selectedClient: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: HttpService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService
  ) {
    this.router.navigate([], {
      queryParams: {
        cash_payment_page: null,
        cash_recieve_page: null,
        sales_page: null,
        returns_sales_page: null,
        transaction_page: null,
        returns_transaction_page: null,
        notification_discount: null,
        notification_addition: null,
        balance_recieved_page: null,
        balance_transered_page: null,

        client_id: null,
        pharmacy_id: null,
        to: null,
        from: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  previousParam1: number | null = null;
  previousParam2: number | null = null;
  previousParam3: number | null = null;
  previousParam4: number | null = null;
  previousParam5: number | null = null;
  previousParam6: number | null = null;
  previousParam7: number | null = null;
  previousParam8: number | null = null;
  previousParam9: number | null = null;
  previousParam10: number | null = null;

  pageCashPayment = 1;
  pageCashRecieved = 1;
  pageSales = 1;
  pageReturnsSales = 1;
  pagePurchase = 1;
  pagePurchaseReturns = 1;
  pageNotificationDiscount = 1;
  pageNotificationAddition = 1;
  pageBalanceTransferred = 1;
  pageBalanceReceived = 1;

  dateFrom: any;

  pharmacyId?: number;

  getDate() {
    // this.generalService.getSettingsEnum().subscribe({
    //   next:res => {
    //     this.dateFrom=res.data.sales_report.from
    //     this.dateTo=res.data.sales_report.to
    //   },complete:()=> {

    //   }
    // })
    this.dateFrom = this.auth.getEnums().sales_report.from;
    this.dateTo = this.auth.getEnums().sales_report.to;

    this.clientDataForm.controls['from'].setValue(
      datePipe.transform(this.dateFrom, 'yyyy-MM-dd')
    );
    this.clientDataForm.controls['to'].setValue(
      datePipe.transform(this.dateTo, 'yyyy-MM-dd')
    );
  }
  supplier_reports!: boolean;
  ngOnInit() {
    if (this.router.url.includes('/supplier-transaction-volume-cash')) {
      this.supplier_reports = true;
      this.getSuppliers();
    } else {
      this.supplier_reports = false;
    }
    this.clientDataForm = this.fb.group({
      client_code: [''],
      supplier_code: [''],
      client_id: [''],
      supplier_id: [''],
      pharmacy_id: [''],
      from: [''],
      to: [''],
    });
    this.getDate();

    this.pharmacyId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    this.getClientData();
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params.hasOwnProperty('cash_payment_page')) {
        const previousParam1 = this.previousParam1;
        const currentParam1 = params['cash_payment_page'];
        const currentClientIdPayment = params['client_id'];
        const currentSupplierIdPayment = params['supplier_id'];
        if (
          previousParam1 !== currentParam1 ||
          currentClientIdPayment != null ||
          currentSupplierIdPayment != null
        ) {
          this.previousParam1 = currentParam1;
          this.pageCashPayment = +params['cash_payment_page'] || 1;
          this.transactionCashPayment(params, this.pageCashPayment); //
        }
      }
      if (params.hasOwnProperty('cash_recieve_page')) {
        const previousParam2 = this.previousParam2;
        const currentParam2 = params['cash_recieve_page'];
        const currentClientIdRecieved = params['client_id'];
        const currentSupplierIdRecieved = params['supplier_id'];
        if (
          previousParam2 !== currentParam2 ||
          currentClientIdRecieved != null ||
          currentSupplierIdRecieved != null
        ) {
          this.previousParam2 = currentParam2;
          this.pageCashRecieved = +params['cash_recieve_page'] || 1;
          this.transactionCashRecieved(params, this.pageCashRecieved);
        }
      }
      if (params.hasOwnProperty('sales_page')) {
        const previousParam3 = this.previousParam3;
        const currentParam3 = params['sales_page'];
        const currentClientIdRecieved = params['client_id'];
        const currentSupplierIdRecieved = params['supplier_id'];
        if (
          previousParam3 !== currentParam3 ||
          currentClientIdRecieved != null ||
          currentSupplierIdRecieved != null
        ) {
          this.previousParam3 = currentParam3;
          this.pageSales = +params['sales_page'] || 1;
          this.transactionSales(params, this.pageSales);
        }
      }
      if (params.hasOwnProperty('returns_sales_page')) {
        const previousParam4 = this.previousParam4;
        const currentParam4 = params['returns_sales_page'];
        const currentClientIdReturnsSales = params['client_id'];
        const currentSupplierIdReturnsSales = params['supplier_id'];
        if (
          previousParam4 !== currentParam4 ||
          currentClientIdReturnsSales != null ||
          currentSupplierIdReturnsSales != null
        ) {
          this.previousParam4 = currentParam4;
          this.pageReturnsSales = +params['returns_sales_page'] || 1;
          this.transactionReturnsSales(params, this.pageReturnsSales);
        }
      }
      if (params.hasOwnProperty('purchase_page')) {
        const previousParam5 = this.previousParam5;
        const currentParam5 = params['purchase_page'];
        const currentClientIdPurchase = params['client_id'];
        const currentSupplierIdPurchase = params['supplier_id'];
        if (
          previousParam5 !== currentParam5 ||
          currentClientIdPurchase != null ||
          currentSupplierIdPurchase != null
        ) {
          this.previousParam5 = currentParam5;
          this.pagePurchase = +params['purchase_page'] || 1;
          console.log(this.pagePurchase);
          this.transactionPurchases(params, this.pagePurchase);
        }
      }
      if (params.hasOwnProperty('returns_purchase_page')) {
        const previousParam6 = this.previousParam6;
        const currentParam6 = params['returns_purchase_page'];
        const currentClientIdPurchaseReturns = params['client_id'];
        const currentSupplierIdPurchaseReturns = params['supplier_id'];
        if (
          previousParam6 !== currentParam6 ||
          currentClientIdPurchaseReturns != null ||
          currentSupplierIdPurchaseReturns != null
        ) {
          this.previousParam6 = currentParam6;
          this.pagePurchaseReturns = +params['returns_purchase_page'] || 1;
          this.transactionPurchasesReturns(params, this.pagePurchaseReturns);
        }
      }
      if (params.hasOwnProperty('notification_discount')) {
        const previousParam7 = this.previousParam7;
        const currentParam7 = params['notification_discount'];
        const currentClientIdNotificationDiscount = params['client_id'];
        const currentSupplierIdNotificationDiscount = params['supplier_id'];
        if (
          previousParam7 !== currentParam7 ||
          currentClientIdNotificationDiscount != null ||
          currentSupplierIdNotificationDiscount != null
        ) {
          this.previousParam7 = currentParam7;
          this.pageNotificationDiscount = +params['notification_discount'] || 1;
          this.transactionNotificationDiscount(
            params,
            this.pageNotificationDiscount
          );
        }
      }
      if (params.hasOwnProperty('notification_addition')) {
        const previousParam8 = this.previousParam8;
        const currentParam8 = params['notification_addition'];
        const currentClientIdNotificationAddition = params['client_id'];
        const currentSupplierIdNotificationAddition = params['supplier_id'];
        if (
          previousParam8 !== currentParam8 ||
          currentClientIdNotificationAddition != null ||
          currentSupplierIdNotificationAddition != null
        ) {
          this.previousParam8 = currentParam8;
          this.pageNotificationAddition = +params['notification_addition'] || 1;
          this.transactionNotificationAddition(
            params,
            this.pageNotificationAddition
          );
        }
      }
      if (params.hasOwnProperty('balance_transferred_page')) {
        const previousParam9 = this.previousParam9;
        const currentParam9 = params['balance_transferred_page'];
        const currentClientIdBalanceTransferred = params['client_id'];
        const currentSupplierIdBalanceTransferred = params['supplier_id'];
        if (
          previousParam9 !== currentParam9 ||
          currentClientIdBalanceTransferred != null ||
          currentSupplierIdBalanceTransferred != null
        ) {
          this.previousParam9 = currentParam9;
          this.pageBalanceTransferred =
            +params['balance_transferred_page'] || 1;
          this.transactionBalanceTransferred(
            params,
            this.pageBalanceTransferred
          );
        }
      }
      if (params.hasOwnProperty('balance_received_page')) {
        const previousParam10 = this.previousParam10;
        const currentParam10 = params['balance_received_page'];
        const currentClientIdBalanceRecieved = params['client_id'];
        const currentSupplierIdBalanceRecieved = params['supplier_id'];
        if (
          previousParam10 !== currentParam10 ||
          currentClientIdBalanceRecieved != null ||
          currentSupplierIdBalanceRecieved != null
        ) {
          this.previousParam10 = currentParam10;
          this.pageBalanceReceived = +params['balance_received_page'] || 1;
          this.transactionBalanceReceived(params, this.pageBalanceReceived);
        }
      }
    });
  }

  changeTab(id: number) {
    this.activeTab = id;
    this.cashPaymentData = [];
    this.cashRecievedData = [];
    this.salesData = [];
    this.returnsSalesData = [];
    this.purchaseData = [];
    this.purchaseReturnData = [];
    this.notificationDisountData = [];
    this.NotifiationAdditionData = [];
    this.balanceTransferredData = [];
    this.BalanceReceivedData = [];
    this.ReportDataLowerArea = [];
    this.ReportOweDataLowerArea = [];
    this.previousParam1 = null;
    this.previousParam2 = null;
    this.previousParam3 = null;
    this.previousParam4 = null;
    this.previousParam5 = null;
    this.previousParam6 = null;
    this.previousParam7 = null;
    this.previousParam8 = null;
    this.previousParam9 = null;
    this.previousParam10 = null;

    if (!this.supplier_reports) {
      this.router.navigate([], {
        queryParams: {
          cash_payment_page: null,
          cash_recieve_page: null,

          sales_page: null,
          returns_sales_page: null,

          purchase_page: null,
          returns_purchase_page: null,

          notification_discount: null,
          notification_addition: null,

          balance_transferred_page: null,
          balance_received_page: null,

          client_code: null,
          client_id: null,
          pharmacy_id: null,
          to: null,
          from: null,
        },
        queryParamsHandling: 'merge',
      });
    } else {
      this.router.navigate([], {
        queryParams: {
          cash_payment_page: null,
          cash_recieve_page: null,

          sales_page: null,
          returns_sales_page: null,

          purchase_page: null,
          returns_purchase_page: null,

          notification_discount: null,
          notification_addition: null,

          balance_transferred_page: null,
          balance_received_page: null,

          supplier_code: null,
          supplier_id: null,
          to: null,
          from: null,
        },
        queryParamsHandling: 'merge',
      });
    }
  }

  getclientDrop(param: string, dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.getClientidFromCode(param);
      dropdown?.close();
    }
  }

  private isCodeAlphabetic(code: string): boolean {
    return /[a-zA-Z]/.test(code);
  }

  private fetchClientData(params: any): void {
    this.subs.add(
      this.http.getReq('clients/dropdown', { params }).subscribe({
        next: (res) => {
          this.client = [];
          // Handle the client data
          this.client = res.data;
          this.pharmaciesData = this.client[0].pharmacies;
          this.clientDataForm.controls['client_id'].setValue(this.client[0].id);
          this.clientDataForm.controls['client_code'].setValue(
            this.client[0].code
          );
          console.log(this.pharmaciesData);
          if (this.pharmaciesData.length === 1) {
            this.clientDataForm.controls['pharmacy_id'].setValue(
              this.pharmaciesData[0].id
            );
          }
        },
      })
    );
  }
  selectedID: any;
  private fetchPharmacyData(params: any): void {
    this.subs.add(
      this.http.getReq('pharmacies', { params }).subscribe({
        next: (res) => {
          this.pharmaciesData = res.data;
          this.selectedPharmacy = res.data;
          this.clientDataForm.controls['client_id'].setValue(
            res.data[0]?.clients[0]?.id
          );
          this.clientDataForm.controls['client_code'].setValue(
            res.data[0]?.clients[0]?.code
          );
          console.log(this.pharmaciesData);
          if (this.pharmaciesData.length === 1) {
            this.clientDataForm.controls['pharmacy_id'].setValue(
              this.pharmaciesData[0].id
            );
          }
          this.selectedID = res.data[0]?.clients[0]?.id;
          this.clientDataForm?.controls['code']?.setValue(this?.selectedID);
        },
        complete: () => {
          if (this.selectedID) {
            // this.fetchAllClientPharmacy({ id: this.selectedID });
          }
        },
      })
    );
  }

  onPageChangeRemoveCode(event: any) {
    if (
      event.value &&
      !/[a-zA-Z]/.test(this.clientDataForm.controls['client_code'].value)
    ) {
      this.clientDataForm.controls['client_code']?.setValue(event.value);
    }
  }

  getClientidFromCode(param: string, e?: any) {
    const clientCode = this.clientDataForm.controls['client_code'].value;
    const clientId = this.clientDataForm.controls['client_id'].value;

    if (param === 'code' && clientCode) {
      if (this.isCodeAlphabetic(clientCode)) {
        // this.fetchPharmacyData({ pharmacy_id: clientCode });
        this.fetchClientData({ code: clientCode });
      } else {
        this.fetchPharmacyData({ pharmacy_id: clientCode });
      }
    } else if (param === 'client_id' && clientId) {
      this.fetchClientData({ id: clientId });
    } else {
      this.clientDataForm.controls['client_id'].setValue(null);
      this.clientDataForm.controls['client_code'].setValue('');
      this.clientDataForm.controls['pharmacy_id'].setValue(null);
      this.pharmaciesData = [];
    }
  }
  private fetchAllClientPharmacy(params: any): void {
    this.subs.add(
      this.generalService.getClients({ params }).subscribe({
        next: (res) => {
          this.selectedPharmacy = res.data[0].pharmacies;
          this.pharmaciesData = res.data[0].pharmacies;
          console.log(this.pharmaciesData);
          if (this.pharmaciesData.length === 1) {
            this.clientDataForm.controls['pharmacy_id'].setValue(
              this.pharmaciesData[0].id
            );
          }
          this.selectedClient = res.data[0];
        },
        complete: () => {
          this.clientDataForm.controls['client_id'].setValue(
            this.selectedClient?.id
          );
          this.clientDataForm.controls['pharmacy_id'].setValue(
            parseInt(this.clientDataForm.controls['client_code']?.value)
          );
        },
      })
    );
  }

  pageMapping: { [key: string]: { pageIndex: any; queryParam: string } } = {
    cashPayment: { pageIndex: 'cashPayment', queryParam: 'cash_payment_page' },
    cashRecieve: { pageIndex: 'cashRecieve', queryParam: 'cash_recieve_page' },
    sales: { pageIndex: 'sales', queryParam: 'sales_page' },
    salesReturns: {
      pageIndex: 'salesReturns',
      queryParam: 'returns_sales_page',
    },
    purchases: { pageIndex: 'purchases', queryParam: 'purchase_page' },
    purchasesReturns: {
      pageIndex: 'purchasesReturns',
      queryParam: 'returns_purchase_page',
    },
    notificationDiscount: {
      pageIndex: 'notificationDiscount',
      queryParam: 'notification_discount',
    },
    notificationAddition: {
      pageIndex: 'notificationAddition',
      queryParam: 'notification_addition',
    },
    balanceTransferred: {
      pageIndex: 'balanceTransferred',
      queryParam: 'balance_transferred_page',
    },
    balanceRecieved: {
      pageIndex: 'balanceRecieved',
      queryParam: 'balance_received_page',
    },
  };
  currentPageIndices: { [key: string]: number } = {
    cashPayment: 0,
    cashRecieve: 0,
    sales: 0,
    salesReturns: 0,
    purchases: 0,
    purchasesReturns: 0,
    notificationDiscount: 0,
    notificationAddition: 0,
    balanceTransferred: 0,
    balanceRecieved: 0,
  };

  changePage = (event: any, pageType: string): void => {
    let queryParam = this.pageMapping[pageType].queryParam;

    this.currentPageIndices[pageType] = event.page + 1;

    let queryParams: { [key: string]: any } = {};

    queryParams[queryParam] = this.currentPageIndices[pageType];

    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  };

  changeParam(TabPage: number) {
    if (TabPage == 1) {
      this.currentPageIndexCashRecieve = 1;
      this.currentPageIndexCashPayment = 1;
      let params: LooseObject = {
        cash_recieve_page: this.currentPageIndexCashRecieve,
        cash_payment_page: this.currentPageIndexCashPayment,
        pharmacy_id: this.clientDataForm.controls['pharmacy_id'].value,
        from: this.clientDataForm.controls['from'].value,
        to: this.clientDataForm.controls['to'].value,
      };
      if (this.supplier_reports) {
        params['supplier_id'] =
          this.clientDataForm.controls['supplier_id'].value;
        params['supplier_code'] =
          this.clientDataForm.controls['supplier_code'].value;
      } else {
        (params['client_code'] =
          this.clientDataForm.controls['client_code'].value),
          (params['client_id'] =
            this.clientDataForm.controls['client_id'].value);
      }
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    } else if (TabPage == 2) {
      this.currentPageIndexSales = 1;
      this.currentPageIndexSalesReturns = 1;
      let params: LooseObject = {
        sales_page: this.currentPageIndexSales,
        returns_sales_page: this.currentPageIndexSalesReturns,
        pharmacy_id: this.clientDataForm.controls['pharmacy_id'].value,
        from: this.clientDataForm.controls['from'].value,
        to: this.clientDataForm.controls['to'].value,
      };
      if (this.supplier_reports) {
        params['supplier_id'] =
          this.clientDataForm.controls['supplier_id'].value;
        params['supplier_code'] =
          this.clientDataForm.controls['supplier_code'].value;
      } else {
        (params['client_code'] =
          this.clientDataForm.controls['client_code'].value),
          (params['client_id'] =
            this.clientDataForm.controls['client_id'].value);
      }
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    } else if (TabPage == 3) {
      this.currentPageIndexPurchases = 1;
      this.currentPageIndexReturnPurchases = 1;
      let params: LooseObject = {
        purchase_page: this.currentPageIndexPurchases,
        returns_purchase_page: this.currentPageIndexReturnPurchases,
        pharmacy_id: this.clientDataForm.controls['pharmacy_id'].value,
        from: this.clientDataForm.controls['from'].value,
        to: this.clientDataForm.controls['to'].value,
      };
      if (this.supplier_reports) {
        params['supplier_id'] =
          this.clientDataForm.controls['supplier_id'].value;
        params['supplier_code'] =
          this.clientDataForm.controls['supplier_code'].value;
      } else {
        (params['client_code'] =
          this.clientDataForm.controls['client_code'].value),
          (params['client_id'] =
            this.clientDataForm.controls['client_id'].value);
      }
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    } else if (TabPage == 4) {
      this.currentPageIndexNotificationDiscount = 1;
      this.currentPageIndexNotificationAddition = 1;
      let params: LooseObject = {
        notification_discount: this.currentPageIndexNotificationDiscount,
        notification_addition: this.currentPageIndexNotificationAddition,
        pharmacy_id: this.clientDataForm.controls['pharmacy_id'].value,
        from: this.clientDataForm.controls['from'].value,
        to: this.clientDataForm.controls['to'].value,
      };
      if (this.supplier_reports) {
        params['supplier_id'] =
          this.clientDataForm.controls['supplier_id'].value;
        params['supplier_code'] =
          this.clientDataForm.controls['supplier_code'].value;
      } else {
        (params['client_code'] =
          this.clientDataForm.controls['client_code'].value),
          (params['client_id'] =
            this.clientDataForm.controls['client_id'].value);
      }
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    } else if (TabPage == 5) {
      this.currentPageIndexBalanceTransferred = 1;
      this.currentPageIndexBalanceRecieved = 1;

      let params: LooseObject = {
        balance_transferred_page: this.currentPageIndexBalanceTransferred,
        balance_received_page: this.currentPageIndexBalanceRecieved,
        pharmacy_id: this.clientDataForm.controls['pharmacy_id'].value,
        from: this.clientDataForm.controls['from'].value,
        to: this.clientDataForm.controls['to'].value,
      };
      if (this.supplier_reports) {
        params['supplier_id'] =
          this.clientDataForm.controls['supplier_id'].value;
        params['supplier_code'] =
          this.clientDataForm.controls['supplier_code'].value;
      } else {
        (params['client_code'] =
          this.clientDataForm.controls['client_code'].value),
          (params['client_id'] =
            this.clientDataForm.controls['client_id'].value);
      }
      this.router.navigate([], {
        queryParams: params,
        queryParamsHandling: 'merge',
      });
    }

    // }
  }
  suppliers: supplier[] = [];
  supplier: supplier = {} as supplier;
  getSuppliers() {
    this.subs.add(
      this.generalService.getDropdownData(['suppliers']).subscribe({
        next: (res) => {
          this.suppliers = res.data.suppliers;
        },
      })
    );
  }
  getClientData() {
    if (this.clientDataForm.controls['client_id'].value) {
      let param = {
        id: this.clientDataForm.controls['client_id'].value,
      };
      this.subs.add(
        this.generalService.getClients({ params: param }).subscribe({
          next: (res) => {
            this.pharmaciesData = res.data[0].pharmacies;
          },
        })
      );
    } else {
      this.subs.add(
        this.generalService.getClients().subscribe({
          next: (res) => {
            this.clientsData = res.data;
          },
          complete: () => {
            if (this.pharmacyId) {
              this.changeTab(6);
              this.clientDataForm.controls['client_code'].setValue(
                this.pharmacyId
              );

              this.getClientidFromCode('code');
            }
          },
        })
      );
    }
  }

  private getCommonParams(): CommonParams {
    let queryParams: any = {};

    // Iterate over each form control in clientDataForm
    for (const key in this.clientDataForm.controls) {
      if (this.clientDataForm.controls.hasOwnProperty(key)) {
        let value = this.clientDataForm.controls[key].value;
        if (value != null && value != undefined && value !== '') {
          if (key === 'from' || key === 'to') {
            const formattedDate = value
              ? datePipe.transform(new Date(value), 'yyyy-MM-dd')
              : null;
            queryParams[key] = formattedDate;
          } else {
            queryParams[key] = value;
          }
        }
      }
    }
    return queryParams as CommonParams;
  }

  transactionCashPayment(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['cash_payment_page']) {
      params['page'] = filter['cash_payment_page'];
    }
    let url = '';
    if (this.router.url.includes('/supplier-transaction-volume-cash')) {
      url = 'suppliers/cash-payment';
    } else {
      url = 'transactions/cash-payment';
    }

    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        if (res.data.length > 0) {
          this.cashPaymentData = res;
        }
      },
    });
  }

  transactionCashRecieved(filter?: any, page?: number) {
    let params = this.getCommonParams();

    if (filter && filter['cash_recieve_page']) {
      params['page'] = filter['cash_recieve_page'];
    }

    let url = '';
    if (this.router.url.includes('/supplier-transaction-volume-cash')) {
      url = 'suppliers/cash-received';
    } else {
      url = 'transactions/cash-received';
    }

    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        if (res.data.length > 0) {
          this.cashRecievedData = res;
        }
      },
    });
  }

  transactionSales(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['sales_page']) {
      params['page'] = filter['sales_page'];
    }
    let url = '';
    if (this.supplier_reports) {
      url = 'suppliers/sales';
    } else {
      url = 'transactions/sales';
    }
    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        this.salesData = res;
      },
    });
  }
  transactionReturnsSales(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['returns_sales_page']) {
      params['page'] = filter['returns_sales_page'];
    }
    let url = '';
    if (this.supplier_reports) {
      url = 'suppliers/sales-returns';
    } else {
      url = 'transactions/sales-returns';
    }
    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        this.returnsSalesData = res;
      },
    });
  }

  transactionPurchases(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['purchase_page']) {
      params['page'] = filter['purchase_page'];
    }
    let url = '';
    if (this.supplier_reports) {
      url = 'suppliers/purchases';
    } else {
      url = 'transactions/purchases';
    }
    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        this.purchaseData = res;
      },
    });
  }
  transactionPurchasesReturns(filter?: any, page?: number) {
    // this.purchaseReturnData = []
    let params = this.getCommonParams();
    if (filter && filter['returns_purchase_page']) {
      params['page'] = filter['returns_purchase_page'];
    }

    let url = '';
    if (this.supplier_reports) {
      url = 'suppliers/purchases-returns';
    } else {
      url = 'transactions/purchase-returns';
    }

    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        this.purchaseReturnData = res;
      },
    });
  }

  transactionNotificationDiscount(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['notification_discount']) {
      params['notification_discount'] = filter['notification_discount'];
    }
    params['type'] = 0;
    let url = '';
    if (this.router.url.includes('/supplier-transaction-volume-cash')) {
      url = 'suppliers/adjustment-notes/deduction';
    } else {
      url = 'transactions/adjustment-notes/deduction';
    }
    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        this.notificationDisountData = res;
      },
    });
  }
  transactionNotificationAddition(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['notification_addition']) {
      params['notification_addition'] = filter['notification_addition'];
    }
    params['type'] = 1;
    let url = '';
    if (this.router.url.includes('/supplier-transaction-volume-cash')) {
      url = 'suppliers/adjustment-notes/addition';
    } else {
      url = 'transactions/adjustment-notes/addition';
    }
    this.http.getReq(url, { params }).subscribe({
      next: (res) => {
        this.NotifiationAdditionData = res;
      },
    });
  }

  transactionBalanceTransferred(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['balance_transferred_page']) {
      params['page'] = filter['balance_transferred_page'];
    }
    this.http.getReq('balance/transferred', { params }).subscribe({
      next: (res) => {
        this.balanceTransferredData = res;
      },
    });
  }

  transactionBalanceReceived(filter?: any, page?: number) {
    let params = this.getCommonParams();
    if (filter && filter['balance_received_page']) {
      params['page'] = filter['balance_received_page'];
    }

    this.http.getReq('balance/received', { params }).subscribe({
      next: (res) => {
        this.BalanceReceivedData = res;
      },
    });
  }

  // transcationReport() {
  //   let params = this.getCommonParams();
  //   let url=''
  //   if(!this.supplier_reports){
  //     url='transactions/reports'
  //   }
  //   else{
  //     url='suppliers/totals'
  //   }

  //   this.subs.add(this.http.getReq(url, { params }).subscribe({
  //     next: res => {
  //       this.reportData = res.data
  //     }
  //   }));

  // }

  transcationReport() {
    let params = this.getCommonParams();

    if (!this.supplier_reports) {
      this.subs.add(
        this.http.getReq('transactions/totals', { params }).subscribe({
          next: (res) => {
            this.reportData = res.data;
            console.log('reportData', this.reportData);
          },
        })
      );

      // this.subs.add(
      //   this.http.getReq('transactions/reports-owe', { params }).subscribe({
      //     next: (res) => {
      //       this.ReportOweData = res.data;
      //     },
      //   })
      // );
    } else {
      this.subs.add(
        this.http.getReq('suppliers/totals', { params }).subscribe({
          next: (res) => {
            this.reportData = res.data;
          },
        })
      );
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  openInvoicePopup(invoiceData: any) {
    this.openInvoiceDetailsModel(invoiceData.pharmacy_id, invoiceData.id);
  }
  cartData: any = [];
  extra_discount: any;
  totals: any;
  ClientType: any;
  @ViewChild('invoiceDetailsModel')
  invoiceDetailsModel!: ElementRef<HTMLElement>;

  openInvoiceDetailsModel(pharmacyId: number, invoiceId: number) {
    let el: HTMLElement = this.invoiceDetailsModel.nativeElement;
    el.click();
    this.getInvoiceData(pharmacyId, invoiceId);
  }

  getInvoiceData(pharmacyId: number, invoiceId: number) {
    let body = {
      id: invoiceId,
      pharmacy_id: pharmacyId,
    };
    this.subs.add(
      this.http.getReq('orders/invoice-content', { params: body }).subscribe({
        next: (res) => {
          this.cartData = [];
          res.data.cart.forEach((cartItem: any) => {
            this.cartData.push({
              name: cartItem.product_name,
              expired_at: cartItem.expired_at,
              operating_number: cartItem.operating_number,
              quantity: cartItem.quantity,
              bonus: cartItem.bonus,
              price: cartItem.price,
              taxes: cartItem.taxes,
              discount: cartItem.discount,
              client_discount_difference: cartItem.client_discount_difference,
              total: cartItem.total,
            });
          });
          this.extra_discount = res.data?.extra_discount;
          this.totals = res.additional_data?.totals;
          this.ClientType = res?.data?.client?.type_value;
        },
      })
    );
  }
}
