import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appOnlyIntegerNumbers]',
  standalone:false
})
export class OnlyIntegerNumbersDirective {
  @Input('appOnlyIntegerNumbers') enabled: boolean = false;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.enabled) {
      const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'];
      const isNumberKey = event.key >= '0' && event.key <= '9';
      if (!allowedKeys.includes(event.key) && !isNumberKey) {
        event.preventDefault();
      }
    }
  }
}
