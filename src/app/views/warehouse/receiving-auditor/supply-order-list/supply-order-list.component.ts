import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { LooseObject } from "@models/LooseObject";
import { warehouses } from "@models/products";
import { suppliers } from "@models/suppliers";
import { NotesModalComponent } from "@modules/notes-modal/notes-modal.component";
import { HttpService } from "@services/http.service";
import { SkeletonLoadingService } from "@services/skeleton-loading.service";
import { Subscription, catchError, finalize, forkJoin, of, switchMap } from "rxjs";
import { solver } from '../../../../core/models/complain';
import { ColumnValue, columnHeaders } from "@models/tableData";
import { PrintService } from "@services/print.service";
import { Paginator } from "primeng/paginator";
import { selectedInvoice, supplyOrder } from "@models/supply-order";
import { GeneralService } from "@services/general.service";

const datePipe = new DatePipe('en-EG');



@Component({
    selector: 'app-supply-order-list',
    templateUrl: './supply-order-list.component.html',
    styleUrls: [ './supply-order-list.component.scss' ]
})

export class SupplyOrderListComponent implements OnInit, OnDestroy {

    filterForm!: FormGroup
    listNumber: any
    suppliers!: suppliers[]
    SupplyOrderListData: supplyOrder[] = []
    total!: number
    rows!: number
    page: number = 1
    first: number = 0
    private subs = new Subscription();
    selectedInvoiceData: selectedInvoice[] = [];
    warehouse_id: number = 0;
    notesData: string = '';

    @ViewChild(NotesModalComponent) private notesModalComponent!: NotesModalComponent;
    nonPaginatedPrintableData: supplyOrder[] = [];
    constructor(
        private fb: FormBuilder,
        private router: Router,
        private http: HttpService,
        private activatedRoute: ActivatedRoute,
        private printService: PrintService,
        private generalService:GeneralService
    ) {

    }


