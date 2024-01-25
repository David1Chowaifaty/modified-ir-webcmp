import { Component, Host, Prop, State, h, Event, EventEmitter, Fragment } from '@stencil/core';
import axios from 'axios';
import { BookingService } from '../../services/booking.service';
import { convertDatePrice, formatDate, getCurrencySymbol, getDaysArray } from '../../utils/utils';
import { Booking, Day, IUnit, Room } from '../../models/booking.dto';
import { IRoomNightsDataEventPayload } from '../../models/property-types';
import { v4 } from 'uuid';
import moment from 'moment';
import locales from '@/stores/locales.store';

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
  @Prop() fromDate: string;
  @Prop() pool: string;
  @Prop() ticket: string;

  @State() bookingEvent: Booking;
  @State() selectedRoom: Room;
  @State() rates: Day[] = [];
  @State() isLoading = false;
  @State() initialLoading = false;
  @State() inventory: number | null = null;
  @State() isEndDateBeforeFromDate: boolean = false;
  @State() defaultTotalNights = 0;

  @Event() closeRoomNightsDialog: EventEmitter<IRoomNightsDataEventPayload>;

  private bookingService = new BookingService();

  componentWillLoad() {
    if (this.baseUrl) {
      axios.defaults.baseURL = this.baseUrl;
    }
    this.init();
  }

  isButtonDisabled() {
    return this.isLoading || this.rates.some(rate => rate.amount === -1) || this.inventory === 0 || this.inventory === null;
  }
  async init() {
    try {
      this.bookingEvent = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);
      if (this.bookingEvent) {
        const filteredRooms = this.bookingEvent.rooms.filter(room => room.identifier === this.identifier);
        this.selectedRoom = filteredRooms[0];

        const lastDay = this.selectedRoom?.days[this.selectedRoom.days.length - 1];
        let first_rate = this.selectedRoom.days[0].amount;
        if (moment(this.toDate).add(-1, 'days').isSame(moment(lastDay.date))) {
          this.fetchBookingAvailability(this.fromDate, this.selectedRoom.days[0].date);
          const newDatesArr = getDaysArray(this.selectedRoom.days[0].date, this.fromDate);
          this.isEndDateBeforeFromDate = true;
          this.rates;
          this.rates = [
            ...newDatesArr.map(day => ({
              amount: first_rate,
              date: day,
            })),
            ...this.selectedRoom.days,
          ];
        } else {
          this.fetchBookingAvailability(lastDay.date, moment(this.toDate, 'YYYY-MM-DD').add(-1, 'days').format('YYYY-MM-DD'));
          const newDatesArr = getDaysArray(lastDay.date, this.toDate);
          this.rates = [
            ...this.selectedRoom.days,
            ...newDatesArr.map(day => ({
              amount: first_rate,
              date: day,
            })),
          ];
        }
        this.defaultTotalNights = this.rates.length - this.selectedRoom.days.length;
      }
    } catch (error) {
      console.log(error);
    }
  }
  handleInput(event: InputEvent, index: number) {
    let inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    let days = [...this.rates];
    if (inputValue === '') {
      days[index].amount = -1;
    } else if (!isNaN(Number(inputValue))) {
      days[index].amount = +inputValue;
    } else {
      inputValue = inputValue.replace(/[^0-9]/g, '');
      inputElement.value = inputValue;
    }
    this.rates = days;
    console.log(this.rates);
  }
  async fetchBookingAvailability(from_date: string, to_date: string) {
    try {
      this.initialLoading = true;
      const bookingAvailability = await this.bookingService.getBookingAvailability(
        from_date,
        to_date,
        this.propertyId,
        {
          adult: this.selectedRoom.rateplan.selected_variation.adult_nbr,
          child: this.selectedRoom.rateplan.selected_variation.child_nbr,
        },
        this.language,
        [this.selectedRoom.roomtype.id],
        this.bookingEvent.currency,
      );
      this.inventory = bookingAvailability.roomtypes[0].inventory;
    } catch (error) {
      console.log(error);
    } finally {
      this.initialLoading = false;
    }
  }
  renderInputField(index: number, currency_symbol: string, day: Day) {
    return (
      <fieldset class="col-2 ml-1 position-relative has-icon-left m-0 p-0 rate-input-container">
        <input
          disabled={this.inventory === 0 || this.inventory === null}
          type="text"
          class="form-control input-sm rate-input py-0 m-0 rateInputBorder"
          id={v4()}
          value={day.amount > 0 ? day.amount : ''}
          placeholder={locales.entries.Lcz_Rate || 'Rate'}
          onInput={event => this.handleInput(event, index)}
        />
        <span class="currency">{currency_symbol}</span>
      </fieldset>
    );
  }
  renderReadOnlyField(currency_symbol: string, day: Day) {
    return <p class="col-9 ml-1 m-0 p-0">{`${currency_symbol}${Number(day.amount).toFixed(2)}`}</p>;
  }
  renderRateFields(index: number, currency_symbol: string, day: Day) {
    if (this.isEndDateBeforeFromDate) {
      if (index < this.defaultTotalNights) {
        return this.renderInputField(index, currency_symbol, day);
      } else {
        return this.renderReadOnlyField(currency_symbol, day);
      }
    } else {
      return index < this.selectedRoom.days.length ? this.renderReadOnlyField(currency_symbol, day) : this.renderInputField(index, currency_symbol, day);
    }
  }
  renderDates() {
    const currency_symbol = getCurrencySymbol(this.bookingEvent.currency.code);
    return (
      <div class={'mt-2 m-0'}>
        {this.rates?.map((day, index) => (
          <div class={'row m-0 mt-1 align-items-center'}>
            <p class={'col-2 m-0 p-0'}>{convertDatePrice(day.date)}</p>
            {this.renderRateFields(index, currency_symbol, day)}
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
      oldRooms[selectedRoomIndex] = { ...oldRooms[selectedRoomIndex], days: this.rates, to_date: this.toDate, from_date: this.fromDate };
      const body = {
        assign_units: true,
        check_in: true,
        is_pms: true,
        is_direct: true,
        booking: {
          booking_nbr: this.bookingNumber,
          from_date: this.fromDate,
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
      return <p>{locales.entries.Lcz_Loading}</p>;
    }
    return (
      <Host>
        <div class="card position-sticky mb-0 shadow-none p-0 ">
          <div class="d-flex mt-2 align-items-center justify-content-between ">
            <h3 class="card-title text-left pb-1 font-medium-2 px-2">
              {locales.entries.Lcz_AddingRoomNightsTo} {this.selectedRoom?.roomtype?.name} {(this.selectedRoom?.unit as IUnit).name}
            </h3>
            <button type="button" class="close close-icon" onClick={() => this.closeRoomNightsDialog.emit({ type: 'cancel', pool: this.pool })}>
              <ir-icon icon="ft-x" class={'m-0'}></ir-icon>
            </button>
          </div>
        </div>
        <section class={'text-left px-2'}>
          <p class={'font-medium-1'}>
            {`${locales.entries.Lcz_Booking}#`} {this.bookingNumber}
          </p>
          <p class={'font-weight-bold font-medium-1'}>{`${formatDate(this.fromDate, 'YYYY-MM-DD')} - ${formatDate(this.toDate, 'YYYY-MM-DD')}`}</p>
          {this.initialLoading ? (
            <p class={'mt-2 text-secondary'}>{locales.entries['Lcz_CheckingRoomAvailability ']}</p>
          ) : (
            <Fragment>
              <p class={'font-medium-1 mb-0'}>
                {`${this.selectedRoom.rateplan.name}`} {this.selectedRoom.rateplan.is_non_refundable && <span class={'irfontgreen'}>{locales.entries.Lcz_NonRefundable}</span>}
              </p>
              {(this.inventory === 0 || this.inventory === null) && <p class="font-medium-1 text danger">{locales.entries.Lcz_NoAvailabilityForAdditionalNights}</p>}

              {this.selectedRoom.rateplan.custom_text && <p class={'text-secondary mt-0'}>{this.selectedRoom.rateplan.custom_text}</p>}
              {this.renderDates()}
            </Fragment>
          )}
        </section>
        <section class={'d-flex align-items-center mt-2 px-2'}>
          <button
            disabled={this.isLoading}
            type="button"
            class={'btn btn-secondary full-width'}
            onClick={() => this.closeRoomNightsDialog.emit({ type: 'cancel', pool: this.pool })}
          >
            {locales?.entries.Lcz_Cancel}
          </button>
          {this.inventory > 0 && this.inventory !== null && (
            <button disabled={this.isButtonDisabled()} type="button" class={'btn btn-primary ml-2 full-width'} onClick={this.handleRoomConfirmation.bind(this)}>
              {this.isLoading && <i class="la la-circle-o-notch spinner mx-1"></i>}
              {locales?.entries.Lcz_Confirm}
            </button>
          )}
        </section>
      </Host>
    );
  }
}
