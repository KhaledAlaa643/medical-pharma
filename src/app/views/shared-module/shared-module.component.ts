import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-shared-module',
  templateUrl: './shared-module.component.html',
  styleUrls: ['./shared-module.component.scss'],
  standalone:false
})
export class SharedModuleComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
