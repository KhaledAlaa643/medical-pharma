import { sales } from "./sales"

export interface productionReports {
    id: any
    total_price: any
    total_quantity: any
    total_taxes: any
    total: number
    orders_count: number
    order_number: any
    pharmacies_count: any
    related_clients_count: number
    non_related_clients_count: number
    percentage_sales: number
    percentage_area_sales: number
    percentage_track_sales: number
    percentage_city_sales: number
    client_sales_percentage: number
    percentage_target: number
    created_at: string
    pharmacy: any
    sales: sales[]
    created_by: any
}

export interface allProductionReports {
    data: productionReports
    salesmen_count: number
    sales_sum: number
    percentage_sales_sum: number
    client_sales_percentage_sum: number
    percentage_city_sales_sum: number
    percentage_area_sales_sum: number
    percentage_track_sales_sum: number
    orders_count_sum: number
    related_clients_count_sum: number
    non_related_clients_count_sum: number
    target_sum: number
    target_percentage_sum: number
    returns_sum?: number
    net_sales_sum?:number
}







