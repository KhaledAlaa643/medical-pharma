import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NotesModalComponent } from "@modules/notes-modal/notes-modal.component";
import { HttpService } from "@services/http.service";
import { Subscription, catchError, of, switchMap } from "rxjs";
import { warehouses } from "@models/products";
import { suppliers } from "@models/suppliers";
import { DatePipe } from "@angular/common";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { LooseObject } from "@models/LooseObject.js";
import { auditCompleteData } from "@models/auditcompleteData";
import { GeneralService } from "@services/general.service";
import { Paginator } from "primeng/paginator";
const datePipe = new DatePipe('en-EG');


@Component({
    selector: 'app-audit-completed',
    templateUrl: './audit-completed.component.html',
    styleUrls: [ './audit-completed.component.scss' ]
})

export class AuditCompletedComponent implements OnInit, OnDestroy {


    warehouses!: warehouses[]
    suppliers!: suppliers[]
    filterForm!: FormGroup
    listNumber: any
    total!: number
    rows!: number
    page: number = 1
    private subs = new Subscription();
    auditCompleteData: auditCompleteData[] = [];
    first: number = 0
    notesData: string = '';
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private http: HttpService,
        private activatedRoute: ActivatedRoute,
        private generalService: GeneralService

    ) {

    }



    ngOnInit(): void {

        this.router.navigate([], { queryParams: {} });

        this.filterForm = this.fb.group({
            supplier_id: [ '' ],
            purchase_number: [ '' ],
            supplied_at: [ '' ],
            warehouse_id: [ '' ]
        })
        this.getDropdownData()

        this.subs.add(this.activatedRoute.queryParams.pipe(
            switchMap((param: any) => {
                return this.getSupplyOrderListData(param).pipe(
                    catchError((error) => {
                        console.error('Error in API call:', error);
                        return of({ data: [] });
                    })
                );
            })
        ).subscribe({
            next: res => {
                this.auditCompleteData = []
                res.data.forEach((element: any, index: number) => {

                    this.auditCompleteData.push(
                        {
                            id: element.id,
                            serial_number: index + 1,
                            reviewed_at: element?.reviewed_at,
                            supplied_at: element?.supplied_at,
                            supplier_name: element.supplier.name,
                            purchase_number: element.id,
                            total_cart_items: element.total_cart_items,
                            warehouse: element.warehouse.name,
                            created_by: element?.created_by?.name,
                            reviewed_by: element?.reviewed_by?.name,
                            status:element.status.name,
                            note: element.note,
                            show_order: ""
                        }
                    )
                });
                this.total = res?.meta.total
                this.rows = res.meta?.per_page
            }
        }));

    }
    columnsArray: columnHeaders[] = [
        { name: 'مسلسل' },
        { name: 'التاريخ ' },
        { name: 'اسم المورد' },
        { name: 'رقم الطلب' },
        { name: 'اجمالي  الاصناف' },
        { name: 'المخزن المورد   اليه الطلب' },
        { name: 'الكاتب ' },
        { name: 'المراجع' },
        { name: 'حالة الطلب' },
        { name: 'ملاحظات' },
        { name: 'أمر' },
    ]
    columnsName: ColumnValue[] = [
        { name: 'serial_number', type: 'normal' },
        { name: 'reviewed_at', type: 'normal' },
        { name: 'supplier_name', type: 'normal' },
        { name: 'purchase_number', type: 'normal' },
        { name: 'total_cart_items', type: 'normal' },
        { name: 'warehouse', type: 'normal' },
        { name: 'created_by', type: 'normal' },
        { name: 'reviewed_by', type: 'normal' },
        { name: 'status', type: 'normal' },
        { name: 'note', type: 'notes' },
        { name: 'show_order', type: 'eyeIcon_transfer' },

    ]


    @ViewChild(NotesModalComponent) private notesModalComponent!: NotesModalComponent;
    showNotesModalWithData(id: any): void {
        const foundItem = this.auditCompleteData.find((item: { id: any; }) => item.id === id);
        const noteData = foundItem ? foundItem.note : null;
        this.notesModalComponent.notesModalData = noteData;
        this.notesModalComponent.openModal();
    }


    onEyeIconClicked(id: any) {
        this.router.navigate([ `warehouse/receiving-auditor/audit-completed/${id}` ]);
    }



    getDropdownData(){
        this.subs.add(this.generalService.getDropdownData(['suppliers']).subscribe({
            next: res => {
                this.suppliers = res.data.suppliers
            }
        }))
        this.subs.add(this.generalService.getWarehouses({ 'retail_sales': 1 ,'bulk_sales':1}).subscribe({
            next: res => {
              this.warehouses = res.data
            }
          }))
    }

    getSupplyOrderListData(filter: any) {
        let x: LooseObject = {};
        for (const [ key, value ] of Object.entries(filter)) {
            if (value) {
                x[ key ] = value
            }

        }

        return this.http.getReq('purchases/receiving-reviewer/reviewed', { params: x })
    }

    @ViewChild('paginator') paginator!: Paginator
    updateCurrentPage(currentPage: number): void {
      setTimeout(() => this.paginator.changePage(currentPage),0);
    }

    filter() {
        this.page = 1;
        this.updateCurrentPage(this.page-1);
        this.first = 1
        const queryParamsObject = this.getUpdatedQueryParams();

        for (const [ key, value ] of Object.entries(queryParamsObject)) {
            if (value === '' || value === null || value === undefined) {
                queryParamsObject[ key ] = null;
            } else {
                if(key=='supplied_at'){
                    let supplied_at_value:any=value
                    queryParamsObject[ key ] = datePipe.transform(supplied_at_value, 'yyyy-MM-dd')

                }
                else{
                    queryParamsObject[ key ] = value;  
                }

            }
            if (queryParamsObject[ 'page' ])
                queryParamsObject[ 'page' ] = this.first
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
                if(key=='supplied_at'){
                    queryParams[ key ] = datePipe.transform(value, 'yyyy-MM-dd')
                }
                else{
                    queryParams[ key ] = value 
                }
            }
        }
        if (this.page) {
            queryParams[ 'page' ] = this.page;
        }


        // if (this.filterForm.controls[ 'reviewed_at' ].value) {
        //     queryParams[ 'reviewed_at' ] = datePipe.transform(new Date(this.filterForm.controls[ 'reviewed_at' ].value), 'yyyy-MM-dd');
        // }
        return queryParams;
    }
    changePage(event: any) {
        this.page = event.page + 1
        const queryParams = this.getUpdatedQueryParams();
        this.router.navigate([], { queryParams, queryParamsHandling: "merge", });
    }



    ngOnDestroy(): void {
        this.subs.unsubscribe()
    }
}