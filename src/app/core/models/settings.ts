import { corridors } from "./corridors.js"

export interface setting{
    baskets_number:number
    corridors:corridors[]
    damaged_baskets:basket[]
    high_price:number
    remaining_months_for_expiration:number
    default_sorting:string

}
// export interface corridor{
//     id:number
//     number:number
//     completed_at:string
//     is_main_corridor:boolean
//     color:string
// }
export interface basket{
    number:number
    id:number
}