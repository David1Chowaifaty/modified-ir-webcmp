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
  @State() selectedUnit: Partial<SelectedUnit> = {};
  @State() isLoading: boolean;
  @State() errors: Record<string, boolean> | null;
  @State() mealPlanOptions: SelectOption[] | null = null;

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
    let MFromDate = moment(room.from_date, 'YYYY-MM-DD');
    const MToDate = moment(room.to_date, 'YYYY-MM-DD').add(-1, 'days');
    const today = moment();
    if (MFromDate.isBefore(today)) {
      MFromDate = today.clone();
    }
    if (MFromDate.isSame(today)) {
      return { from_date: MFromDate, to_date: MToDate };
    }
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
      this.closeModal.emit(null);
    } catch (error) {
      const err: Record<string, boolean> = {};
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
    const merged: Partial<SelectedUnit> = { ...this.selectedUnit, ...params };
    const roomTypesSource = calendar_data?.property?.roomtypes;
    const mealPlanResult = checkMealPlan({
      rateplan_id: this.room.rateplan.id.toString(),
      roomTypeId: merged?.roomtype_id,
      roomTypes: roomTypesSource,
    });

    const hasExplicitRateplanUpdate = Object.prototype.hasOwnProperty.call(params, 'rateplan_id');

    if (Array.isArray(mealPlanResult)) {
      this.mealPlanOptions = mealPlanResult;
      if (!hasExplicitRateplanUpdate) {
        delete merged.rateplan_id;
      }
    } else {
      this.mealPlanOptions = null;
      if (!hasExplicitRateplanUpdate) {
        if (mealPlanResult) {
          merged.rateplan_id = Number(mealPlanResult.value);
        } else {
          delete merged.rateplan_id;
        }
      }
    }

    this.selectedUnit = merged;
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
              const units = (() => {
                const unitMap = new Map<number, string>();
                for (const rateplan of roomType.rateplans) {
                  for (const unit of rateplan.assignable_units) {
                    if (unit.Is_Fully_Available) {
                      unitMap.set(unit.pr_id, unit.name);
                    }
                  }
                }

                return Array.from(unitMap, ([id, name]) => ({ id, name }));
              })();
              return (
                <Fragment>
                  <li key={`roomTypeRow-${roomType.id}`} class={`room-type-row`}>
                    <div class={'d-flex choice-row'}>
                      <span class="text-left room-type-name">{roomType.name}</span>
                    </div>
                  </li>
                  {units.map((room, j) => {
                    const row_style = j === roomType.physicalrooms.length - 1 ? 'pb-1' : '';
                    const showMealPlanSelect = this.selectedUnit?.unit_id === room.id && Array.isArray(this.mealPlanOptions) && this.mealPlanOptions.length > 0;
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
                          {showMealPlanSelect && (
                            // <ir-select
                            //   firstOption="Select a new rateplan..."
                            //   error={this.errors?.rateplan_id && !this.selectedUnit?.rateplan_id}
                            //   onSelectChange={e => {
                            //     const value = e.detail === null || e.detail === undefined || e.detail === '' ? undefined : Number(e.detail);
                            //     this.updateSelectedUnit({
                            //       rateplan_id: value,
                            //     });
                            //   }}
                            //   data={this.mealPlanOptions}
                            // ></ir-select>
                            <ir-dropdown
                              onOptionChange={e => {
                                this.updateSelectedUnit({
                                  rateplan_id: Number(e.detail.toString()),
                                });
                              }}
                              style={{ '--ir-dropdown-menu-min-width': 'max-content' }}
                            >
                              <button type="button" class="btn btn-sm form-control pr-2 d-flex align-items-center" style={{ minWidth: '200px' }} slot="trigger">
                                {this.selectedUnit?.rateplan_id ? this.mealPlanOptions.find(r => r.value === this.selectedUnit.rateplan_id.toString()).text : 'Choose a meal plan'}
                              </button>
                              {this.mealPlanOptions.map(o => (
                                <ir-dropdown-item value={o.value}>
                                  <p class="m-0 p-0">{o.text}</p>
                                  {o.custom_text && (
                                    <p class="m-0 p-0" style={{ fontSize: '12px' }}>
                                      {o.custom_text}
                                    </p>
                                  )}
                                </ir-dropdown-item>
                              ))}
                            </ir-dropdown>
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
