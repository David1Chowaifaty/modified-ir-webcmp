import { Booking, Room } from '@/models/booking.dto';
import { PropertyRoomType } from '@/models/IBooking';
import { BookingService } from '@/services/booking.service';
import { resetBookingStore } from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { checkMealPlan, SelectOption } from '@/utils/utils';
import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';
import moment from 'moment';
import { ZodError } from 'zod';
import { RoomDates, SelectedUnit, SelectedUnitSchema } from './types';

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
  @State() selectedUnit: SelectedUnit = {};
  @State() isLoading: boolean;
  @State() errors: Record<string, boolean>;
  @State() mealPlans: SelectOption[];

  @Event() closeModal: EventEmitter<null>;

  private defaultDates: RoomDates;
  private bookingService = new BookingService();

  componentWillLoad() {
    this.room = this.getRoom();
    this.defaultDates = { ...this.generateDates(this.room) };
    this.selectedDates = { ...this.defaultDates };
    console.log(this.booking);
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
      return { from_date: MFromDate.clone().add(1, 'days'), to_date: MToDate.clone().add(-1, 'days') };
    }
    return { from_date: today.clone().add(1, 'days'), to_date: MToDate.clone().add(-1, 'days') };
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
      this.roomTypes = data as any as PropertyRoomType[];
    } catch (error) {
      console.error('Error initializing booking availability:', error);
    }
  }

  private async doReservation() {
    try {
      this.isLoading = true;
      this.errors = null;
      const selectedUnit = SelectedUnitSchema.parse(this.selectedUnit);
      const oldRooms = this.booking.rooms.filter(r => r.identifier !== this.identifier);
      let rooms = [
        ...oldRooms,
        {
          ...this.room,
          from_date: this.room.from_date,
          to_date: this.selectedDates.from_date.format('YYYY-MM-DD'),
          days: this.room.days.filter(r => moment(r.date, 'YYYY-MM-DD').isBefore(this.selectedDates.from_date, 'dates')),
        },
        {
          ...this.room,
          identifier: null,
          assigned_units_pool: null,
          roomtype: {
            id: selectedUnit.roomtype_id,
          },
          rateplan: {
            id: selectedUnit.rateplan_id || this.room.rateplan.id,
          },
          unit: { id: selectedUnit.unit_id },
          from_date: this.selectedDates.from_date.format('YYYY-MM-DD'),
          // to_date: this.selectedDates.to_date.format('YYYY-MM-DD'),
          days: this.room.days.filter(r => moment(r.date, 'YYYY-MM-DD').isSameOrAfter(this.selectedDates.from_date, 'dates')),
        },
      ];
      const booking = {
        assign_units: true,
        is_pms: true,
        is_direct: this.booking.is_direct,
        is_backend: true,
        is_in_loyalty_mode: this.booking.is_in_loyalty_mode,
        promo_key: this.booking.promo_key,
        extras: this.booking.extras,
        agent: this.booking.agent,
        booking: {
          from_date: this.booking.from_date,
          to_date: this.booking.to_date,
          remark: this.booking.remark,
          booking_nbr: this.booking.booking_nbr,
          property: this.booking.property,
          booked_on: this.booking.booked_on,
          source: this.booking.source,
          rooms,
          currency: this.booking.currency,
          arrival: this.booking.arrival,
          guest: this.booking.guest,
        },
        pickup_info: this.booking.pickup_info,
      };
      await this.bookingService.doReservation(booking);
    } catch (error) {
      const err = {};
      if (error instanceof ZodError) {
        console.error(error);
        error.issues.forEach(i => {
          err[i.path[0]] = true;
        });
        this.errors = { ...err };
      }
    } finally {
      this.isLoading = false;
    }
  }

  private updateSelectedUnit(params: Partial<SelectedUnit>) {
    let prev = { ...this.selectedUnit, ...params };
    if (!params.rateplan_id) {
      const mealPlan = checkMealPlan({
        room: this.room,
        roomTypeId: prev?.roomtype_id,
        roomTypes: calendar_data.property.roomtypes,
      });
      let m = [];
      if (!mealPlan || Array.isArray(mealPlan)) {
        prev = { ...prev, rateplan_id: undefined };
        if (mealPlan) {
          m = [...(mealPlan as SelectOption[])];
        }
      } else {
        prev = { ...prev, rateplan_id: Number(mealPlan.value) };
      }
    }
    this.selectedUnit = { ...prev };
  }

  render() {
    const mealPlans = checkMealPlan({
      room: this.room,
      roomTypeId: this.selectedUnit?.roomtype_id,
      roomTypes: calendar_data.property.roomtypes,
    });
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
          <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <div>
              <ir-date-view from_date={this.room.from_date} to_date={this.room.to_date} showDateDifference={false}></ir-date-view>
            </div>
            <p class="m-0 p-0">
              {this.room.rateplan.short_name} {this.room.rateplan.is_non_refundable ? locales.entries.Lcz_NonRefundable : ''}
            </p>
          </div>
          <div class={'d-flex align-items-center mt-1'} style={{ gap: '0.5rem' }}>
            <span>From:</span>
            <ir-date-picker
              data-testid="pickup_arrival_date"
              date={this.selectedDates?.from_date?.format('YYYY-MM-DD')}
              maxDate={this.defaultDates?.to_date.format('YYYY-MM-DD')}
              minDate={this.defaultDates?.from_date.format('YYYY-MM-DD')}
              emitEmptyDate={true}
              // aria-invalid={this.errors?.arrival_date && !this.pickupData.arrival_date ? 'true' : 'false'}
              onDateChanged={evt => {
                this.selectedDates = {
                  ...this.selectedDates,
                  from_date: evt.detail.start,
                };
              }}
            >
              <input
                type="text"
                slot="trigger"
                value={this.selectedDates.from_date ? this.selectedDates.from_date.format('MMM DD, YYYY') : null}
                class={`form-control input-sm  text-center`}
                style={{ width: '120px' }}
              ></input>
            </ir-date-picker>
            <ir-button isLoading={isRequestPending('/Check_Availability')} text="Check available units" size="sm" onClick={() => this.checkBookingAvailability()}></ir-button>
          </div>
          {this.errors?.roomtype_id && <p class="text-danger text-left mt-2">Please select a room</p>}
          <ul class="room-type-list mt-2">
            {this.roomTypes?.map(roomType => {
              if (!roomType.is_available_to_book) {
                return null;
              }
              return (
                <Fragment>
                  <li key={`roomTypeRow-${roomType.id}`} class={`room-type-row`}>
                    <div class={'d-flex choice-row'}>
                      <span class="text-left room-type-name">{roomType.name}</span>
                    </div>
                  </li>
                  {roomType.physicalrooms.map((room, j) => {
                    if (!room.is_active) {
                      return null;
                    }
                    const row_style = j === roomType.physicalrooms.length - 1 ? 'pb-1' : '';
                    return (
                      <li key={`physicalRoom-${room.id}-${j}`} class={`physical-room ${row_style}`}>
                        <div class={'d-flex choice-row align-items-center'} style={{ gap: '0.5rem' }}>
                          <ir-radio
                            class="pl-1"
                            name="unit"
                            checked={this.selectedUnit?.unit_id === room.id}
                            onCheckChange={() =>
                              this.updateSelectedUnit({
                                roomtype_id: roomType.id,
                                unit_id: room.id,
                              })
                            }
                            label={room.name}
                          ></ir-radio>
                          {this.selectedUnit?.unit_id === room.id && Array.isArray(mealPlans) && mealPlans?.length > 0 && (
                            <ir-select
                              firstOption="Select a new rateplan..."
                              error={this.errors?.rateplan_id && !this.selectedUnit?.rateplan_id}
                              onSelectChange={e =>
                                this.updateSelectedUnit({
                                  rateplan_id: e.detail ?? undefined,
                                })
                              }
                              data={mealPlans}
                            ></ir-select>
                          )}
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
