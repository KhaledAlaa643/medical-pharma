import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { products } from '@models/products';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-market-discount',
  templateUrl: './market-discount.component.html',
  styleUrls: ['./market-discount.component.scss'],
})
export class MarketDiscountComponent implements OnInit {
  private subscription = new Subscription();
  filterForm!: FormGroup;
  columnsArray: columnHeaders[] = [
    { name: 'اسم المورد', sort: true, direction: null },
    { name: 'التاريخ ' },
    { name: 'الخصم', sort: true, direction: null },
    { name: 'السعر', sort: true, direction: null },
  ];
  columnsName: ColumnValue[] = [
    { name: 'supplier_name', type: 'normal' },
    { name: 'created_at', type: 'normal' },
    { name: 'discount', type: 'normal' },
    { name: 'price', type: 'normal' },
  ];
  Discounts: any[] = [];
  products: products[] = [];
  suppliers: supplier[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  sortData: any;

  constructor(
    private generalService: GeneralService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService
  ) {}

  ngOnInit() {
    let fromDate = new Date();
    let toDate = new Date();
    fromDate.setDate(toDate.getDate() - 30);

    this.filterForm = this.fb.group({
      supplier_id: [''],
      product_id: ['', Validators.required],
      from: [datePipe.transform(fromDate, 'yyyy-MM-dd')],
      to: [datePipe.transform(toDate, 'yyyy-MM-dd')],
    });

    this.getDropdownData();
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let url = 'purchases/supplier-products/market-discount-changes';
    return this.http.getReq(url, { params: x });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService.getDropdownData(['suppliers']).subscribe({
        next: (res) => {
          this.suppliers = res.data.suppliers;
        },
      })
    );

    this.subscription.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );
  }

  @ViewChild('paginator') paginator!: Paginator;

  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  filter() {
    this.page = 1;
    // this.updateCurrentPage(this.page - 1);
    this.updateQueryAndFetchData();
  }

  sort(sortData: any) {
    this.sortData = sortData;
    this.page = 1;
    // this.updateCurrentPage(this.page - 1);
    this.updateQueryAndFetchData();
  }

  changePage(event: any) {
    this.page = event.page + 1;
    this.updateQueryAndFetchData();
  }

  updateQueryAndFetchData() {
    const queryParams = this.getUpdatedQueryParams();
    if (this.filterForm.valid) {
      this.subscription.add(
        this.getAllData(queryParams).subscribe({
          next: (res) => {
            this.Discounts = res.data.map((discount: any) => ({
              supplier_name: discount.supplier.name,
              created_at: discount.created_at,
              discount: discount.discount,
              price: discount.price,
            }));
            this.total = res.additional_data.total_distinct_count;
            this.rows = res.meta.per_page;
          },
          error: (err) => {
            console.error('Error fetching data', err); // Log error
          },
        })
      );
    } else {
      this.filterForm.markAllAsTouched();
    }
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from' || key == 'to') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    if (this.sortData) {
      queryParams['sort_by'] = this.sortData.name;
      queryParams['direction'] = this.sortData.direction;
    }
    if (this.page) {
      queryParams['page'] = this.page;
    }
    return queryParams;
  }
}
