import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NotesModalComponent } from "@modules/notes-modal/notes-modal.component";
import { HttpService } from "@services/http.service";
import { Subscription, catchError, of, switchMap } from "rxjs";
import { receiversAuditor } from '@models/receiver-auditors';
import { warehouses } from "@models/products";
import { suppliers } from "@models/suppliers";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { DatePipe } from "@angular/common";
import { LooseObject } from "@models/LooseObject";
import { PrintService } from "@services/print.service";
import { receiversAuditorStoreKeepers } from "@models/receivers-auditor-store-keepers";
import { receivingCompleted, receivingCompletedData } from "@models/receiving-completed";
import { selectedInvoice } from "@models/supply-order";
import { GeneralService } from "@services/general.service";
const datePipe = new DatePipe('en-EG');

@Component({
    selector: 'app-receiving-completed',
    templateUrl: './receiving-completed.component.html',
    styleUrls: [ './receiving-completed.component.scss' ]
})

export class ReceivingCompletedComponent implements OnInit, OnDestroy {

    filterForm!: FormGroup
    warehouses!: warehouses[]
    suppliers!: suppliers[]
    receiversAuditor!: receiversAuditor[]
    total!: number
    rows!: number
    page: number = 1
    private subs = new Subscription();
    receivingCompletedData: receivingCompleted[] = [];
    selectedInvoiceData: receivingCompleted[] = [];
    noteData: string = '';
    receiversAuditorStoreKeepers: receiversAuditorStoreKeepers[] = [];
    receivingCompletedTotals: number = 0;
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private http: HttpService,
        private activatedRoute: ActivatedRoute,
        private printService: PrintService,
        private generalService: GeneralService
    ) {

    }


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

        this.subs.add(this.activatedRoute.queryParams.pipe(
            switchMap((param: any) => {
                return this.getAllData(param).pipe(
                    catchError((error) => {
                        console.error('Error in API call:', error);
                        return of({ data: [] });
                    })
                );;;
            })
        ).subscribe({
            next: res => {
                this.receivingCompletedData = []
                this.receivingCompletedTotals = res.additional_data.total_returned_items
                res.data.forEach((element: any, index: number) => {

                    this.receivingCompletedData.push(
                        {
                            id: element.id,
                            purchase_id: element.id,
                            serial_number: index + 1,
                            created_at: element.created_at,
                            supplier_name: element.supplier.name,
                            purchase_number: element.id,
                            total_cart_items: element.total_cart_items,
                            warehouse: element?.warehouse?.name,
                            created_by: element?.created_by?.name,
                            reviewed_by: element?.reviewed_by?.name,
                            note: element.note,
                            warehouse_id: element?.warehouse?.id,
                            show_order: "",
                        }
                    )
                });
                this.total = res?.meta.total
                this.rows = res.meta?.per_page
            }
        }));

        this.getDropdownData()
        this.getReceiversAuditorStoreKeepers()

    }

    columnsArray: columnHeaders[] = [
        { name: 'مسلسل' },
        { name: 'تاريخ تسجيل المرتجع  ' },
        { name: 'اسم المورد' },
        { name: 'رقم أذن   المرتجع  ' },
        { name: 'اجمالي    الاصناف    المرتجع   ' },
        { name: 'المخزن المورد   اليه الطلب' },
        { name: 'كاتب   ' },
        { name: 'المراجع' },
        { name: 'أمر ' },
    ]
    columnsName: ColumnValue[] = [
        { name: 'serial_number', type: 'normal' },
        { name: 'created_at', type: 'normal' },
        { name: 'supplier_name', type: 'normal' },
        { name: 'purchase_number', type: 'normal' },
        { name: 'total_cart_items', type: 'normal' },
        { name: 'warehouse', type: 'normal' },
        { name: 'created_by', type: 'normal' },
        { name: 'reviewed_by', type: 'normal' },
        { name: 'print', type: 'handin' }
    ]



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
                this.receiversAuditor = res.data.receiving_reviewer

            }
        }))
        this.subs.add(this.generalService.getWarehouses({ 'retail_sales': 1 ,'bulk_sales':1}).subscribe({
            next: res => {
              this.warehouses = res.data
            }
          }))
    }

    getAllData(filters: any) {
        let x: LooseObject = {};
        for (const [ key, value ] of Object.entries(filters)) {
            if (value) {
                x[ key ] = value
            }
        }
        return this.http.getReq('purchases/reviewer-returns/dispatched', { params: x })
    }




    onEyeIconClicked(data: any) {
        this.router.navigate([ `warehouse/receiving-auditor/receiving-completed/${data.id}` ]);
    }

    filter() {
        const queryParamsObject = this.getUpdatedQueryParams();
        for (const [ key, value ] of Object.entries(queryParamsObject)) {
            if (value === '' || value === null || value === undefined) {
                queryParamsObject[ key ] = null;
            } else {
                queryParamsObject[ key ] = value;

            }
        }
        this.router.navigate([], { queryParams: queryParamsObject, queryParamsHandling: "merge", });
    }
    getUpdatedQueryParams() {
        let queryParams: any = {};
        for (const key in this.filterForm.value) {
            let value = this.filterForm.value[ key ];
            if (value === "" || value === null || value === undefined) {
                queryParams[ key ] = null;
            } else {
                queryParams[ key ] = value;
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

    @ViewChild(NotesModalComponent) private notesModalComponent!: NotesModalComponent;
    showNotesModalWithData(id: any): void {
        const foundItem = this.receivingCompletedData.find(item => item.id === id);
        const noteData = foundItem ? foundItem.note : null;
        this.notesModalComponent.notesModalData = noteData;
        this.notesModalComponent.openModal();
    }

    printMain(print?: any) {

        let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
        let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'print');
        this.printService.setColumnsArray(tempColumnsArray)
        this.printService.setColumnsNames(tempColumnsName)
        this.printService.setRowsData(this.receivingCompletedData)
        setTimeout(() => {
            this.openModal()
        }, 100);

        if (print.type == 1) {
            this.printService.downloadPDF()
        }
        else {
            this.printService.downloadCSV()
        }

    }
    print(printData: any) {

        let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
        let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'print');
        if (printData.amountOfPrint == 2) {
            this.subs.add(this.http.getReq(`purchases/reviewer-returns/dispatched/print`).subscribe({
                next: (res) => {
                    res.data.forEach((element: any, index: number) => {
                        this.selectedInvoiceData.push(
                            {
                                id: element.id,
                                purchase_id: element.purchase.id,
                                serial_number: index + 1,
                                created_at: element.created_at,
                                supplier_name: element.supplier_name,
                                purchase_number: element.id,
                                total_cart_items: element.purchase.total_cart_items,
                                warehouse: element.purchase?.warehouse?.name,
                                created_by: element?.created_by?.name,
                                reviewed_by: element.purchase?.reviewed_by?.name,
                                note: element.note,
                                warehouse_id: element?.purchase?.warehouse?.id,
                                show_order: "",
                            }
                        )
                    })

                }, complete: () => {
                    this.printService.setColumnsArray(tempColumnsArray)
                    this.printService.setColumnsNames(tempColumnsName)
                    this.printService.setRowsData(this.receivingCompletedData)
                    setTimeout(() => {
                        this.openModal()
                    }, 100);


                    if (printData.type == 1) {
                        this.printService.downloadPDF()
                    }
                    else {
                        this.printService.downloadCSV()
                    }
                }
            }))
        }
        else {
            this.printService.setColumnsArray(tempColumnsArray)
            this.printService.setColumnsNames(tempColumnsName)
            this.printService.setRowsData(this.receivingCompletedData)
            if (printData.type == 1) {
                this.printService.downloadPDF()
            }
            else {
                this.printService.downloadCSV()
            }
        }
    }
    @ViewChild('OpenOptionsModal2') OpenOptionsModal2!: ElementRef<HTMLElement>;
    openModal() {
        let el: HTMLElement = this.OpenOptionsModal2.nativeElement;
        el.click();
    }


    ngOnDestroy(): void {
        this.subs.unsubscribe()
    }
}