export interface receiversAuditor {
    id: number
    name: string,
    role:string[]
    email: string,
    phone: number,
    target: any,
    shift_status: any,
    has_list: boolean,
    shift?:string,
    permissions:any
  }