import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  selector: 'app-cash-receipts',
  templateUrl: './cash-receipts.component.html',
  styleUrls: ['./cash-receipts.component.scss'],
})
export class CashReceiptsComponent {
  sub: Subscription = new Subscription();
  columnsArray: columnHeaders[] = [];
  data: any = [];
  safes: any = [];
  pharmacies: any = [];
  updatedPharmacyNames: any = [];
  pharmacy: any;
  additional_data: any;
  receipts = [];
  type: string = 'add';
  accountType: commonObject[] = [];
  receiveForm!: FormGroup;
  deliveries: FiltersObject[] = [];
  tracks: FiltersObject[] = [];
  collectionRounds: commonObject[] = [];
  collection_id?: number;
  collection_round_id?: number;
  makeAvailable = false;
  receipt_id?: number;
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
        name: 'رقم الإيصال',
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
        name: ' اسم المندوب',
      },
      {
        name: ' اسم السائق',
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
        name: 'receipt',
        type: 'normal',
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
        type: 'normal.name',
      },
      {
        name: 'delivery',
        type: 'normal.name',
      },
      {
        name: 'driver',
        type: 'normal.name',
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
      receipt_number: [null],
      driver_id: [],
      track_id: [],
      account_type: [null],
      sales: [],
      delivery_id: [],
      safe_number: [],

      code: [],
      receipt: [null],
      account_id: [null],
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getDropdownData() {
    if (!this.permissions.includes('cash_receipt_from_all_accounts')) {
      this.sub.add(
        this.http.getReq('clients').subscribe({
          next: (res) => {
            this.pharmacies = res.data;
          },
          complete: () => {
            this.pharmacies.forEach((client: any) => {
              client.pharmacies.forEach((pharamcy: any) => {
                this.updatedPharmacyNames.push({
                  name: client?.name + '-' + pharamcy.name,
                  id: pharamcy?.id,
                });
              });
            });
            console.log(this.updatedPharmacyNames);
          },
        })
      );
    }

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

    this.sub.add(
      this.generalService.getDropdownData(['deliveries', 'tracks']).subscribe({
        next: (res) => {
          this.deliveries = res.data.deliveries;
          this.tracks = res.data.tracks;
        },
      })
    );

    this.accountType = this.auth.getEnums().account_types;

    this.collectionRounds = this.auth.getEnums().collection_round;
  }

  getLogbookReceipt() {
    if (this.receiveForm.value.receipt == '') {
      return;
    }
    let params = {
      receipt_num: this.receiveForm.value.receipt_number,
    };
    console.log(params);
    this.sub.add(
      this.http
        .getReq('accounting/cash-receipts/logbook-receipts', { params })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.receipts = res.data;

            this.receiveForm
              .get('delivery_id')!
              .setValue(res.additional_data.delivery.id);
          },
          complete: () => {
            // this.focusNextInput(this.receiptInput);
          },
        })
    );
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
  //           this.receiveForm.get('pharmacy_id')!.setValue(this.pharmacy.id);
  //           this.receiveForm.get('balance')!.setValue(this.pharmacy.balance);
  //           this.receiveForm
  //             .get('sales')!
  //             .setValue(this.pharmacy?.delivery?.name);
  //           this.getBalanceAfter();
  //         },
  //       })
  //   );
  // }
  getPharmacyFromDropdown(dropdown: any) {
    if (
      // this.receiveForm.value.pharmacy_id == null &&
      this.receiveForm.value.account_id == null
    ) {
      return;
    }
    this.sub.add(
      this.generalService
        .getPharmacies({
          pharmacy_id: this.receiveForm.value.account_id,
          // this.receiveForm.value.pharmacy_id
          // ? this.receiveForm.value.pharmacy_id
          // :
        })
        .subscribe({
          next: (res) => {
            this.pharmacy = res.data[0];
          },
          complete: () => {
            this.receiveForm.get('balance')!.setValue(this.pharmacy.balance);
            this.receiveForm.get('code')!.setValue(this.pharmacy.code);

            this.receiveForm
              .get('sales')!
              .setValue(this.pharmacy?.delivery?.name);

            this.getBalanceAfter();
            if (!dropdown.overlayVisible) {
              this.focusNextInputDelayed(this.trackInput);
            }
            this.checkDraft();
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
      this.http.getReq('accounting/accounts/dropdown', { params }).subscribe({
        next: (res) => {
          this.updatedPharmacyNames = res.data;
        },
        complete: () => {
          if (!dropdown.overlayVisible) {
            this.focusNextInputDelayed(this.accountInput);
          }
        },
      })
    );
  }

  selectSafe() {
    if (this.receiveForm.value.safe_id == null) {
      return;
    }
    this.receiveForm
      .get('safe_number')!
      .setValue(this.receiveForm.value.safe_id);
  }

  getSafeIdFromDropdown(dropdown: any) {
    if (this.receiveForm.value.safe_id == '') {
      this.receiveForm.get('safe_number')!.setValue('');
    }

    this.receiveForm
      .get('safe_number')!
      .setValue(this.receiveForm.value.safe_id);
    if (!dropdown.overlayVisible) {
      this.data.length >= 1
        ? this.focusNextInputDelayed(this.receiptInput)
        : this.focusNextInputDropdown(
            this.receiptNumberInput.nativeElement,
            this.safeInput
          );
    }
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

  addCashReceipt() {
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
          key == 'receipt' ||
          key == 'balance' ||
          key == 'safe_id' ||
          key == 'driver_id' ||
          key == 'track_id' ||
          key == 'delivery_id' ||
          // key == 'pharmacy_id' ||
          key == 'account_id' ||
          key == 'note'
        ) {
          queryParams[key] = value;
        }
      }
    }
    if (this.collection_id) {
      queryParams['collection_id'] = this.collection_id;
    }

    this.sub.add(
      this.http.postReq('accounting/cash-receipts', queryParams).subscribe({
        next: (res) => {
          console.log(res);
          this.collection_id = res.additional_data.collection_id;
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
            // pharmacy_id: null,
            delivery_id: null,
            account_type: null,
            account_id: null,
            receipt: null,
            track_id: null,
            code: null,
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

  submitCashReceipts() {
    let message = '';
    let queryParams: any = {};
    queryParams['collection_id'] = this.collection_id;
    queryParams['collection_round'] = this.collection_round_id;
    this.sub.add(
      this.http
        .putReq(`accounting/cash-receipts/submit`, queryParams)
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.data = [];
            this.collection_id = undefined;
            this.receiveForm.reset();
            this.router.navigate(['accounting/cash-receipts/list']);
            this.toaster.success(message);
          },
        })
    );
  }

  getReceiptFromId(event: any) {
    console.log(event);
    this.receipt_id = event;

    let selectedReceipt = this.data.find((receipt: any) => {
      return event == receipt.id;
    });
    console.log(selectedReceipt);
    if (selectedReceipt) {
      this.type = 'edit';
    }
    this.receiveForm.patchValue({
      // code: selectedReceipt.code,
      note: selectedReceipt.note,
      amount: selectedReceipt.amount,
      delivery_id: selectedReceipt?.delivery?.id,
      driver_id: selectedReceipt?.driver?.id,
      receipt: selectedReceipt.receipt,
      // pharmacy_id: selectedReceipt?.pharmacy?.id,
      balance: selectedReceipt?.pharmacy?.balance,
      sales: selectedReceipt?.pharmacy?.delivery?.id,
      track_id: selectedReceipt?.track?.id,
    });
    this.getBalanceAfter();
    console.log(this.receiveForm.value);
  }

  editCashReceipt() {
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
          key == 'receipt' ||
          key == 'balance' ||
          key == 'safe_id' ||
          key == 'driver_id' ||
          key == 'track_id' ||
          key == 'delivery_id' ||
          // key == 'pharmacy_id' ||
          key == 'account_id' ||
          key == 'note'
        ) {
          queryParams[key] = value;
        }
      }
    }
    if (this.collection_id) {
      queryParams['collection_id'] = this.collection_id;
    }

    this.sub.add(
      this.http
        .putReq(`accounting/cash-receipts/${this.receipt_id}`, queryParams)
        .subscribe({
          next: (res) => {
            console.log(res);
            message = res.message;
            this.data = res.data;
            this.additional_data = res.additional_data;
            this.collection_id = res.additional_data.collection_id;
          },
          complete: () => {
            this.data.forEach((element: any, i: number) => {
              element['serial'] = i + 1;
            });

            this.toaster.success(message);
            this.type = 'add';
            this.receiveForm.patchValue({
              note: null,
              // pharmacy_id: null,
              delivery_id: null,
              account_type: null,
              account_id: null,
              receipt: null,
              track_id: null,
              code: null,
              balance: null,
              balance_after: null,
              amount: null,
              amount_in_words: null,
            });
          },
        })
    );
  }

  @ViewChild('editBtn') editBtn!: ElementRef;
  @ViewChild('receiveBtn') receiveBtn!: ElementRef;
  @ViewChild('amountInput') amountInput!: ElementRef;
  @ViewChild('trackInput') trackInput!: ElementRef;
  @ViewChild('safeInput') safeInput!: ElementRef;
  @ViewChild('receiptNumberInput') receiptNumberInput!: ElementRef;
  @ViewChild('receiptInput') receiptInput!: ElementRef;
  @ViewChild('clientCodeInput') clientCodeInput!: ElementRef;
  @ViewChild('clientInput') clientInput!: ElementRef;
  @ViewChild('accountTypeInput') accountTypeInput!: ElementRef;
  @ViewChild('accountInput') accountInput!: ElementRef;
  @ViewChild('noteInput') noteInput!: ElementRef;
  @ViewChild('driverInput') driverInput!: ElementRef;
  @ViewChild('collectionRoundInput') collectionRoundInput!: ElementRef;
  focusNextInputDelayed(element: any) {
    setTimeout(() => {
      const nativeEl =
        element.nativeElement ??
        element.el?.nativeElement?.querySelector('input');
      if (nativeEl) {
        nativeEl.focus();
      }
    }, 100);
  }
  focusNextInputDelayedDropdown(element: any, dropdown: any) {
    if (!dropdown.overlayVisible) {
      setTimeout(() => {
        const nativeEl =
          element.nativeElement ??
          element.el?.nativeElement?.querySelector('input');
        if (nativeEl) {
          nativeEl.focus();
        }
      }, 100);
    }
  }
  focusNextInput(element: HTMLInputElement) {
    element.focus();
  }
  focusNextInputDropdown(element: any, dropdown: any) {
    if (!dropdown.overlayVisible) {
      element.focus();
    }
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
  onDropdownFocus(event: any) {
    event.target.addEventListener('keydown', (keydownEvent: KeyboardEvent) => {
      if (keydownEvent.key === 'Enter') {
        keydownEvent.preventDefault();
      }
    });
  }

  onDropdownKeydown(event: any, dropdown: any) {
    if (!dropdown.overlayVisible) {
      // this.getWarehouse()
      setTimeout(() => {
        dropdown?.close();
      }, 100);
    }
  }

  checkDraft() {
    let params: any = {};
    if (this.receiveForm.value.account_id) {
      params['account_id'] = this.receiveForm.value.account_id;
    }
    // else if (this.receiveForm.value.pharmacy_id) {
    //   params['account_id'] = this.receiveForm.value.pharmacy_id;
    // }
    else {
      return;
    }
    this.sub.add(
      this.http
        .getReq('accounting/cash-receipts/check-draft', { params })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.collection_id = res.additional_data.collection_id;
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
            this.makeAvailable = true;
            // this.getReceiptFromId()
          },
        })
    );
  }

  deleteReceipts(event: any) {
    let params: LooseObject = {};
    if (event.type === 'all') {
      params['collection_id'] = this.collection_id;
    } else {
      params['id'] = event.id;
    }
    this.sub.add(
      this.http.deleteReq('accounting/cash-receipts', { params }).subscribe({
        next: (res) => {
          console.log(res);
          this.collection_id = res.additional_data.collection_id;
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
          this.makeAvailable = true;
          // this.getReceiptFromId()
        },
      })
    );
  }
}
