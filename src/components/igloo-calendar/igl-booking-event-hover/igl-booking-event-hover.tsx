import { Component, Host, h, Prop, Event, EventEmitter, State } from '@stencil/core';
import { findCountry, getCurrencySymbol } from '../../../utils/utils';
import { ICountry } from '../../../models/IBooking';
import { EventsService } from '../../../services/events.service';

@Component({
  tag: 'igl-booking-event-hover',
  styleUrl: 'igl-booking-event-hover.css',
  scoped: true,
})
export class IglBookingEventHover {
  @Prop({ mutable: true }) bookingEvent: { [key: string]: any };
  @Prop() bubbleInfoTop: boolean = false;
  @Prop() currency;
  @Prop() countryNodeList: ICountry[];
  @State() isLoading: string;
  @Event() showBookingPopup: EventEmitter;
  @Event({ bubbles: true, composed: true }) hideBubbleInfo: EventEmitter;
  @Event({ bubbles: true, composed: true }) deleteButton: EventEmitter<string>;
  private fromTimeStamp: number;
  private toTimeStamp: number;
  private todayTimeStamp: number = new Date().setHours(0, 0, 0, 0);
  private eventService = new EventsService();
  getBookingId() {
    return this.bookingEvent.ID;
  }

  getTotalOccupants() {
    return this.bookingEvent.ADULTS_COUNT;
  }

  getPhoneNumber() {
    return this.bookingEvent.PHONE;
  }

  getCountry() {
    return findCountry(this.bookingEvent.COUNTRY, this.countryNodeList).name;
  }
  getPhoneCode() {
    return findCountry(this.bookingEvent.COUNTRY, this.countryNodeList).phone_prefix;
  }
  renderPhone() {
    return this.bookingEvent.COUNTRY ? `${this.getPhoneCode()}-${this.getPhoneNumber()} - ${this.getCountry()}` : this.getPhoneNumber();
  }

  getGuestNote() {
    return this.bookingEvent.NOTES;
  }

  getInternalNote() {
    return this.bookingEvent.INTERNAL_NOTE;
  }

  getTotalPrice() {
    return this.bookingEvent.TOTAL_PRICE;
  }

  getCheckInDate() {
    return this.bookingEvent.FROM_DATE_STR;
  }

  getCheckOutDate() {
    return this.bookingEvent.TO_DATE_STR;
  }

  getArrivalTime() {
    return this.bookingEvent.ARRIVAL_TIME;
  }

  getRatePlan() {
    return this.bookingEvent.RATE_PLAN;
  }

  getEntryDate() {
    return this.bookingEvent.ENTRY_DATE;
  }

  getReleaseAfterHours() {
    return this.bookingEvent.RELEASE_AFTER_HOURS;
  }

  isNewBooking() {
    return this.getBookingId() === 'NEW_TEMP_EVENT';
  }

  isCheckedIn() {
    return this.bookingEvent.STATUS === 'CHECKED-IN';
  }

  isCheckedOut() {
    return this.bookingEvent.STATUS === 'CHECKED-OUT';
  }

  isBlockedDateEvent() {
    return this.bookingEvent.STATUS === 'BLOCKED' || this.bookingEvent.STATUS === 'BLOCKED-WITH-DATES';
  }

  getRoomId() {
    return this.bookingEvent.PR_ID;
  }

  getCategoryByRoomId(roomId) {
    // console.log("room id ",roomId)
    // console.log("booking event",this.bookingEvent)
    return this.bookingEvent.roomsInfo.find(roomCategory => roomCategory.physicalrooms.find(room => room.id === roomId));
  }

  hasSplitBooking() {
    return this.bookingEvent.hasOwnProperty('splitBookingEvents') && this.bookingEvent.splitBookingEvents.length;
  }

  canCheckIn() {
    if (!this.fromTimeStamp) {
      let dt = new Date(this.getCheckInDate());
      dt.setHours(0, 0, 0, 0);
      this.fromTimeStamp = dt.getTime();
    }
    if (!this.toTimeStamp) {
      let dt = new Date(this.getCheckOutDate());
      dt.setHours(0, 0, 0, 0);
      this.toTimeStamp = dt.getTime();
    }
    if (this.isCheckedIn() || this.isCheckedOut()) {
      return false;
    }
    if (this.fromTimeStamp <= this.todayTimeStamp && this.todayTimeStamp <= this.toTimeStamp) {
      return true;
    } else {
      return false;
    }
  }

  canCheckOut() {
    if (this.isCheckedIn() && this.todayTimeStamp <= this.toTimeStamp) {
      return true;
    } else {
      return false;
    }
  }

  handleBlockDateUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.bookingEvent = { ...this.bookingEvent, ...opt.data };
    //console.log("blocked date booking event", this.bookingEvent);
  }

  handleEditBooking() {
    // console.log("Edit booking");
    this.bookingEvent.TITLE = 'Edit Room';
    this.handleBookingOption('EDIT_BOOKING');
  }

  getStringDateFormat(dt) {
    return dt.getFullYear() + '-' + (dt.getMonth() < 9 ? '0' : '') + (dt.getMonth() + 1) + '-' + (dt.getDate() <= 9 ? '0' : '') + dt.getDate();
  }

  handleAddRoom() {
    let fromDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    let from_date_str = this.getStringDateFormat(fromDate);

    let toDate = new Date();
    toDate.setDate(toDate.getDate() + 1);
    toDate.setHours(0, 0, 0, 0);
    let to_date_str = this.getStringDateFormat(toDate);

    let eventData = {
      ID: '',
      NAME: '',
      FROM_DATE: from_date_str, // "2023-07-09",
      TO_DATE: to_date_str, // "2023-07-11",
      roomsInfo: this.bookingEvent.roomsInfo,
      ADD_ROOM_TO_BOOKING: this.bookingEvent.ID,
      TITLE: 'Add Room to #' + this.bookingEvent.ID + ' - ' + this.bookingEvent.NAME,
      event_type: 'ADD_ROOM',
      defaultDateRange: {
        fromDate: fromDate, //new Date("2023-09-10"),
        fromDateStr: '', //"10 Sep 2023",
        toDate: toDate, //new Date("2023-09-15"),
        toDateStr: '', // "15 Sep 2023",
        dateDifference: 0,
        editabled: true,
        message: 'Including 5.00% City Tax - Excluding 11.00% VAT',
      },
    };

    this.handleBookingOption('ADD_ROOM', eventData);
  }

  handleCustomerCheckIn() {
    console.log('Handle Customer Check In');
  }

  handleCustomerCheckOut() {
    console.log('Handle Customer Check Out');
  }
  handleDeleteEvent() {
    this.deleteButton.emit(this.bookingEvent.POOL);
    console.log('Delete Event');
  }

  async handleUpdateBlockedDates() {
    try {
      this.isLoading = 'update';
      await this.eventService.updateBlockedEvent(this.bookingEvent);
      this.hideBubbleInfo.emit({
        key: 'hidebubble',
        currentInfoBubbleId: this.getBookingId(),
      });
      this.isLoading = '';
      console.log('Updated blocked dates');
    } catch (error) {
      //   toastr.error(error);
    }
  }

  handleConvertBlockedDateToBooking() {
    this.handleBookingOption('BAR_BOOKING');
  }

  getRoomInfo() {
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
  handleBookingOption(eventType, roomData = null) {
    const roomInfo = this.getRoomInfo();
    let data = roomData ? roomData : this.bookingEvent;
    data.event_type = eventType;
    if (['003', '002', '004'].includes(this.bookingEvent.STATUS_CODE)) {
      data.roomsInfo = [roomInfo.ROOMS_INFO];
    }
    this.showBookingPopup.emit({
      key: 'add',
      data: {
        ...data,
        TITLE: `New Booking for ${roomInfo.CATEGORY} ${roomInfo.ROOM_NAME}`,
        //roomsInfo: [roomInfo.ROOMS_INFO],
      },
    });
    this.hideBubbleInfo.emit({
      key: 'hidebubble',
      currentInfoBubbleId: this.getBookingId(),
    });
  }

  getInfoElement() {
    return (
      <div class={`iglPopOver infoBubble ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        <div class="row p-0 m-0 pb-1">
          <div class="pl-0 col-8 font-weight-bold font-medium-1">{this.bookingEvent.BOOKING_NUMBER}</div>
          <div class="pr-0 col-4 text-right">
            {getCurrencySymbol(this.currency.code)}
            {this.getTotalPrice()}
          </div>
        </div>
        <div class="row p-0 m-0">
          <div class="pl-0 pr-0 col-12">
            <span class="font-weight-bold">In: </span>
            {this.getCheckInDate()} - <span class="font-weight-bold">Out: </span>
            {this.getCheckOutDate()}
          </div>
        </div>
        {this.getArrivalTime() && (
          <div class="row p-0 m-0">
            <div class="pl-0 pr-0 col-12">
              <span class="font-weight-bold">Arrival time: </span>
              {this.getArrivalTime()}
            </div>
          </div>
        )}
        {this.getTotalOccupants() && (
          <div class="row p-0 m-0">
            <div class="pl-0 pr-0 col-12">
              <span class="font-weight-bold">Occupancy: </span>
              {this.getTotalOccupants()}
            </div>
          </div>
        )}
        {this.getPhoneNumber() && (
          <div class="row p-0 m-0">
            <div class="pl-0 pr-0 col-12 text-wrap">
              <span class="font-weight-bold">Phone: </span>
              {this.renderPhone()}
            </div>
          </div>
        )}
        {this.getRatePlan() && (
          <div class="row p-0 m-0">
            <div class="pl-0 pr-0 col-12">
              <span class="font-weight-bold">Rate plan: </span>
              {this.getRatePlan()}
            </div>
          </div>
        )}
        {this.getGuestNote() ? (
          <div class="row p-0 m-0">
            <div class="col-12 pl-0 pr-0 text-wrap">
              <sapn class="font-weight-bold">Note: </sapn>
              {this.getGuestNote()}
            </div>
          </div>
        ) : null}
        {this.getInternalNote() ? (
          <div class="row p-0 m-0">
            <div class="col-12 pl-0 pr-0 text-wrap">
              <span class="font-weight-bold">Internal remark: </span>
              {this.getInternalNote()}
            </div>
          </div>
        ) : null}

        <div class="row p-0 m-0 mt-2">
          <div class="full-width btn-group btn-group-sm font-small-3" role="group">
            <button
              type="button"
              class="btn btn-primary mr-1"
              onClick={_ => {
                this.handleEditBooking();
              }}
              disabled={!this.bookingEvent.IS_EDITABLE}
            >
              <i class="ft ft-edit font-small-3"></i> Edit
            </button>
            <button
              type="button"
              class="btn btn-primary mr-1"
              onClick={_ => {
                this.handleAddRoom();
              }}
              disabled={!this.bookingEvent.IS_EDITABLE}
            >
              <i class="ft ft-plus-circle font-small-3"></i> Add room
            </button>
            {this.canCheckIn() ? (
              <button
                type="button"
                class="btn btn-primary p-0 mr-1"
                onClick={_ => {
                  this.handleCustomerCheckIn();
                }}
                disabled={!this.bookingEvent.IS_EDITABLE}
              >
                <i class="ft ft-edit font-small-3"></i> Check-in
              </button>
            ) : null}
            {this.canCheckOut() ? (
              <button
                type="button"
                class="btn btn-primary p-0 mr-1"
                onClick={_ => {
                  this.handleCustomerCheckOut();
                }}
                disabled={!this.bookingEvent.IS_EDITABLE}
              >
                <i class="ft ft-log-out font-small-3"></i> Check-out
              </button>
            ) : null}
            <button
              type="button"
              class="btn btn-danger p-0"
              onClick={_ => {
                this.handleDeleteEvent();
              }}
              disabled={!this.bookingEvent.IS_EDITABLE}
            >
              <i class="ft ft-trash-2 font-small-3"></i> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  getNewBookingOptions() {
    return (
      <div class={`iglPopOver newBookingOptions ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        <button
          type="button"
          class="d-block full-width btn btn-sm btn-primary mb-1 font-small-3 square"
          onClick={_ => {
            this.handleBookingOption('BAR_BOOKING');
          }}
        >
          Create new booking
        </button>
        {this.hasSplitBooking() ? (
          <button
            type="button"
            class="d-block full-width btn btn-sm btn-primary mb-1 font-small-3 square"
            onClick={_ => {
              this.handleBookingOption('SPLIT_BOOKING');
            }}
          >
            Assign unit to existing booking
          </button>
        ) : null}
        <button
          type="button"
          class="d-block full-width btn btn-sm btn-primary font-small-3 square"
          onClick={_ => {
            this.handleBookingOption('BLOCK_DATES');
          }}
        >
          Block dates
        </button>
      </div>
    );
  }

  getBlockedView() {
    // let defaultData = {RELEASE_AFTER_HOURS: 0, OPTIONAL_REASON: "", OUT_OF_SERVICE: false};
    return (
      <div class={`iglPopOver blockedView ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        <igl-block-dates-view
          entryHour={this.bookingEvent.ENTRY_HOUR}
          entryMinute={this.bookingEvent.ENTRY_MINUTE}
          defaultData={this.bookingEvent}
          fromDate={this.getCheckInDate()}
          toDate={this.getCheckOutDate()}
          entryDate={this.getEntryDate()}
          onDataUpdateEvent={event => this.handleBlockDateUpdate(event)}
        ></igl-block-dates-view>
        <div class="row p-0 m-0 mt-2">
          <div class="full-width btn-group btn-group-sm font-small-3" role="group">
            <button
              disabled={this.isLoading === 'update'}
              type="button"
              class="btn btn-primary mr-1"
              onClick={_ => {
                this.handleUpdateBlockedDates();
              }}
            >
              {this.isLoading === 'update' ? <i class="la la-circle-o-notch spinner mx-1"></i> : <i class="ft ft-edit font-small-3"></i>}
              Update
            </button>
            <button
              type="button"
              class="btn btn-primary p-0"
              onClick={_ => {
                this.handleConvertBlockedDateToBooking();
              }}
            >
              Convert to booking
            </button>
            <button
              type="button"
              class="btn btn-danger ml-1 p-0"
              onClick={_ => {
                this.handleDeleteEvent();
              }}
            >
              <i class="ft ft-trash-2 font-small-3"></i> Delete
            </button>
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