    ngOnInit(): void {
        this.router.navigate([], { queryParams: {} });
        this.filterForm = this.fb.group({
            supplier_id: [ '' ],
            purchase_number: [ '' ],
            from: [ '' ],
            to: [ '' ],
        })
        this.getSupplierData()
        this.subs.add(this.activatedRoute.queryParams.pipe(
            switchMap((param: any) => {
                return this.getSupplyOrderListData(param).pipe(
                    catchError((error) => {
                        console.error('Error in API call:', error);
                        return of({ data: [] });
                    })
                );;
            })
        ).subscribe({
            next: res => {
                this.SupplyOrderListData = []
                res.data.forEach((element: any, index: number) => {

                    this.SupplyOrderListData.push(
                        {
                            id: element.id,
                            serial_number: index + 1,
                            created_at: element.created_at,
                            supplier_name: element.supplier.name,
                            purchase_number: element.id,
                            total_items: element.total_cart_items,
                            warehouse: element.warehouse.name,
                            created_by: element.created_by.name,
                            status: element?.status?.name,
                            note: element.note,
                            warehouse_id: element.warehouse.id,
                            show_order: "",
                            print: "طباعه"
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
        { name: 'التاريخ والوقت' },
        { name: 'اسم المورد' },
        { name: 'رقم الطلب' },
        { name: 'اجمالي  الاصناف' },
        { name: 'المخزن المورد   اليه الطلب' },
        { name: 'كاتب   الطلب' },
        { name: 'الملاحظات' },
        { name: 'حالة الطلب' },
        { name: 'عرض محتويات   الطلب' },
        { name: 'طباعة' }
    ]
    columnsName: ColumnValue[] = [
        { name: 'serial_number', type: 'normal' },
        { name: 'created_at', type: 'normal' },
        { name: 'supplier_name', type: 'normal' },
        { name: 'purchase_number', type: 'normal' },
        { name: 'total_items', type: 'normal' },
        { name: 'warehouse', type: 'normal' },
        { name: 'created_by', type: 'normal' },
        { name: 'note', type: 'notes' },
        { name: 'status', type: 'normal' },
        { name: 'show_order', type: 'eyeIcon_transfer_with_data' },
        { name: 'print', type: 'print' }
    ]

    columnsArrayPopup: columnHeaders[] = [
        { name: 'مسلسل' },
        { name: 'التاريخ والوقت' },
        { name: 'اسم المورد' },
        { name: 'رقم الطلب' },
        { name: 'اجمالي  الاصناف' },
        { name: 'المخزن المورد   اليه الطلب' },
        { name: 'كاتب   الطلب' },
    ]
    columnsNamePopup: ColumnValue[] = [
        { name: 'serial_number', type: 'normal' },
        { name: 'created_at', type: 'normal' },
        { name: 'supplier_name', type: 'normal' },
        { name: 'purchase_number', type: 'normal' },
        { name: 'total_items', type: 'normal' },
        { name: 'warehouse', type: 'normal' },
        { name: 'created_by', type: 'normal' },
    ]


    showNotesModalWithData(id: any): void {
        const foundItem = this.SupplyOrderListData.find(item => item.id === id);
        const noteData = foundItem ? foundItem.note : null;
        this.notesModalComponent.notesModalData = noteData;
        this.notesModalComponent.openModal();
    }
    onEyeIconClicked(data: any) {
        this.router.navigate([ `warehouse/receiving-auditor/supply-order-list/${data.warehouse_id}/${data.id}` ]);
    }
    getSupplierData() {
        this.subs.add(this.generalService.getDropdownData(['suppliers']).subscribe({
            next: res => {
                this.suppliers = res.data.suppliers
            }
        }))
    }
    getSupplyOrderListData(filters: any) {
        let x: LooseObject = {};
        for (const [ key, value ] of Object.entries(filters)) {
            if (value) {
                x[ key ] = value
            }

        }
        return this.http.getReq('purchases/receiving-reviewer', { params: x })
    }

    @ViewChild('paginator') paginator: Paginator | undefined;

    filter() {
        this.page = 1;
        this.first = 1
        const queryParamsObject = this.getUpdatedQueryParams();

        for (const [ key, value ] of Object.entries(queryParamsObject)) {
            if (value === '' || value === null || value === undefined) {
                queryParamsObject[ key ] = null;
            } else {
                queryParamsObject[ key ] = value;

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
        this.router.navigate([], { queryParams, queryParamsHandling: "merge", });
    }
    printType: string = ''

    printInvoice(id: any) {
        this.selectedInvoiceData = [];
        //TODO  when the data comes fit it into an array.
        let printInvoiceColumnArray = [
            { name: '   سعر التوريد    ' },
            { name: '  سعر الجمهور' },
            { name: '  الفرق' },
            { name: ' كمية  الفاتورة' },
            { name: 'كمية   مجرودة ' },
            { name: 'اسم الصنف ' },
        ]
        let printInvoiceColumnName = [
            { name: 'supply_price', type: 'normal' },
            { name: 'public_price', type: 'normal' },
            { name: 'quantity_difference', type: 'normal' },
            { name: 'invoice_quantity', type: 'normal' },
            { name: 'quantified_amount', type: 'normal' },
            { name: 'name', type: 'normal' }
        ]
        this.subs.add(this.http.getReq(`purchases/${id}`).subscribe({
            next: (res) => {
                const allOrder = res.data.cart.all;

                allOrder.forEach((cart: any, index: number) => {
                    this.selectedInvoiceData.push(
                        {
                            'id': cart.id,
                            'product_id': cart.product.id,
                            'barcode': cart.product.barcode,
                            'name': cart.product.name,
                            'quantified_amount':cart.inventoried_quantity,
                            'invoice_quantity': cart.ordered_quantity,
                            'quantity_difference': cart.quantity_difference,
                            'public_price': cart.public_price,
                            'supply_price': cart.supply_price,
                            'notes_on_item': cart.note,
                            'items_number_in_packet': cart.product.items_number_in_packet,
                            'packets_number_in_package': cart.product.packets_number_in_package,
                            'indexOfHighlight': index,
                        }
                    )
                })
            }, complete: () => {
                this.printService.setColumnsArray(printInvoiceColumnArray.reverse())
                this.printService.setColumnsNames(printInvoiceColumnName.reverse())
                this.printService.setRowsData(this.selectedInvoiceData.reverse())
                setTimeout(() => {
                    window.open('ToPrint/Data', '_blank');
                }, 100);
            }
        }))


    }
    @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
    openOptionsModal() {
        let el: HTMLElement = this.OpenOptionsModal.nativeElement;
        el.click();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe()
    }
    print(printData: any) {
        if (printData.amountOfPrint == 2) {
            this.nonPaginatedPrintableData=[]
            this.subs.add(this.http.getReq(`purchases/receiving-reviewer/print`).subscribe({
                next: (res) => {
                    Object.values(res.data).forEach((element: any, index: number) => {
                        this.nonPaginatedPrintableData.push(
                            {
                                id: element.id,
                                serial_number: index + 1,
                                created_at: element.created_at,
                                supplier_name: element.supplier.name,
                                purchase_number: element.purchase_number,
                                total_items: element.total_cart_items,
                                warehouse: element.warehouse.name,
                                created_by: element.created_by.name,
                                status:element?.status?.name
                            }
                        )
                    })
                }, complete: () => {
                    this.printService.setColumnsArray(this.columnsArrayPopup)
                    this.printService.setColumnsNames(this.columnsNamePopup)
                    this.printService.setRowsData(this.nonPaginatedPrintableData)
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
            this.printService.setColumnsArray(this.columnsArrayPopup)
            this.printService.setColumnsNames(this.columnsNamePopup)
            this.printService.setRowsData(this.SupplyOrderListData)
            if (printData.type == 1) {
                this.printService.downloadPDF()
            }
            else {
                this.printService.downloadCSV()
            }
        }


        setTimeout(() => {
            this.openModal()
        }, 100);
    }
    @ViewChild('OpenOptionsModal2') OpenOptionsModal2!: ElementRef<HTMLElement>;
    openModal() {
        let el: HTMLElement = this.OpenOptionsModal2.nativeElement;
        el.click();
    }
}  