import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNoSpecialChars]',
  standalone:false
})
export class NoSpecialCharsDirective {
  @Input('appNoSpecialChars') enabled: boolean = false;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return;

    const allowedKeys = [
      'Backspace',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Delete',
      'Enter',
    ];

    const key = event.key;

    const isAllowed =
      /^[a-zA-Z0-9\u0600-\u06FF ]$/.test(key) || allowedKeys.includes(key);

    if (!isAllowed) {
      event.preventDefault();
    }
  }
}
