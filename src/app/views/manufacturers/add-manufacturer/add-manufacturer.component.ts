import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-manufacturer',
  templateUrl: './add-manufacturer.component.html',
  styleUrls: ['./add-manufacturer.component.scss'],
})
export class AddManufacturerComponent implements OnInit {
  private subscription = new Subscription();
  manufacturerForm!: FormGroup;
  cites: any = [];
  areas: any = [];
  manufacturer_id?: number;
  edit: boolean = false;
  constructor(
    private fb: FormBuilder,
    private generalService: GeneralService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute,
    // private auth: AuthService,
    private router: Router,
    private http: HttpService
  ) {}

  ngOnInit() {
    this.initForm();
    this.getAreas();
    this.getCites();
    this.manufacturer_id = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );
    if (this.manufacturer_id) {
      this.edit = true;
      this.getProductData();
    }
  }

  initForm() {
    this.manufacturerForm = this.fb.group({
      name_en: [''],
      name_ar: [''],
      phone_1: [''],
      phone_2: [''],
      location: [''],
      address: [''],
      city_id: [''],
      area_id: [''],
      manager: [''],
      order: [''],
    });
  }

  getCites() {
    this.generalService.getCity().subscribe((res) => {
      this.cites = res.data;
    });
  }

  getAreas() {
    this.generalService.getArea().subscribe((res) => {
      this.areas = res.data;
    });
  }

  addManufacturer() {
    if (this.manufacturerForm.valid && this.manufacturerForm.touched) {
      let queryParams: any = {};
      for (const key in this.manufacturerForm.value) {
        let value = this.manufacturerForm.controls[key].value;
        if (
          value != null &&
          value != undefined &&
          (value === 0 || value !== '')
        ) {
          queryParams[key] = value;
        }
      }
      this.subscription.add(
        this.http
          .postReq('products/manufacturers/create', queryParams)
          .subscribe({
            next: (res) => {
              this.toastr.success(res.message);
            },
            complete: () => {
              this.router.navigate(['/purchases/manufacturers/list']);
            },
          })
      );
    } else {
    }
  }

  getProductData() {
    // let params = {
    //   manufacturer_id: this.manufacturer_id,
    // };
    this.subscription.add(
      this.http
        .getReq(`products/manufacturers/${this.manufacturer_id}`)
        .subscribe({
          next: (res) => {
            this.manufacturerForm.patchValue(res.data);
          },
          complete: () => {},
        })
    );
  }

  updateManufacturer() {
    if (this.manufacturerForm.valid && this.manufacturerForm.touched) {
      let queryParams: any = {};
      for (const key in this.manufacturerForm.value) {
        let value = this.manufacturerForm.controls[key].value;
        if (
          value != null &&
          value != undefined &&
          (value === 0 || value !== '')
        ) {
          queryParams[key] = value;
        }
      }

      this.subscription.add(
        this.http
          .putReq(`products/manufacturers/${this.manufacturer_id}`, queryParams)
          .subscribe({
            next: (res) => {
              this.toastr.success(res.message);
            },
            complete: () => {
              this.router.navigate(['/purchases/manufacturers/list']);
            },
          })
      );
    } else {
    }
  }
}
