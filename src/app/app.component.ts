import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { SessionTimeoutService } from '@services/SessionTimeout.service';
import { AuthService } from '@services/auth.service';
import { ChangeLanguageService } from '@services/changeLanguage.service';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription, filter } from 'rxjs';
import * as  io from 'socket.io-client';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.scss' ]
})

export class AppComponent implements OnInit {
  title = 'medical'
  websocket!: WebSocket;
  private subs = new Subscription();

  socket: any;
  users: any[] = [];
  messages: any[] = [];
  message: string = '';
  channel: string = '';
  enumsData:any

  constructor(public changeLangService: ChangeLanguageService,private generalService:GeneralService,private router:Router, private auth: AuthService, private http: HttpService,private sessionTimeoutService:SessionTimeoutService,private toastr:ToastrService) {
    this.changeLangService.checkLangage()


  }
  ngOnInit() {
    this.subs.add(this.sessionTimeoutService.checkSessionTimeout().subscribe(() => {
      this.sessionTimeoutService.logout();
    }
    )
    )
  

  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

removeQuarryParams(){
  this.router.events
  .pipe(filter(event => event instanceof NavigationStart))
  .subscribe((event: any) => {
    if (event.navigationTrigger === 'imperative') {
    } else {
      this.router.navigate([], {
        queryParams: {},
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  });
}


}
