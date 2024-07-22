import { Component, Host, Prop, State, h, Event, EventEmitter, Fragment } from '@stencil/core';
import axios from 'axios';
import { BookingService } from '../../services/booking.service';
import { convertDatePrice, formatDate, getCurrencySymbol, getDaysArray } from '../../utils/utils';
import { Booking, Day, IUnit, Room } from '../../models/booking.dto';
import { IRoomNightsDataEventPayload } from '../../models/property-types';
import { v4 } from 'uuid';
import moment from 'moment';
import locales from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';

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
  @State() isInputFocused = -1;

  @Event() closeRoomNightsDialog: EventEmitter<IRoomNightsDataEventPayload>;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.bookingService.setToken(calendar_data.token);

    if (this.baseUrl) {
      axios.defaults.baseURL = this.baseUrl;
    }
    this.init();
  }

  isButtonDisabled() {
    return this.isLoading || this.rates.some(rate => rate.amount === -1) || this.inventory === 0 || this.inventory === null;
  }
  async init() {
    console.log(this.fromDate, this.toDate);
    try {
      this.bookingEvent = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);

      if (this.bookingEvent) {
        const filteredRooms = this.bookingEvent.rooms.filter(room => room.identifier === this.identifier);
        this.selectedRoom = filteredRooms[0];

        const lastDay = this.selectedRoom?.days[this.selectedRoom.days.length - 1];
        //let first_rate = this.selectedRoom.days[0].amount;
        if (moment(this.toDate).add(-1, 'days').isSame(moment(lastDay.date))) {
          const amount = await this.fetchBookingAvailability(
            this.fromDate,
            this.selectedRoom.days[0].date,
            this.selectedRoom.rateplan.id,
            this.selectedRoom.rateplan.selected_variation.adult_child_offering,
          );
          const newDatesArr = getDaysArray(this.selectedRoom.days[0].date, this.fromDate);
          this.isEndDateBeforeFromDate = true;
          this.rates;
          this.rates = [
            ...newDatesArr.map(day => ({
              amount: amount / newDatesArr.length,
              date: day,
              cost: null,
            })),
            ...this.selectedRoom.days,
          ];
          this.defaultTotalNights = this.rates.length - this.selectedRoom.days.length;
        } else {
          const amount = await this.fetchBookingAvailability(
            lastDay.date,
            moment(this.toDate, 'YYYY-MM-DD').add(-1, 'days').format('YYYY-MM-DD'),
            this.selectedRoom.rateplan.id,
            this.selectedRoom.rateplan.selected_variation.adult_child_offering,
          );
          const newDatesArr = getDaysArray(lastDay.date, this.toDate);
          this.rates = [
            ...this.selectedRoom.days,
            ...newDatesArr.map(day => ({
              amount: amount / newDatesArr.length,
              date: day,
              cost: null,
            })),
          ];
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  handleInput(event: InputEvent, index: number) {
    let inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
    let days = [...this.rates];
    inputValue = inputValue.replace(/[^0-9.]/g, '');
    if (inputValue === '') {
      days[index].amount = -1;
    } else {
      const decimalCheck = inputValue.split('.');
      if (decimalCheck.length > 2) {
        inputValue = inputValue.substring(0, inputValue.length - 1);
        inputElement.value = inputValue;
      } else if (decimalCheck.length === 2 && decimalCheck[1].length > 2) {
        inputValue = `${decimalCheck[0]}.${decimalCheck[1].substring(0, 2)}`;
        inputElement.value = inputValue;
      }
      if (!isNaN(Number(inputValue))) {
        days[index].amount = Number(inputValue);
      }
    }
    this.rates = days;
    console.log(this.rates);
  }
  async fetchBookingAvailability(from_date: string, to_date: string, rate_plan_id: number, selected_variation: string) {
    try {
      this.initialLoading = true;
      const bookingAvailability = await this.bookingService.getBookingAvailability({
        from_date,
        to_date,
        propertyid: this.propertyId,
        adultChildCount: {
          adult: this.selectedRoom.rateplan.selected_variation.adult_nbr,
          child: this.selectedRoom.rateplan.selected_variation.child_nbr,
        },
        language: this.language,
        currency: this.bookingEvent.currency,
        room_type_ids: [this.selectedRoom.roomtype.id],
      });
      this.inventory = bookingAvailability.roomtypes[0].inventory;
      const rate_plan_index = bookingAvailability.roomtypes[0].rateplans.find(rate => rate.id === rate_plan_id);
      if (!rate_plan_index || !rate_plan_index.variations) {
        this.inventory = null;
        return null;
      }
      const { amount } = rate_plan_index.variations?.find(variation => variation.adult_child_offering === selected_variation);
      return amount;
    } catch (error) {
      console.log(error);
    } finally {
      this.initialLoading = false;
    }
  }

  renderInputField(index: number, currency_symbol: string, day: Day) {
    return (
      <fieldset class="col-2 ml-1 position-relative has-icon-left m-0 p-0 rate-input-container">
        <div class="input-group-prepend bg-white">
          <span
            data-disabled={this.inventory === 0 || this.inventory === null}
            data-state={this.isInputFocused === index ? 'focus' : ''}
            class="input-group-text new-currency bg-white"
            id="basic-addon1"
          >
            {currency_symbol}
          </span>
        </div>
        <input
          onFocus={() => (this.isInputFocused = index)}
          onBlur={() => (this.isInputFocused = -1)}
          disabled={this.inventory === 0 || this.inventory === null}
          type="text"
          class="form-control bg-white pl-0 input-sm rate-input py-0 m-0 rateInputBorder"
          id={v4()}
          value={day.amount > 0 ? day.amount : ''}
          placeholder={locales.entries.Lcz_Rate || 'Rate'}
          onInput={event => this.handleInput(event, index)}
        />
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
          from_date: this.rates[0].date,
          to_date: this.rates[this.rates.length - 1].date,
          remark: this.bookingEvent.remark,
          property: this.bookingEvent.property,
          source: this.bookingEvent.source,
          currency: this.bookingEvent.currency,
          arrival: this.bookingEvent.arrival,
          guest: this.bookingEvent.guest,
          rooms: oldRooms,
        },
      };
      await this.bookingService.doReservation(body);
      this.closeRoomNightsDialog.emit({ type: 'confirm', pool: this.pool });
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    if (!this.bookingEvent) {
      return (
        <div class="loading-container">
          <ir-loading-screen></ir-loading-screen>
        </div>
      );
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
          <ir-button
            btn_color="secondary"
            btn_disabled={this.isLoading}
            text={locales?.entries.Lcz_Cancel}
            class="full-width"
            btn_styles="justify-content-center"
            onClickHanlder={() => this.closeRoomNightsDialog.emit({ type: 'cancel', pool: this.pool })}
          ></ir-button>

          {this.inventory > 0 && this.inventory !== null && (
            <ir-button
              isLoading={this.isLoading}
              text={locales?.entries.Lcz_Confirm}
              btn_disabled={this.isButtonDisabled()}
              class="ml-1 full-width"
              btn_styles="justify-content-center"
              onClickHanlder={this.handleRoomConfirmation.bind(this)}
            ></ir-button>
          )}
        </section>
      </Host>
    );
  }
}
