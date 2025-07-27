import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { warehouses } from "@models/products";
import { suppliers } from "@models/suppliers";
import { NotesModalComponent } from "@modules/notes-modal/notes-modal.component";
import { HttpService } from "@services/http.service";
import { Subscription, catchError, of, switchMap } from "rxjs";
import { receiversAuditor } from '@models/receiver-auditors';
import { LooseObject } from "@models/LooseObject";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { DatePipe } from "@angular/common";
import { PrintService } from "@services/print.service";
import { Paginator } from "primeng/paginator";
import { returnsList } from "@models/returns-list";
import { receiversAuditorStoreKeepers } from "@models/receivers-auditor-store-keepers";
import { GeneralService } from "@services/general.service";
const datePipe = new DatePipe('en-EG');
interface additionalData {
    total_returned_items: number
}
@Component({
    selector: 'app-returns-list',
    templateUrl: './returns-list.component.html',
    styleUrls: [ './returns-list.component.scss' ]
})

export class ReturnsListComponent implements OnInit, OnDestroy {

    filterForm!: FormGroup
    warehouses!: warehouses[]
    suppliers!: suppliers[]
    receiversAuditor!: receiversAuditor[]
    returnsListData: returnsList[] = []

    total!: number
    rows!: number
    page: number = 1
    first: number = 0
    private subs = new Subscription();
    receiversAuditorStoreKeepers: receiversAuditorStoreKeepers[] = [];
    additionalData: additionalData = { total_returned_items: 0 };
    notesData: string = '';

