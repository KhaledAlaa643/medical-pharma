import { Component, OnInit } from '@angular/core';
import { Progress_barService } from '@services/progress_bar.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  constructor(public progressBarLoader:Progress_barService) { }

  ngOnInit() {
  }

}
