import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fixedData } from '@models/products';
import { supplier } from '@models/suppliers';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-incentives-or-penalties',
  templateUrl: './create-incentives-or-penalties.component.html',
  styleUrls: ['./create-incentives-or-penalties.component.scss'],
})
export class CreateIncentivesOrPenaltiesComponent {
  private subscription = new Subscription();
  addForm!: FormGroup;
  employees: supplier[] = [];
  transaction_value: supplier[] = [];
  types: fixedData[] = [];
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
    private toaster: ToastrService
  ) {}

  ngOnInit() {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');

    this.initForm();
    this.getDropdownData();
    if (this.id) {
      this.getById();
    }
  }

  initForm() {
    this.addForm = this.fb.group({
      user_id: [],
      transaction_value: [],
      type: [],
      note: [],
      amount: [],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService.getDropdownData(['employees']).subscribe({
        next: (res) => {
          this.employees = res.data.employees;
        },
      })
    );
    this.transaction_value = this.auth.getEnums().incentive_penalty_transaction;
    // this.employees = this.auth.getEnums().employees;

    this.types = this.auth.getEnums().incentive_penalty;
  }

  getById() {
    this.subscription.add(
      this.http.getReq(`accounting/incentives-penalties/${this.id}`).subscribe({
        next: (res) => {
          this.incentiveOrPenalty = res.data;
        },
        complete: () => {
          this.addForm.patchValue({
            type: this.incentiveOrPenalty.type.value,
            user_id: this.incentiveOrPenalty.employee.id,
            transaction_value: this.incentiveOrPenalty.transaction_value.value,
            amount: this.incentiveOrPenalty.amount,
            note: this.incentiveOrPenalty.note,
          });
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
    this.http.postReq('accounting/incentives-penalties', param).subscribe({
      next: (res) => {
        message = res.message;
      },
      complete: () => {
        this.toaster.info(message);
        this.router.navigate(['/accounting/incentives-or-penalties/list']);
        this.addForm.reset();
      },
    });
  }

  cancelOperation() {
    let message = '';
    this.http
      .putReq(`accounting/incentives-penalties/${this.id}/cancel`)
      .subscribe({
        next: (res) => {
          message = res.message;
        },
        complete: () => {
          this.toaster.info(message);
          this.router.navigate(['/accounting/incentives-or-penalties/list']);
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
        param[key] = value;
      }
    }
    this.http
      .putReq('accounting/incentives-penalties/' + this.id, param)
      .subscribe({
        next: (res) => {
          message = res.message;
        },
        complete: () => {
          this.toaster.info(message);
          this.router.navigate(['/accounting/incentives-or-penalties/list']);
          this.addForm.reset();
        },
      });
  }
}
