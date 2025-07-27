import { AfterContentInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-shared_popup',
  templateUrl: './shared_popup.component.html',
  styleUrls: ['./shared_popup.component.scss'],
  standalone:false
})
export class Shared_popupComponent implements OnInit ,OnChanges {
  @Output() ChoosenEvent:EventEmitter<{ok:boolean,cancle:boolean}> = new EventEmitter<{ok:boolean,cancle:boolean}>();
  @Input() popupMessage!: string;
  @Input() ok_button_name!: string;
  @Input() cancle_button_name!: string;
  @Input() hover_ok_button!:boolean
  @ViewChild('ok_button') ok_button!: ElementRef<HTMLElement>;

  

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    
    this.ok_button?.nativeElement?.focus();  
    if(changes['hover_ok_button'] && this.hover_ok_button){

      setTimeout(() => {
        this.ok_button.nativeElement?.focus();  
      },800);
    }
  }

  ngOnInit() {
    // setTimeout(() => {
    //   this.ok_button.nativeElement?.focus();
    // }, 250);
  }


  emitChoosenEvent(okEvent:boolean,cancleEvent:boolean){
    let event={
      'ok':okEvent,
      'cancle':cancleEvent
    }

    this.ChoosenEvent.emit(event)
    this.closeModalClick()

  }

  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }

  @ViewChild('OpenModalBtn') OpenModalBtn!: ElementRef<HTMLElement>;
  openModel(){
    setTimeout(()=>{
      let el: HTMLElement = this.OpenModalBtn.nativeElement;
      el.click();
    },600)
  }

}
