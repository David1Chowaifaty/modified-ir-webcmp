import { Component, Host, Listen, Prop, State, h, Event, EventEmitter } from '@stencil/core';
import calendar_dates from '@/stores/calendar-dates.store';
import locales from '@/stores/locales.store';
import { RoomType } from '@/models/booking.dto';
import moment, { Moment } from 'moment';
import { DayData } from '@/models/DayType';

export type RoomCategory = RoomType & { expanded: boolean };

@Component({
  tag: 'igl-cal-body',
  styleUrl: 'igl-cal-body.css',
  scoped: true,
})
export class IglCalBody {
  @Event() showBookingPopup: EventEmitter;
  @Event({ bubbles: true, composed: true }) scrollPageToRoom: EventEmitter;
  @Prop() isScrollViewDragging: boolean;
  @Prop() calendarData: { [key: string]: any };
  @Prop() today: string;
  @Prop() currency;
  @Prop() language: string;
  @Prop() countryNodeList;
  @State() dragOverElement: string = '';
  @State() renderAgain: boolean = false;
  @Prop() highlightedDate: string;
  @Event() addBookingDatasEvent: EventEmitter<any[]>;

  private selectedRooms: { [key: string]: any } = {};
  private fromRoomId: number = -1;
  private newEvent: { [key: string]: any };
  // private currentDate = new Date();
  private currentDate = moment();

  // componentWillLoad() {
  //   this.currentDate.setHours(0, 0, 0, 0);
  // }

  @Listen('dragOverHighlightElement', { target: 'window' })
  dragOverHighlightElementHandler(event: CustomEvent) {
    this.dragOverElement = event.detail.dragOverElement;
  }

  @Listen('gotoRoomEvent', { target: 'window' })
  gotoRoom(event: CustomEvent) {
    let roomId = event.detail.roomId;
    let category = this.getRoomCategoryByRoomId(roomId);
    if (!category.expanded) {
      this.toggleCategory(category);
      setTimeout(() => {
        this.scrollToRoom(roomId);
      }, 10);
    } else {
      this.scrollToRoom(roomId);
    }
  }

  @Listen('addToBeAssignedEvent', { target: 'window' })
  addToBeAssignedEvents(event: CustomEvent) {
    // let roomId = event.detail.roomId;
    this.addBookingDatas(event.detail.data);
    this.renderElement();
  }

  scrollToRoom(roomId) {
    this.scrollPageToRoom.emit({
      key: 'scrollPageToRoom',
      id: roomId,
      refClass: 'room_' + roomId,
    });
  }

  getRoomCategoryByRoomId(roomId) {
    return this.calendarData.roomsInfo.find(roomCategory => {
      return this.getCategoryRooms(roomCategory).find(room => this.getRoomId(room) === roomId);
    });
  }

  getCategoryName(roomCategory) {
    return roomCategory.name;
  }

  getCategoryId(roomCategory) {
    return roomCategory.id;
  }

  getTotalPhysicalRooms(roomCategory) {
    return this.getCategoryRooms(roomCategory).length;
  }

  getCategoryRooms(roomCategory: RoomCategory) {
    return (roomCategory && roomCategory.physicalrooms) || [];
  }

  getRoomName(roomInfo) {
    return roomInfo.name;
  }

  getRoomId(roomInfo) {
    return roomInfo.id;
  }

  getRoomById(physicalRooms, roomId) {
    return physicalRooms.find(physical_room => this.getRoomId(physical_room) === roomId);
  }

  getBookingData() {
    return this.calendarData.bookingEvents;
  }

  addBookingDatas(aData) {
    this.addBookingDatasEvent.emit(aData);
  }

  private getSelectedCellRefName(roomId: number, selectedDay: DayData) {
    return `room_${roomId}_${selectedDay.day}`;
  }

