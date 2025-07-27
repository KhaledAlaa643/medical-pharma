import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { commonObject, FiltersObject } from '@models/settign-enums';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { ArabicNumberConverterService } from '@services/convert-num-to-words.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-create-deduction-notice',
  templateUrl: './create-deduction-notice.component.html',
  styleUrls: ['./create-deduction-notice.component.scss'],
})
export class CreateDeductionNoticeComponent {
  sub: Subscription = new Subscription();
  columnsArray: columnHeaders[] = [];
  data: any = [];
  safes: any = [];
  deliveries: FiltersObject[] = [];

  pharmacies: any = [];
  updatedPharmacyNames: any = [];
  pharmacy: any;
  additional_data: any;
  type: string = 'add';
  accountType: commonObject[] = [];
  receiveForm!: FormGroup;

  collection_num?: number;
  payment_id?: number;
  permissions: string[] = [];
  columnsName: ColumnValue[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private generalService: GeneralService,
    private toaster: ToastrService,
    private arabicConverter: ArabicNumberConverterService
  ) {}

  ngOnInit(): void {
    this.permissions = this.auth.getUserPermissions();
    this.initForm();
    this.columnsArray = [
      {
        name: 'المسلسل',
      },
      {
        name: 'كود الحساب',
      },

      {
        name: 'اسم الحساب',
      },

      {
        name: 'رقم الإذن',
      },
      {
        name: 'المبلغ',
      },
      {
        name: 'خط السير',
      },
      {
        name: 'اسم المندوب',
      },
      {
        name: 'اسم السائق',
      },
    ];
    this.columnsName = [
      {
        name: 'serial',
        type: 'normal',
      },
      {
        name: 'account',
        type: 'normal.id',
      },

      {
        name: 'account',
        type: 'normal.name',
      },

      {
        name: 'id',
        type: 'nameClickableBlue',
      },
      {
        name: 'amount',
        type: 'normal',
      },
      {
        name: 'track',
        type: 'normal',
      },
      {
        name: 'delivery',
        type: 'normal',
      },
      {
        name: 'driver',
        type: 'normal',
      },
    ];

    this.getDropdownData();

    this.updateCurrentDateAndTime(); // Call it once on initialization
    setInterval(() => {
      this.updateCurrentDateAndTime(); // Update every second
    }, 1000);
  }

