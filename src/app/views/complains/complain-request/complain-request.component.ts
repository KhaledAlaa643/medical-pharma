import {
  Component,
  ElementRef,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { client } from '@models/client';
import { HttpService } from '@services/http.service';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import { userRole } from '@models/user-role';
import { clients, groupedPharmacy, pharmacie } from '@models/pharmacie.js';
import { roles } from '@models/roles.js';
import { sales } from '@models/sales.js';
import { GeneralService } from '@services/general.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-complain-request',
  templateUrl: './complain-request.component.html',
  styleUrls: ['./complain-request.component.scss'],
})
export class ComplainRequestComponent implements OnInit, OnChanges {
  private subs = new Subscription();
  pharmaciesData: any;

  constructor(
    private http: HttpService,
    private generalService: GeneralService,
    private fb: FormBuilder,
    private router: Router,
    private _toast: ToastrService,
    private auth: AuthService
  ) {
    this.router.navigate([], {
      queryParams: { name: null },
      queryParamsHandling: 'merge',
    });
  }
  @ViewChild('pharmacyName') private pharmacyName!: Dropdown;
  @ViewChild('salesAgent') private salesAgent!: Dropdown;
  @ViewChild('role_id') private role_id!: Dropdown;
  @ViewChild('accusedEmployee') private accusedEmployee!: Dropdown;
  @ViewChild('complaintBox') private complaintBox!: ElementRef;

  loaderBooleans = {
    code: false,
    client_name: false,
    product_name: false,
    warehouses: false,
    quantity: false,
    search: false,
    role_id: false,
    sales_name: false,
    client_branch: false,
    accused_agent: false,
    sales_agent: false,
  };
  isButtonDisabled: boolean = false;
  roleBoolean = false;
  userDepartmentBoolean = false;
  gotToPharmacies: boolean = false;
  activateLoader: boolean = false;
  clientCode: string | null = '';
  event: any;
  clientDataForm!: FormGroup;
  allDepartment: roles[] = [];
  clients: clients[] = [];
  allUserDepartments: userRole[] = [];
  usersFromDepartment: any;
  sales: sales[] = [];
  clientID: any;
  selectedPharmacyId: number = -1;
  salesID: string = '';
  userID: string = '';
  pharmacies: pharmacie[] = [];
  groupPharmacied: groupedPharmacy[] = [];

  ngOnInit(): void {
    this.clientDataForm = this.fb.group({
      pharmacy_id: [''],
      sales_id: [''],
      complaintBox: [''],
      department: [''],
      userID: [''],
    });
    this.getPharmacy();
    this.getClientData();
    this.getSalesAgentData();
    this.getDepartment();
  }

