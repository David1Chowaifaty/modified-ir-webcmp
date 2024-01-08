import { Component, Host, Prop, State, h, Event, EventEmitter } from '@stencil/core';
import axios from 'axios';
import { BookingService } from '../../services/booking.service';
import { convertDatePrice, formatDate, getCurrencySymbol, getDaysArray } from '../../utils/utils';
import { store } from '../../redux/store';
import { Booking, Day, IUnit, Room } from '../../models/booking.dto';
import { Unsubscribe } from 'redux';
import { IRoomNightsDataEventPayload } from '../../models/property-types';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-room-nights',
  styleUrl: 'ir-room-nights.css',
  scoped: true,
})
export class IrRoomNights {
  @Prop() bookingNumber: string;
  @Prop() baseUrl: string;
  @Prop() propertyId: number;
  @Prop() language: string;
  @Prop() identifier: string;
  @Prop() toDate: string;
  @Prop() pool: string;
  @Prop() ticket: string;

  @State() bookingEvent: Booking;
  @State() selectedRoom: Room;
  @State() defaultTexts;
  @State() rates: Day[] = [];
  @State() isLoading = false;

  @Event() closeRoomNightsDialog: EventEmitter<IRoomNightsDataEventPayload>;

  private bookingService = new BookingService();
  private unsubscribe: Unsubscribe;

  componentWillLoad() {
    if (this.baseUrl) {
      axios.defaults.baseURL = this.baseUrl;
    }
    this.init();
  }

  updateStore() {
    this.defaultTexts = store.getState().languages;
  }
  isButtonDisabled() {
    return this.isLoading || this.rates.some(rate => rate.amount === 0 || rate.amount === -1);
  }
  async init() {
    try {
      this.updateStore();
      this.bookingEvent = await this.bookingService.getExoposedBooking(this.bookingNumber, this.language);
      if (this.bookingEvent) {
        const filteredRooms = this.bookingEvent.rooms.filter(room => room.identifier === this.identifier);
        this.selectedRoom = filteredRooms[0];
        const lastDay = this.selectedRoom?.days[this.selectedRoom.days.length - 1];
        const newDatesArr = getDaysArray(lastDay.date, this.toDate);
        let first_rate = this.selectedRoom.days[0].amount;
        this.rates = [
          ...this.selectedRoom.days,
          ...newDatesArr.map(day => ({
            amount: first_rate,
            date: day,
          })),
        ];
      }
      this.unsubscribe = store.subscribe(() => this.updateStore());
    } catch (error) {
      console.log(error);
    }
  }
  disconnectedCallback() {
    this.unsubscribe();
  }
  handleInput(event: InputEvent, index: number) {
    let inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    let days = [...this.rates];
    if (!isNaN(Number(inputValue))) {
      days[index].amount = +inputValue;
    } else {
      inputValue = inputValue.replace(/[^0-9]/g, '');
      inputElement.value = inputValue;
      if (inputValue === '') {
        days[index].amount = -1;
      } else {
        days[index].amount = +inputValue;
      }
    }
    this.rates = days;
  }

