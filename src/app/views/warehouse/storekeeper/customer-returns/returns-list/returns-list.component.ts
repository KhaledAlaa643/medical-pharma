import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { pharmacy_client } from '@models/pharmacie';
import { warehouses } from '@models/products';
import { returns } from '@models/returns';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-returns-list',
  templateUrl: './returns-list.component.html',
  styleUrls: ['./returns-list.component.scss'],
})
export class ReturnsListComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم الأذن ',
    },
    {
      name: 'اسم العميل',
    },
    {
      name: ' التاريخ والوقت	',
    },
    {
      name: ' عدد الأصناف المرتجعه	',
    },
    {
      name: ' أمر	',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'order_number',
      type: 'normal',
    },
    {
      name: 'client_name',
      type: 'normal',
    },
    {
      name: 'time_date',
      type: 'normal',
    },
    {
      name: 'return_count',
      type: 'normal',
    },
    {
      name: 'view',
      type: 'ViewReturnDetails',
    },
  ];
  returnsData: returns[] = [];
  groupPharmacies: pharmacy_client[] = [];
  warehouses: warehouses[] = [];
  page: number = 1;
  returnsFilter!: FormGroup;
  //pagination
  total!: number;
  rows!: number;
  constructor(
    private http: HttpService,
    private printService: PrintService,
    private router: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    let tempColumnsArray = this.columnsArray.filter(
      (column) => column.name.trim() !== 'أمر'
    );
    let tempColumnsName = this.columnsName.filter(
      (column) => column.name.trim() !== 'view'
    );

    localStorage.setItem('columnsArray', JSON.stringify(tempColumnsArray));
    localStorage.setItem('columnsNames', JSON.stringify(tempColumnsName));
    this.returnsFilter = this.fb.group({
      pharmacy_id: [''],
      warehouse_id: [''],
    });
    this.getDropdownData();
    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param);
          })
        )
        .subscribe({
          next: (res) => {
            this.returnsData = [];
            res.data.forEach((Return: any) => {
              this.returnsData.push({
                order_number: Return?.id,
                client_name: Return?.pharmacy?.name,
                time_date: Return?.created_at,
                return_count:
                  Return?.cart_items_count > 0
                    ? Return?.cart_items_count
                    : Return?.products_count,
                id: Return?.id,
              });
            });
            this.additional_data = res.additional_data;

            this.total = res?.meta.total;
            this.rows = res.meta?.per_page;
          },
        })
    );
  }

  additional_data: any;

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = 'orders/returns';

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownData() {
    //pharamcy
    let pharmacies: any = [];
    this.subs.add(
      this.generalService.getPharmacies().subscribe({
        next: (res) => {
          pharmacies = res.data;
        },
        complete: () => {
          pharmacies.forEach((element: any) => {
            this.groupPharmacies.push({
              name: element?.clients[0]?.name + '-' + element?.name,
              id: element?.id,
              client_id: element?.clients[0]?.name,
            });
          });
        },
      })
    );
    let params = ['warehouses'];
    //warehouse
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.warehouses = res.data.warehouses;
        },
      })
    );
  }

  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  filterPharmacies() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.returnsFilter.value) {
      let value = this.returnsFilter.value[key];
      if (value != null && value != undefined && value != '') {
        queryParams[key] = value;
      }
    }
    if (this.page) {
      queryParams['page'] = this.page;
    }
    return queryParams;
  }
  viewReturnDetails(id: any) {
    this.router.navigate([
      `/warehouse/storekeeper/customer-returns/return-permission-details/${id}`,
    ]);
  }
  print(printData: any) {
    let tempColumnsArray = this.columnsArray.filter(
      (column) => column.name.trim() !== 'أمر'
    );
    let tempColumnsName = this.columnsName.filter(
      (column) => column.name.trim() !== 'view'
    );
    if (printData.amountOfPrint == 2) {
      this.printService.setColumnsArray(tempColumnsArray);
      this.printService.setColumnsNames(tempColumnsName);
      this.printService.setRowsData(this.returnsData);
    } else {
      this.printService.setColumnsArray(tempColumnsArray);
      this.printService.setColumnsNames(tempColumnsName);
      this.printService.setRowsData(this.returnsData);
    }

    if (printData.type == 1) {
      this.printService.downloadPDF();
    } else {
      this.printService.downloadCSV();
    }
    setTimeout(() => {
      this.openModal();
    }, 100);
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.router.navigate([]);
  }
}
