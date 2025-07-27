import { Directive, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appFocusNext]',
  standalone:false
})
export class FocusNextDirective implements OnInit {
  @Input() appFocusNext!: {id: string,type:string,dropdown?:any};

  constructor() { }

  ngOnInit() {
  }

  // Listen to 'Enter' key on the element where the directive is applied
  @HostListener('keydown.enter', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.appFocusNext.id) {
      const nextElement = document.getElementById(this.appFocusNext.id) as HTMLElement;
      if (nextElement) {
        if(this.appFocusNext.type!='dropdown'){
          if(this.appFocusNext.dropdown){
            if (!this.appFocusNext.dropdown?.overlayVisible){
              event.preventDefault();
              nextElement.focus()
            }
          }
          else{
            event.preventDefault();
            nextElement.focus()
          }
        }
        else{
            const hiddenInput = nextElement.querySelector('input') as HTMLElement; 
            event.preventDefault();
            hiddenInput.focus();
        }
      }
    } 

  }

  }



