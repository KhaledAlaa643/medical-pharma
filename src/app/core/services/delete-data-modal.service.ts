import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeleteDataModalService {
  public itemDeleteRoute: string ='';
  public deleteModalTitle: string= '';
  public deleteModalDescription: string ='';
  public currentItemId = -1
  public tableName = ''
  constructor() { }

}
