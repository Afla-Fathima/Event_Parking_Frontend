export type UserRole = 'Admin' | 'Customer';

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  customerId: number;
  fullName: string;
  email: string;
  role: UserRole;
  token: string;
  expiration: string;
}
export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
export interface Customer {
  customerId: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  status: string;
}
export interface UpdateCustomerRequest {
  name: string;
  phoneNumber: string;
}

export interface Venue {
  venueId: number;
  venueName: string;
  location: string;
  capacity: number;
  description: string;
}
export interface VenueWrite {
  venueName: string;
  location: string;
  capacity: number;
  description: string;
}
export interface Category {
  categoryId: number;
  categoryName: string;
  description: string;
  status: string;
}
export interface CategoryWrite {
  categoryName: string;
  description: string;
}
export interface CategoryUpdate extends CategoryWrite {
  status: string;
}

export interface EventItem {
  eventId: number;
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  description: string;
  ticketPrice: number;
  parkingFee: number;
  capacity: number;
  venueId: number;
  venueName: string;
  categoryId: number;
  categoryName: string;
}
export interface EventWrite {
  eventName: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  description: string;
  ticketPrice: number;
  parkingFee: number;
  capacity: number;
  venueId: number;
  categoryId: number;
}

export interface Seat {
  seatId: number;
  eventId: number;
  seatNumber: string;
  seatType: string;
  price: number;
  status: string;
}
export interface SeatWrite {
  seatNumber: string;
  seatType: string;
  price: number;
}
export interface ParkingSlot {
  parkingSlotId: number;
  eventId: number;
  slotNumber: string;
  vehicleType: string;
  fee: number;
  status: string;
}
export interface ParkingSlotWrite {
  slotNumber: string;
  vehicleType: string;
  fee: number;
}

export interface Booking {
  bookingId: number;
  bookingNumber: string;
  customerId: number;
  customerName: string;
  eventId: number;
  eventName: string;
  bookingDate: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  seats: string[];
  parkingSlot?: string | null;
}
export interface CreateBookingRequest {
  eventId: number;
  seatIds: number[];
  parkingSlotId: number | null;
}

export interface PaymentStatus {
  bookingId: number;
  amountDue: number;
  paymentStatus: string;
}
export interface Payment {
  paymentId: number;
  bookingId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  transactionReference: string;
}
export interface Receipt {
  bookingNumber: string;
  customerName: string;
  eventName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionReference: string;
}

export interface NotificationItem {
  notificationId: number;
  customerId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
export interface CustomerDashboard {
  upcomingBookings: number;
  reservedParking: number;
  recentPayments: number;
  unreadNotifications: number;
}
export interface AdminDashboard {
  totalEvents: number;
  totalBookings: number;
  availableSeats: number;
  occupiedParkingSlots: number;
  totalRevenue: number;
  totalCustomers: number;
}
export interface ApiMessage {
  message: string;
}
