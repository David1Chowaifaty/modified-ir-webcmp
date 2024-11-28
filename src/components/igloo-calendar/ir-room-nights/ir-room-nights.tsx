import { Component, Host, Prop, State, h, Event, EventEmitter, Fragment } from '@stencil/core';
import { BookingService } from '@/services/booking.service';
import { convertDatePrice, formatDate, getDaysArray } from '@/utils/utils';
import { Booking, Day, IUnit, Room } from '@/models/booking.dto';
import { IRoomNightsDataEventPayload } from '@/models/property-types';
import moment from 'moment';
import locales from '@/stores/locales.store';
import { Variation } from '@/models/property';

@Component({
  tag: 'ir-room-nights',
  styleUrl: 'ir-room-nights.css',
  scoped: true,
})
export class IrRoomNights {
  @Prop() bookingNumber: string;
  @Prop() propertyId: number;
  @Prop() language: string;
  @Prop() identifier: string;
  @Prop() toDate: string;
  @Prop() fromDate: string;
  @Prop() pool: string;
  @Prop() ticket: string;
  @Prop() defaultDates: { from_date: string; to_date: string };

  @State() bookingEvent: Booking;
  @State() selectedRoom: Room;
  @State() rates: Day[] = [];
  @State() isLoading = false;
  @State() initialLoading = false;
  @State() inventory: number | null = null;
  @State() isEndDateBeforeFromDate: boolean = false;
  @State() defaultTotalNights = 0;
  @State() isInputFocused = -1;
  @State() dates: { from_date: Date; to_date: Date } = { from_date: new Date(), to_date: new Date() };

  @Event() closeRoomNightsDialog: EventEmitter<IRoomNightsDataEventPayload>;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.dates = { from_date: new Date(this.fromDate), to_date: new Date(this.toDate) };
    this.init();
  }

  isButtonDisabled() {
    return this.isLoading || this.rates.some(rate => rate.amount === -1) || this.inventory === 0 || this.inventory === null;
  }
  async init() {
    try {
      const { from_date } = this.defaultDates;
      if (moment(from_date, 'YYYY-MM-DD').isBefore(moment(this.fromDate, 'YYYY-MM-DD'))) {
        this.dates.from_date = new Date(from_date);
      } else {
        this.dates.from_date = new Date(this.fromDate);
      }
      this.dates.to_date = new Date(this.toDate);
      this.bookingEvent = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);
      if (this.bookingEvent) {
        const filteredRooms = this.bookingEvent.rooms.filter(room => room.identifier === this.identifier);
        this.selectedRoom = filteredRooms[0];
        const lastDay = this.selectedRoom?.days[this.selectedRoom.days.length - 1];
        //let first_rate = this.selectedRoom.days[0].amount;
        if (moment(this.toDate).add(-1, 'days').isSame(moment(lastDay.date))) {
          console.log('here1');
          const amount = await this.fetchBookingAvailability(this.fromDate, this.selectedRoom.days[0].date, this.selectedRoom.rateplan.id);
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
          console.log('here2');
          console.log(lastDay);
          const amount = await this.fetchBookingAvailability(this.bookingEvent.to_date, moment(this.toDate, 'YYYY-MM-DD').format('YYYY-MM-DD'), this.selectedRoom.rateplan.id);
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
  private handleInput(event: string, index: number) {
    let inputValue = event;
    let days = [...this.rates];
    inputValue = inputValue.replace(/[^0-9.]/g, '');
    if (inputValue === '') {
      days[index].amount = -1;
    } else {
      if (!isNaN(Number(inputValue))) {
        days[index].amount = Number(inputValue);
      }
    }
    this.rates = days;
  }
  async fetchBookingAvailability(from_date: string, to_date: string, rate_plan_id: number) {
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
        rate_plan_ids: [rate_plan_id],
      });
      console.log(bookingAvailability[0], rate_plan_id);
      this.inventory = bookingAvailability[0].inventory;
      const rate_plan = bookingAvailability[0].rateplans.find(rate => rate.id === rate_plan_id);
      if (!rate_plan || !rate_plan.variations) {
        this.inventory = null;
        return null;
      }
      const selected_variation: Variation = rate_plan.variations?.find(
        variation =>
          variation.adult_nbr === this.selectedRoom.rateplan.selected_variation.adult_nbr && variation.child_nbr === this.selectedRoom.rateplan.selected_variation.child_nbr,
      );
      if (!selected_variation) {
        return null;
      }
      return selected_variation.discounted_gross_amount;
    } catch (error) {
      console.error(error);
    } finally {
      this.initialLoading = false;
    }
  }

  private renderInputField(index: number, currency_symbol: string, day: Day) {
    return (
      <div class="col-3 ml-1 position-relative  m-0 p-0 rate-input-container">
        <ir-price-input
          value={day.amount > 0 ? day.amount.toString() : ''}
          disabled={this.inventory === 0 || this.inventory === null}
          currency={currency_symbol}
          aria-label="rate"
          aria-describedby="rate cost"
          onTextChange={e => this.handleInput(e.detail, index)}
        ></ir-price-input>
      </div>
    );
  }

  private renderReadOnlyField(currency_symbol: string, day: Day) {
    return <p class="col-9 ml-1 m-0 p-0">{`${currency_symbol}${Number(day.amount).toFixed(2)}`}</p>;
  }
  private renderRateFields(index: number, currency_symbol: string, day: Day) {
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
    const currency_symbol = this.bookingEvent.currency.symbol;
    // const currency_symbol = getCurrencySymbol(this.bookingEvent.currency.code);
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
      oldRooms[selectedRoomIndex] = {
        ...oldRooms[selectedRoomIndex],
        days: this.rates,
        to_date: moment(this.dates.to_date).format('YYYY-MM-DD'),
        from_date: moment(this.dates.from_date).format('YYYY-MM-DD'),
      };
      const body = {
        assign_units: true,
        check_in: true,
        is_pms: true,
        is_direct: true,
        pickup_info: this.bookingEvent.pickup_info,
        extra_services: this.bookingEvent.extra_services,
        booking: {
          booking_nbr: this.bookingNumber,
          from_date: moment(this.dates.from_date).format('YYYY-MM-DD'),
          to_date: moment(this.dates.to_date).format('YYYY-MM-DD'),
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
    console.log(this.inventory);
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
          {this.initialLoading ? (
            <p class={'mt-2 text-secondary'}>{locales.entries['Lcz_CheckingRoomAvailability ']}</p>
          ) : (
            <Fragment>
              <p class={'font-weight-bold font-medium-1'}>{`${formatDate(moment(this.dates.from_date).format('YYYY-MM-DD'), 'YYYY-MM-DD')} - ${formatDate(
                moment(this.dates.to_date).format('YYYY-MM-DD'),
                'YYYY-MM-DD',
              )}`}</p>
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
