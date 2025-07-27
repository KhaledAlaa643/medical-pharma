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
  selector: 'app-deliver-logbooks',
  templateUrl: './deliver-logbooks.component.html',
  styleUrls: ['./deliver-logbooks.component.scss'],
})
export class DeliverLogbooksComponent {
  private subscription = new Subscription();
  addForm!: FormGroup;
  tracks: supplier[] = [];
  deliveries: supplier[] = [];
  accounting_supervisors: supplier[] = [];
  types: fixedData[] = [];
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
      track_id: [],
      supervisor_id: [],
      type: [],
      notes: [],
      representative_id: [],
      end: [],
      start: [],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['tracks', 'deliveries', 'accounting_supervisors'])
        .subscribe({
          next: (res) => {
            this.deliveries = res.data.deliveries;
            this.tracks = res.data.tracks;
            this.accounting_supervisors = res.data.accounting_supervisors;
          },
        })
    );

    this.types = this.auth.getEnums().log_book_type;
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
    this.http.postReq('accounting/log-books', param).subscribe({
      next: (res) => {
        message = res.message;
      },
      complete: () => {
        this.toaster.info(message);
        // this.router.navigate(['/accounting/logbooks']);
        this.addForm.reset();
      },
    });
  }
}
