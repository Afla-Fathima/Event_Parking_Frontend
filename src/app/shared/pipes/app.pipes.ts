import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'shortText', standalone: true })
export class ShortTextPipe implements PipeTransform {
  transform(value: string | null | undefined, length = 72): string {
    const text = value ?? '';
    return text.length > length ? `${text.slice(0, length).trim()}…` : text;
  }
}

@Pipe({ name: 'seatLabel', standalone: true })
export class SeatLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return (value ?? '').replace(/^([A-Z]+)(\d+)$/i, '$1-$2');
  }
}

@Pipe({ name: 'slotCode', standalone: true })
export class SlotCodePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return (value ?? '').toUpperCase();
  }
}

@Pipe({ name: 'bookingStatus', standalone: true })
export class BookingStatusPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return (value ?? 'Unknown').replace(/([a-z])([A-Z])/g, '$1 $2');
  }
}
