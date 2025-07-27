import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { offer, offerToDisplay } from '@models/offers';
import { HttpService } from '@services/http.service';
import { BehaviorSubject, Subscription, debounceTime } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnInit {
  private subs = new Subscription();
  previousOffer1 = '';
  previousOffer2 = '';
  searchOffer1Input$ = new BehaviorSubject('');
  searchOffer2Input$ = new BehaviorSubject('');
  searchWordOffer1: any;
  searchWordOffer2: any;
  loaderBooleans = {
    searchOffer1: false,
    searchOffer2: false,
  };
  offer1: offerToDisplay[] = [];
  offer2: offerToDisplay[] = [];

  pageOffer1 = 1;
  pageOffer2 = 1;
  constructor(
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute
  ) {
    this.router.navigate([], {
      queryParams: {
        search_offer_one: null,
        search_offer_two: null,
        slat_one_page: 1,
        slat_two_page: 1,
      },
      queryParamsHandling: '',
    }); //removed merged to fix filter bug
  }
  rowsPerPageOffer1 = 2;
  totalRecordsOffer1 = 5;
  rowsPerPageOffer2 = 2;
  totalRecordsOffer2 = 3;

  previousslat1 = -1;
  previousstlat2 = -1;

  previoussearch_offer_one = '';
  previoussearch_offer_two = '';
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params.hasOwnProperty('slat_one_page')) {
        const previousParam1 = this.previousslat1;
        const currentParam1 = params['slat_one_page'];
        if (previousParam1 !== currentParam1) {
          this.previousslat1 = currentParam1;
          this.pageOffer1 = +params['slat_one_page'] || 1;
          this.getAllOffer1Data(params, this.pageOffer1);
        }
      }

      if (params.hasOwnProperty('search_offer_one')) {
        const previousParam1 = this.previoussearch_offer_one;
        const currentParam1 = params['search_offer_one'];
        if (previousParam1 !== currentParam1) {
          this.previoussearch_offer_one = currentParam1;
          this.pageOffer1 = +params['search_offer_one'] || 1;
          this.getAllOffer1Data(params, this.pageOffer1);
        }
      }

      if (params.hasOwnProperty('slat_two_page')) {
        const previousParam1 = this.previousstlat2;
        const currentParam1 = params['slat_two_page'];
        if (previousParam1 !== currentParam1) {
          this.previousstlat2 = currentParam1;
          this.pageOffer2 = +params['slat_two_page'] || 1;
          this.getAllOffer2Data(params, this.pageOffer2);
        }
      }

      if (params.hasOwnProperty('search_offer_two')) {
        const previousParam1 = this.previoussearch_offer_two;
        const currentParam1 = params['search_offer_two'];
        if (previousParam1 !== currentParam1) {
          this.previoussearch_offer_two = currentParam1;
          this.pageOffer2 = +params['search_offer_two'] || 1;
          this.getAllOffer2Data(params, this.pageOffer2);
        }
      }
    });
  }

  searchOffer1() {
    this.loaderBooleans['searchOffer1'] = true;
    this.subs.add(
      this.searchOffer1Input$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          return this.router.navigate([], {
            queryParams: {
              search_offer_one: this.searchWordOffer1,
            },
            queryParamsHandling: '', //removed merged to fix filter bug
          });
        },
        complete: () => {
          this.loaderBooleans['searchOffer1'] = false;
        },
      })
    );
    this.searchOffer1Input$.next(this.searchWordOffer1);
  }

  searchOffer2() {
    this.loaderBooleans['searchOffer2'] = true;
    this.subs.add(
      this.searchOffer2Input$.pipe(debounceTime(2000)).subscribe({
        next: () => {
          return this.router.navigate([], {
            queryParams: {
              search_offer_two: this.searchWordOffer2,
            },
            queryParamsHandling: '', //removed merged to fix filter bug
          });
        },
        complete: () => {
          this.loaderBooleans['searchOffer2'] = false;
        },
      })
    );
    this.searchOffer2Input$.next(this.searchWordOffer2);
  }

  offerone: offer[] = [];

  rowCount = 2;
  totalRecordsCount = 3;
  currentPage = 1;

  @Output() newItemEvent = new EventEmitter<number>();
  getproductIdFromChild(id: any) {
    this.newItemEvent.emit(id);
  }

  getAllOffer1Data(filter: any, page: number) {
    this.offer1 = [];
    this.totalRecordsOffer1 = 0;
    this.pageOffer1 = 0;
    let param = [{}];
    let x: LooseObject = {};

    if (filter['slat_one_page']) x['page'] = filter['slat_one_page'];
    if (filter['search_offer_one'])
      x['search_offer_one'] = filter['search_offer_one'];
    x['pagination_number_one'] = 10;

    let getUrl = 'products/offers/firstOrder';
    this.http.getReq(getUrl, { params: x }).subscribe({
      next: (res) => {
        if (res.data.length > 0) {
          this.offerone = res.data;
          this.totalRecordsOffer1 = res.meta.total;
          this.pageOffer1 = res.meta.current_page;
          this.rowsPerPageOffer1 = res.meta.per_page;
          this.offerone.forEach((element: any) => {
            this.offer1.push({
              id: element.id,
              name: element.product_name,
              normal_discount: element.main_discount,
              percentage: element.discount,
              quantity_for_offer: element.quantity,
            });
          });
        } else {
          this.offer1 = res.data;
        }
      },
      complete: () => {
        this.loaderBooleans['searchOffer1'] = false;
      },
    });
  }
  offertwo: offer[] = [];
  getAllOffer2Data(filter: any, page: number) {
    this.offer2 = [];

    this.totalRecordsOffer2 = 0;
    this.pageOffer2 = 0;

    let x: LooseObject = {};

    if (filter['slat_two_page']) x['page'] = filter['slat_two_page'];
    if (filter['search_offer_two'])
      x['search_offer_two'] = filter['search_offer_two'];
    x['pagination_number_two'] = 10;

    let getUrl = 'products/offers/secondOrder';
    this.http.getReq(getUrl, { params: x }).subscribe({
      next: (res) => {
        if (res.data.length > 0) {
          this.offertwo = res.data;
          this.totalRecordsOffer2 = res.meta.total;
          this.pageOffer2 = res.meta.current_page;
          this.rowsPerPageOffer2 = res.meta.per_page;
          this.offertwo.forEach((element: any) => {
            this.offer2.push({
              id: element.id,
              name: element.product_name,
              normal_discount: element.main_discount,
              percentage: element.discount,
              quantity_for_offer: element.quantity,
            });
          });
        } else {
          this.offer2 = res.data;
        }
      },
      complete: () => {
        this.loaderBooleans['searchOffer2'] = false;
      },
    });
  }
  changePageOffer1(event: any) {
    this.pageOffer1 = event.page + 1;
    this.offer1 = [];
    this.router.navigate([], {
      queryParams: { slat_one_page: this.pageOffer1 },
      queryParamsHandling: 'merge',
    });
  }
  changePageOffer2(event: any) {
    this.pageOffer2 = event.page + 1;
    this.offer2 = [];

    this.router.navigate([], {
      queryParams: { slat_two_page: this.pageOffer2 },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestory() {
    this.subs.unsubscribe();
  }
}
