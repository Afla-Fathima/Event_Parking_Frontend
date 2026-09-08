import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminDashboard,
  Booking,
  Category,
  CategoryUpdate,
  CategoryWrite,
  CreateBookingRequest,
  Customer,
  CustomerDashboard,
  EventItem,
  EventWrite,
  NotificationItem,
  ParkingSlot,
  ParkingSlotWrite,
  Payment,
  PaymentStatus,
  Receipt,
  Seat,
  SeatWrite,
  UpdateCustomerRequest,
  Venue,
  VenueWrite,
} from '../models/api.models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private readonly http: HttpClient) {}
  list(
    filters: {
      search?: string;
      date?: string;
      venue?: number | null;
      category?: number | null;
    } = {},
  ): Observable<EventItem[]> {
    let params = new HttpParams();
    if (filters.search) params = params.set('search', filters.search);
    if (filters.date) params = params.set('date', filters.date);
    if (filters.venue) params = params.set('venue', filters.venue);
    if (filters.category) params = params.set('category', filters.category);
    return this.http.get<EventItem[]>(`${API}/events`, { params });
  }
  get(id: number): Observable<EventItem> {
    return this.http.get<EventItem>(`${API}/events/${id}`);
  }
  create(value: EventWrite): Observable<EventItem> {
    return this.http.post<EventItem>(`${API}/events`, value);
  }
  update(id: number, value: EventWrite): Observable<EventItem> {
    return this.http.put<EventItem>(`${API}/events/${id}`, value);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class SeatService {
  constructor(private readonly http: HttpClient) {}
  list(eventId: number): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${API}/events/${eventId}/seats`);
  }
  create(eventId: number, value: SeatWrite): Observable<Seat> {
    return this.http.post<Seat>(`${API}/events/${eventId}/seats`, value);
  }
  update(eventId: number, seatId: number, value: SeatWrite): Observable<Seat> {
    return this.http.put<Seat>(`${API}/events/${eventId}/seats/${seatId}`, value);
  }
  delete(eventId: number, seatId: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${eventId}/seats/${seatId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class ParkingService {
  constructor(private readonly http: HttpClient) {}
  list(eventId: number): Observable<ParkingSlot[]> {
    return this.http.get<ParkingSlot[]>(`${API}/events/${eventId}/parking-slots`);
  }
  create(eventId: number, value: ParkingSlotWrite): Observable<ParkingSlot> {
    return this.http.post<ParkingSlot>(`${API}/events/${eventId}/parking-slots`, value);
  }
  update(eventId: number, slotId: number, value: ParkingSlotWrite): Observable<ParkingSlot> {
    return this.http.put<ParkingSlot>(`${API}/events/${eventId}/parking-slots/${slotId}`, value);
  }
  delete(eventId: number, slotId: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/${eventId}/parking-slots/${slotId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private readonly http: HttpClient) {}
  create(value: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${API}/bookings`, value);
  }
  mine(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${API}/bookings/my`);
  }
  myBooking(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${API}/bookings/my/${id}`);
  }
  byEvent(eventId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${API}/bookings`, { params: { eventId } });
  }
  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/bookings/my/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private readonly http: HttpClient) {}
  status(bookingId: number): Observable<PaymentStatus> {
    return this.http.get<PaymentStatus>(`${API}/bookings/${bookingId}/payment`);
  }
  pay(bookingId: number, paymentMethod: string): Observable<Payment> {
    return this.http.post<Payment>(`${API}/bookings/${bookingId}/payment`, { paymentMethod });
  }
  mine(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${API}/payments/my`);
  }
  receipt(paymentId: number): Observable<Receipt> {
    return this.http.get<Receipt>(`${API}/payments/${paymentId}/receipt`);
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly unread = signal(0);

  constructor(private readonly http: HttpClient) {}

  mine(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${API}/notifications/my`);
  }

  unreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${API}/notifications/my/unread-count`);
  }

  refreshUnread(): void {
    this.unreadCount().subscribe({
      next: ({ count }) => this.unread.set(count),
      error: () => this.unread.set(0),
    });
  }

  syncUnread(items: NotificationItem[]): void {
    this.unread.set(items.filter((item) => !item.isRead).length);
  }

  clearUnread(): void {
    this.unread.set(0);
  }

  markRead(id: number): Observable<void> {
    return this.http.put<void>(`${API}/notifications/${id}/read`, {}).pipe(
      tap(() => this.unread.update((count) => Math.max(0, count - 1))),
    );
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private readonly http: HttpClient) {}
  customer(): Observable<CustomerDashboard> {
    return this.http.get<CustomerDashboard>(`${API}/dashboard/customer`);
  }
  admin(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${API}/dashboard/admin`);
  }
}

@Injectable({ providedIn: 'root' })
export class VenueService {
  constructor(private readonly http: HttpClient) {}
  list(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${API}/venues`);
  }
  create(value: VenueWrite): Observable<Venue> {
    return this.http.post<Venue>(`${API}/venues`, value);
  }
  update(id: number, value: VenueWrite): Observable<Venue> {
    return this.http.put<Venue>(`${API}/venues/${id}`, value);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/venues/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private readonly http: HttpClient) {}
  list(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API}/categories`);
  }
  create(value: CategoryWrite): Observable<Category> {
    return this.http.post<Category>(`${API}/categories`, value);
  }
  update(id: number, value: CategoryUpdate): Observable<Category> {
    return this.http.put<Category>(`${API}/categories/${id}`, value);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/categories/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  constructor(private readonly http: HttpClient) {}
  me(): Observable<Customer> {
    return this.http.get<Customer>(`${API}/customers/me`);
  }
  updateMe(value: UpdateCustomerRequest): Observable<Customer> {
    return this.http.put<Customer>(`${API}/customers/me`, value);
  }
  list(search = ''): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API}/customers`, { params: search ? { search } : {} });
  }
  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/customers/${id}`);
  }
  reactivate(id: number): Observable<void> {
    return this.http.put<void>(`${API}/customers/${id}/reactivate`, {});
  }
}
