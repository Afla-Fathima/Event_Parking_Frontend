import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}
  @HostListener('mouseenter') enter(): void {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translateY(-2px)');
  }
  @HostListener('mouseleave') leave(): void {
    this.renderer.removeStyle(this.el.nativeElement, 'transform');
  }
}

@Directive({ selector: '[appSeatStatus]', standalone: true })
export class SeatStatusDirective {
  @Input() set appSeatStatus(status: string) {
    const available = status?.toLowerCase() === 'available';
    this.renderer.setAttribute(
      this.el.nativeElement,
      'data-seat-state',
      available ? 'available' : 'occupied',
    );
  }
  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}
}
