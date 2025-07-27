import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choose-client-type',
  templateUrl: './choose-client-type.component.html',
  styleUrls: ['./choose-client-type.component.scss'],
  standalone:false
})
export class ChooseClientTypeComponent implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  navigateTo(type: string) {
    if (type == 'sales') {
      this.closeModalClick()
      setTimeout(() => {
        this.router.navigate([ '/sales-admin/clients/Add-client/sales' ])
      }, 100)
    }
    else if (type == 'group') {
      this.closeModalClick()
      setTimeout(() => {

        this.router.navigate([ '/sales-admin/clients/Add-client/group' ])
      }, 100)

    }
    else {
      this.closeModalClick()
      setTimeout(() => {

        this.router.navigate([ '/sales-admin/clients/Add-client/pharmacy' ])
      }, 100)
    }
  }

  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }

  @ViewChild('AddModal') AddModal!: ElementRef<HTMLElement>;
  openAddModal() {
    let el: HTMLElement = this.AddModal.nativeElement;
    el.click();
  }
}
