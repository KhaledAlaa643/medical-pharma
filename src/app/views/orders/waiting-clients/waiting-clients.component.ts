import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { client } from '@models/client';
import { pharmacie } from '@models/pharmacie';
import { waitingClient, waitingList } from '@models/waitingList';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, findIndex, switchMap } from 'rxjs';
import * as moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';

interface ClickedWaitingClient {
  pharmacy_id: number;
  client_id: number;
}

@Component({
  selector: 'app-waiting-clients',
  templateUrl: './waiting-clients.component.html',
  styleUrls: ['./waiting-clients.component.scss'],
})
export class WaitingClientsComponent implements OnInit {
  private subs = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'الاسم',
    },
    {
      name: 'وقت التسجيل',
    },
    {
      name: ' عدد دقائق الانتظار	',
    },
    {
      name: ' السيلز	',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'name',
      type: 'client-pharmacy-name',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'minutes_waited',
      type: 'timeFormat',
    },
    {
      name: 'salesName',
      type: 'sales.name',
    },
  ];
  @Output() changeWaitingNumberEvent = new EventEmitter<number>();
  @Output() clickedWaitingClient = new EventEmitter<ClickedWaitingClient>();

  pharmacies: any;
  groupPharmacied: any[] = [];
  waitingClients: waitingClient[] = [];
  waitingClientsNumber: number = 0;
  client: client[] = [];
  clientId!: number;
  pharmacyID: any;
  pharmacy_id: any;
  timeInMinutes: any = '';
  formattedTime: any;
  page = 1;
  per_page = 0;
  total_rec = 0;

  constructor(
    private http: HttpService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService
  ) {
    moment.locale('ar');
  }

  ngOnInit() {
    this.getclient();
    this.getWaitingClients();
  }

  getWaitingClients() {
    this.subs.add(
      this.http.getReq('waiting-list').subscribe({
        next: (res) => {
          this.waitingClients = res.data.waiting_list;
          this.waitingClientsNumber = res.data.waiting_list_number;
        },
        complete: () => {
          this.changeWaitingClientNumber(this.waitingClientsNumber);
        },
      })
    );
  }

  getclient() {
    // this.subs.add(this.http.getReq('pharmacies').subscribe({
    //   next:res=>{
    //     this.pharmacies=res.data
    //   },complete:()=>{
    //     this.pharmacies.forEach((element:any)=>{
    //       this.groupPharmacied.push({
    //        'name':element?.clients[0]?.name+'-'+element?.name,
    //        'id':element?.id,
    //        'client_id':element?.clients[0]?.id
    //       })
    //      })
    //   }
    //  }))

    let clients: any = [];
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          clients = res.data;
          clients.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacied.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
                client_id: client?.id,
              });
            });
          });
        },
      })
    );
  }

  addWaitingClient() {
    const index = this.groupPharmacied.findIndex(
      (x: any) => x.id === this.pharmacyID
    );
    if (index > -1) {
      this.clientId = this.groupPharmacied[index].client_id;
      let body = {
        client_id: this.clientId,
        pharmacy_id: this.pharmacyID,
      };
      let message = '';
      this.subs.add(
        this.http.postReq('waiting-list/create', body).subscribe({
          next: (res) => {
            message = res.message;
            this.waitingClients.push(res.data.waiting_list);
            this.waitingClientsNumber = res.data.waiting_list_number;
          },
          complete: () => {
            this.changeWaitingClientNumber(this.waitingClientsNumber);
            this.toastr.info(message);
          },
        })
      );
    }
  }

  changeWaitingClientNumber(data: number) {
    this.changeWaitingNumberEvent.emit(data);
  }

  getClientIds(event: ClickedWaitingClient) {
    localStorage.setItem('pharmacyId', event.pharmacy_id.toString());

    this.clickedWaitingClient.emit(event);
  }
}
