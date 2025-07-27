import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsViewArray = Array.from({ length: 5 }, () => ({ show: false, disabled: false }));

  constructor() { }

  ngOnInit() {
  }

  show(index:any){
      this.settingsViewArray[index].show=!this.settingsViewArray[index].show
  }
}
