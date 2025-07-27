import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideNavbarComponent } from './sideNavbar/sideNavbar.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModuleModule } from '@modules/shared-module.module';


@NgModule({
  declarations: [
    SideNavbarComponent,
  ],
  exports:[
    SideNavbarComponent, ReactiveFormsModule,
    ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModuleModule
  ]
})
export class LayoutModule { }
