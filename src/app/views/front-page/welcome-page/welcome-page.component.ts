import { Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: [ './welcome-page.component.scss' ]
})
export class WelcomePageComponent implements OnInit {
  @Input() downloadBoolean:boolean = false
  @ViewChild('QRcode') htmlPage!: ElementRef;
  @Input() stickerData:any
  @Input() stickerType:any
  @Input() printCount:any
  activeURL:string=''
  
  numberOfPrint=0

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
   if(changes['stickerData']){

   }
  }

  ngOnInit() {
    this.stickerType='bag'
  }


}