  // getSplitBookingEvents(newEvent) {
  //   return this.getBookingData().some(bookingEvent => !['003', '002', '004'].includes(bookingEvent.STATUS_CODE) && newEvent.FROM_DATE === bookingEvent.FROM_DATE);
  // }
  getSplitBookingEvents(newEvent) {
    console.log(newEvent.FROM_DATE);
    return this.getBookingData().some(bookingEvent => {
      if (!['003', '002', '004'].includes(bookingEvent.STATUS_CODE)) {
        if (
          new Date(newEvent.FROM_DATE).getTime() >= new Date(bookingEvent.FROM_DATE).getTime() &&
          new Date(newEvent.FROM_DATE).getTime() <= new Date(bookingEvent.TO_DATE).getTime()
        ) {
          return bookingEvent;
        }
      }
    });
  }
  @Listen('closeBookingWindow', { target: 'window' })
  closeWindow() {
    let ind = this.getBookingData().findIndex(ev => ev.ID === 'NEW_TEMP_EVENT');
    if (ind !== -1) {
      this.getBookingData().splice(ind, 1);
      console.log('removed item..');
      this.renderElement();
    }
  }

  addNewEvent(roomCategory) {
    let keys = Object.keys(this.selectedRooms);
    let startDate: Moment, endDate: Moment;
    console.log(this.selectedRooms);
    // console.log(this.selectedRooms);
    // if (this.selectedRooms[keys[0]].currentDate < this.selectedRooms[keys[1]].currentDate) {
    //   startDate = new Date(this.selectedRooms[keys[0]].currentDate);
    //   endDate = new Date(this.selectedRooms[keys[1]].currentDate);
    // } else {
    //   startDate = new Date(this.selectedRooms[keys[1]].currentDate);
    //   endDate = new Date(this.selectedRooms[keys[0]].currentDate);
    // }
    const from = moment(this.selectedRooms[keys[0]].day, 'YYYY-MM-DD');
    const to = moment(this.selectedRooms[keys[1]].day, 'YYYY-MM-DD');
    if (from.isBefore(to, 'dates')) {
      startDate = from;
      endDate = to;
    } else {
      startDate = to;
      endDate = from;
    }
    // const dateDiff = ((endDate.toDate() as any) - (startDate.toDate() as any)) / 86400000;
    const dateDiff = (endDate.toDate().getTime() - startDate.toDate().getTime()) / 86400000;
    console.log({ endDate: endDate.format('YYYY-MM-DD'), startDate: startDate.format('YYYY-MM-DD') });
    this.newEvent = {
      ID: 'NEW_TEMP_EVENT',
      NAME: <span>&nbsp;</span>,
      EMAIL: '',
      PHONE: '',
      convertBooking: false,
      REFERENCE_TYPE: 'PHONE',
      // FROM_DATE: startDate.getFullYear() + '-' + this.getTwoDigitNumStr(startDate.getMonth() + 1) + '-' + this.getTwoDigitNumStr(startDate.getDate()),
      // TO_DATE: endDate.getFullYear() + '-' + this.getTwoDigitNumStr(endDate.getMonth() + 1) + '-' + this.getTwoDigitNumStr(endDate.getDate()),
      FROM_DATE: startDate.format('YYYY-MM-DD'),
      TO_DATE: endDate.format('YYYY-MM-DD'),
      BALANCE: '',
      NOTES: '',
      RELEASE_AFTER_HOURS: 0,
      PR_ID: this.selectedRooms[keys[0]].roomId,
      ENTRY_DATE: '',
      NO_OF_DAYS: dateDiff,
      ADULTS_COUNT: 1,
      COUNTRY: '',
      INTERNAL_NOTE: '',
      RATE: '',
      TOTAL_PRICE: '',
      RATE_PLAN: '',
      ARRIVAL_TIME: '',
      TITLE: locales.entries.Lcz_NewBookingFor,
      roomsInfo: [roomCategory],
      CATEGORY: roomCategory.name,
      event_type: 'BAR_BOOKING',
      STATUS: 'TEMP-EVENT',
      defaultDateRange: {
        fromDate: null,
        fromDateStr: '',
        toDate: null,
        toDateStr: '',
        dateDifference: dateDiff,
        editable: false,
        message: 'Including 5.00% City Tax - Excluding 11.00% VAT',
      },
    };

    let popupTitle = roomCategory.name + ' ' + this.getRoomName(this.getRoomById(this.getCategoryRooms(roomCategory), this.selectedRooms[keys[0]].roomId));
    this.newEvent.BLOCK_DATES_TITLE = `${locales.entries.Lcz_BlockDatesFor} ${popupTitle}`;
    this.newEvent.TITLE += popupTitle;
    this.newEvent.defaultDateRange.toDate = endDate;
    this.newEvent.defaultDateRange.fromDate = startDate;
    this.newEvent.defaultDateRange.fromDateStr = startDate.format('YYYY-MM-DD');
    this.newEvent.defaultDateRange.toDateStr = endDate.format('YYYY-MM-DD');
    this.newEvent.ENTRY_DATE = moment().format('YYYY-MM-DD');
    this.newEvent.legendData = this.calendarData.formattedLegendData;

    let splitBookingEvents = this.getSplitBookingEvents(this.newEvent);
    if (splitBookingEvents) {
      this.newEvent.splitBookingEvents = splitBookingEvents;
    }
    console.warn({ newEvent: this.newEvent });
    this.getBookingData().push(this.newEvent);
    return this.newEvent;
  }