  renderDates() {
    const currency_symbol = getCurrencySymbol(this.bookingEvent.currency.code);
    return (
      <div class={'mt-2 m-0'}>
        {this.rates?.map((day, index) => (
          <div class={'row m-0 mt-1 align-items-center'}>
            <p class={'col-2 m-0 p-0'}>{convertDatePrice(day.date)}</p>
            {index < this.selectedRoom.days.length ? (
              <p class={'col-9 ml-1 m-0 p-0'}>{`${currency_symbol}${day.amount}`}</p>
            ) : (
              <fieldset class="col-3 ml-1 position-relative has-icon-left m-0 p-0 rate-input-container  ">
                <input
                  type="text"
                  class="form-control input-sm rate-input py-0 m-0 rateInputBorder"
                  id={v4()}
                  value={day.amount > 0 ? day.amount : ''}
                  placeholder={this.defaultTexts.entries.Lcz_Rate || 'Rate'}
                  onInput={(event: InputEvent) => this.handleInput(event, index)}
                />
                <span class="currency">{currency_symbol}</span>
              </fieldset>
            )}
          </div>
        ))}
      </div>
    );
  }
  async handleRoomConfirmation() {
    try {
      this.isLoading = true;
      let oldRooms = [...this.bookingEvent.rooms];
      let selectedRoomIndex = oldRooms.findIndex(room => room.identifier === this.identifier);
      if (selectedRoomIndex === -1) {
        throw new Error('Invalid Pool');
      }
      oldRooms[selectedRoomIndex] = { ...oldRooms[selectedRoomIndex], days: this.rates, to_date: this.toDate };
      const body = {
        assign_units: true,
        check_in: true,
        is_pms: true,
        is_direct: true,
        booking: {
          booking_nbr: this.bookingNumber,
          from_date: this.bookingEvent.from_date,
          to_date: this.toDate,
          remark: this.bookingEvent.remark,
          property: this.bookingEvent.property,
          source: this.bookingEvent.source,
          currency: this.bookingEvent.currency,
          arrival: this.bookingEvent.arrival,
          guest: this.bookingEvent.guest,
          rooms: oldRooms,
        },
      };
      const { data } = await axios.post(`/DoReservation?Ticket=${this.ticket}`, body);
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      this.closeRoomNightsDialog.emit({ type: 'confirm', pool: this.pool });
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    if (!this.bookingEvent) {
      return <p>Loading</p>;
    }
    return (
      <Host>
        <div class="card position-sticky mb-0 shadow-none p-0 ">
          <div class="d-flex mt-2 align-items-center justify-content-between ">
            <h3 class="card-title text-left pb-1 font-medium-2 px-2">
              Adding Room Nights to {this.selectedRoom?.roomtype?.name} {(this.selectedRoom?.unit as IUnit).name}
            </h3>
            <button type="button" class="close close-icon" onClick={() => this.closeRoomNightsDialog.emit({ type: 'cancel', pool: this.pool })}>
              <ir-icon icon="ft-x" class={'m-0'}></ir-icon>
            </button>
          </div>
        </div>
        <section class={'text-left px-2'}>
          <p>Booking# {this.bookingNumber}</p>
          <p class={'font-weight-bold font-medium-1'}>{`${formatDate(this.bookingEvent.from_date, 'YYYY-MM-DD')} - ${formatDate(this.bookingEvent.to_date, 'YYYY-MM-DD')}`}</p>
          <p class={'font-medium-1 mb-0'}>
            {`${this.selectedRoom.rateplan.name}`}{' '}
            {this.selectedRoom.rateplan.is_non_refundable && <span class={'irfontgreen'}>{this.defaultTexts.entries.Lcz_NonRefundable}</span>}
          </p>
          {this.selectedRoom.rateplan.custom_text && <p class={'text-secondary mt-0'}>{this.selectedRoom.rateplan.custom_text}</p>}
          {this.renderDates()}
        </section>
        <section class={'d-flex align-items-center mt-2 px-2'}>
          <button
            disabled={this.isLoading}
            type="button"
            class={'btn btn-secondary full-width'}
            onClick={() => this.closeRoomNightsDialog.emit({ type: 'cancel', pool: this.pool })}
          >
            {this.defaultTexts?.entries.Lcz_Cancel}
          </button>
          <button disabled={this.isButtonDisabled()} type="button" class={'btn btn-primary ml-2 full-width'} onClick={this.handleRoomConfirmation.bind(this)}>
            {this.isLoading && <i class="la la-circle-o-notch spinner mx-1"></i>}
            {this.defaultTexts?.entries.Lcz_Confirmation}
          </button>
        </section>
      </Host>
    );
  }
}
