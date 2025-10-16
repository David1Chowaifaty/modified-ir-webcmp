import { Booking, Room } from '@/models/booking.dto';
import { PropertyRoomType } from '@/models/IBooking';
import { BookingService } from '@/services/booking.service';
import { resetBookingStore } from '@/stores/booking.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';
import moment, { Moment } from 'moment';

export type RoomDates = { from_date: Moment; to_date: Moment };
@Component({
  tag: 'igl-split-booking',
  styleUrls: ['igl-split-booking.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IglSplitBooking {
  @Prop() booking: Booking;
  @Prop() identifier: Room['identifier'];

  @State() selectedDates: RoomDates;
  @State() room: Room;
  @State() roomTypes: PropertyRoomType[] = [];
  @State() selectedUnit: {
    roomtype_id: number;
    unit_id: number;
  };
  @State() isLoading: boolean;

  @Event() closeModal: EventEmitter<null>;

  private defaultDates: RoomDates;
  private bookingService = new BookingService();

  componentWillLoad() {
    this.room = this.getRoom();
    this.defaultDates = { ...this.generateDates(this.room) };
    this.selectedDates = { ...this.defaultDates };
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
    // if (MFromDate.isAfter(today)) {
    //   return { from_date: MFromDate, to_date: MToDate };
    // }
    if (MFromDate.isSameOrAfter(today)) {
      return { from_date: MFromDate.clone().add(1, 'days'), to_date: MToDate };
    }
    return { from_date: today.clone().add(1, 'days'), to_date: MToDate };
  }

  private async checkBookingAvailability() {
    resetBookingStore();
    const from_date = this.selectedDates.from_date.format('YYYY-MM-DD');
    const to_date = this.selectedDates.to_date.format('YYYY-MM-DD');

    const is_in_agent_mode = this.booking.agent !== null;
    try {
      const data = await this.bookingService.getBookingAvailability({
        from_date,
        to_date,
        propertyid: this.booking.property.id,
        adultChildCount: {
          adult: 1,
          child: 0,
        },
        language: 'en',
        room_type_ids: [],
        currency: this.booking.currency,
        agent_id: is_in_agent_mode ? this.booking.agent.id : null,
        is_in_agent_mode,
        room_type_ids_to_update: [],
      });

      console.log({ data });
      this.roomTypes = data as any as PropertyRoomType[];
    } catch (error) {
      console.error('Error initializing booking availability:', error);
    }
  }

  private handleDateSelectChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { key, data } = (e as any).detail ?? {};
    if (key !== 'selectedDateRange' || !data) return;

    // Accept multiple possible shapes/keys
    const fromInput = data.fromDate ?? data.fromDateMs ?? data.fromDateStr;
    const toInput = data.toDate ?? data.toDateMs ?? data.toDateStr;

    const parse = (v: any) => {
      if (typeof v === 'number') return moment(v); // epoch ms
      if (v instanceof Date) return moment(v);
      // try common formats (strict where possible)
      return moment(v, ['YYYY-MM-DD', 'DD MMM YYYY', moment.ISO_8601], true);
    };

    const from = parse(fromInput);
    const to = parse(toInput);

    if (!from.isValid() || !to.isValid()) {
      console.warn('Invalid date payload from date picker:', { fromInput, toInput, data });
      return;
    }

    // normalize to start of day since you later format as 'YYYY-MM-DD'
    const fromDay = from.clone().startOf('day');
    // If the picker sends an end-of-day millisecond (like 23:59:59.999), normalize to the day
    const toDay = to.clone().startOf('day');

    // Clamp to min/max coming from your component props
    const min = this.defaultDates?.from_date?.clone().startOf('day');
    const max = this.defaultDates?.to_date?.clone().startOf('day');

    const clampedFrom = min ? moment.max(fromDay, min) : fromDay;
    const clampedTo = max ? moment.min(toDay, max) : toDay;

    if (clampedTo.isBefore(clampedFrom)) {
      console.warn('Selected range is invalid after clamping:', { clampedFrom: clampedFrom.toISOString(), clampedTo: clampedTo.toISOString() });
      return;
    }

    this.selectedDates = {
      from_date: clampedFrom,
      to_date: clampedTo,
    };
  }

  private doReservation() {
    const oldRooms = this.booking.rooms.filter(r => r.identifier !== this.identifier);
    let rooms = [
      ...oldRooms,
      {
        ...this.room,
        from_date: this.room.from_date,
        to_date: this.selectedDates.to_date.format('YYYY-MM-DD'),
      },
      {
        ...this.room,
        identifier: null,
        // ["pool"]: null,
        // roomtype: rateplan.roomtype,
        // rateplan: rateplan.ratePlan,
        unit: { id: this.selectedUnit.unit_id },
        from_date: this.selectedDates.from_date.format('YYYY-MM-DD'),
        to_date: this.selectedDates.to_date.format('YYYY-MM-DD'),

        // days: this.generateDailyRates(rateplan, i),
      },
    ];
    console.log(rooms);
  }
  render() {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          this.doReservation();
        }}
        class="sheet-container"
      >
        <ir-title class="px-1 sheet-header mb-0" displayContext="sidebar" label={`Split unit ${this.room?.unit['name']}`}></ir-title>
        <section class="px-1 sheet-body">
          <p>
            {this.room.from_date} <ir-icons name="arrow_right"></ir-icons>
            {this.room.to_date}
          </p>
          <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
            <igl-date-range
              data-testid="date_picker"
              variant="default"
              dateLabel={locales.entries.Lcz_Dates}
              maxDate={this.defaultDates?.to_date.format('YYYY-MM-DD')}
              minDate={this.defaultDates?.from_date.format('YYYY-MM-DD')}
              defaultData={{ fromDate: this.selectedDates?.from_date.format('YYYY-MM-DD'), toDate: this.selectedDates?.to_date.format('YYYY-MM-DD') }}
              onDateSelectEvent={this.handleDateSelectChange.bind(this)}
            ></igl-date-range>
            <ir-button isLoading={isRequestPending('/Check_Availability')} text="Check available units" size="sm" onClick={() => this.checkBookingAvailability()}></ir-button>
          </div>
          <ul class="room-type-list mt-2">
            {this.roomTypes?.map(roomType => {
              if (!roomType.is_available_to_book) {
                return null;
              }
              return (
                <Fragment>
                  <li key={`roomTypeRow-${roomType.id}`} class={`room-type-row`}>
                    <div class={'d-flex choice-row'}>
                      <span class="pl-1 text-left room-type-name">{roomType.name}</span>
                    </div>
                  </li>
                  {roomType.physicalrooms.map((room, j) => {
                    if (!room.is_active) {
                      return null;
                    }
                    const row_style = j === roomType.physicalrooms.length - 1 ? 'pb-1' : '';
                    return (
                      <li key={`physicalRoom-${room.id}-${j}`} class={`physical-room ${row_style}`}>
                        <div class={'d-flex choice-row'}>
                          <ir-radio
                            class="pl-1 "
                            name="unit"
                            checked={this.selectedUnit?.unit_id === room.id}
                            onCheckChange={() =>
                              (this.selectedUnit = {
                                roomtype_id: roomType.id,
                                unit_id: room.id,
                              })
                            }
                            label={room.name}
                          ></ir-radio>
                        </div>
                      </li>
                    );
                  })}
                </Fragment>
              );
            })}
          </ul>
        </section>
        <div class={'sheet-footer'}>
          <ir-button text={locales.entries.Lcz_Cancel} btn_color="secondary" class={'flex-fill'} onClickHandler={() => this.closeModal.emit(null)}></ir-button>
          <ir-button isLoading={this.isLoading} text={locales.entries.Lcz_Confirm} btn_type="submit" class="flex-fill"></ir-button>
        </div>
      </form>
    );
  }
}
