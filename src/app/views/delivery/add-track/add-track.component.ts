import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { city } from '@models/pharmacie';
import { sourcePharmacy } from '@models/sourcePharymacies';
import { supplier } from '@models/suppliers';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-track',
  templateUrl: './add-track.component.html',
  styleUrls: ['./add-track.component.scss'],
})
export class AddTrackComponent implements OnInit {
  private subs = new Subscription();
  id: number = 0;

  pharmacyTargetTotal: number = 0;
  updatedTargetPharmacies: sourcePharmacy[] = [];
  targetPharmaciesID: number[] = [];
  targetPharmaciesLength: number = 0;
  sourcePharmaciesLength: number = 0;
  distributer_employees: supplier[] = [];

  trackForm!: FormGroup;
  source: any = [];
  target: any = [];
  allPharmacies: any = [];
  listTitle = 'خط سير 1';
  maxCycles = 6;
  cycleOptions = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    name: `دورة ${i + 1}`,
  }));

  constructor(
    private http: HttpService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,

    private generalService: GeneralService,
    private auth: AuthService,
    private _formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
    this.sourcePharmaciesLength = this.source.length;
    this.targetPharmaciesLength = this.target.length;
    this.GetPharmacies();
    this.getDropdownData();
    this.getAreaData();
    this.getCitiesData();
    this.id = Number(this.activeRoute.snapshot.paramMap.get('id'));
    if (this.id) {
      this.getTrackById();
    }
    this.trackForm.get('name_ar')?.valueChanges.subscribe((value) => {
      if (value.length > 0) {
        this.listTitle = value;
      }
    });
  }

  getTrackById() {
    this.trackForm.get('selectedShifts')?.disable(); // To disable the dropdown
    this.subs.add(
      this.http.getReq(`tracks/${this.id}`).subscribe({
        next: (res) => {
          console.log(res);
          this.trackForm.patchValue({
            name_en: res.data.name_en,
            name_ar: res.data.name_ar,
            user_1: res.data.delivery.id,
            user_2: res.data.driver.id,
            selectedShifts: res.data.shifts_count,
            shifts: res.data.shifts,
          });

          this.listTitle = res.data.name_ar;
          res.data.shifts.forEach((factor: any) => {
            this.shiftsArray.push(this.createShifts());
          });

          this.shiftsArray.controls.forEach((control, i) => {
            control.patchValue({
              id: res.data.shifts[i].id,
              order_from: res.data.shifts[i].order_from,
              order_to: res.data.shifts[i].order_to,
              start: res.data.shifts[i].start_at,
              expected_time: res.data.shifts[i].delivery_time,
            });
          });
        },
        complete: () => {},
      })
    );
  }

  getDropdownData() {
    this.subs.add(
      this.generalService.getDropdownData(['deliveries']).subscribe({
        next: (res) => {
          this.distributer_employees = res.data.deliveries;
        },
      })
    );
  }

  initForm() {
    this.trackForm = this._formBuilder.group({
      shifts: this._formBuilder.array([]),
      selectedShifts: [0],
      name_en: [],
      name_ar: [],
      user_1: [],
      user_2: [],
    });
    if (this.id) {
      console.log('disable');
    }
  }

  get shiftsArray(): FormArray {
    return this.trackForm.get('shifts') as FormArray;
  }

  // إنشاء نموذج لكل دورة
  createShifts(): FormGroup {
    return this._formBuilder.group({
      id: [],
      order_from: [''],
      order_to: [''],
      start: [''],
      expected_time: [''],
    });
  }

  // تحديث عدد الدورات عند تغيير القائمة المنسدلة
  updateCycles(selectedCount: number): void {
    const cycles = this.shiftsArray;
    while (cycles.length > selectedCount) {
      cycles.removeAt(cycles.length - 1);
    }
    while (cycles.length < selectedCount) {
      cycles.push(this.createShifts());
    }
  }

  cities: city[] = [];
  areas: city[] = [];
  getCitiesData() {
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
  }

  getAreaData() {
    this.subs.add(
      this.generalService.getArea().subscribe({
        next: (res) => {
          this.areas = res.data;
        },
      })
    );
  }
  additional_data: any;
  GetPharmacies() {
    this.subs.add(
      this.http.getReq('tracks/pharmacies').subscribe({
        next: (res) => {
          this.allPharmacies = res.data;
          // this.clients_without_list = res.additional_data.clients_without_list;
          this.sourcePharmaciesLength = this.allPharmacies.length;
          // this.targetPharmacies.forEach((element: any) => {
          //   this.targetPharmaciesID = element.id;
          // });
          this.additional_data = res.additional_data;
        },
        complete: () => {
          this.source = this.allPharmacies;
          if (this.id) {
            this.GetPharmaciesByTrack();
          }
        },
      })
    );
  }
  trackPharmacies: [] = [];
  GetPharmaciesByTrack() {
    let params = {
      sorted_by: 'has_client',
    };
    this.subs.add(
      this.http.getReq(`tracks/pharmacies/${this.id}`, params).subscribe({
        next: (res) => {
          this.trackPharmacies = res.data;

          this.targetPharmaciesLength = this.target.length;
        },
        complete: () => {
          this.target = this.trackPharmacies.map((track: any) => {
            return (
              this.allPharmacies.find((pharm: any) => track.id == pharm.id) ||
              track
            );
          });
          this.targetPharmaciesLength = this.target.length;
        },
      })
    );
  }

  updateTargetLength(pharmacy?: any) {
    if (pharmacy.items[0].has_track) {
      this.target = this.target.filter(
        (item: any) => item.id !== pharmacy.items[0].id
      );
      this.source.splice(0, 0, pharmacy.items[0]);
    } else {
      this.updatedTargetPharmacies.push(pharmacy.items[0]);
    }
    console.log(pharmacy.items);
    // let targetTotal = 0;
    // for (const pharmacy of this.target) {
    //   targetTotal += pharmacy.target;
    // }

    // Update totals and lengths
    // this.pharmacyTargetTotal = targetTotal;
    this.targetPharmaciesLength = this.target.length;
    this.sourcePharmaciesLength = this.source.length;
  }

  updateSourceLength(event?: any) {
    // Recalculate targetTotal
    let targetTotal = 0;
    for (const pharmacy of this.target) {
      targetTotal += pharmacy.target;
    }

    // Update totals and lengths
    this.pharmacyTargetTotal = targetTotal;
    this.targetPharmaciesLength = this.target.length;
    this.sourcePharmaciesLength = this.source.length;
  }

  // Filters for source list
  selectedCitySource: number | null = null;
  selectedAreaSource: number | null = null;
  searchQuerySource: string = '';

  // Filters for target list
  selectedCityTarget: number | null = null;
  selectedAreaTarget: number | null = null;
  searchQueryTarget: string = '';

  /**
   * Filters the source list based on city, area, and name.
   */
  filterSource() {
    this.source = this.allPharmacies.filter((pharmacy: any) => {
      const isInTarget = this.target.some((t: any) => t.id === pharmacy.id);
      if (isInTarget) return false; // Exclude pharmacies that are in the target list

      const matchesCity = this.selectedCitySource
        ? pharmacy.city_id === this.selectedCitySource
        : true;
      const matchesArea = this.selectedAreaSource
        ? pharmacy.area_id === this.selectedAreaSource
        : true;
      const matchesName = this.searchQuerySource
        ? pharmacy.pharmacy_name.includes(this.searchQuerySource)
        : true;

      return matchesCity && matchesArea && matchesName;
    });
  }

  addTrack() {
    let target_id: number[] = [];
    this.target.map((track: any) => {
      target_id.push(track.id);
    });
    let queryParams: any = {
      name_en: this.trackForm.value.name_en,
      name_ar: this.trackForm.value.name_ar,
      shifts: this.trackForm.value.shifts,
      users: [this.trackForm.value.user_1, this.trackForm.value.user_2],
      pharmacies: target_id,
      shift_nums: this.trackForm.value.selectedShifts,
    };
    console.log(queryParams);

    let message: string = '';
    let product: any;
    this.subs.add(
      this.http.postReq('tracks', queryParams).subscribe({
        next: (res) => {
          message = res.message;
          product = res.data;
        },
        complete: () => {
          this.toastrService.success(message);
          this.router.navigate(['/delivery/tracks-list']);
        },
      })
    );
  }

  editTrack() {
    let target_id: number[] = [];
    this.target.map((track: any) => {
      target_id.push(track.id);
    });
    let queryParams: any = {
      name_en: this.trackForm.value.name_en,
      name_ar: this.trackForm.value.name_ar,
      shifts: this.trackForm.value.shifts,
      users: [this.trackForm.value.user_1, this.trackForm.value.user_2],
      pharmacies: target_id,
      shift_nums: this.trackForm.value.selectedShifts,
    };
    console.log(queryParams);

    let message: string = '';
    let product: any;
    this.subs.add(
      this.http.putReq('tracks/' + this.id, queryParams).subscribe({
        next: (res) => {
          message = res.message;
          product = res.data;
        },
        complete: () => {
          this.toastrService.success(message);
          this.router.navigate(['/delivery/tracks-list']);
        },
      })
    );
  }

  checkDisablePharmacy(pharmacy: any) {
    let Found = pharmacy.has_track;
    // console.log(pharmacy);
    // for (const list of pharmacy) {
    // if (Found == true) {
    //   // Found = true;
    //   console.log(pharmacy);

    //   return Found;
    // }
    // }

    return Found;
  }
}
