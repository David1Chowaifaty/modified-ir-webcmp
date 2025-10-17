import { Component, Host, h, Prop, Event, EventEmitter, State, Element, Fragment, Watch, Listen } from '@stencil/core';
import { canCheckIn, findCountry, formatAmount } from '@/utils/utils';
import { ICountry } from '@/models/IBooking';
import { EventsService } from '@/services/events.service';
import moment from 'moment';
import locales from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';
import { CalendarModalEvent } from '@/models/property-types';
import { compareTime, createDateWithOffsetAndHour } from '@/utils/booking';
import { BookingColor, IOtaNotes } from '@/models/booking.dto';
import { PropertyService } from '@/services/property.service';
import { CalendarSidebarState } from '../igloo-calendar';
//import { transformNewBLockedRooms } from '../../../utils/booking';

@Component({
  tag: 'igl-booking-event-hover',
  styleUrl: 'igl-booking-event-hover.css',
  scoped: true,
})
export class IglBookingEventHover {
  @Element() element: HTMLIglBookingEventHoverElement;

  @Prop({ mutable: true }) bookingEvent: { [key: string]: any };
  @Prop() bubbleInfoTop: boolean = false;
  @Prop() currency;
  @Prop() countries: ICountry[];
  @Prop() is_vacation_rental: boolean = false;

  @State() isLoading: string;
  @State() shouldHideUnassignUnit = false;
  @State() canCheckInOrCheckout: boolean;
  @State() bookingColor: BookingColor | null = null;

  @Event() showBookingPopup: EventEmitter;
  @Event({ bubbles: true, composed: true }) hideBubbleInfo: EventEmitter;
  @Event({ bubbles: true, composed: true }) deleteButton: EventEmitter<string>;
  @Event() bookingCreated: EventEmitter<{ pool?: string; data: any[] }>;
  @Event() showDialog: EventEmitter<CalendarModalEvent>;
  @Event() openCalendarSidebar: EventEmitter<CalendarSidebarState>;

  private eventService = new EventsService();
  private hideButtons = false;
  private propertyService = new PropertyService();
  private baseColor: string;

