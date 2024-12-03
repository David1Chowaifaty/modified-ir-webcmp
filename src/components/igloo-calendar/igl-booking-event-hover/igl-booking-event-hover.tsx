import { Component, Host, h, Prop, Event, EventEmitter, State, Element, Fragment } from '@stencil/core';
import { findCountry, formatAmount } from '@/utils/utils';
import { ICountry } from '@/models/IBooking';
import { EventsService } from '@/services/events.service';
import moment from 'moment';
import locales from '@/stores/locales.store';
//import { transformNewBLockedRooms } from '../../../utils/booking';

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
  @Prop() is_vacation_rental: boolean = false;
  @State() isLoading: string;

  @Event() showBookingPopup: EventEmitter;
  @Event({ bubbles: true, composed: true }) hideBubbleInfo: EventEmitter;
  @Event({ bubbles: true, composed: true }) deleteButton: EventEmitter<string>;
  @Event() bookingCreated: EventEmitter<{ pool?: string; data: any[] }>;
  @Element() element;
  private fromTimeStamp: number;
  private toTimeStamp: number;
  private todayTimeStamp: number = new Date().setHours(0, 0, 0, 0);
  private eventService = new EventsService();
  private hideButtons = false;
  @State() shouldHideUnassignUnit = false;
  componentWillLoad() {
    let selectedRt = this.bookingEvent.roomsInfo.find(r => r.id === this.bookingEvent.RATE_TYPE);
    if (selectedRt) {
      console.log(selectedRt.physicalrooms.length === 1);
      this.shouldHideUnassignUnit = selectedRt.physicalrooms.length === 1;
    }
    if (moment(this.bookingEvent.TO_DATE, 'YYYY-MM-DD').isBefore(moment())) {
      this.hideButtons = true;
    }
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.hideBubble();
    } else return;
  }

  hideBubble() {
    this.hideBubbleInfo.emit({
      key: 'hidebubble',
      currentInfoBubbleId: this.getBookingId(),
    });
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  componentDidLoad() {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  getBookingId() {
    return this.bookingEvent.ID;
  }

  getTotalOccupants() {
    const { CHILDREN_COUNT, ADULTS_COUNT } = this.bookingEvent;
    if (CHILDREN_COUNT === 0) {
      return `${ADULTS_COUNT} ${ADULTS_COUNT > 1 ? locales.entries.Lcz_AdultsCaption.toLowerCase() : locales.entries.Lcz_Single_Adult?.toLowerCase()}`;
    }
    return `${ADULTS_COUNT} ${ADULTS_COUNT > 1 ? locales.entries.Lcz_AdultsCaption.toLowerCase() : locales.entries.Lcz_Single_Adult?.toLowerCase()}, ${CHILDREN_COUNT} ${
      CHILDREN_COUNT > 1 ? locales.entries.Lcz_ChildCaption.toLowerCase() : locales.entries.Lcz_Single_Child?.toLowerCase()
    }`;
  }

  getPhoneNumber() {
    return this.bookingEvent.PHONE;
  }

  getCountry() {
    return findCountry(this.bookingEvent.COUNTRY, this.countryNodeList).name;
  }
  getPhoneCode() {
    if (this.bookingEvent.PHONE_PREFIX) {
      return this.bookingEvent.PHONE_PREFIX;
    }
    return findCountry(this.bookingEvent.COUNTRY, this.countryNodeList).phone_prefix;
  }
  renderPhone() {
    return this.bookingEvent.COUNTRY ? `${this.bookingEvent.is_direct ? this.getPhoneCode() + '-' : ''}${this.getPhoneNumber()} - ${this.getCountry()}` : this.getPhoneNumber();
  }

  getGuestNote() {
    return this.bookingEvent.NOTES && <p class={'user-notes p-0 my-0'}>{this.bookingEvent.NOTES}</p>;
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
    return this.bookingEvent.hasOwnProperty('splitBookingEvents') && this.bookingEvent.splitBookingEvents;
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
    this.bookingEvent.TITLE = locales.entries.Lcz_EditBookingFor;
    this.handleBookingOption('EDIT_BOOKING');
  }

  getStringDateFormat(dt) {
    return dt.getFullYear() + '-' + (dt.getMonth() < 9 ? '0' : '') + (dt.getMonth() + 1) + '-' + (dt.getDate() <= 9 ? '0' : '') + dt.getDate();
  }

  handleAddRoom() {
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
      booking: this.bookingEvent?.booking,
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

  handleCustomerCheckIn() {
    console.log('Handle Customer Check In');
  }

  handleCustomerCheckOut() {
    console.log('Handle Customer Check Out');
  }
  handleDeleteEvent() {
    this.hideBubble();
    this.deleteButton.emit(this.bookingEvent.POOL);
    console.log('Delete Event');
  }

  async handleUpdateBlockedDates() {
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
  renderTitle(eventType, roomInfo) {
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
  renderNote() {
    const { is_direct, ota_notes } = this.bookingEvent;
    const guestNote = this.getGuestNote();
    const noteLabel = locales.entries.Lcz_Note + ':';

    if (!is_direct && ota_notes) {
      return (
        <div class="row p-0 m-0">
          <div class="col-12 px-0 text-wrap d-flex">
            <ota-label label={noteLabel} remarks={ota_notes}></ota-label>
          </div>
        </div>
      );
    } else if (is_direct && guestNote) {
      return (
        <div class="row p-0 m-0">
          <div class="col-12 px-0 text-wrap d-flex">
            <Fragment>
              <span class="font-weight-bold">{noteLabel} </span>
              {guestNote}
            </Fragment>
          </div>
        </div>
      );
    }
    return null;
  }

  getInfoElement() {
    return (
      <div class={`iglPopOver infoBubble ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        <div class={`row p-0 m-0  ${this.bookingEvent.BALANCE > 1 ? 'pb-0' : 'pb-1'}`}>
          <div class="px-0  col-8 font-weight-bold font-medium-1 d-flex align-items-center">
            <img src={this.bookingEvent?.origin?.Icon} alt={this.bookingEvent?.origin?.Label} class={'icon-image'} />
            <p class={'p-0 m-0'}>{!this.bookingEvent.is_direct ? this.bookingEvent.channel_booking_nbr : this.bookingEvent.BOOKING_NUMBER}</p>
          </div>
          <div class="pr-0 col-4 text-right">{formatAmount(this.currency.symbol, this.getTotalPrice())}</div>
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
          <div class="row p-0 m-0">
            <div class="px-0 col-12">
              <span class="font-weight-bold">{locales.entries.Lcz_ArrivalTime}: </span>
              {this.getArrivalTime()}
            </div>
          </div>
        )}
        {this.getTotalOccupants() && (
          <div class="row p-0 m-0">
            <div class="px-0  col-12">
              <span class="font-weight-bold">{locales.entries.Lcz_Occupancy}: </span>
              {this.getTotalOccupants()}
            </div>
          </div>
        )}
        {this.getPhoneNumber() && (
          <div class="row p-0 m-0">
            <div class="px-0  col-12 text-wrap">
              <span class="font-weight-bold">{locales.entries.Lcz_Phone}: </span>
              {this.renderPhone()}
            </div>
          </div>
        )}
        {this.getRatePlan() && (
          <div class="row p-0 m-0">
            <div class="px-0  col-12">
              <span class="font-weight-bold">{locales.entries.Lcz_RatePlan}: </span>
              {this.getRatePlan()}
            </div>
          </div>
        )}
        {this.bookingEvent.PRIVATE_NOTE && (
          <div class="row p-0 m-0">
            <div class="px-0  col-12 text-wrap">
              <span class="font-weight-bold">{locales.entries.Lcz_PrivateNote}: </span>
              {this.bookingEvent.PRIVATE_NOTE}
            </div>
          </div>
        )}
        {this.renderNote()}
        {this.getInternalNote() ? (
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
        ) : null}

        <div class="row p-0 m-0 mt-2">
          <div class="full-width btn-group  btn-group-sm font-small-3" role="group">
            <button
              type="button"
              class={`btn btn-primary events_btns ${this.hideButtons ? 'mr-0' : 'mr-1'} ${this.shouldHideUnassignUnit ? 'w-50' : ''}`}
              onClick={_ => {
                this.handleEditBooking();
              }}
              // disabled={!this.bookingEvent.IS_EDITABLE}
            >
              <ir-icons name="edit" style={{ '--icon-size': '0.875rem' }}></ir-icons>
              <span>{locales.entries.Lcz_Edit}</span>
            </button>
            {this.bookingEvent.is_direct && this.bookingEvent.IS_EDITABLE && !this.hideButtons && (
              <button
                type="button"
                class={`btn btn-primary events_btns ${!this.shouldHideUnassignUnit ? 'mr-1' : 'w-50'}`}
                onClick={_ => {
                  this.handleAddRoom();
                }}
              >
                <ir-icons name="square_plus" style={{ '--icon-size': '0.875rem' }}></ir-icons>
                <span>{locales.entries.Lcz_AddRoom}</span>
              </button>
            )}
            {/* {this.canCheckIn() ? (
              <button
                type="button"
                class="btn btn-primary p-0 mr-1"
                onClick={_ => {
                  this.handleCustomerCheckIn();
                }}
                disabled={!this.bookingEvent.IS_EDITABLE}
              >
                <i class="ft ft-edit font-small-3"></i> {locales.entries.Lcz_CheckIn}
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
                <i class="ft ft-log-out font-small-3"></i> {locales.entries.Lcz_CheckOut}
              </button>
            ) : null} */}

            {this.hideButtons
              ? null
              : !this.shouldHideUnassignUnit && (
                  <button
                    type="button"
                    class="btn btn-primary events_btns"
                    onClick={_ => {
                      this.handleDeleteEvent();
                    }}
                    // disabled={!this.bookingEvent.IS_EDITABLE || this.is_vacation_rental}
                  >
                    <ir-icons name="xmark" style={{ '--icon-size': '0.875rem' }}></ir-icons>
                    <span class="m-0 p-0">{locales.entries.Lcz_Unassign}</span>
                  </button>
                )}
          </div>
        </div>
      </div>
    );
  }

  getNewBookingOptions() {
    const shouldDisplayButtons = this.bookingEvent.roomsInfo[0].rateplans.some(rate => rate.is_active);
    return (
      <div class={`iglPopOver newBookingOptions ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        {shouldDisplayButtons ? (
          <Fragment>
            <button
              type="button"
              class="d-block full-width btn btn-sm btn-primary mb-1 font-small-3 square"
              onClick={_ => {
                this.handleBookingOption('BAR_BOOKING');
              }}
            >
              {locales.entries.Lcz_CreateNewBooking}
            </button>
            {this.hasSplitBooking() ? (
              <button
                type="button"
                class="d-block full-width btn btn-sm btn-primary mb-1 font-small-3 square"
                onClick={_ => {
                  this.handleBookingOption('SPLIT_BOOKING');
                }}
              >
                {locales.entries.Lcz_AssignUnitToExistingBooking}
              </button>
            ) : null}
          </Fragment>
        ) : (
          <p class={'text-danger'}>{locales.entries.Lcz_NoRatePlanDefined}</p>
        )}
        <button
          type="button"
          class="d-block full-width btn btn-sm btn-primary font-small-3 square"
          onClick={_ => {
            this.handleBookingOption('BLOCK_DATES');
          }}
        >
          {locales.entries.Lcz_Blockdates}
        </button>
      </div>
    );
  }

  getBlockedView() {
    // let defaultData = {RELEASE_AFTER_HOURS: 0, OPTIONAL_REASON: "", OUT_OF_SERVICE: false};
    return (
      <div class={`iglPopOver blockedView ${this.bubbleInfoTop ? 'bubbleInfoAbove' : ''} text-left`}>
        <igl-block-dates-view
          isEventHover={true}
          entryHour={this.bookingEvent.ENTRY_HOUR}
          entryMinute={this.bookingEvent.ENTRY_MINUTE}
          defaultData={this.bookingEvent}
          fromDate={moment(this.bookingEvent.defaultDates.from_date, 'YYYY-MM-DD').format('DD MM YYYY')}
          toDate={moment(this.bookingEvent.defaultDates.to_date, 'YYYY-MM-DD').format('DD MM YYYY')}
          entryDate={this.getEntryDate()}
          onDataUpdateEvent={event => this.handleBlockDateUpdate(event)}
        ></igl-block-dates-view>
        <div class="row p-0 m-0 mt-2">
          <div class="full-width btn-group btn-group-sm font-small-3" role="group">
            <button
              disabled={this.isLoading === 'update'}
              type="button"
              class="btn btn-primary mr-1 events_btns"
              onClick={_ => {
                this.handleUpdateBlockedDates();
              }}
            >
              {this.isLoading === 'update' ? <i class="la la-circle-o-notch spinner mx-1"></i> : <ir-icons name="edit" style={{ '--icon-size': '0.875rem' }}></ir-icons>}
              <span>{locales.entries.Lcz_Update}</span>
            </button>
            <button
              type="button"
              class="btn btn-primary events_btns"
              onClick={() => {
                this.handleConvertBlockedDateToBooking();
              }}
            >
              {locales.entries.Lcz_ConvertToBooking}
            </button>

            <button
              type="button"
              class="btn btn-danger ml-1 events_btns"
              onClick={_ => {
                this.handleDeleteEvent();
              }}
            >
              <ir-icons name="trash" style={{ '--icon-size': '0.875rem' }}></ir-icons>
              <span>{locales.entries.Lcz_Delete}</span>
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
