import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
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
  selector: 'app-add-supervisor-client-list',
  templateUrl: './add-supervisor-client-list.component.html',
  styleUrls: ['./add-supervisor-client-list.component.scss'],
})
export class AddSupervisorClientListComponent {
  private subs = new Subscription();
  id: number = 0;

  pharmacyTargetTotal: number = 0;
  updatedTargetPharmacies: sourcePharmacy[] = [];
  targetPharmaciesID: number[] = [];
  targetPharmaciesLength: number = 0;
  sourcePharmaciesLength: number = 0;
  distributer_employees: supplier[] = [];
  tracks: supplier[] = [];

  listForm!: FormGroup;
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
    // this.getAreaData();
    this.getCitiesData();
    this.id = Number(this.activeRoute.snapshot.paramMap.get('id'));
    if (this.id) {
      this.getListById();
    }
    this.listForm.get('name')?.valueChanges.subscribe((value) => {
      if (value.length > 0) {
        this.listTitle = value;
      }
    });
  }

  getListById() {
    this.subs.add(
      this.http.getReq(`accounting/client-lists/${this.id}`).subscribe({
        next: (res) => {
          console.log(res);
          this.listForm.patchValue({
            supervisor_id: res.data.supervisor_id.toString(),
            ...res.data,
          });
          console.log(res.data.supervisor_id.toString());
          this.listTitle = res.data.name;
        },
        complete: () => {},
      })
    );
  }

  getDropdownData() {
    this.subs.add(
      this.generalService
        .getDropdownData(['accounting_supervisors', 'tracks'])
        .subscribe({
          next: (res) => {
            this.distributer_employees = res.data.accounting_supervisors;
            this.tracks = res.data.tracks;
          },
        })
    );
  }

  initForm() {
    this.listForm = this._formBuilder.group({
      supervisor_id: [],
      name: [],
      city_id: [],
      area_id: [],
      track_id: [],
    });
    if (this.id) {
      console.log('disable');
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

  getAreaData(event: any) {
    this.subs.add(
      this.generalService.getCity({ city_id: event.value }).subscribe({
        next: (res) => {
          this.areas = res.data[0].areas;
        },
      })
    );
  }
  additional_data: any;
  GetPharmacies() {
    this.subs.add(
      this.http.getReq('accounting/client-lists/pharmacies').subscribe({
        next: (res) => {
          this.allPharmacies = res.data;
          this.sourcePharmaciesLength = this.allPharmacies.length;

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
      this.http
        .getReq(`accounting/client-lists/pharmacies/${this.id}`, params)
        .subscribe({
          next: (res) => {
            this.trackPharmacies = res.data;

            this.targetPharmaciesLength = this.target.length;
          },
          complete: () => {
            this.target = this.trackPharmacies.map((track: any) => {
              return (
                this.allPharmacies.find((pharm: any, idx: number) => {
                  if (track.id == pharm.id) {
                    this.source.splice(idx, 1);
                    return true;
                  }
                  return false;
                }) || track
              );
            });
            this.targetPharmaciesLength = this.target.length;
          },
        })
    );
  }

  updateTargetLength(pharmacy?: any) {
    if (pharmacy.items[0].has_list) {
      this.target = this.target.filter(
        (item: any) => item.id !== pharmacy.items[0].id
      );
      this.source.splice(0, 0, pharmacy.items[0]);
    } else {
      this.updatedTargetPharmacies.push(pharmacy.items[0]);
    }
    this.addAllDisabled = false;

    this.targetPharmaciesLength = this.target.length;
    this.sourcePharmaciesLength = this.source.length;
  }

  updateSourceLength(event?: any) {
    // Recalculate targetTotal
    let targetTotal = 0;
    for (const pharmacy of this.target) {
      targetTotal += pharmacy.target;
    }
    event.items[0].has_list = false;
    // Update totals and lengths
    this.pharmacyTargetTotal = targetTotal;
    this.targetPharmaciesLength = this.target.length;
    this.sourcePharmaciesLength = this.source.length;
    this.addAllDisabled = false;
  }

  // Filters for source list
  selectedCitySource: number | null = null;
  selectedAreaSource: number | null = null;
  selectedTrackSource: number | null = null;
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

      const matchesCity = this.listForm.value.city_id
        ? pharmacy.city_id === this.listForm.value.city_id
        : true;
      const matchesArea = this.listForm.value.area_id
        ? pharmacy.area_id === this.listForm.value.area_id
        : true;
      const matchesTrack = this.listForm.value.track_id
        ? pharmacy.track_id === this.listForm.value.track_id
        : true;

      return matchesCity && matchesArea && matchesTrack;
    });
  }

  addList() {
    let target_id: number[] = [];
    this.target.map((list: any) => {
      target_id.push(list.id);
    });
    let queryParams: any = {
      name: this.listForm.value.name,
      supervisor_id: this.listForm.value.supervisor_id,
      pharmacyIds: target_id,
    };
    console.log(queryParams);

    let message: string = '';
    let product: any;
    this.subs.add(
      this.http.postReq('accounting/client-lists', queryParams).subscribe({
        next: (res) => {
          message = res.message;
          product = res.data;
        },
        complete: () => {
          this.toastrService.success(message);
          this.router.navigate(['/accounting/supervisor-clients/list']);
        },
      })
    );
  }

  editList() {
    let target_id: number[] = [];
    this.target.map((list: any) => {
      target_id.push(list.id);
    });
    let queryParams: any = {
      name: this.listForm.value.name,
      supervisor_id: this.listForm.value.supervisor_id,
      pharmacyIds: target_id,
    };
    console.log(queryParams);

    let message: string = '';
    let product: any;
    this.subs.add(
      this.http
        .putReq('accounting/client-lists/' + this.id, queryParams)
        .subscribe({
          next: (res) => {
            message = res.message;
            product = res.data;
          },
          complete: () => {
            this.toastrService.success(message);
            this.router.navigate(['/accounting/supervisor-clients/list']);
          },
        })
    );
  }

  checkDisablePharmacy(pharmacy: any) {
    let Found = pharmacy.has_list;

    return Found;
  }

  addAllDisabled = false;
  addAll() {
    const newTarget = [...this.target];
    const newSource = [];

    for (let idx = 0; idx < this.source.length; idx++) {
      const pharmacy = this.source[idx];
      if (!this.checkDisablePharmacy(pharmacy)) {
        newTarget.push(pharmacy);
      } else {
        newSource.push(pharmacy);
      }
    }
    this.target = newTarget;
    this.source = newSource;

    this.updateSourceLength();
    this.addAllDisabled = true;
  }
}
