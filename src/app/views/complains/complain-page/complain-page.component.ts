import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { complain } from '@models/complain';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-complain-page',
  templateUrl: './complain-page.component.html',
  styleUrls: ['./complain-page.component.scss'],
})
export class ComplainPageComponent implements OnInit {
  id: number = 0;
  type: string = '';
  Complain: complain = {} as complain;
  private subs = new Subscription();
  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private http: HttpService
  ) {}

  ngOnInit() {
    this.id = Number(this.activeRoute.snapshot.paramMap.get('id'));
    this.type = String(this.activeRoute.snapshot.paramMap.get('type'));
    this.getSpecificComplaint(this.id);
  }
  getSpecificComplaint(id: any) {
    let body = {
      id: this.id,
    };
    let getUrl = 'settings/complains/show-complain';

    this.subs.add(
      this.http.getReq(getUrl, { params: body }).subscribe({
        next: (res) => {
          this.Complain = res.data;
          this.paramID = res.data.id;
        },
      })
    );
  }
  paramID!: number;
  completeComplaint() {
    let getUrl = 'settings/complains/update-solver-complain';

    this.subs.add(
      this.http.postReq(getUrl, { id: this.paramID }).subscribe({
        next: (res) => {
          this.Complain = res.data;
        },
        complete: () => {
          setTimeout(() => {
            this.router.navigate(['complains/all-complains/log']);
          }, 100);
        },
      })
    );
  }
}
