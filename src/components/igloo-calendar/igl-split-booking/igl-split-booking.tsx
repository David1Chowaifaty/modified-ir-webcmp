import { Booking, Room } from '@/models/booking.dto';
import { Component, Host, Prop, State, h } from '@stencil/core';
import moment, { Moment } from 'moment';
export type RoomDates = { from_date: Moment; to_date: Moment };
@Component({
  tag: 'igl-split-booking',
  styleUrl: 'igl-split-booking.css',
  scoped: true,
})
export class IglSplitBooking {
  @Prop() booking: Booking;
  @Prop() identifier: Room['identifier'];

  @State() selectedDates: RoomDates;
  @State() room: Room;

  componentWillLoad() {
    this.room = this.getRoom();
    this.selectedDates = { ...this.generateDates(this.room) };
  }

  private getRoom() {
    if (!this.booking) {
      throw new Error('Missing booking');
    }
    if (!this.identifier) {
      throw new Error('Missing Identifier');
    }
    const room = this.booking.rooms.find(r => r.identifier === this.identifier);
    if (!room) {
      throw new Error(`Couldn't find room with identifier ${this.identifier}`);
    }
    return room;
  }

  private generateDates(room: Room): RoomDates {
    const MFromDate = moment(room.from_date, 'YYYY-MM-DD');
    const MToDate = moment(room.to_date, 'YYYY-MM-DD');
    const today = moment();
    if (MFromDate.isSameOrAfter(today)) {
      return { from_date: MFromDate.clone().add(1, 'days'), to_date: MToDate };
    }
    return { from_date: today.clone().add(1, 'days'), to_date: MToDate };
  }

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
