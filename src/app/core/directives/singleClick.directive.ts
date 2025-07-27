import { Directive, Renderer2, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appDisableButton]',
  standalone:false
})
export class DisableButtonDirective {

  private isButtonBusy = false;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('click', [ '$event' ])
  handleClick(event: Event) {
    // if (this.isButtonBusy) {
    //   event.preventDefault();
    //   event.stopPropagation();
    //   return;
    // }

    this.renderer.addClass(this.el.nativeElement, 'disabledDiv');
    // this.renderer.setProperty(this.el.nativeElement, 'backgroundColor', 'black');
    this.isButtonBusy = true;

    setTimeout(() => {
      this.isButtonBusy = false;
      this.renderer.removeClass(this.el.nativeElement, 'disabledDiv');
      // this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor'); // removes the background color style
    }, 2000);  // Disables the button for 3 seconds
  }
}
