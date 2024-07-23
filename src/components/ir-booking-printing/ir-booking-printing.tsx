import { Booking } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-booking-printing',
  styleUrl: 'ir-booking-printing.css',
  shadow: true,
})
export class IrBookingPrinting {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() bookingNumber: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;
  @Prop() mode: 'invoice' | 'default' = 'default';

  @State() booking: Booking;
  private bookingService = new BookingService();
  private roomService = new RoomService();

  @Watch('ticket')
  async ticketChanged() {
    this.bookingService.setToken(this.ticket);
    this.roomService.setToken(this.ticket);
    this.initializeApp();
  }
  async initializeApp() {
    try {
      const [languageTexts, booking] = await Promise.all([this.roomService.fetchLanguage(this.language), this.bookingService.getExposedBooking(this.bookingNumber, this.language)]);
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
      this.booking = booking;
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
