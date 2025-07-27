export interface products {
    
        id: number,
        created_by: number,
        updated_by: number,
        name: string,
        description: string,
        sku: string,
        operating_number: string,
        total_quantity:number,
        is_limited_quantity: number,
        location?:string,
        name_ar?:string,
        name_en?:string,
        available_quantity_for_limited_quantity: number,
        manufacture_company: {
            id: number,
            name: string,
            created_at: string
        },
        market_price: number,
        taxes: number,
        items_number_in_packet: number,
        current_discount_tier:number
        packets_number_in_package: 5,
        production_date: string,
        normal_discount:number
        expired_at: string,
        created_at: string,
        updated_at: string,
        type:{
            name:string,
            value:string
        }
        offers:offers[],
        warehouses:warehouses[]
        quantity?:number,
        warehouse_name?:string,
        warehouses_details:[{id:number,quantity:number}],
        manufacturer_ar?:string,
        quantity_sum_in_warehouses?:string,
        quantity_in_warehouse?: number
        price?:number,
        batches: [
            {
                id: number,
                quantity: number,
                expired_at: string,
                operating_number: string,
                production_date: string
                batch_price?:number
            },

        ]
        disabled?:boolean
    
}

export interface product_dropdown{
    name:string
    id:number | string
    disabled?:boolean
}


export interface warehouses{
    id: number,
    name: string,
    address:string,
    type: string,
    created_at: string
    updated_at: string
    products?:products[]
}

export interface offers{
    quantity?: number|null,
    percentage?: number|null
}

export interface fixedData{
    exp_date:string
    production_date:string
    price:number
    tax:number
    totalAmount:number
    warehousesQuantity:number|null
    salesDiscount:number
}

export interface batch{
    location?: string,
    product_name: string,
    price?: number,
    real_quantity?:number,
    reciving_reviewer?:string,
    selling_reviewer?:string,
    created_by:string,
    old_operation:string,
    new_operation:string,
    supplied_by?:string,
    supplied_at?:string,
    warehouse_name?: string,
    manufacturer_name: string, 
    housing_worker?: string, 
    preparer?: string, 
    quantity:number
    batch_id?:number
    total_quantity:number
    sub_batch_id?:number

}


