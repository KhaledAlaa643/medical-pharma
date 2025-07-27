import { Component, OnInit } from '@angular/core';
import { Progress_barService } from '@services/progress_bar.service';
import { SkeletonLoadingService } from '@services/skeleton-loading.service';

@Component({
  selector: 'app-general-settings',
  templateUrl: './general-settings.component.html',
  styleUrls: ['./general-settings.component.scss']
})
export class GeneralSettingsComponent implements OnInit {

  showSide!:boolean


  constructor(public progressBarLoader:Progress_barService) { }

  ngOnInit() {

  }
  
  handleShowSideChange(showSide: boolean) {
    this.showSide = showSide;
  }

  get mainDivClass(): string {
    // Return the appropriate class based on the showSide value
    return this.showSide ? 'MainDiv' : 'MainDiv-full';
  }

}
