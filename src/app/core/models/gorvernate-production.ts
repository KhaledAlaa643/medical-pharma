export interface Root {
    status_code: number
    message: string
    data: Data
    additional_data: any
  }
  
  export interface Data {
    data: Daum[]
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
  }
  
  export interface Daum {
    id: any
    total_price: any
    total_quantity: any
    total_taxes: any
    total: number
    orders_count: number
    order_number: any
    pharmacies_count: any
    related_clients_count: any
    non_related_clients_count: any
    percentage_sales: number
    percentage_area_sales: number
    percentage_track_sales: number
    percentage_city_sales: number
    client_sales_percentage: number
    percentage_target: number
    created_at: string
    city: City
  }
  
  export interface City {
    id: number
    name: string
    pharmacies_count: any
  }
  