import { products, warehouses } from "./products"

export interface newItems{
    id?:number,
    quantity: number,
    expired_at?: string,
    operating_number?: string,
    production_date?: string,
    discount: number,
    code?: string,
    created_at?: string,
    product_name:string
    Product_price:number
    product?:products
    warehouse?: warehouses
    warehouse_name:string
}