  componentWillLoad() {
    let selectedRt = this.bookingEvent.roomsInfo.find(r => r.id === this.bookingEvent.RATE_TYPE);
    if (selectedRt) {
      this.shouldHideUnassignUnit = selectedRt.physicalrooms.length === 1;
    }
    if (moment(this.bookingEvent.TO_DATE, 'YYYY-MM-DD').isBefore(moment())) {
      this.hideButtons = true;
    }
    this.baseColor = this.getEventLegend().color;
    this.bookingColor = this.bookingEvent.ROOM_INFO?.calendar_extra ? this.bookingEvent.ROOM_INFO?.calendar_extra?.booking_color : null;
    this.canCheckInOrCheckout = moment().isSameOrAfter(new Date(this.bookingEvent.FROM_DATE), 'days') && moment().isBefore(new Date(this.bookingEvent.TO_DATE), 'days');
  }
  private getEventLegend() {
    let status = this.bookingEvent?.legendData.statusId[this.bookingEvent.STATUS];
    return {
      ...this.bookingEvent?.legendData[status.id],
      ...status,
    };
  }
  @Watch('bookingEvent')
  handleBookingEventChange(newValue, oldValue) {
    if (newValue !== oldValue)
      this.canCheckInOrCheckout =
        moment(new Date()).isSameOrAfter(new Date(this.bookingEvent.FROM_DATE), 'days') && moment(new Date()).isBefore(new Date(this.bookingEvent.TO_DATE), 'days');
  }
  private getBookingId() {
    return this.bookingEvent.ID;
  }
  private hideBubble() {
    this.hideBubbleInfo.emit({
      key: 'hidebubble',
      currentInfoBubbleId: this.getBookingId(),
    });
  }
  @Listen('keydown', { target: 'body' })
  handleListenKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      this.hideBubble();
    } else return;
  }

  private getTotalOccupants() {
    const { CHILDREN_COUNT, ADULTS_COUNT } = this.bookingEvent;
    if (CHILDREN_COUNT === 0) {
      return `${ADULTS_COUNT} ${ADULTS_COUNT > 1 ? locales.entries.Lcz_AdultsCaption.toLowerCase() : locales.entries.Lcz_Single_Adult?.toLowerCase()}`;
    }
    return `${ADULTS_COUNT} ${ADULTS_COUNT > 1 ? locales.entries.Lcz_AdultsCaption.toLowerCase() : locales.entries.Lcz_Single_Adult?.toLowerCase()}, ${CHILDREN_COUNT} ${
      CHILDREN_COUNT > 1 ? locales.entries.Lcz_ChildCaption.toLowerCase() : locales.entries.Lcz_Single_Child?.toLowerCase()
    }`;
  }

  private getPhoneNumber() {
    return this.bookingEvent.PHONE;
  }

  private getCountry() {
    return findCountry(this.bookingEvent.COUNTRY, this.countries).name;
  }
  private getPhoneCode() {
    if (this.bookingEvent.PHONE_PREFIX) {
      return this.bookingEvent.PHONE_PREFIX;
    }
    return findCountry(this.bookingEvent.COUNTRY, this.countries).phone_prefix;
  }
  private renderPhone() {
    return this.bookingEvent.COUNTRY ? `${this.bookingEvent.is_direct ? this.getPhoneCode() + '-' : ''}${this.getPhoneNumber()} - ${this.getCountry()}` : this.getPhoneNumber();
  }

  // private getGuestNote() {
  //   return this.bookingEvent.NOTES && <p class={'user-notes p-0 my-0'}>{this.bookingEvent.NOTES}</p>;
  // }

  private getInternalNote() {
    return this.bookingEvent.INTERNAL_NOTE;
  }

  private getTotalPrice() {
    return this.bookingEvent.TOTAL_PRICE;
  }

  private getArrivalTime() {
    return this.bookingEvent.ARRIVAL_TIME;
  }

  private getRatePlan() {
    if (!this.bookingEvent) {
      return;
    }
    const currentRoom = this.bookingEvent?.booking?.rooms?.find(room => room.assigned_units_pool === this.bookingEvent.ID);
    if (!currentRoom) {
      console.warn(`Couldn't find room with pool ${this.bookingEvent.ID}`);
      return null;
    }
    let str = '';
    str += currentRoom.rateplan['short_name'];
    if (currentRoom.rateplan['is_non_refundable']) {
      str += ` - ${locales.entries.Lcz_NonRefundable}`;
    }
    return str;
  }

  private getEntryDate() {
    return this.bookingEvent.ENTRY_DATE;
  }

  private isNewBooking() {
    return this.getBookingId() === 'NEW_TEMP_EVENT';
  }

  private isCheckedIn() {
    return this.bookingEvent.STATUS === 'IN-HOUSE';
  }

  private isBlockedDateEvent() {
    return this.bookingEvent.STATUS === 'BLOCKED' || this.bookingEvent.STATUS === 'BLOCKED-WITH-DATES';
  }

  private hasSplitBooking() {
    return this.bookingEvent.hasOwnProperty('splitBookingEvents') && this.bookingEvent.splitBookingEvents;
  }

  private canCheckIn() {
    // if (!calendar_data.checkin_enabled || calendar_data.is_automatic_check_in_out) {
    //   return false;
    // }
    // if (this.isCheckedIn()) {
    //   return false;
    // }
    // const now = moment();
    // if (
    //   this.canCheckInOrCheckout ||
    //   (moment().isSame(new Date(this.bookingEvent.TO_DATE), 'days') &&
    //     !compareTime(now.toDate(), createDateWithOffsetAndHour(calendar_data.checkin_checkout_hours?.offset, calendar_data.checkin_checkout_hours?.hour)))
    // ) {
    //   return true;
    // }
    // return false;
    return canCheckIn({
      from_date: this.bookingEvent.FROM_DATE,
      to_date: this.bookingEvent.TO_DATE,
      isCheckedIn: this.isCheckedIn(),
    });
  }

  private canCheckOut() {
    if (!calendar_data.checkin_enabled || calendar_data.is_automatic_check_in_out) {
      return false;
    }
    if (this.isCheckedIn()) {
      return true;
    }
    const now = moment();
    if (
      this.bookingEvent.ROOM_INFO?.in_out?.code === '000' &&
      moment().isSameOrAfter(new Date(this.bookingEvent.TO_DATE), 'days') &&
      compareTime(now.toDate(), createDateWithOffsetAndHour(calendar_data.checkin_checkout_hours?.offset, calendar_data.checkin_checkout_hours?.hour))
    ) {
      return true;
    }
    return false;
  }

  private handleBlockDateUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.bookingEvent = { ...this.bookingEvent, ...opt.data };
    //console.log("blocked date booking event", this.bookingEvent);
  }

  private handleEditBooking() {
    // console.log("Edit booking");
    this.bookingEvent.TITLE = locales.entries.Lcz_EditBookingFor;
    this.handleBookingOption('EDIT_BOOKING');
  }

  private getStringDateFormat(dt) {
    return dt.getFullYear() + '-' + (dt.getMonth() < 9 ? '0' : '') + (dt.getMonth() + 1) + '-' + (dt.getDate() <= 9 ? '0' : '') + dt.getDate();
  }

  private handleAddRoom() {
    let fromDate = new Date(this.bookingEvent.FROM_DATE);
    fromDate.setHours(0, 0, 0, 0);
    let from_date_str = this.getStringDateFormat(fromDate);

    let toDate = new Date(this.bookingEvent.TO_DATE);
    //toDate.setDate(toDate.getDate() + 1);
    toDate.setHours(0, 0, 0, 0);
    let to_date_str = this.getStringDateFormat(toDate);
    // console.log(this.bookingEvent);
    let eventData = {
      ID: '',
      NAME: '',
      BOOKING_NUMBER: this.bookingEvent.BOOKING_NUMBER,
      FROM_DATE: from_date_str, // "2023-07-09",
      TO_DATE: to_date_str, // "2023-07-11",
      roomsInfo: this.bookingEvent.roomsInfo,
      ARRIVAL: this.bookingEvent.ARRIVAL,
      ADD_ROOM_TO_BOOKING: this.bookingEvent.ID,
      TITLE: 'Add Room to #' + this.bookingEvent.BOOKING_NUMBER,
      event_type: 'ADD_ROOM',
      ROOMS: this.bookingEvent.ROOMS,
      GUEST: this.bookingEvent.GUEST,
      message: this.bookingEvent.NOTES,
      SOURCE: this.bookingEvent.SOURCE,
      booking: this.bookingEvent?.base_booking,
      defaultDateRange: {
        fromDate: fromDate,
        fromDateStr: '',
        toDate: toDate,
        toDateStr: '',
        dateDifference: 0,
        editabled: true,
        message: 'Including 5.00% City Tax - Excluding 11.00% VAT',
      },
    };

    this.handleBookingOption('ADD_ROOM', eventData);
  }

  private handleCustomerCheckIn() {
    const { adult_nbr, children_nbr, infant_nbr } = this.bookingEvent.ROOM_INFO.occupancy;
    this.showDialog.emit({
      reason: 'checkin',
      bookingNumber: this.bookingEvent.BOOKING_NUMBER,
      roomIdentifier: this.bookingEvent.IDENTIFIER,
      roomName: '',
      roomUnit: '',
      sidebarPayload: {
        identifier: this.bookingEvent.IDENTIFIER,
        bookingNumber: this.bookingEvent.BOOKING_NUMBER,
        checkin: false,
        roomName: this.bookingEvent.ROOM_INFO.unit?.name ?? '',
        sharing_persons: this.bookingEvent.ROOM_INFO.sharing_persons,
        totalGuests: adult_nbr + children_nbr + infant_nbr,
      },
    });
  }

  private handleCustomerCheckOut() {
    this.showDialog.emit({ reason: 'checkout', bookingNumber: this.bookingEvent.BOOKING_NUMBER, roomIdentifier: this.bookingEvent.IDENTIFIER, roomName: '', roomUnit: '' });
  }

  private handleDeleteEvent() {
    this.hideBubble();
    this.deleteButton.emit(this.bookingEvent.POOL);
    console.log('Delete Event');
  }

  private async handleUpdateBlockedDates() {
    try {
      this.isLoading = 'update';
      setTimeout(() => {
        this.hideBubble();
      }, 50);
      await this.eventService.updateBlockedEvent(this.bookingEvent);
      this.isLoading = '';
    } catch (error) {
      //   toastr.error(error);
    }
  }

  private handleConvertBlockedDateToBooking() {
    this.handleBookingOption('BAR_BOOKING');
  }

  private getRoomInfo() {
    const roomIdToFind = +this.bookingEvent.PR_ID;
    let selectedRoom: any = {};

    for (const room of this.bookingEvent.roomsInfo) {
      for (const physicalRoom of room.physicalrooms) {
        if (roomIdToFind === physicalRoom.id) {
          selectedRoom.CATEGORY = room.name;
          selectedRoom.ROOM_NAME = physicalRoom.name;
          selectedRoom.ROOMS_INFO = room;
          return selectedRoom;
        }
      }
    }

    return selectedRoom;
  }
  private renderTitle(eventType, roomInfo) {
    switch (eventType) {
      case 'EDIT_BOOKING':
        return `${locales.entries.Lcz_EditBookingFor} ${roomInfo.CATEGORY} ${roomInfo.ROOM_NAME}`;
      case 'ADD_ROOM':
        return `${locales.entries.Lcz_AddingUnitToBooking}# ${this.bookingEvent.BOOKING_NUMBER}`;
      case 'SPLIT_BOOKING':
        return locales.entries.Lcz_Adding + ` ${roomInfo.CATEGORY} ${roomInfo.ROOM_NAME}`;
      default:
        return `${locales.entries.Lcz_NewBookingFor} ${roomInfo.CATEGORY} ${roomInfo.ROOM_NAME}`;
    }
  }
  private handleBookingOption(eventType, roomData = null) {
    const roomInfo = this.getRoomInfo();
    let data = roomData ? roomData : this.bookingEvent;
    data.event_type = eventType;
    data.TITLE = this.renderTitle(eventType, roomInfo);

    if (['003', '002', '004'].includes(this.bookingEvent.STATUS_CODE)) {
      data.roomsInfo = [roomInfo.ROOMS_INFO];
    }
    if (eventType === 'BAR_BOOKING' && this.bookingEvent.STATUS !== 'TEMP-EVENT') {
      const { FROM_DATE, TO_DATE, PR_ID, RELEASE_AFTER_HOURS, ENTRY_DATE, OPTIONAL_REASON, ENTRY_MINUTE, ENTRY_HOUR, STATUS_CODE } = this.bookingEvent;
      data.block_exposed_unit_props = {
        from_date: FROM_DATE,
        to_date: TO_DATE,
        NOTES: OPTIONAL_REASON,
        pr_id: PR_ID,
        STAY_STATUS_CODE: STATUS_CODE,
        DESCRIPTION: RELEASE_AFTER_HOURS,
        BLOCKED_TILL_DATE: ENTRY_DATE,
        BLOCKED_TILL_HOUR: ENTRY_HOUR,
        BLOCKED_TILL_MINUTE: ENTRY_MINUTE,
      };
      this.handleDeleteEvent();
    }
    this.showBookingPopup.emit({
      key: 'add',
      data: {
        ...data,
        //roomsInfo: [roomInfo.ROOMS_INFO],
      },
    });
    this.hideBubbleInfo.emit({
      key: 'hidebubble',
      currentInfoBubbleId: this.getBookingId(),
    });
  }
  // private renderNote() {
  //   const { is_direct, ota_notes } = this.bookingEvent;
  //   const guestNote = this.getGuestNote();
  //   const noteLabel = locales.entries.Lcz_Note + ':';

  //   if (!is_direct && ota_notes) {
  //     return (
  //       <div class="row p-0 m-0">
  //         <div class="col-12 px-0 text-wrap d-flex">
  //           <ota-label label={noteLabel} remarks={ota_notes}></ota-label>
  //         </div>
  //       </div>
  //     );
  //   } else if (is_direct && guestNote) {
  //     return (
  //       <div class="row p-0 m-0">
  //         <div class="col-12 px-0 text-wrap d-flex">
  //           <Fragment>
  //             <span class="font-weight-bold">{noteLabel} </span>
  //             {guestNote}
  //           </Fragment>
  //         </div>
  //       </div>
  //     );
  //   }
  //   return null;
  // }
  private getOTANotes(maxVisible: number = 3) {
    if (!this.bookingEvent.ota_notes || this.bookingEvent.ota_notes?.length === 0) {
      return null;
    }
    const channel_notes: IOtaNotes[] = [...this.bookingEvent.ota_notes];
    const separator = '<br>- ';
    if (channel_notes.length > maxVisible) {
      channel_notes[maxVisible - 1] = { statement: `${channel_notes[maxVisible - 1].statement} <span style="color: #1e9ff2;">more...</span>` };
    }
    return channel_notes
      .slice(0, maxVisible)
      .map(o => `${separator}${o.statement}`)
      .join('');
  }
  /**
   * Determines whether the current booking is eligible to be split.
   *
   * Rules enforced:
   *  1) Minimum stay — there must be at least 2 nights between `from_date` (check-in) and `to_date` (check-out).
   *     (Checkout is treated as exclusive; nights = `to_date - from_date` in whole days.)
   *  2) Proximity to checkout — disallow splitting when checkout is tomorrow or earlier
   *     (i.e., `to_date - today < 1 day` when all are normalized to start of day).
   *
   * @returns {boolean} `true` if the booking can be split under the rules above; otherwise `false`.
   *
   * @example
   * // Given defaultDates: { from_date: '2025-10-10', to_date: '2025-10-13' }
   * // nights = 3, and if checkout is more than a day away, returns true.
   * const canSplit = this.canSplitBooking(); // -> true
   */
  private canSplitBooking(): boolean {
    const fromStr = this.bookingEvent?.defaultDates?.from_date;
    const toStr = this.bookingEvent?.defaultDates?.to_date;

    const MFromDate = moment(fromStr, 'YYYY-MM-DD', true).startOf('day');
    const MToDate = moment(toStr, 'YYYY-MM-DD', true).startOf('day');

    if (!MFromDate.isValid() || !MToDate.isValid()) return false;

    // Nights between (checkout is exclusive)
    const nights = MToDate.diff(MFromDate, 'days');

    // Must be at least 2 nights to make a meaningful split
    if (nights < 2) return false;

    // Don’t allow split if checkout is  tomorrow (< 1 day away)
    const today = moment().startOf('day');
    if (MToDate.diff(today, 'days') < 1) return false;

    return true;
  }

  private getInfoElement() {
    return (
      <div class={`iglPopOver infoBubble ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        <div class={`d-flex p-0 m-0  ${this.bookingEvent.BALANCE > 1 ? 'pb-0' : 'pb-1'}`}>
          <div class="px-0  font-weight-bold font-medium-1 d-flex align-items-center" style={{ flex: '1 1 0%' }}>
            <img src={this.bookingEvent?.origin?.Icon} alt={this.bookingEvent?.origin?.Label} class={'icon-image'} />
            <p class={'p-0 m-0'}>{!this.bookingEvent.is_direct ? this.bookingEvent.channel_booking_nbr : this.bookingEvent.BOOKING_NUMBER}</p>
          </div>
          <div class="pr-0  text-right d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <ir-dropdown
              caret={false}
              onOptionChange={async e => {
                const newBookingColor = e.detail === 'none' ? null : calendar_data.property.calendar_extra?.booking_colors.find(c => c.color === e.detail);
                await this.propertyService.setRoomCalendarExtra({
                  property_id: calendar_data.property.id,
                  room_identifier: this.bookingEvent.IDENTIFIER,
                  value: JSON.stringify({
                    booking_color: newBookingColor,
                  }),
                });
                this.bookingColor = newBookingColor;
              }}
              style={{ '--ir-dropdown-menu-min-width': 'fit-content', 'width': '1.5rem' }}
            >
              <button class="booking-event-hover__color-picker-trigger" slot="trigger">
                {this.bookingColor ? (
                  <div style={{ height: '1rem', width: '1rem', background: this.bookingColor?.color, borderRadius: '0.21rem' }}></div>
                ) : (
                  <ir-icons
                    class="p-0 m-0 d-flex align-items-center"
                    style={{
                      '--icon-size': '1rem',
                      'height': '1rem',
                      'width': '1rem',
                      'background': this.baseColor,
                      'color': 'white',
                      'borderRadius': '0.21rem',
                      'padding': '0.25rem',
                    }}
                    name="ban"
                  ></ir-icons>
                )}
              </button>
              <ir-dropdown-item value="none">
                <ir-icons class="p-0 m-0 d-flex align-items-center" style={{ '--icon-size': '1rem', 'height': '1rem', 'width': '1rem' }} name="ban"></ir-icons>
              </ir-dropdown-item>
              {calendar_data.property.calendar_extra?.booking_colors.map(s => (
                <ir-dropdown-item value={s.color}>
                  <div style={{ height: '1rem', width: '1rem', borderRadius: '0.21rem', background: s.color }}></div>
                </ir-dropdown-item>
              ))}
            </ir-dropdown>
            {formatAmount(this.currency.symbol, this.getTotalPrice())}
          </div>
        </div>

        {this.bookingEvent.BALANCE > 1 && (
          <p class="pr-0 m-0 p-0 text-right balance_amount">
            {locales.entries.Lcz_Balance}: {formatAmount(this.currency.symbol, this.bookingEvent.BALANCE)}
          </p>
        )}
        <div class="row p-0 m-0">
          <div class="px-0 pr-0 col-12">
            <ir-date-view from_date={this.bookingEvent.defaultDates.from_date} to_date={this.bookingEvent.defaultDates.to_date} showDateDifference={false}></ir-date-view>
            {/* <span class="font-weight-bold">{locales.entries.Lcz_In}: </span> */}
          </div>
        </div>
        {this.getArrivalTime() && (
          // <div class="row p-0 m-0">
          //   <div class="px-0 col-12">
          //     <span class="font-weight-bold">{locales.entries.Lcz_ArrivalTime}: </span>
          //     {this.getArrivalTime()}
          //   </div>
          // </div>
          <ir-label containerStyle={{ padding: '0', margin: '0' }} class="m-0 p-0" labelText={`${locales.entries.Lcz_ArrivalTime}:`} content={this.getArrivalTime()}></ir-label>
        )}
        {this.getTotalOccupants() && (
          // <div class="row p-0 m-0">
          //   <div class="px-0  col-12">
          //     <span class="font-weight-bold">{locales.entries.Lcz_Occupancy}: </span>
          //     {this.getTotalOccupants()}
          //   </div>
          // </div>

          <ir-label class="m-0 p-0" containerStyle={{ padding: '0', margin: '0' }} labelText={`${locales.entries.Lcz_Occupancy}:`} content={this.getTotalOccupants()}></ir-label>
        )}
        {this.getPhoneNumber() && (
          // <div class="row p-0 m-0">
          //   <div class="px-0  col-12 text-wrap">
          //     <span class="font-weight-bold">{locales.entries.Lcz_Phone}: </span>
          //     {this.renderPhone()}
          //   </div>
          // </div>
          <ir-label containerStyle={{ padding: '0', margin: '0' }} class="m-0 p-0" labelText={`${locales.entries.Lcz_Phone}:`} content={this.renderPhone()}></ir-label>
        )}
        {this.getRatePlan() && (
          // <div class="row p-0 m-0">
          //   <div class="px-0  col-12">
          //     <span class="font-weight-bold">{locales.entries.Lcz_RatePlan}: </span>
          //     {this.getRatePlan()}
          //   </div>
          // </div>
          <ir-label containerStyle={{ padding: '0', margin: '0' }} class="m-0 p-0" labelText={`${locales.entries.Lcz_RatePlan}:`} content={this.getRatePlan()}></ir-label>
        )}
        {this.bookingEvent.DEPARTURE_TIME?.code !== '000' && (
          <ir-label containerStyle={{ padding: '0', margin: '0' }} class="m-0 p-0" labelText={`Departure time:`} content={this.bookingEvent.DEPARTURE_TIME?.description}></ir-label>
        )}
        {this.bookingEvent.PRIVATE_NOTE && (
          // <div class="row p-0 m-0">
          //   <div class="px-0  col-12 text-wrap">
          //     <span class="font-weight-bold">{locales.entries.Lcz_PrivateNote}: </span>
          //     {this.bookingEvent.PRIVATE_NOTE}
          //   </div>
          // </div>
          <ir-label
            containerStyle={{ padding: '0', margin: '0' }}
            class="m-0 p-0"
            labelText={`${locales.entries.Lcz_BookingPrivateNote}:`}
            display="inline"
            content={this.bookingEvent.PRIVATE_NOTE}
          ></ir-label>
        )}

        {/* {this.renderNote()} */}
        {/* {this.bookingEvent.is_direct ? (
          <ir-label containerStyle={{ padding: '0', margin: '0' }} labelText={`${locales.entries.Lcz_GuestRemark}:`} display="inline" content={this.bookingEvent.NOTES}></ir-label>
        ) : (
          <ota-label
            class={'m-0 p-0 ota-notes'}
            label={`${locales.entries.Lcz_ChannelNotes || 'Channel notes'}:`}
            remarks={this.bookingEvent.ota_notes}
            maxVisibleItems={this.bookingEvent.ota_notes?.length}
          ></ota-label>
        )} */}
        {this.bookingEvent.is_direct && (
          <ir-label containerStyle={{ padding: '0', margin: '0' }} labelText={`${locales.entries.Lcz_GuestRemark}:`} display="inline" content={this.bookingEvent.NOTES}></ir-label>
        )}
        <ir-label
          containerStyle={{ padding: '0', margin: '0' }}
          labelText={`${locales.entries.Lcz_ChannelNotes}:`}
          display="inline"
          content={this.getOTANotes()}
          renderContentAsHtml
        ></ir-label>

        {/* {this.getInternalNote() ? (
          <div class="row p-0 m-0">
            <div class="col-12 px-0 text-wrap">
              {this.bookingEvent.is_direct ? (
                <Fragment>
                  <span class="font-weight-bold">{locales.entries.Lcz_InternalRemark}: </span>
                  {this.getInternalNote()}
                </Fragment>
              ) : (
                <ota-label label={`${locales.entries.Lcz_InternalRemark}:`} remarks={this.bookingEvent.ota_notes}></ota-label>
              )}
            </div>
          </div>
        ) : null} */}
        {this.getInternalNote() && <ir-label labelText={`${locales.entries.Lcz_InternalRemark}:`} content={this.getInternalNote()}></ir-label>}
        <div class="row p-0 m-0 mt-2">
          <div class="full-width d-flex align-items-center" style={{ gap: '0.25rem' }} role="group">
            <ir-button
              style={{ '--icon-size': '0.875rem' }}
              onClickHandler={() => this.handleEditBooking()}
              class={'w-100'}
              btn_block
              text={locales.entries.Lcz_Edit}
              // icon_name="edit"
              btn_styles="h-100"
              size="sm"
            ></ir-button>
            {this.bookingEvent.is_direct && this.bookingEvent.IS_EDITABLE && !this.hideButtons && (
              <ir-button
                style={{ '--icon-size': '0.875rem' }}
                text={locales.entries.Lcz_AddRoom}
                // icon_name="square_plus"
                size="sm"
                class={'w-100'}
                btn_styles="h-100"
                onClickHandler={() => this.handleAddRoom()}
              ></ir-button>
            )}
            {this.canSplitBooking() && (
              <ir-button
                class={'w-100'}
                style={{ '--icon-size': '0.875rem' }}
                text={'Split'}
                onClickHandler={() => this.handleSplitBooking()}
                btn_styles="h-100"
                size="sm"
              ></ir-button>
            )}
            {this.canCheckIn() && (
              <ir-button
                class={'w-100'}
                style={{ '--icon-size': '0.875rem' }}
                text={locales.entries.Lcz_CheckIn}
                onClickHandler={() => this.handleCustomerCheckIn()}
                // icon_name="edit"
                btn_styles="h-100"
                size="sm"
              ></ir-button>
            )}
            {this.canCheckOut() && (
              <ir-button
                class={'w-100'}
                btn_styles="h-100"
                style={{ '--icon-size': '0.875rem' }}
                text={locales.entries.Lcz_CheckOut}
                // icon_name="edit"
                onClickHandler={() => this.handleCustomerCheckOut()}
                size="sm"
              ></ir-button>
            )}
            {this.hideButtons
              ? null
              : !this.shouldHideUnassignUnit && (
                  <ir-button
                    class={'w-100'}
                    btn_styles="h-100"
                    style={{ '--icon-size': '0.875rem' }}
                    size="sm"
                    text={locales.entries.Lcz_Unassign}
                    // icon_name="xmark"
                    onClickHandler={_ => {
                      this.handleDeleteEvent();
                    }}
                  ></ir-button>
                )}
          </div>
        </div>
      </div>
    );
  }
  private handleSplitBooking(): void {
    this.hideBubble();
    this.openCalendarSidebar.emit({ type: 'split', payload: { booking: this.bookingEvent.base_booking, identifier: this.bookingEvent.IDENTIFIER } });
  }
  private getNewBookingOptions() {
    const shouldDisplayButtons = this.bookingEvent.roomsInfo[0].rateplans.some(rate => rate.is_active);
    return (
      <div class={`iglPopOver d-flex flex-column newBookingOptions ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`} style={{ gap: '0.5rem' }}>
        {shouldDisplayButtons ? (
          <Fragment>
            {/* <div class={'mb-1'}> */}
            <ir-button
              size="sm"
              btn_block
              data-testid="bar_booking_btn"
              text={locales.entries.Lcz_CreateNewBooking}
              onClickHandler={_ => {
                this.handleBookingOption('BAR_BOOKING');
              }}
            ></ir-button>
            {/* </div> */}
            {/* <div> */}
            {this.hasSplitBooking() && (
              // <div class="mb-1">
              <ir-button
                size="sm"
                btn_block
                text={locales.entries.Lcz_AssignUnitToExistingBooking}
                onClickHandler={_ => {
                  this.handleBookingOption('SPLIT_BOOKING');
                }}
              ></ir-button>
              // </div>
            )}
            {/* </div> */}
          </Fragment>
        ) : (
          <p class={'text-danger'}>{locales.entries.Lcz_NoRatePlanDefined}</p>
        )}
        {/* <div> */}
        <ir-button
          size="sm"
          text={locales.entries.Lcz_Blockdates}
          btn_block
          onClickHandler={_ => {
            this.handleBookingOption('BLOCK_DATES');
          }}
        ></ir-button>
        {/* </div> */}
      </div>
    );
  }

  private getBlockedView() {
    console.log('booking event', this.bookingEvent);
    // let defaultData = {RELEASE_AFTER_HOURS: 0, OPTIONAL_REASON: "", OUT_OF_SERVICE: false};
    return (
      <div class={`iglPopOver blockedView ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        <igl-block-dates-view
          isEventHover={true}
          entryHour={this.bookingEvent.ENTRY_HOUR}
          entryMinute={this.bookingEvent.ENTRY_MINUTE}
          defaultData={this.bookingEvent}
          fromDate={this.bookingEvent.defaultDates.from_date}
          toDate={this.bookingEvent.defaultDates.to_date}
          entryDate={this.getEntryDate()}
          onDataUpdateEvent={event => this.handleBlockDateUpdate(event)}
        ></igl-block-dates-view>
        <div class="row p-0 m-0 mt-2">
          <div class="full-width d-flex align-items-center" style={{ gap: '0.25rem' }} role="group">
            <ir-button
              btn_disabled={this.isLoading === 'update'}
              text={locales.entries.Lcz_Update}
              onClickHandler={_ => {
                this.handleUpdateBlockedDates();
              }}
              icon_name="edit"
              size="sm"
              btn_styles="h-100"
              isLoading={this.isLoading === 'update'}
              style={{ '--icon-size': '0.875rem' }}
              btn_block
              class={'w-100'}
            ></ir-button>
            <ir-button
              class={'w-100 h-100 my-0'}
              btn_block
              btn_styles="h-100"
              size="sm"
              text={locales.entries.Lcz_ConvertSplitBooking}
              onClickHandler={() => {
                this.handleConvertBlockedDateToBooking();
              }}
            ></ir-button>

            <ir-button
              class={'w-100'}
              btn_styles="h-100"
              btn_block
              size="sm"
              style={{ '--icon-size': '0.875rem' }}
              icon_name="trash"
              btn_color="danger"
              onClickHandler={_ => {
                this.handleDeleteEvent();
              }}
              text={locales.entries.Lcz_Delete}
            ></ir-button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div class={`pointerContainer ${this.bubbleInfoTop ? 'pointerContainerTop' : ''}`}>
          <div class={`bubblePointer ${this.bubbleInfoTop ? 'bubblePointTop' : 'bubblePointBottom'}`}></div>
        </div>
        {this.isBlockedDateEvent() ? this.getBlockedView() : null}
        {this.isNewBooking() ? this.getNewBookingOptions() : null}
        {!this.isBlockedDateEvent() && !this.isNewBooking() ? this.getInfoElement() : null}
      </Host>
    );
  }
}