  getClientData() {
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          this.clients = res.data;
          this.loaderBooleans['client_name'] = false;
        },
      })
    );
  }

  getSalesAgentData() {
    this.loaderBooleans['sales_agent'] = true;
    this.subs.add(
      this.generalService.getUsers().subscribe({
        next: (res) => {
          this.sales = res.data;
          this.loaderBooleans['sales_agent'] = false;
        },
      })
    );
  }
  getDepartment() {
    this.allDepartment = this.auth.getEnums().department_type;
  }

  getUserRoleData() {
    this.userDepartmentBoolean = true;
    let param = {
      department: this.usersFromDepartment,
    };
    this.subs.add(
      this.generalService.getUserDepartments(param).subscribe({
        next: (res) => {
          this.allUserDepartments = res.data;
          this.userDepartmentBoolean = false;
        },
      })
    );
  }

  getwarehouse(dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.pharmacyName.focus();
      dropdown?.close();
    }
  }

  goToSalesAgentFromPharmacy(dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.salesAgent.focus();
      dropdown?.close();
    }
  }

  goToRoleFromSalesAgent(dropdown: any, $event: any) {
    if (!dropdown.overlayVisible) {
      this.role_id.focus();
      dropdown?.close();
    }
  }
  goToAccusedEmployeeFromRole(dropdown: any, $event: any) {
    if (!dropdown.overlayVisible) {
      this.accusedEmployee.focus();
    }
  }

  ngOnChanges() {}

  getPharmacy() {
    // let param=['pharmacies']
    // this.subs.add(this.generalService.getDropdownData(param).subscribe({
    //   next:res=>{

    //   }
    // }))

    this.subs.add(
      this.generalService.getPharmacies().subscribe({
        next: (res) => {
          this.pharmacies = res.data;
        },
        complete: () => {
          console.log(this.pharmacies);
          this.pharmacies.forEach((element) => {
            this.groupPharmacied.push({
              name: element?.clients[0]?.name + '-' + element?.name,
              id: element?.id,
              code: element?.code,
              client_id: element?.clients[0]?.id,
            });
          });
        },
      })
    );
  }

  goFromCodeToPharmacy() {
    setTimeout(() => {
      this.gotToPharmacies = true;
    }, 100);
  }

  goToPharmacy(dropdown: any) {
    if (!dropdown.overlayVisible) {
      this.gotToPharmacies = true;
      dropdown?.close();
    }
  }
  client: client = {} as client;
  getClient(param: string, e?: any, dropdown?: any) {
    let params;
    if (param == 'code' && this.clientCode) {
      this.loaderBooleans['code'] = true;
      params = {
        code: this.clientCode,
      };
      this.clientID = null;
      let index = this.pharmacies.findIndex((x) => x.code === this.clientCode);
      console.log(index);
      console.log(this.clientCode);
      if (index > -1) {
        this.clientID = this.pharmacies[index].id;
        this.clientDataForm.controls['pharmacy_id'].setValue(
          this.pharmacies[index].id
        );
        this.clientDataForm.controls['sales_id'].setValue(
          this.pharmacies[index].current_sales?.id
        );
      } else {
        this._toast.error(
          'الرمز الذي ادخلته غير صحيح او غير موجود في قاعدة البيانات'
        );
      }
    } else if (param == 'clientId' && this.clientID) {
      this.loaderBooleans['client_name'] = true;
      this.clientID = e;
      params = { id: this.clientID };
      this.clientDataForm.controls['pharmacy_id'].setValue(this.clientID);

      this.clientCode = '';
      let index = this.pharmacies.findIndex((x) => x.id === this.clientID);
      if (index > -1) {
        this.clientCode = this.pharmacies[index].code;
        this.clientDataForm.controls['sales_id'].setValue(
          this.pharmacies[index].current_sales?.id
        );
      }
    } else {
      this.clientID = null;
      this.clientCode = '';
    }
    if (params) {
      this.gotToPharmacies = false;
      this.loaderBooleans['client_name'] = false;
      this.loaderBooleans['code'] = false;
    }
  }

  postComplaint() {
    let message = '';
    let clientId = '';
    let index = this.groupPharmacied.findIndex(
      (c: any) => c.id == this.clientDataForm.controls['pharmacy_id'].value
    );
    if (index > -1) {
      clientId = this.groupPharmacied[index].client_id;
    }
    let paramRaw = {
      client_id: clientId,
      pharmacy_id: this.clientDataForm.controls['pharmacy_id'].value,
      sales_id: this.clientDataForm.controls['sales_id'].value,
      user_id: this.clientDataForm.controls['userID'].value,
      body: this.clientDataForm.get('complaintBox')?.value,
      department: this.clientDataForm.get('department')?.value,
    };

    // Filter only populated values
    let param = Object.fromEntries(
      Object.entries(paramRaw).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ''
      )
    );
    this.isButtonDisabled = true;
    this.activateLoader = true;
    this.subs.add(
      this.http.postReq('settings/complains/create', param).subscribe({
        next: (res) => {
          this.clientDataForm.reset();
          this.clientCode = '';
          this.clientID = -1;
          message = res.message;
        },
        complete: () => {
          this.isButtonDisabled = false;
          this.activateLoader = false;
          this._toast.success(message);
        },
        error: () => {
          this.isButtonDisabled = false;
          this.activateLoader = false;
        },
      })
    );
  }

  onFocusSwitchercomplaintBox(dropdown: any, event: any) {
    if (!dropdown?.overlayVisible) {
      this.userID = this.clientDataForm.controls['userID'].value;
      this.complaintBox.nativeElement.focus();
      dropdown?.close();
    }
  }

  getclientID() {
    this.clientID = this.clientDataForm.controls['client_id'].value;
  }
  getPharmacyID($event: any) {
    this.selectedPharmacyId = $event.value;
  }
  getSalesID($event: any) {
    this.salesID = this.clientDataForm.controls['sales_id'].value;
  }
  getUserID($event: any) {
    this.userID = this.clientDataForm.get('userID')?.value;
  }
  getRoleID() {
    this.usersFromDepartment = this.clientDataForm.get('department')?.value;
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
