import { pharmacie } from "./pharmacie"

export interface waitingList{
    waiting_list: waitingClient[],
    waiting_list_number: number
}

export interface waitingClient{
        id: number
        client: {
          id: number,
          name: string,
          code:string,
          type: string
        }
        sales: {
          id: number,
          name: string,
          role: string[],
          email: string,
          phone: string
        }
        pharmacy:pharmacie
        minutes_waited: number
        created_at: string


        
}