  initForm() {
    this.receiveForm = this.fb.group({
      amount: [null],
      amount_in_words: [null],
      notes: [null],
      balance: [null],
      balance_after: [null],
      dateAndTime: [],
      sales: [null],
      delivery: [null],
      driver: [null],
      account_type: [null],
      type: [2],
      // code: [],
      account_id: [null],
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getDropdownData() {
    this.sub.add(
      this.generalService.getDropdownData(['deliveries']).subscribe({
        next: (res) => {
          this.deliveries = res.data.deliveries;
          // this.tracks = res.data.tracks;
        },
      })
    );

    this.accountType = this.auth.getEnums().account_types;
  }

  getPharmacyFromDropdown() {
    if (this.receiveForm.value.account_id == null) {
      return;
    }
    this.sub.add(
      this.generalService
        .getPharmacies({
          pharmacy_id: this.receiveForm.value.account_id,
        })
        .subscribe({
          next: (res) => {
            this.pharmacy = res.data[0];
          },
          complete: () => {
            this.receiveForm.get('balance')!.setValue(this.pharmacy.balance);
            this.receiveForm
              .get('delivery')!
              .setValue(this.pharmacy.delivery.name);
            this.receiveForm
              .get('driver')!
              .setValue(this.pharmacy?.track?.delivery[1]?.name);
            this.receiveForm
              .get('sales')!
              .setValue(this.pharmacy?.morning_sales?.name);
            this.getBalanceAfter();
          },
        })
    );
  }

  getAccounts(dropdown: any) {
    if (this.receiveForm.value.account_type == null) {
      return;
    }
    let params = {
      type: this.receiveForm.value.account_type,
    };
    this.sub.add(
      this.http.getReq('accounting/accounts', { params }).subscribe({
        next: (res) => {
          this.updatedPharmacyNames = res.data;
        },
        complete: () => {},
      })
    );
  }

  getBalanceAfter() {
    if (this.receiveForm.value.amount == '') {
      return;
    } else {
      this.receiveForm
        .get('amount_in_words')!
        .setValue(this.arabicConverter.convert(this.receiveForm.value.amount));
    }
    if (this.pharmacy?.balance < 0) {
      return;
    } else {
      this.receiveForm
        .get('balance_after')!
        .setValue(this.pharmacy?.balance - this.receiveForm.value.amount);
    }
  }

  addCashPayment() {
    let message = '';
    let queryParams: any = {};
    for (const key in this.receiveForm.value) {
      let value = this.receiveForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (
          key == 'amount' ||
          key == 'type' ||
          key == 'account_id' ||
          key == 'notes'
        ) {
          queryParams[key] = value;
        }
      }
    }
    if (this.collection_num) {
      queryParams['collection_num'] = this.collection_num;
    }

    this.sub.add(
      this.http.postReq('accounting/adjustment-notes', queryParams).subscribe({
        next: (res) => {
          console.log(res);
          this.collection_num = res.additional_data.collection_num;
          message = res.message;
          this.additional_data = res.additional_data;
          this.data = res.data;
        },
        complete: () => {
          this.data.forEach((element: any, i: number) => {
            element['serial'] = i + 1;
          });
          this.receiveForm.patchValue({
            notes: null,
            account_id: null,
            // code: null,
            balance: null,
            delivery: null,
            driver: null,
            sales: null,
            balance_after: null,
            amount: null,
            amount_in_words: null,
          });
          this.toaster.success(message);
        },
      })
    );
  }

  submitCashPayments() {
    let message = '';
    let queryParams: any = {};
    queryParams['collection_num'] = this.collection_num;
    this.sub.add(
      this.http
        .putReq(`accounting/adjustment-notes/submit`, queryParams)
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.data = [];
            this.collection_num = undefined;
            this.receiveForm.reset();
            this.router.navigate(['accounting/add-and-deduction-notice/list']);
            this.toaster.success(message);
          },
        })
    );
  }

  getReceiptFromId(event: any) {
    console.log(event);
    this.payment_id = event;

    let selectedPayment = this.data.find((payment: any) => {
      return event == payment.id;
    });
    console.log(selectedPayment);
    if (selectedPayment) {
      this.type = 'edit';
    }
    this.receiveForm.patchValue({
      notes: selectedPayment.notes,
      amount: selectedPayment.amount,

      account_id: selectedPayment?.account?.id,
      safe_id: selectedPayment?.safe?.id,
    });
    this.getPharmacyFromDropdown();
    // this.getBalanceAfter();
  }

  editCashPayment() {
    let message = '';
    let queryParams: any = {};
    for (const key in this.receiveForm.value) {
      let value = this.receiveForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (
          key == 'amount' ||
          key == 'type' ||
          key == 'account_id' ||
          key == 'notes'
        ) {
          queryParams[key] = value;
        }
      }
    }
    if (this.collection_num) {
      queryParams['collection_num'] = this.collection_num;
    }

    this.sub.add(
      this.http
        .putReq(`accounting/adjustment-notes/${this.payment_id}`, queryParams)
        .subscribe({
          next: (res) => {
            console.log(res);
            message = res.message;
            this.data = res.data;
            this.additional_data = res.additional_data;
            this.collection_num = res.additional_data.collection_num;
          },
          complete: () => {
            this.data.forEach((element: any, i: number) => {
              element['serial'] = i + 1;
            });

            this.toaster.success(message);
            this.type = 'add';
            this.receiveForm.patchValue({
              notes: null,
              account_id: null,
              balance: null,
              delivery: null,
              driver: null,
              sales: null,
              balance_after: null,
              amount: null,
              amount_in_words: null,
            });
          },
        })
    );
  }

  updateCurrentDateAndTime() {
    const currentDate = new Date();
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    //  format the date and time that the time displays first
    // and the date second

    this.receiveForm
      .get('dateAndTime')!
      .setValue(currentDate.toLocaleString('ar-EG', options));
  }
}
