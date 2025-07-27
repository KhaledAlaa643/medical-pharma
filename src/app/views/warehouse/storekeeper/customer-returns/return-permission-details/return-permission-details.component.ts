import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { returns } from '@models/returns';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, retry } from 'rxjs';

@Component({
  selector: 'app-return-permission-details',
  templateUrl: './return-permission-details.component.html',
  styleUrls: ['./return-permission-details.component.scss'],
})
export class ReturnPermissionDetailsComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  OrderDetailsForm!: FormGroup;
  returnProductsList: returns[] = [];
  return_id!: number;
  additional_data: any;

  columnsArray: columnHeaders[] = [
    {
      name: 'اسم الصنف ',
    },
    {
      name: 'الكمية',
    },
    {
      name: ' السعر	',
    },
    {
      name: ' الخصم	',
    },
    {
      name: ' الاجمالي	',
    },
    {
      name: 'السبب',
    },
    {
      name: 'الحالة',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'normal',
    },
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'total',
      type: 'normal',
    },
    {
      name: 'reason',
      type: 'normal',
    },
    {
      name: 'status',
      type: 'status',
    },
  ];
  constructor(
    private http: HttpService,
    private printService: PrintService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.return_id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.OrderDetailsForm = this.fb.group({
      code: [''],
      pharmacy_name: [''],
      created_at: [''],
      order_number: [''],
      return_number: [''],
      warehouse_id: [''],
      sales_id: [''],
      delivery_id: [''],
    });
    this.getReturnData();
  }

  getReturnData() {
    let returnData: any = {};
    this.subs.add(
      this.http
        .getReq('orders/returns/get-return', {
          params: { return_id: this.return_id },
        })
        .subscribe({
          next: (res) => {
            returnData = res.data;
            this.additional_data = res.additional_data;
          },
          complete: () => {
            returnData.returnables.forEach((returnable: any) => {
              this.returnProductsList.push({
                product_name: returnable?.product_name,
                quantity: returnable?.quantity,
                price: returnable?.price,
                discount: returnable?.discount,
                total: returnable?.total,
                reason: returnable?.reason.name,
                status: returnable?.status.name,
              });
            });

            this.OrderDetailsForm.controls['code'].setValue(
              returnData.pharmacy?.code
            );
            this.OrderDetailsForm.controls['pharmacy_name'].setValue(
              returnData.pharmacy?.name
            );
            this.OrderDetailsForm.controls['created_at'].setValue(
              returnData.created_at
            );
            this.OrderDetailsForm.controls['order_number'].setValue(
              returnData.order?.order_number
            );
            this.OrderDetailsForm.controls['return_number'].setValue(
              returnData.id
            );
            this.OrderDetailsForm.controls['warehouse_id'].setValue(
              returnData?.warehouse?.name
            );
            this.OrderDetailsForm.controls['sales_id'].setValue(
              returnData?.created_by?.name
            );
            this.OrderDetailsForm.controls['delivery_id'].setValue(
              returnData.order?.delivery?.name
            );
          },
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.openModal();
  }

  print(printData: any) {
    this.printService.setColumnsArray(this.columnsArray);
    this.printService.setColumnsNames(this.columnsName);
    this.printService.setRowsData(this.returnProductsList);

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
}