  getTwoDigitNumStr(num) {
    return num <= 9 ? '0' + num : num;
  }

  getDateStr(date, locale = 'default') {
    return date.getDate() + ' ' + date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }

  removeNewEvent() {
    this.calendarData.bookingEvents = this.calendarData.bookingEvents.filter(events => events.ID !== 'NEW_TEMP_EVENT');
    this.newEvent = null;
  }

  clickCell(roomId: number, selectedDay: DayData, roomCategory: RoomCategory) {
    if (!this.isScrollViewDragging && moment(selectedDay.day, 'YYYY-MM-DD').isAfter(this.currentDate, 'days')) {
      let refKey = this.getSelectedCellRefName(roomId, selectedDay);
      if (this.selectedRooms.hasOwnProperty(refKey)) {
        this.removeNewEvent();
        delete this.selectedRooms[refKey];
        this.renderElement();
        return;
      } else if (Object.keys(this.selectedRooms).length != 1 || this.fromRoomId != roomId) {
        this.removeNewEvent();
        this.selectedRooms = {};
        this.selectedRooms[refKey] = { ...selectedDay, roomId };
        this.fromRoomId = roomId;
        this.renderElement();
      } else {
        // create bar;
        this.selectedRooms[refKey] = { ...selectedDay, roomId };
        this.addNewEvent(roomCategory);
        this.selectedRooms = {};
        this.renderElement();
        this.showNewBookingPopup(this.newEvent);
      }
    }
  }

  showNewBookingPopup(data) {
    console.log(data);
    // this.showBookingPopup.emit({key: "add", data});
  }

  renderElement() {
    this.renderAgain = !this.renderAgain;
  }

  getGeneralCategoryDayColumns(addClass: string, isCategory: boolean = false, index: number) {
    return calendar_dates.days.map(dayInfo => {
      return (
        <div
          class={`cellData  font-weight-bold categoryPriceColumn ${addClass + '_' + dayInfo.day} ${
            dayInfo.day === this.today || dayInfo.day === this.highlightedDate ? 'currentDay' : ''
          }`}
        >
          {isCategory ? (
            <span class={'categoryName'}>
              {dayInfo.rate[index].exposed_inventory.rts}
              {/* <br />
              {dayInfo.rate[index].exposed_inventory.offline} */}
            </span>
          ) : (
            ''
          )}
        </div>
      );
    });
  }

  getGeneralRoomDayColumns(roomId: string, roomCategory: RoomCategory) {
    // onDragOver={event => this.handleDragOver(event)} onDrop={event => this.handleDrop(event, addClass+"_"+dayInfo.day)}
    return this.calendarData.days.map(dayInfo => (
      <div
        data-room={roomId}
        data-date={dayInfo.day}
        class={`cellData ${'room_' + roomId + '_' + dayInfo.day} ${dayInfo.day === this.today || dayInfo.day === this.highlightedDate ? 'currentDay' : ''} ${
          this.dragOverElement === roomId + '_' + dayInfo.day ? 'dragOverHighlight' : ''
        } ${this.selectedRooms.hasOwnProperty(this.getSelectedCellRefName(Number(roomId), dayInfo)) ? 'selectedDay' : ''}`}
        onClick={() => this.clickCell(Number(roomId), dayInfo, roomCategory)}
      ></div>
    ));
  }

