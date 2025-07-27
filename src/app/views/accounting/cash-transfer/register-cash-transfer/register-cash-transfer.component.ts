import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fixedData } from '@models/products';
import { supplier } from '@models/suppliers';
import { AuthService } from '@services/auth.service';
import { ArabicNumberConverterService } from '@services/convert-num-to-words.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-cash-transfer',
  templateUrl: './register-cash-transfer.component.html',
  styleUrls: ['./register-cash-transfer.component.scss'],
})
export class RegisterCashTransferComponent {
  private subscription = new Subscription();
  addForm!: FormGroup;
  deliveries: supplier[] = [];
  safes: supplier[] = [];
  cashSafes: supplier[] = [];
  logbooks: supplier[] = [];
  id?: any;
  incentiveOrPenalty: any;
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
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    this.initForm();
    if (this.id) {
      this.getById();
    } else {
      this.getDropdownData();
    }
  }

  initForm() {
    this.addForm = this.fb.group({
      safe_from_id: [],
      safe_to_id: [],
      delivery_id: [],
      notes: [],
      amount: [],
      log_book_id: [],
      amount_in_words: [],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.http.getReq('accounting/safes/dropdown').subscribe({
        next: (res) => {
          this.safes = res.data;
          if (this.safes.length === 1) {
            this.addForm.get('safe_from_id')!.setValue(this.safes[0].id);
          }
        },
      })
    );
    this.subscription.add(
      this.http.getReq('accounting/safes/cash/edit').subscribe({
        next: (res) => {
          this.cashSafes = res.data;
          if (this.cashSafes.length === 1) {
            this.addForm.get('safe_to_id')!.setValue(this.cashSafes[0].id);
          }
        },
      })
    );
    this.subscription.add(
      this.generalService.getDropdownData(['deliveries']).subscribe({
        next: (res) => {
          this.deliveries = res.data.deliveries;
        },
      })
    );
  }
  getLogbooksFromEmployees() {
    let param = {
      representative_id: this.addForm.get('delivery_id')?.value,
    };
    this.subscription.add(
      this.http.getReq('accounting/log-books/dropdown', param).subscribe({
        next: (res) => {
          this.logbooks = res.data.map((item: any) => {
            return {
              id: item.id,
              name: item.start + ' - ' + item.end,
            };
          });
        },
      })
    );
  }

  getById() {
    this.subscription.add(
      this.http.getReq(`accounting/cash-transfers/show/${this.id}`).subscribe({
        next: (res) => {
          this.incentiveOrPenalty = res.data;
        },
        complete: () => {
          this.addForm.patchValue({
            safe_from_id: this.incentiveOrPenalty.safe_from.name,
            safe_to_id: this.incentiveOrPenalty.safe_to.name,
            delivery_id: this.incentiveOrPenalty.delivery.name,
            log_book_id:
              this.incentiveOrPenalty.log_book.start +
              ' - ' +
              this.incentiveOrPenalty.log_book.end,
            amount: this.incentiveOrPenalty.amount,
            notes: this.incentiveOrPenalty.notes,
          });
          this.getAmountInWords();
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
        param[key] = value;
      }
    }
    this.http.postReq('accounting/cash-transfers', param).subscribe({
      next: (res) => {
        message = res.message;
      },
      complete: () => {
        this.toaster.info(message);
        this.router.navigate(['/accounting/cash-transfer/transaction-list']);
        this.addForm.reset();
      },
    });
  }

  updateOperation() {
    let message = '';
    let param: any = {};
    for (const key in this.addForm.value) {
      let value = this.addForm.controls[key].value;
      if (value != null && value != undefined && value !== '') {
        if (key === 'notes' || key === 'amount') {
          param[key] = value;
        }
      }
    }
    this.http.putReq('accounting/cash-transfers/' + this.id, param).subscribe({
      next: (res) => {
        message = res.message;
      },
      complete: () => {
        this.toaster.info(message);
        this.router.navigate(['/accounting/cash-transfer/transaction-list']);
        this.addForm.reset();
      },
    });
  }

  getAmountInWords() {
    if (this.addForm.value.amount == '') {
      return;
    } else {
      this.addForm
        .get('amount_in_words')!
        .setValue(this.arabicConverter.convert(this.addForm.value.amount));
    }
  }
}
