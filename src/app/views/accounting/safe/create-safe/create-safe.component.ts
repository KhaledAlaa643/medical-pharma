import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { commonObject, FiltersObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-safe',
  templateUrl: './create-safe.component.html',
  styleUrls: ['./create-safe.component.scss'],
})
export class CreateSafeComponent {
  private sub: Subscription = new Subscription();
  safeTypes: commonObject[] = [];
  safe_employees: FiltersObject[] = [];
  id?: number;
  nextId?: number;
  safeForm!: FormGroup;
  users: FiltersObject[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getDropdownData();
    this.initForm();
    this.id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    if (this.id) {
      this.getSafeById();
    }
  }

  initForm() {
    this.safeForm = this.fb.group({
      name: [''],
      type: [''],
      safe_employee_id: [''],
      is_private: [0],
      number: [''],
    });
  }

  getDropdownData() {
    this.safeTypes = this.auth.getEnums().safe_type;
    this.sub.add(
      this.generalService.getDropdownData(['safe_employees']).subscribe({
        next: (res) => {
          this.safe_employees = res.data.safe_employees;
        },
      })
    );

    if (!this.id) {
      this.sub.add(
        this.http.getReq('accounting/safes/next').subscribe({
          next: (res) => {
            this.nextId = res.data;
            this.safeForm.patchValue({
              number: this.nextId,
            });
          },
        })
      );
    }
  }

  getSafeById() {
    this.sub.add(
      this.http.getReq(`accounting/safes/show/${this.id}`).subscribe({
        next: (res) => {
          this.safeForm.patchValue({
            name: res.data.name,
            type: res.data.type.value,
            is_private: res.data.is_private === 1 ? true : false,
            number: res.data.id,
          });
          res.data.users.map((user: FiltersObject) => {
            // console.log(user);
            return this.AddEmployee({ value: user.id });
          });
        },
        complete: () => {},
      })
    );
  }

  AddEmployee(event: any) {
    const selectedEmployeeId = event.value; // This gives you the selected employee's ID
    const selectedEmployee = this.safe_employees.findIndex(
      (emp) => emp.id === selectedEmployeeId
    );
    if (!this.users.includes(this.safe_employees[selectedEmployee])) {
      this.users.push(this.safe_employees[selectedEmployee]);
      this.safe_employees.splice(selectedEmployee, 1);

      this.safeForm.patchValue({
        safe_employee_id: '',
      });
    }
  }

  deleteEmployee(emp: FiltersObject, i: number) {
    if (!this.safe_employees.includes(emp)) {
      this.safe_employees.push(emp);
      this.users.splice(i, 1);
    }
    console.log(this.safe_employees);
    console.log(this.users);
  }

  onSubmit() {
    let us = this.users.map((user) => user.id);
    console.log(this.safeForm.value);

    let params;
    if (this.id) {
      params = {
        is_private: this.safeForm.value.is_private === true ? 1 : 0,
        users: us,
      };
      this.sub.add(
        this.http.putReq(`accounting/safes/${this.id}`, params).subscribe({
          next: (res) => {},
          complete: () => {
            this.router.navigate(['/accounting/safe/safe-list']);
          },
        })
      );
    } else {
      params = {
        name: this.safeForm.value.name,
        type: this.safeForm.value.type,
        is_private: this.safeForm.value.is_private === true ? 1 : 0,
        users: us,
      };
      this.sub.add(
        this.http.postReq('accounting/safes', params).subscribe({
          next: (res) => {},
          complete: () => {
            this.router.navigate(['/accounting/safe/safe-list']);
          },
        })
      );
    }
  }
}
