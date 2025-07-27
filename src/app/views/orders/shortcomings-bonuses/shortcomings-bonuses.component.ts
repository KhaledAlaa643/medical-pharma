import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { Params, Router } from '@angular/router';
import { HttpService } from '@services/http.service';
import { BehaviorSubject, Subscription, debounceTime } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ColumnValue, columnHeaders } from '@models/tableData';

@Component({
  selector: 'app-shortcomings-bonuses',
  templateUrl: './shortcomings-bonuses.component.html',
  styleUrls: ['./shortcomings-bonuses.component.scss'],
})
export class ShortcomingsBonusesComponent implements OnInit {
  @Input() getIdFromRegister: any;
  columnsArrayShortage: columnHeaders[] = [
    {
      name: 'اسم الصنف ',
      search: true,
    },
    {
      name: 'رقم الكوتة',
    },
    {
      name: ' خصم الصنف	',
    },
  ];
  columnsNameShortage: ColumnValue[] = [
    {
      name: 'name',
      type: 'nameClickable',
    },
    {
      name: 'limited_quantity',
      type: 'normal',
    },
    {
      name: 'normal_discount',
      type: 'normal',
    },
  ];
  columnsArrayBonus: columnHeaders[] = [
    {
      name: ' اسم الصنف ',
      search: true,
    },
    {
      name: 'شريحة أولي ',
    },
    {
      name: 'بونص 1',
    },
    {
      name: 'شريحة ثانية	',
    },
    {
      name: 'بونص 2	',
    },
  ];
  columnsNameBonus: ColumnValue[] = [
    {
      name: 'name',
      type: 'nameClickable',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'quantity_for_offer',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'multiple2',
    },
    {
      name: 'quantity_for_offer',
      type: 'multiple2',
    },
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private _router: Router
  ) {
    this._router.navigate([], {
      queryParams: { nameShortage: null, nameBonus: null },
      queryParamsHandling: 'merge',
    });
  }

  private subs = new Subscription();
  searchTerm: string | undefined;
  searchResults: any[] = [];
  searchShortage: string = '';
  searchInput$ = new BehaviorSubject('');
  bonusesSearchInput$ = new BehaviorSubject('');
  shortageSearchInput$ = new BehaviorSubject('');
  shortages!: [];
  loaderBooleans = {
    code: false,
    client_name: false,
    product_name: false,
    warehouses: false,
    quantity: false,
    searchS: false,
    searchB: false,
    shortage: false,
    bonus: false,
  };
  productID: any;
  searchBonus: any;
  searchBonusResults: any = [];

  previousBounus = '';
  previousShortage = '';
  ngOnInit() {
    this.getAllData({});
    this.getAllBonusData({});
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params.hasOwnProperty('nameShortage')) {
        const previousParam1 = this.previousShortage;
        const currentParam1 = params['nameShortage'];
        if (previousParam1 !== currentParam1) {
          this.previousShortage = currentParam1;
          this.getAllData(params);
        }
      }

      if (params.hasOwnProperty('nameBonus')) {
        const previousParam1 = this.previousBounus;
        const currentParam1 = params['nameBonus'];
        if (previousParam1 !== currentParam1) {
          this.previousBounus = currentParam1;
          this.getAllBonusData(params);
        }
      }
    });
  }

  search() {
    this.loaderBooleans['searchS'] = true;
    this.subs.add(
      this.searchInput$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          this.loaderBooleans['searchS'] = false;
          this._router.navigate([], {
            queryParams: {
              nameShortage: this.searchShortage,
            },
            queryParamsHandling: 'merge',
          });
        },
        complete: () => {},
      })
    );
    // setTimeout(() => {
    //   this.searchInput$.next(searchWord);
    // }, 1000);
  }

  searchBonuses() {
    this.loaderBooleans['searchB'] = true;
    this.subs.add(
      this.bonusesSearchInput$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          return this._router.navigate([], {
            queryParams: {
              nameBonus: this.searchBonus,
            },
            queryParamsHandling: 'merge',
          });
        },
        complete: () => {
          this.loaderBooleans['searchB'] = false;
        },
      })
    );
    // this.bonusesSearchInput$.next(this.searchBonus);
  }

  getAllData(filter: any) {
    let param = {};
    if (filter['nameShortage']) {
      param = { nameShortage: filter['nameShortage'] };
    }

    let getUrl = 'products/shortage';
    this.http.getReq(getUrl, { params: param }).subscribe({
      next: (res) => {
        this.searchResults = res.data;
      },
      complete: () => {
        this.loaderBooleans['searchS'] = false;
      },
    });
  }

  getAllBonusData(filter: any) {
    let param = {};
    if (filter['nameBonus']) {
      param = { nameBonus: filter['nameBonus'] };
    }

    let getUrl = 'products/bonus/order';
    this.searchBonusResults = [];

    this.http.getReq(getUrl, { params: param }).subscribe({
      next: (res) => {
        this.searchBonusResults = res.data;
      },
      complete: () => {
        this.loaderBooleans['searchB'] = false;
      },
    });
  }

  @Output() emitProductIdEvent = new EventEmitter<number>();
  getproductIdFromChild(id: any) {
    this.emitProductIdEvent.emit(id);
  }

  ngOnDestory() {
    this.subs.unsubscribe();
  }
}
