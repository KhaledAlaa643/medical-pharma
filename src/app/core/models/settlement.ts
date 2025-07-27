import { pharmacie } from "./pharmacie"
import { products, warehouses } from "./products"

export interface settlement{
    order_id:number,
    cart_id?:number,
    batch_id?:number,
    returned_quantity:number
    product_name:string
    from_warehouse_name:string
    quantity:number
    date_operatingNumber:string
    pharmacy_name:string
    created_at:string
    reviewed_by:string
    status?:string,
    id?:number
}

export interface reviewer{
    name:string
}