    @ViewChild(NotesModalComponent) private notesModalComponent!: NotesModalComponent;
    @ViewChild('paginator') paginator: Paginator | undefined;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private http: HttpService,
        private activatedRoute: ActivatedRoute,
        private printService: PrintService,
        private generalService: GeneralService

    ) {

    }

    columnsArray: columnHeaders[] = [
        { name: 'مسلسل' },
        { name: 'تاريخ تسجيل المرتجع  ' },
        { name: 'اسم المورد' },
        { name: 'رقم أذن   المرتجع  ' },
        { name: 'اجمالي    الاصناف    المرتجع   ' },
        { name: 'المخزن المورد   اليه الطلب' },
        { name: 'الكاتب   ' },
        { name: 'المراجع' },
        { name: 'أمر ' },
    ]
    columnsName: ColumnValue[] = [
        { name: 'serial_number', type: 'normal' },
        { name: 'created_at', type: 'normal' },
        { name: 'supplier_name', type: 'normal' },
        { name: 'purchase_number', type: 'normal' },
        { name: 'total_returned_items', type: 'normal' },
        { name: 'warehouse', type: 'normal' },
        { name: 'created_by', type: 'normal' },
        { name: 'reviewed_by', type: 'normal' },
        { name: 'print', type: 'handin' }
    ]

    ngOnInit(): void {
        this.filterForm = this.fb.group({
            supplier_id: [ '' ],
            purchase_number: [ '' ],
            from: [ '' ],
            to: [ '' ],
            warehouse_id: [ '' ],
            created_by: [ '' ],
            reviewed_by: [ '' ]
        })

        this.getDropdownData()
        this.getReceiversAuditorStoreKeepers()

        this.subs.add(this.activatedRoute.queryParams.pipe(
            switchMap((param: any) => {
                return this.getAllData(param,true).pipe(
                    catchError((error) => {
                        console.error('Error in API call:', error);
                        return of({ data: [] });
                    })
                );;;
            })
        ).subscribe({
            next: res => {
                this.returnsListData = []
                this.additionalData = res.additional_data
                res.data.forEach((element: any, index: number) => {

                    this.returnsListData.push(
                        {
                            id: element.id,
                            purchase_id: element.id,
                            serial_number: index + 1,
                            created_at: element.created_at,
                            supplier_name: element.supplier.name,
                            purchase_number: element?.id,
                            total_returned_items: element.total_cart_items,
                            warehouse: element.warehouse.name,
                            created_by: element?.created_by?.name,
                            reviewed_by: element?.reviewed_by?.name,
                            note: element.note,
                            warehouse_id: element.warehouse?.id,
                            show_order: "",
                        }
                    )
                });
                this.total = res?.meta.total
                this.rows = res.meta?.per_page
            }
        }));

    }

    getReceiversAuditorStoreKeepers() {
        this.subs.add(this.generalService.getReceiversAuditorStoreKeepers().subscribe({
            next: res => {
                this.receiversAuditorStoreKeepers = res.data
            }
        }))
    }

    getDropdownData(){
        this.subs.add(this.generalService.getDropdownData(['suppliers','receiving_reviewer']).subscribe({
            next: res => {
                this.suppliers = res.data.suppliers
                // this.warehouses=res.data.warehouses
                this.receiversAuditor = res.data.receiving_reviewer

            }
        }))

        this.subs.add(this.generalService.getWarehouses({ 'sales_return': 1 }).subscribe({
            next: res => {
              this.warehouses = res.data
            }
          }))
    }

    quary: any = {}

    getAllData(filters: any,paginated: boolean) {
        let x: LooseObject = {};
        for (const [ key, value ] of Object.entries(filters)) {
            if (value) {
                x[ key ] = value
            }
        }
        this.quary=x
        let url=''
        if(paginated){
            url='purchases/reviewer-returns'
        }
        else{
            url='purchases/reviewer-returns/print' 
        }

        return this.http.getReq(url, { params: x }) 
        
    }


    onEyeIconClicked(data: any) {
        this.router.navigate([ `warehouse/receiving-auditor/returns-list/${data.id}` ]);
    }


    showNotesModalWithData(id: any): void {
        const foundItem = this.returnsListData.find(item => item.id === id);
        const noteData = foundItem ? foundItem.note : null;
        this.notesModalComponent.notesModalData = noteData;
        this.notesModalComponent.openModal();
    }

    filter() {
        this.page = 1
        const queryParamsObject = this.getUpdatedQueryParams();
        for (const [ key, value ] of Object.entries(queryParamsObject)) {
            if (value === '' || value === null || value === undefined) {
                queryParamsObject[ key ] = null;
            }
        }
        this.router.navigate([], { queryParams: queryParamsObject, queryParamsHandling: "merge" }).then(() => {
            if (this.paginator) {
                this.paginator.first = 0;
                this.first = 1
            }
        });
    }

    getUpdatedQueryParams() {

        let queryParams: any = {};
        for (const key in this.filterForm.value) {
            let value = this.filterForm.value[ key ];
            if (value === '' || value === null || value === undefined) {
                queryParams[ key ] = null
            } else {
                queryParams[ key ] = value
            }
        }
        if (this.page) {
            queryParams[ 'page' ] = this.page;
        }

        if (this.filterForm.controls[ 'from' ].value) {
            queryParams[ 'from' ] = datePipe.transform(new Date(this.filterForm.controls[ 'from' ].value), 'yyyy-MM-dd');
        }
        if (this.filterForm.controls[ 'to' ].value) {
            queryParams[ 'to' ] = datePipe.transform(new Date(this.filterForm.controls[ 'to' ].value), 'yyyy-MM-dd');
        }
        return queryParams;
    }
    changePage(event: any) {
        this.page = event.page + 1
        const queryParams = this.getUpdatedQueryParams();
        this.router.navigate([], { queryParams, queryParamsHandling: "merge" });

    }

    ngOnDestroy(): void {
        this.subs.unsubscribe()
    }


    getAllbatches(printType: any) {
        this.subs.add(this.getAllData(this.quary, false).subscribe({
          next: res => {
            this.allreturnsListData = []
            this.getData(res.data, false)
          }, complete: () => {
            let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
            let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'print');
            this.printService.setColumnsArray(tempColumnsArray)
            this.printService.setColumnsNames(tempColumnsName)
            this.printService.setRowsData(this.allreturnsListData)
            if (printType == 1) {
              this.printService.downloadPDF()
            }
            else {
              this.printService.downloadCSV()
            }
            setTimeout(() => {
                this.openModal()
            }, 100);
          }
        }))
      }
    
      print(printData: any) {
        let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
        let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'print');
        if (printData.amountOfPrint == 2) {
          this.getAllbatches(printData.type)
        }
        else {
          localStorage.setItem('RowsData', JSON.stringify(this.returnsListData))
          localStorage.setItem('columnsArray', JSON.stringify(tempColumnsArray))
          localStorage.setItem('columnsNames', JSON.stringify(tempColumnsName))
          if (printData.type == 1) {
            this.printService.downloadPDF()
          }
          else {
            this.printService.downloadCSV()
          }
          setTimeout(() => {
            this.openModal()
          }, 100);
        }
    
      }
      allreturnsListData:any=[]
      getData(data: any, pagiated: boolean) {
        let tempArr: any = []
        data.forEach((element: any,index:number) => {
          tempArr.push(
            {
                'id': element.id,
                'purchase_id': element.id,
                'serial_number': index + 1,
                'created_at': element.created_at,
                'supplier_name': element.supplier.name,
                'purchase_number': element?.id,
                'total_returned_items': element.total_cart_items,
                'warehouse': element.warehouse.name,
                'created_by': element?.created_by?.name,
                'reviewed_by': element?.reviewed_by?.name,
                'note': element.note,
                'warehouse_id': element.warehouse?.id,
                'show_order': "",
            }
    
          )
    
        });
        if (pagiated == true) {
          this.returnsListData = tempArr
        }
        else {
          this.allreturnsListData = tempArr
        }
      }

    @ViewChild('OpenOptionsModal2') OpenOptionsModal2!: ElementRef<HTMLElement>;
    openModal() {
        let el: HTMLElement = this.OpenOptionsModal2.nativeElement;
        el.click();
    }
}