  toggleCategory(roomCategory: RoomCategory) {
    roomCategory.expanded = !roomCategory.expanded;
    this.renderElement();
  }

  getRoomCategoryRow(roomCategory: RoomCategory, index: number) {
    if (this.getTotalPhysicalRooms(roomCategory) <= 1 || !roomCategory.is_active) {
      return null;
    }
    return (
      <div class="roomRow">
        <div
          class={`cellData text-left align-items-center roomHeaderCell categoryTitle ${'category_' + this.getCategoryId(roomCategory)}`}
          onClick={() => this.toggleCategory(roomCategory)}
        >
          <div class={'categoryName'}>
            <ir-popover popoverTitle={this.getCategoryName(roomCategory)}></ir-popover>
          </div>
          {roomCategory.expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={14} width={14}>
              <path
                fill="#6b6f82"
                d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
              />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height={14} width={14}>
              <path
                fill="#6b6f82"
                d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
              />
            </svg>
          )}
          {/* <i class={`la la-angle-${roomCategory.expanded ? 'down' : 'right'}`}></i> */}
        </div>
        {this.getGeneralCategoryDayColumns('category_' + this.getCategoryId(roomCategory), true, index)}
      </div>
    );
  }

  /**
   * Renders a list of active rooms for an expanded room category. Returns an array of JSX elements, including headers and day columns, or an empty array if the category is collapsed or contains no active rooms.
   *
   * @param {RoomCategory} roomCategory - The category containing room details.
   * @returns {JSX.Element[]} - JSX elements for the active rooms or an empty array.
   */
  private getRoomsByCategory(roomCategory: RoomCategory) {
    // Check accordion is expanded.
    if (!roomCategory.expanded) {
      return [];
    }

    return this.getCategoryRooms(roomCategory)?.map(room => {
      if (!room.is_active) {
        return null;
      }
      return (
        <div class="roomRow">
          <div
            class={`cellData text-left align-items-center roomHeaderCell  roomTitle ${this.getTotalPhysicalRooms(roomCategory) <= 1 ? 'pl10' : ''} ${
              'room_' + this.getRoomId(room)
            }`}
            data-room={this.getRoomId(room)}
          >
            {/* <div>{this.getTotalPhysicalRooms(roomCategory) <= 1 ? this.getCategoryName(roomCategory) : this.getRoomName(room)}</div> */}
            <ir-popover popoverTitle={this.getTotalPhysicalRooms(roomCategory) <= 1 ? this.getCategoryName(roomCategory) : this.getRoomName(room)}></ir-popover>
          </div>
          {this.getGeneralRoomDayColumns(this.getRoomId(room), roomCategory)}
        </div>
      );
    });
  }

  getRoomRows() {
    return this.calendarData.roomsInfo?.map((roomCategory, index) => {
      if (roomCategory.is_active) {
        return [this.getRoomCategoryRow(roomCategory, index), this.getRoomsByCategory(roomCategory)];
      } else {
        return null;
      }
    });
  }

  render() {
    // onDragStart={event => this.handleDragStart(event)} draggable={true}
    return (
      <Host>
        <div class="bodyContainer">
          {this.getRoomRows()}
          <div class="bookingEventsContainer preventPageScroll">
            {this.getBookingData()?.map(bookingEvent => (
              <igl-booking-event
                language={this.language}
                is_vacation_rental={this.calendarData.is_vacation_rental}
                countryNodeList={this.countryNodeList}
                currency={this.currency}
                data-component-id={bookingEvent.ID}
                bookingEvent={bookingEvent}
                allBookingEvents={this.getBookingData()}
              ></igl-booking-event>
            ))}
          </div>
        </div>
      </Host>
    );
  }
}
