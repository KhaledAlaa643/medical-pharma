import { DatePipe } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { allData, auditedData, reviewedData } from "@models/audited";
import { warehouses } from "@models/products.js";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { HttpService } from "@services/http.service";
import { Subscription } from "rxjs";
export interface auditedLowerData {
    total_inventoried_cart_items: number
    total_purchase_price: number
    total_non_inventoried_cart_items:number
    warehouse:warehouses
}


@Component({
    selector: 'app-audit-completed-details',
    templateUrl: './audit-completed-details.component.html',
    styleUrls: [ './audit-completed-details.component.scss' ]
})

export class AuditCompletedDetailsComponent implements OnInit, OnDestroy {

    filterForm!: FormGroup
    isActiveTapArray: boolean[] = Array(2).fill(false)
    AuditedData: auditedData[] = [];
    reviewed: reviewedData[] = [];
    allInvoice: allData[] = [];
    lowerAreaData: auditedLowerData ={
        
            total_inventoried_cart_items: 0,
            total_purchase_price: 0,
            total_non_inventoried_cart_items: 0,
            warehouse: {

                name: '',
                id:0, 
                address:'', 
                type:'', 
                created_at:'', 
                updated_at:''
            },
    };
    
    constructor(
        private fb: FormBuilder,
        private http: HttpService,
        private activeRoute: ActivatedRoute,
    ) {

    }

    columnsArray: columnHeaders[] = [
        { name: ' اسم الصنف' },
        { name: ' الصلاحية والتشغيلة  ' },
        { name: ' كمية   مجرودة ' },
        { name: 'كمية   الفاتورة ' },
        { name: 'الفرق ' },
        { name: ' سعر الجمهور' },
        { name: 'سعر   التوريد  ' },
        { name: 'ملاحظات   علي الصنف ' },
    ]
    columnsName: ColumnValue[] = [
        { name: 'name', type: 'normal' },
        { name: 'exp', type: 'normal' },
        { name: 'inventoried_quantity', type: 'normal' },
        { name: 'quantity', type: 'normal' },
        { name: 'quantity_difference', type: 'normal' },
        { name: 'public_price', type: 'normal' },
        { name: 'supply_price', type: 'normal' },
        { name: 'note', type: 'normal' },

    ]




    ngOnInit(): void {
        this.getAuditedCompleted()
        this.changeActiveTab(0)
        this.filterForm = this.fb.group({
            supplier_id: [ '' ],
            purchase_number: [ '' ],
            date: [ '' ],

        })
    }

    changeActiveTab(index: any) {
        this.isActiveTapArray.fill(false)
        this.isActiveTapArray[ index ] = true
        if (index == 0) {
            this.AuditedData = this.allInvoice

            this.columnsName = [
                { name: 'name', type: 'normal' },
                { name: 'inventoried_quantity', type: 'normal' },
                { name: 'quantity', type: 'normal' },
                { name: 'public_price', type: 'normal' },
                { name: 'supply_price', type: 'normal' },
                { name: 'note', type: 'normal' },

            ]
            this.columnsArray = [
                { name: ' اسم الصنف' },
                { name: ' كمية   مجرودة ' },
                { name: 'كمية   الفاتورة ' },
                { name: ' سعر الجمهور' },
                { name: 'سعر   التوريد  ' },
                { name: 'ملاحظات   علي الصنف ' },
            ]
        }
        else if (index == 1) {
            this.AuditedData = this.reviewed

            this.columnsArray = [
                { name: ' اسم الصنف' },
                { name: ' الصلاحية والتشغيلة  ' },
                { name: ' كمية   مجرودة ' },
                { name: 'كمية   الفاتورة ' },
                { name: 'الفرق ' },
                { name: ' سعر الجمهور' },
                { name: 'سعر   التوريد  ' },
                { name: 'ملاحظات   علي الصنف ' },
            ]
            this.columnsName = [
                { name: 'name', type: 'normal' },
                { name: 'exp', type: 'normal' },
                { name: 'inventoried_quantity', type: 'normal' },
                { name: 'quantity', type: 'normal' },
                { name: 'quantity_difference', type: 'normal' },
                { name: 'public_price', type: 'normal' },
                { name: 'supply_price', type: 'normal' },
                { name: 'note', type: 'normal' },

            ]
        }
    }

    private subs = new Subscription()


    getAuditedCompleted() {
        this.AuditedData = []
        let param
        this.activeRoute.params.subscribe(params => {

            param = +params[ 'id' ]

        });
        this.subs.add(this.http.getReq(`purchases/${param}`).subscribe({
            next: (res) => {

                this.filterForm.controls[ 'supplier_id' ].setValue(res.data.supplier.name)
                this.filterForm.controls[ 'purchase_number' ].setValue(res.data.id)
                this.filterForm.controls[ 'date' ].setValue(res.data.created_at.split(" ")[ 0 ])

                if (res.data){
                    this.lowerAreaData = res.data
                } 
                res.data.cart.inventoried.forEach((batch: any) => {
                    this.reviewed.push({
                        'name': batch.product.name,
                        'exp': batch.operating_number + " " + batch.expired_at,
                        'inventoried_quantity': batch.inventoried_quantity,
                        'quantity': batch.quantity,
                        'quantity_difference': batch.quantity_difference,
                        'public_price': batch.public_price,
                        'supply_price': batch.supply_price,
                        'note': batch.note,
                    });
                });

                const allOrder = [...res.data.cart.inventoried, ...res.data.cart.not_inventoried];


                allOrder.forEach((cart: any, index: number) => {
                    this.allInvoice.push({
                        'name': cart.product.name,
                        'inventoried_quantity': cart.inventoried_quantity,
                        'quantity': cart.quantity,
                        'quantity_difference': cart.quantity_difference,
                        'public_price': cart.public_price,
                        'supply_price': cart.supply_price,
                        'note': cart.note,
                    });
                })
            }
        }))
    }



    ngOnDestroy(): void {
        this.subs.unsubscribe()
    }
}