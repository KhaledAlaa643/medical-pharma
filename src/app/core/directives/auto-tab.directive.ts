import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFocusNext]'
})
export class FocusNextDirective {

  constructor(private el: ElementRef) { }

  @HostListener('keydown.enter', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    event.preventDefault();
    let nextInput = this.el.nativeElement;
    do {
      nextInput = nextInput.nextElementSibling || nextInput.parentElement.nextElementSibling;
      if (nextInput) {
        nextInput = nextInput.querySelector('input');
      }
    } while (nextInput && !nextInput.focus);
    if (nextInput) {
      nextInput.focus();
    }
  }

}
