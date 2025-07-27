import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-accounts',
  templateUrl: './create-accounts.component.html',
  styleUrls: ['./create-accounts.component.scss'],
})
export class CreateAccountsComponent {
  private subscription = new Subscription();
  addForm!: FormGroup;

  types: { name: string; value: number; subtypes: commonObject[] }[] = [];
  subtypes: commonObject[] = [];
  dealing: commonObject[] = [];
  display: commonObject[] = [];
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
    this.initForm();
    this.getDropdownData();
  }

  initForm() {
    this.addForm = this.fb.group({
      account_number: [],
      account_nature: [],
      type: [],
      subtype: [],
      name: [],
      is_disabled: [],
      is_hidden: [],
      initial_credit: [],
      initial_debit: [],
    });
  }

  getDropdownData() {
    this.types = this.auth.getEnums().account_types;
    this.dealing = this.auth.getEnums().account_status_enums;
    this.display = this.auth.getEnums().account_appearance_enums;
  }

  getSubTypes(id: any) {
    this.subtypes = [];
    let selectedType = this.types.find((x) => x.value === id.value);

    if (selectedType) {
      this.subtypes = selectedType.subtypes;
    } else {
      console.warn(`Type with id ${id} not found in types array.`);
    }
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
    this.http.postReq('accounting/accounts', param).subscribe({
      next: (res) => {
        message = res.message;
      },
      complete: () => {
        this.toaster.info(message);
        this.addForm.reset();
      },
    });
  }
}
