import { DatePipe } from "@angular/common";
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { returnListDetails } from "@models/returns-list";
import { suppliers } from "@models/suppliers";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { GeneralService } from "@services/general.service";
import { HttpService } from "@services/http.service";
import { PrintService } from "@services/print.service";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
const datePipe = new DatePipe('en-EG');


@Component({
    selector: 'app-returns-list-details',
    templateUrl: './returns-list-details.component.html',
    styleUrls: [ './returns-list-details.component.scss' ]
})

export class ReturnsListDetailsComponent implements OnInit, OnDestroy {

    filterForm!: FormGroup
    returnsTosupplierForm!: FormGroup
    suppliers!: suppliers[]
    returnsListDetailsData: returnListDetails[] = []
    private subs = new Subscription();
    CheckPageBoolean: boolean = false
    constructor(
        private fb: FormBuilder,
        private http: HttpService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private toastr: ToastrService,
        private printService: PrintService,
        private generalService: GeneralService


    ) {
        this.CheckPageBoolean = this.router.url.includes('receiving-completed')
    }

    columnsArray: columnHeaders[] = [
        { name: 'الصنف' },
        { name: 'الكمية' },
        { name: 'السعر ' },
        { name: 'الاجمالي' },
        { name: ' سبب المرتجع' },


    ]
    columnsName: ColumnValue[] = [
        { name: 'product_name', type: 'normal' },
        { name: 'quantity_difference', type: 'normal' },
        { name: 'price', type: 'normal' },
        { name: 'total', type: 'normal' },
        { name: 'return_reason', type: 'normal' },
    ]


    @ViewChild('supplierNameInput') supplierNameInput!: ElementRef;
    @ViewChild('idNumberInput') idNumberInput!: ElementRef;
    @ViewChild('notesInput') notesInput!: ElementRef;
    @ViewChild('submitButton') submitButton!: ElementRef;


    ngOnInit(): void {
        this.filterForm = this.fb.group({
            supplier_id: [ '' ],
            purchase_number: [ '' ],

        })

        this.returnsTosupplierForm = this.fb.group({
            receiver_name: [ '' ],
            receiver_national_id: [ '' ],
            note: [ '' ]
        })

        this.getSupplierData()
        this.getReturnListView()
    }

    ngAfterViewInit(): void {
        this.supplierNameInput.nativeElement.focus();
    }

    @HostListener('document:keydown.enter', [ '$event' ])
    handleEnterKey(event: KeyboardEvent): void {
        if (document.activeElement === this.supplierNameInput.nativeElement) {
            this.idNumberInput.nativeElement.focus();
        } else if (document.activeElement === this.idNumberInput.nativeElement) {
            this.notesInput.nativeElement.focus();
        } else if (document.activeElement === this.notesInput.nativeElement) {
            this.submitButton.nativeElement.focus();
        }
    }


    getSupplierData() {
        this.subs.add(this.generalService.getSuppliers().subscribe({
            next: res => {
                this.suppliers = res.data

            }
        }))
    }


    printTable(print?: any) {
        this.printService.setColumnsArray(this.columnsArray)
        this.printService.setColumnsNames(this.columnsName)
        this.printService.setRowsData(this.returnsListDetailsData)
        setTimeout(() => {
            this.openOptionsModal()
        }, 100);


        if (print.type == 1) {
            this.printService.downloadPDF()
        }
        else {
            this.printService.downloadCSV()
        }
    }
    @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;

    openOptionsModal() {
        let el: HTMLElement = this.OpenOptionsModal.nativeElement;
        el.click();
    }
    getReturnListView() {
        let params = {
            return_id: Number(this.activatedRoute.snapshot.paramMap.get('id'))
        }
        this.subs.add(this.http.getReq(`purchases/reviewer-returns/${Number(this.activatedRoute.snapshot.paramMap.get('id'))}/show`).subscribe({
            next: (res) => {
                this.returnsListDetailsData = []
                this.filterForm.controls[ 'supplier_id' ].setValue(res.data.supplier.name)
                this.filterForm.controls[ 'purchase_number' ].setValue(res.data.id)

                if (this.CheckPageBoolean) {
                    this.returnsTosupplierForm.controls[ 'receiver_name' ].setValue(res.data.returns_receiver_name)
                    this.returnsTosupplierForm.controls[ 'receiver_national_id' ].setValue(res.data.returns_receiver_national_id)
                    this.returnsTosupplierForm.controls[ 'note' ].setValue(res.data.returns_note)
                }
                res.data.cart.forEach((element: any, index: number) => {
                    if(element.status.value==2){
                        this.returnsListDetailsData.push({
                            id: element.id,
                            purchase_id: res.data.id,
                            serial_number: index + 1,
                            product_name: element?.product?.name,
                            quantity_difference: element.quantity_difference,
                            price: element?.product?.price,
                            total: element.total,
                            return_reason: element.reason.name
                        });
                    }
                     
                });
            }, complete: () => {

            },
        }))
    }

    submitReturnsToSupplier() {
        let x: any = {};
        for (const key in this.returnsTosupplierForm.controls) {
            if (this.returnsTosupplierForm.controls.hasOwnProperty(key)) {
                let value = this.returnsTosupplierForm.controls[ key ].value;
                if (value != null && value != undefined && value !== '') {
                    x[ key ] = value;
                } else {
                    delete x[ key ]
                }
            }
        }
        x[ 'purchase_id' ] = Number(this.activatedRoute.snapshot.paramMap.get('id'))

        this.subs.add(this.http.postReq('purchases/reviewer-returns/dispatch', x).subscribe({
            next: (res) => {
                this.toastr.success(res.message)
            }, complete: () => {
                this.router.navigate([ '/warehouse/receiving-auditor/returns-list' ])
            },
        }))
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe()
    }
}