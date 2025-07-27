import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { AuthService } from '@services/auth.service';
import { ArabicNumberConverterService } from '@services/convert-num-to-words.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-transfer-balance',
  templateUrl: './create-transfer-balance.component.html',
  styleUrls: ['./create-transfer-balance.component.scss'],
})
export class CreateTransferBalanceComponent {
  private subscription = new Subscription();
  addForm!: FormGroup;
  accountType: commonObject[] = [];
  updatedPharmacyNamesFrom: any = [];
  updatedPharmacyNamesTo: any = [];
  pharmacyFrom: any;
  pharmacyTo: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private printService: PrintService,
    private generalService: GeneralService,
    private toaster: ToastrService,
    private arabicConverter: ArabicNumberConverterService
  ) {}

  ngOnInit() {
    this.initForm();

    this.getDropdownData();
  }

  initForm() {
    this.addForm = this.fb.group({
      balance_after_from: [],
      balance_after_to: [],
      balance_to: [],
      balance_from: [],
      account_type_from: [],
      account_type_to: [],
      from_account_id: [],
      to_account_id: [],
      notes: [],
      amount: [],
      amount_in_words: [],
    });
  }

  getDropdownData() {
    this.accountType = this.auth.getEnums().account_types;
  }

  getAccountsFrom() {
    if (this.addForm.value.account_type_from == null) {
      return;
    }
    let params = {
      type: this.addForm.value.account_type_from,
    };
    this.subscription.add(
      this.http.getReq('accounting/accounts', { params }).subscribe({
        next: (res) => {
          this.updatedPharmacyNamesFrom = res.data;
        },
        complete: () => {},
      })
    );
  }

  getAccountsTo() {
    if (this.addForm.value.account_type_to == null) {
      return;
    }
    let params = {
      type: this.addForm.value.account_type_to,
    };
    this.subscription.add(
      this.http.getReq('accounting/accounts', { params }).subscribe({
        next: (res) => {
          this.updatedPharmacyNamesTo = res.data;
        },
        complete: () => {},
      })
    );
  }

  getPharmacyFromDropdownFrom() {
    if (this.addForm.value.from_account_id == null) {
      return;
    }
    this.subscription.add(
      this.generalService
        .getPharmacies({
          pharmacy_id: this.addForm.value.from_account_id,
        })
        .subscribe({
          next: (res) => {
            this.pharmacyFrom = res.data[0];
          },
          complete: () => {
            this.addForm
              .get('balance_from')!
              .setValue(this.pharmacyFrom.balance);

            this.getBalanceAfter();
          },
        })
    );
  }

  getPharmacyFromDropdownTo() {
    if (this.addForm.value.to_account_id == null) {
      return;
    }
    this.subscription.add(
      this.generalService
        .getPharmacies({
          pharmacy_id: this.addForm.value.to_account_id,
        })
        .subscribe({
          next: (res) => {
            this.pharmacyTo = res.data[0];
          },
          complete: () => {
            this.addForm.get('balance_to')!.setValue(this.pharmacyFrom.balance);

            this.getBalanceAfter();
          },
        })
    );
  }

  onSubmit() {
    let message = '';
    let param: any = {};
    for (const key in this.addForm.value) {
      let value = this.addForm.controls[key].value;
      if (value != null && value != undefined && value !== '') {
        if (
          key == 'amount' ||
          key == 'from_account_id' ||
          key == 'to_account_id' ||
          key == 'notes'
        ) {
          param[key] = value;
        }
      }
    }
    this.http.postReq('accounting/transfer-balance', param).subscribe({
      next: (res) => {
        message = res.message;
      },
      complete: () => {
        this.toaster.info(message);
        this.router.navigate(['/accounting/transfer-balance']);
        this.addForm.reset();
      },
    });
  }

  getBalanceAfter() {
    if (this.addForm.value.amount == '') {
      return;
    } else {
      this.addForm
        .get('amount_in_words')!
        .setValue(this.arabicConverter.convert(this.addForm.value.amount));
    }
    if (this.pharmacyFrom?.balance < 0) {
      return;
    } else {
      this.addForm
        .get('balance_after_from')!
        .setValue(this.pharmacyFrom?.balance + this.addForm.value.amount);
    }

    if (this.pharmacyTo?.balance < 0) {
      return;
    } else {
      this.addForm
        .get('balance_after_to')!
        .setValue(this.pharmacyTo?.balance - this.addForm.value.amount);
    }
  }
}
