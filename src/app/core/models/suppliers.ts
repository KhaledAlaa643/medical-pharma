export interface suppliers {
    id: number
    name: string,
    role:string[]
    email: string,
    phone: number,
    target: any,
    shift_status: any,
    has_list: boolean,
    shift:string
  }

  export interface supplier{
    id:number
    name: string,
    code:string
  }