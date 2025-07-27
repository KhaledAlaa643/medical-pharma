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
  selector: 'app-create-cash-payment',
  templateUrl: './create-cash-payment.component.html',
  styleUrls: ['./create-cash-payment.component.scss'],
})
export class CreateCashPaymentComponent {
  sub: Subscription = new Subscription();
  columnsArray: columnHeaders[] = [];
  data: any = [];
  safes: any = [];
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
        name: 'حذف',
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
        name: 'delete',
        type: 'delete',
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
      safe_id: [null],
      amount: [null],
      amount_in_words: [null],
      note: [null],
      balance: [null],
      balance_after: [null],
      dateAndTime: [],

      account_type: [null],

      safe_number: [],

      // code: [],
      account_id: [null],
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getDropdownData() {
    // this.sub.add(
    //   this.http.getReq('clients').subscribe({
    //     next: (res) => {
    //       this.pharmacies = res.data;
    //     },
    //     complete: () => {
    //       this.pharmacies.forEach((client: any) => {
    //         client.pharmacies.forEach((pharamcy: any) => {
    //           this.updatedPharmacyNames.push({
    //             name: client?.name + '-' + pharamcy.name,
    //             id: pharamcy?.id,
    //           });
    //         });
    //       });
    //       console.log(this.updatedPharmacyNames);
    //     },
    //   })
    // );
    this.sub.add(
      this.http.getReq('accounting/safes/edit').subscribe({
        next: (res) => {
          this.safes = res.data;
          if (this.safes.length === 1) {
            this.receiveForm.get('safe_id')!.setValue(this.safes[0].id);
            this.receiveForm.get('safe_number')!.setValue(this.safes[0].id);
          }
          console.log(this.safes);
        },
      })
    );

    this.accountType = this.auth.getEnums().account_types;
  }

  // getPharmacyFromCode() {
  //   console.log(this.receiveForm.value.code);
  //   if (this.receiveForm.value.code == '') {
  //     return;
  //   }
  //   this.sub.add(
  //     this.generalService
  //       .getPharmacies({ code: this.receiveForm.value.code })
  //       .subscribe({
  //         next: (res) => {
  //           this.pharmacy = res.data[0];
  //         },
  //         complete: () => {
  //           this.receiveForm.get('account_id')!.setValue(this.pharmacy.id);
  //           this.receiveForm.get('balance')!.setValue(this.pharmacy.balance);

  //           this.getBalanceAfter();
  //         },
  //       })
  //   );
  // }
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
            // this.receiveForm.get('code')!.setValue(this.pharmacy.code);

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

  getSafeIdFromDropdown(dropdown: any) {
    if (this.receiveForm.value.safe_id == '') {
      this.receiveForm.get('safe_number')!.setValue('');
    }

    this.receiveForm
      .get('safe_number')!
      .setValue(this.receiveForm.value.safe_id);
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
          key == 'safe_id' ||
          key == 'account_id' ||
          key == 'note'
        ) {
          queryParams[key] = value;
        }
      }
    }
    if (this.collection_num) {
      queryParams['collection_num'] = this.collection_num;
    }

    this.sub.add(
      this.http.postReq('accounting/cash-payments', queryParams).subscribe({
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
            note: null,
            account_type: null,
            account_id: null,
            // code: null,
            balance: null,
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
    queryParams['collection_round'] = this.receiveForm.value.collection_round;
    this.sub.add(
      this.http
        .putReq(`accounting/cash-payments/submit`, queryParams)
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.data = [];
            this.collection_num = undefined;
            this.receiveForm.reset();
            this.router.navigate(['accounting/cash-payments/list']);
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
      note: selectedPayment.note,
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
          key == 'safe_id' ||
          key == 'account_id' ||
          key == 'note'
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
        .putReq(`accounting/cash-payments/${this.payment_id}`, queryParams)
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
              note: null,

              account_type: null,
              account_id: null,

              balance: null,
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

  deleteReceipts(event: any) {
    let params: LooseObject = {};
    params['id'] = event.id;
    this.sub.add(
      this.http.deleteReq('accounting/cash-payments', { params }).subscribe({
        next: (res) => {
          console.log(res);
          this.collection_num = res.additional_data.collection_num;
          this.additional_data = res.additional_data;
          this.data = res.data;
          this.receiveForm.patchValue({
            // driver_id: this.data[0]?.driver?.id,
            safe_id: this.data[0]?.safe?.id,
            // receipt: this.data[0]?.receipt
          });
        },
        complete: () => {
          this.data.forEach((element: any, i: number) => {
            element['serial'] = i + 1;
          });
        },
      })
    );
  }
}
