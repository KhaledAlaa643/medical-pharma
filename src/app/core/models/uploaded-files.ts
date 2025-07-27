export interface uploaded_file{
    
        file_id: number,
        supplier: {
            name:string,
            code: string
        },
        created_by: string
        supplier_code:string
        supplier_name:string
        created_at: string,
        file_products_num?: number,
        compared_products_num?: number,
        not_compared_products_num?: number,
        prev_compared_products_num?: number,
        supplier_products_name?:string
        supplier_products_price?:number
        supplier_products_discount?:number
}