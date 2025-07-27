import { Component, OnInit, Output } from '@angular/core';
import { Progress_barService } from '@services/progress_bar.service';
import { SkeletonLoadingService } from '@services/skeleton-loading.service';
import { SideNavbarComponent } from '../layout/sideNavbar/sideNavbar.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sales-admin',
  templateUrl: './sales-admin.component.html',
  styleUrls: ['./sales-admin.component.scss']
})
export class SalesAdminComponent implements OnInit {
  showSide!:boolean


  constructor(public skeletonLoader:SkeletonLoadingService,public progressBarLoader:Progress_barService) { }

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
