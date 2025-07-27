import {
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@services/http.service';
import { Subscription, retry } from 'rxjs';
import * as moment from 'moment';
import { FixedDataService } from '@services/fixed-data.service';
import { sales } from '@models/sales';
import { area, city, pharmacie, track } from '@models/pharmacie';
import { users } from '@models/client.js';
import { sourcePharmacy } from '@models/sourcePharymacies';
import { GeneralService } from '@services/general.service';
import { AuthService } from '@services/auth.service';
import { commonObject } from '@models/settign-enums';

export interface listings {
  id: number;
  name: string;
  type_value: number;
  type: string;
  pharmacies_number: number;
  list_target: number;
  users: users[];
  pharmacies: pharmacie[];
}
@Component({
  selector: 'app-create-client-list',
  templateUrl: './create-client-list.component.html',
  styleUrls: ['./create-client-list.component.scss'],
})
export class CreateClientListComponent implements OnInit, OnDestroy, OnChanges {
  private subs = new Subscription();

  trackData: track[] = [];
  citiesData: city[] = [];
  areasData: area[] = [];
  filterForm!: FormGroup;
  EditListForm!: FormGroup;
  isCreate: boolean = false;
  isEdit: boolean = false;

  listTitle: string = '';
  listTitleFilled: string = 'قائمة عملاء 1';
  sourcePharmaciesLength: number = 0;
  targetPharmaciesLength: number = 0;
  listID?: number;
  toEditList!: listings;

  sourcePharmacies: sourcePharmacy[] = [];
  targetPharmacies: sourcePharmacy[] = [];
  updatedTargetPharmacies: sourcePharmacy[] = [];
  targetPharmaciesID: number[] = [];

  dateTo?: Date;
  dateFrom?: Date;

  follow_up: commonObject[] = [];
  call_time: commonObject[] = [];
  listTarget: any;
  pharmacyTargetTotal: number = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fixed_data: FixedDataService,
    private generalService: GeneralService,
    private auth: AuthService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {}
  activeURL: string = '';
  disableType: boolean = false;
  ngOnInit() {
    this.getAgent();

    this.activatedRoute.paramMap.subscribe((params) => {
      this.activeURL = this.router.url;
      if (this.activeURL.includes('add')) {
        this.isCreate = true;
        this.isEdit = false;
      } else if (this.activeURL.includes('edit')) {
        this.isCreate = false;
        this.isEdit = true;
      }
    });
    if (Number(this.activatedRoute.snapshot.paramMap.get('id'))) {
      this.disableType = true;
      this.listID = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    }

    this.EditListForm = this.fb.group({
      list_name: [''],
      type: [''],
      user_id: [''],
      city_id: [''],
      area_id: [''],
      track_id: [''],
      follow_up: [''],
      call_shift: [''],
      pharmacy_ids: [[]],
      search_word_one: [''],
      search_word_two: [''],
    });

    this.sourcePharmaciesLength = this.sourcePharmacies.length;
    this.targetPharmaciesLength = this.targetPharmacies.length;

    this.GetPharmacies();
    this.getShiftType();
    this.getTrackData();
    this.getCitiesData();

    this.call_time = this.auth.getEnums().pharmacy_shifts;
    this.follow_up = this.auth.getEnums().pharmacy_follow_up;
  }
  moveItem(event: any) {}
  sales: sales[] = [];
  getAgent() {
    this.subs.add(
      this.generalService.getUsers().subscribe({
        next: (res) => {
          this.sales = res.data;
        },
        complete: () => {},
      })
    );
  }

  ShiftType: any = [];

  getShiftType() {
    this.subs.add(
      this.fixed_data.getAllFixedData().subscribe({
        next: (res) => {
          this.ShiftType = res.data.listing_type;
        },
      })
    );
  }

  getTrackData() {
    this.subs.add(
      this.generalService.getTracks().subscribe({
        next: (res) => {
          this.trackData = res.data;
        },
      })
    );
  }

  getCitiesData() {
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.citiesData = res.data;
        },
      })
    );
  }

  getAreaData() {
    this.subs.add(
      this.generalService
        .getCity({ city_id: this.EditListForm.value.city_id })
        .subscribe({
          next: (res) => {
            this.areasData = res.data[0].areas;
          },
        })
    );
  }
  clients_without_list!: number;
  GetPharmacies() {
    let params = {
      sorted_by: 'has_client',
    };
    this.subs.add(
      this.generalService.getPharmacies(params).subscribe({
        next: (res) => {
          this.sourcePharmacies = res.data;
          this.clients_without_list = res.additional_data.clients_without_list;
          this.sourcePharmaciesLength = this.sourcePharmacies.length;
          this.targetPharmacies.forEach((element: any) => {
            this.targetPharmaciesID = element.id;
          });
        },
        complete: () => {
          if (this.listID) {
            this.getDataEditList();
          }
        },
      })
    );
  }

  filter() {
    let queryParams: any = {};
    for (const key in this.EditListForm.value) {
      let value = this.EditListForm.value[key];
      if (
        value !== null &&
        value !== undefined &&
        (value === 0 || value !== '')
      ) {
        queryParams[key] = value;
      }
    }
    queryParams['sorted_by'] = 'has_client';

    this.subs.add(
      this.generalService.getPharmacies(queryParams).subscribe({
        next: (res) => {
          this.sourcePharmacies = res.data;
          this.sourcePharmaciesLength = this.sourcePharmacies.length;
          this.targetPharmacies.forEach((element: any) => {
            this.targetPharmaciesID = element.id;
          });
        },
      })
    );
  }

  updateSourceLength(event?: any) {
    let targetTotal = 0;
    for (const pharmacy of this.targetPharmacies) {
      targetTotal += pharmacy.target;
    }
    this.pharmacyTargetTotal = targetTotal;
    this.targetPharmaciesLength = this.targetPharmacies.length;
    this.sourcePharmaciesLength = this.sourcePharmacies.length;
  }
  updateTargetLength(pharmacy?: any) {
    if (
      pharmacy.items[0].lists.length > 0 &&
      pharmacy.items[0].lists[0].type_value ==
        this.EditListForm.controls['type'].value
    ) {
      this.targetPharmacies.pop();
      this.sourcePharmacies.splice(0, 0, pharmacy.items[0]);
    } else {
      this.updatedTargetPharmacies.push(pharmacy.items[0]);
    }
    let targetTotal = 0;
    for (const pharmacy of this.targetPharmacies) {
      targetTotal += pharmacy.target;
    }

    this.pharmacyTargetTotal = targetTotal;
    this.targetPharmaciesLength = this.targetPharmacies.length;
    this.sourcePharmaciesLength = this.sourcePharmacies.length;
  }

  getTargetInitial() {
    let targetTotal = 0;
    for (const pharmacy of this.targetPharmacies) {
      targetTotal += pharmacy.target;
    }

    this.pharmacyTargetTotal = targetTotal;
    this.targetPharmaciesLength = this.targetPharmacies.length;
    this.sourcePharmaciesLength = this.sourcePharmacies.length;
  }

  getDataEditList(param?: any) {
    param = {
      listing_id: this.listID,
    };

    this.subs.add(
      this.http.getReq('listings', { params: param }).subscribe({
        next: (res) => {
          this.toEditList = res.data[0];
          this.targetPharmacies = res.data[0].pharmacies;

          this.listTarget = res.data[0].list_target;
          this.EditListForm.controls['list_name'].setValue(
            this.toEditList.name
          );
          this.targetPharmaciesLength = this.toEditList.pharmacies_number;
          this.EditListForm.controls['type'].setValue(
            this.toEditList.type_value
          );
          this.EditListForm.controls['user_id'].setValue(
            this.toEditList.users[0]?.id
          );
        },
        complete: () => {
          // this.sourcePharmacies.forEach((s: any, indexs: any) => {
          //   this.targetPharmacies.forEach((t: any, indext: any) => {
          //     if (t.id == s.id) {
          //       this.sourcePharmacies.splice(indexs, 1)
          //       this.sourcePharmaciesLength = this.sourcePharmacies.length
          //     }
          //   })

          // })

          this.sourcePharmacies = this.sourcePharmacies.filter(
            (sourcePharmacy) =>
              !this.targetPharmacies.some(
                (targetPharmacy) => targetPharmacy.id === sourcePharmacy.id
              )
          );
          this.getTargetInitial();
        },
      })
    );
  }

  canEdit = true;

  updateList() {
    if (!this.canEdit) {
      return;
    }

    this.canEdit = false;

    this.targetPharmaciesID = [];
    this.targetPharmacies.forEach((element: any) => {
      this.targetPharmaciesID.push(element.id);
    });

    let param = {
      listing_id: this.listID,
      pharmacy_ids: this.targetPharmaciesID,
      name: this.EditListForm.controls['list_name'].value,
      user_id: this.EditListForm.controls['user_id'].value,
      type: this.EditListForm.controls['type'].value,
    };

    this.subs.add(
      this.http.putReq('listings/update', param).subscribe({
        next: (res) => {},
        complete: () => {
          this.canEdit = true;
          this.router.navigate(['salesTeam/sales-man-clients']);
        },
        error: () => {
          this.canEdit = true;
        },
      })
    );
  }

  createList() {
    this.targetPharmaciesID = [];
    this.targetPharmacies.forEach((element: any) => {
      this.targetPharmaciesID.push(element.id);
    });

    let param = {
      pharmacy_ids: this.targetPharmaciesID,
      name: this.EditListForm.controls['list_name'].value,
      user_id: this.EditListForm.controls['user_id'].value,
      type: this.EditListForm.controls['type'].value,
    };

    this.subs.add(
      this.http.postReq('listings/create', param).subscribe({
        next: (res) => {},
        complete: () => {
          this.router.navigate(['salesTeam/sales-man-clients']);
        },
      })
    );
  }
  checkDisablePharmacy(pharmacy: any) {
    let Found = false;

    for (const list of pharmacy.lists) {
      if (list?.type_value == this.EditListForm.controls['type'].value) {
        Found = true;
        break;
      }
    }

    return Found;
  }
  resetSelectedPharmacies() {
    this.updatedTargetPharmacies.forEach((pharmacy: any, index: number) => {
      this.sourcePharmacies.splice(0, 0, pharmacy);
    });

    this.sourcePharmacies.forEach((pharmacy: any, index) => {
      if (pharmacy.lists.length != 0 && pharmacy.lists.length < 2) {
        pharmacy.lists.forEach((list: any) => {
          if (list.type_value == this.EditListForm.controls['type'].value) {
            return;
          } else {
            this.sourcePharmacies.splice(index, 1);
            this.sourcePharmacies.splice(0, 0, pharmacy);
          }
        });
      }
      // else{
      //   if(pharmacy.lists.length==0){
      //     this.sourcePharmacies.splice(0, 0, pharmacy)
      //   }
      // }
    });

    this.targetPharmacies = [];
    this.updatedTargetPharmacies = [];
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
