export interface offer{
            id: number,
            created_by: number,
            updated_by: number,
            name:string,
            description:string,
            sku: string,
            total_quantity: number,
            is_limited: number,
            limited_quantity: number,
            normal_discount: number,
            manufacture_company: string,
            price: number,
            taxes: number,
            items_number_in_packet: number,
            packets_number_in_package:number,
            quantity_sum_in_warehouses: number,
            quantity_in_warehouse: number,
            has_offer: boolean,
            created_at: string,
            updated_at: string,
            offers: offers[]
        

} 

export interface offers{
    id: number,
    quantity_for_offer: number,
    quantity: number,
    percentage: number,
    type: string,
    slat_type: string
}

export interface offerToDisplay{
    id:number
    normal_discount: number,
    name:string
    quantity_for_offer: number,
    percentage: number,


}