import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { RoomService } from '@/services/room.service';
import { BookingService } from '@/services/booking.service';
import { addTwoMonthToDate, computeEndDate, convertDMYToISO, dateToFormattedString, formatLegendColors, getNextDay, isBlockUnit } from '@/utils/utils';
import io, { Socket } from 'socket.io-client';
import { EventsService } from '@/services/events.service';
import { ICountry, RoomBlockDetails, RoomBookingDetails, RoomDetail, bookingReasons } from '@/models/IBooking';
import moment, { Moment } from 'moment';
import { ToBeAssignedService } from '@/services/toBeAssigned.service';
import { bookingStatus, calculateDaysBetweenDates, getPrivateNote, getRoomStatus, transformNewBLockedRooms, transformNewBooking } from '@/utils/booking';
import { IRoomNightsData, IRoomNightsDataEventPayload, CalendarModalEvent } from '@/models/property-types';
import { TIglBookPropertyPayload } from '@/models/igl-book-property';
import calendar_dates from '@/stores/calendar-dates.store';
import locales from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';
import { addUnassignedDates, handleUnAssignedDatesChange, removeUnassignedDates } from '@/stores/unassigned_dates.store';
import Token from '@/models/Token';
import { RoomHkStatus, RoomType } from '@/models/booking.dto';
// import Auth from '@/models/Auth';
export interface UnitHkStatusChangePayload {
  PR_ID: number;
  ROOM_CATEGORY_ID: number;
  NAME: string;
  DESCRIPTION: string;
  ENTRY_USER_ID: number;
  ENTRY_DATE: string;
  OWNER_ID: number;
  IS_ACTIVE: boolean;
  HKS_CODE: RoomHkStatus;
  HKM_ID: number;
  CHECKLIST: null;
  My_Room_category: null;
  My_Hkm: null;
}
export type CalendarSidebarState = {
  type: 'room-guests' | 'booking-details' | 'add-days';
  payload: any;
};
@Component({
  tag: 'igloo-calendar',
  styleUrl: 'igloo-calendar.css',
  scoped: true,
})
export class IglooCalendar {
  @Prop() propertyid: number;
  @Prop({ mutable: true }) from_date: string;
  @Prop() to_date: string;
  @Prop() language: string;
  @Prop() loadingMessage: string;
  @Prop() currencyName: string;
  @Prop() ticket: string = '';
  @Prop() p: string;

  @Element() private element: HTMLElement;

  @State() calendarData: { [key: string]: any } = new Object();
  @State() property_id: number;
  @State() days: { [key: string]: any }[] = new Array();
  @State() scrollViewDragging: boolean = false;
  @State() dialogData: CalendarModalEvent | null = null;
  @State() bookingItem: TIglBookPropertyPayload | null = null;
  @State() editBookingItem: TIglBookPropertyPayload | null = null;
  @State() showLegend: boolean = false;
  @State() showPaymentDetails: boolean = false;
  @State() showToBeAssigned: boolean = false;
  @State() unassignedDates = {};
  @State() roomNightsData: IRoomNightsData | null = null;
  @State() renderAgain = false;
  @State() showBookProperty: boolean = false;
  @State() totalAvailabilityQueue: { room_type_id: number; date: string; availability: number }[] = [];
  @State() highlightedDate: string;
  @State() calDates: { from: string; to: string };
  @State() isAuthenticated = false;
  @State() calendarSidebarState: CalendarSidebarState;

  @Event({ bubbles: true, composed: true })
  dragOverHighlightElement: EventEmitter;
  @Event({ bubbles: true, composed: true }) moveBookingTo: EventEmitter;
  @Event() calculateUnassignedDates: EventEmitter;
  @Event({ bubbles: true, composed: true })
  reduceAvailableUnitEvent: EventEmitter<{ fromDate: string; toDate: string }>;
  @Event({ bubbles: true }) revertBooking: EventEmitter;
  @Event() openCalendarSidebar: EventEmitter<CalendarSidebarState>;

  private bookingService: BookingService = new BookingService();
  private roomService: RoomService = new RoomService();
  private eventsService = new EventsService();
  private toBeAssignedService = new ToBeAssignedService();
  // private auth = new Auth();
  private countries: ICountry[] = [];
  private visibleCalendarCells: { x: any[]; y: any[] } = { x: [], y: [] };
  private scrollContainer: HTMLElement;
  private today: String = '';
  private reachedEndOfCalendar = false;

  private socket: Socket;
  private availabilityTimeout: NodeJS.Timeout;
  private token = new Token();
  calendarModalEl: HTMLIrModalElement;

  componentWillLoad() {
    this.init();
  }
  componentDidLoad() {
    this.scrollToElement(this.today);
  }
  @Listen('deleteButton')
  async handleDeleteEvent(ev: CustomEvent) {
    try {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      await this.eventsService.deleteEvent(ev.detail);
    } catch (error) {
      //toastr.error(error);
    }
  }
  @Listen('openCalendarSidebar')
  async handleCalendarSidbarEvents(ev: CustomEvent) {
    ev.stopImmediatePropagation();
    ev.stopPropagation();
    this.calendarSidebarState = ev.detail;
  }
  @Listen('scrollPageToRoom', { target: 'window' })
  scrollPageToRoom(event: CustomEvent) {
    let targetScrollClass = event.detail.refClass;
    this.scrollContainer = this.scrollContainer || this.element.querySelector('.calendarScrollContainer');
    const topLeftCell = this.element.querySelector('.topLeftCell');
    const gotoRoom = this.element.querySelector('.' + targetScrollClass);
    if (gotoRoom) {
      this.scrollContainer.scrollTo({ top: 0 });
      const gotoRect = gotoRoom.getBoundingClientRect();
      const containerRect = this.scrollContainer.getBoundingClientRect();
      const topLeftCellRect = topLeftCell.getBoundingClientRect();
      this.scrollContainer.scrollTo({
        top: gotoRect.top - containerRect.top - topLeftCellRect.height - gotoRect.height,
      });
    }
  }
  @Listen('showDialog')
  handleShowDialog(event: CustomEvent) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.dialogData = event.detail;
    this.calendarModalEl?.openModal();
  }
  @Listen('showRoomNightsDialog')
  handleShowRoomNightsDialog(event: CustomEvent<IRoomNightsData>) {
    this.roomNightsData = event.detail;
  }
  @Listen('addBookingDatasEvent')
  handleBookingDatasChange(event: CustomEvent) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    let bookings = [...this.calendarData.bookingEvents];
    bookings = bookings.filter(bookingEvent => bookingEvent.ID !== 'NEW_TEMP_EVENT');
    bookings.push(...event.detail.filter(ev => ev.STATUS === 'PENDING-CONFIRMATION'));
    this.updateBookingEventsDateRange(event.detail);
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: bookings,
    };
  }
  @Listen('updateBookingEvent')
  handleUpdateBookingEvent(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const newBookingEvent = e.detail;
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: this.calendarData.bookingEvents.map(event => {
        if (newBookingEvent.ID === event.ID) {
          return newBookingEvent;
        }
        return event;
      }),
    };
  }
  @Listen('showBookingPopup', { target: 'window' })
  showBookingPopupEventDataHandler(event: CustomEvent) {
    event.preventDefault();
    event.stopImmediatePropagation();
    this.onOptionSelect(event);
    //console.log("show booking event", event);
  }

  @Listen('updateEventData')
  updateEventDataHandler(event: CustomEvent) {
    let bookedData = this.calendarData.bookingEvents.find(bookedEvent => bookedEvent.id === event.detail.id);
    if (bookedData && event.detail && event.detail.data) {
      Object.entries(event.detail.data).forEach(([key, value]) => {
        bookedData[key] = value;
      });
    }
  }

  @Listen('dragOverEventData')
  dragOverEventDataHandler(event: CustomEvent) {
    if (event.detail.id === 'CALCULATE_DRAG_OVER_BOUNDS') {
      let topLeftCell = document.querySelector('igl-cal-header .topLeftCell') as HTMLElement;
      let containerDays = document.querySelectorAll('.headersContainer .headerCell');
      let containerRooms = document.querySelectorAll('.bodyContainer .roomRow .roomTitle');
      this.visibleCalendarCells = { x: [], y: [] };

      containerDays.forEach(element => {
        const htmlElement = element as HTMLElement;
        this.visibleCalendarCells.x.push({
          left: htmlElement.offsetLeft + topLeftCell.offsetWidth,
          width: htmlElement.offsetWidth,
          id: htmlElement.getAttribute('data-day'),
        });
      });

      containerRooms.forEach(element => {
        const htmlElement = element as HTMLElement;
        this.visibleCalendarCells.y.push({
          top: htmlElement.offsetTop,
          height: htmlElement.offsetHeight,
          id: htmlElement.getAttribute('data-room'),
        });
      });
      this.highlightDragOver(true, event.detail.data);
    } else if (event.detail.id === 'DRAG_OVER') {
      this.highlightDragOver(true, event.detail.data);
    } else if (event.detail.id === 'DRAG_OVER_END') {
      this.highlightDragOver(false, event.detail.data);
    } else if (event.detail.id === 'STRETCH_OVER_END') {
      this.highlightDragOver(false, event.detail.data);
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }

  private init() {
    this.calDates = {
      from: this.from_date,
      to: this.to_date,
    };
    if (this.ticket !== '') {
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
    this.calDates = {
      from: this.from_date,
      to: this.to_date,
    };
    handleUnAssignedDatesChange('unassigned_dates', newValue => {
      if (Object.keys(newValue).length === 0 && this.highlightedDate !== '') {
        this.highlightedDate = '';
      }
    });
  }
  private renderModalBody() {
    switch (this.dialogData?.reason) {
      case 'checkin': {
        return `Are you sure you want to Check In this unit?`;
      }
      case 'checkout': {
        return 'Are you sure you want to Check Out this unit?';
      }
      case 'reallocate':
        return this.dialogData?.description || '';
      default:
        return 'Unknown modal content';
    }
  }
  private setUpCalendarData(roomResp, bookingResp) {
    console.log(roomResp);
    this.calendarData.currency = roomResp['My_Result'].currency;
    this.calendarData.allowedBookingSources = roomResp['My_Result'].allowed_booking_sources;
    this.calendarData.adultChildConstraints = roomResp['My_Result'].adult_child_constraints;
    console.log(this.calendarData.allowedBookingSources);
    this.calendarData.legendData = this.getLegendData(roomResp);
    this.calendarData.is_vacation_rental = roomResp['My_Result'].is_vacation_rental;
    this.calendarData.from_date = bookingResp.My_Params_Get_Rooming_Data.FROM;
    this.calendarData.to_date = bookingResp.My_Params_Get_Rooming_Data.TO;
    this.calendarData.startingDate = new Date(bookingResp.My_Params_Get_Rooming_Data.FROM).getTime();
    this.calendarData.endingDate = new Date(bookingResp.My_Params_Get_Rooming_Data.TO).getTime();
    this.calendarData.formattedLegendData = formatLegendColors(this.calendarData.legendData);
    let bookings = bookingResp.myBookings || [];
    bookings = bookings.filter(bookingEvent => {
      const toDate = moment(bookingEvent.TO_DATE, 'YYYY-MM-DD');
      const fromDate = moment(bookingEvent.FROM_DATE, 'YYYY-MM-DD');
      return !toDate.isSame(fromDate);
    });
    this.calendarData.bookingEvents = bookings;

    this.calendarData.toBeAssignedEvents = [];
  }

  async initializeApp() {
    try {
      let propertyId = this.propertyid;
      if (!this.propertyid && !this.p) {
        throw new Error('Property ID or username is required');
      }
      let roomResp = null;
      if (!propertyId) {
        console.log(propertyId);
        const propertyData = await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
          include_units_hk_status: true,
        });
        roomResp = propertyData;
        propertyId = propertyData.My_Result.id;
      }
      this.property_id = propertyId;
      const requests = [
        this.bookingService.getCalendarData(propertyId, this.from_date, this.to_date),
        this.bookingService.getCountries(this.language),
        this.roomService.fetchLanguage(this.language),
      ];

      if (this.propertyid) {
        requests.push(
          this.roomService.getExposedProperty({
            id: this.propertyid,
            language: this.language,
            is_backend: true,
            include_units_hk_status: true,
          }),
        );
      }

      const results = await Promise.all(requests);
      if (!roomResp) {
        roomResp = results[results.length - 1];
      }
      const [bookingResp, countries] = results as any;
      calendar_dates.days = bookingResp.days;
      calendar_dates.months = bookingResp.months;
      this.setRoomsData(roomResp);
      this.countries = countries;
      this.setUpCalendarData(roomResp, bookingResp);
      let paymentMethods = roomResp['My_Result']['allowed_payment_methods'] as any[];
      this.showPaymentDetails = paymentMethods.some(item => item.code === '001' || item.code === '004');
      this.updateBookingEventsDateRange(this.calendarData.bookingEvents);
      this.updateBookingEventsDateRange(this.calendarData.toBeAssignedEvents);
      this.today = this.transformDateForScroll(new Date());
      let startingDay: Date = new Date(this.calendarData.startingDate);
      startingDay.setHours(0, 0, 0, 0);
      this.days = bookingResp.days;
      this.calendarData.days = this.days;
      this.calendarData.monthsInfo = bookingResp.months;
      calendar_dates.fromDate = this.calendarData.from_date;
      calendar_dates.toDate = this.calendarData.to_date;
      setTimeout(() => {
        this.scrollToElement(this.today);
      }, 200);
      if (!this.calendarData.is_vacation_rental) {
        const data = await this.toBeAssignedService.getUnassignedDates(this.property_id, dateToFormattedString(new Date()), this.to_date);
        this.unassignedDates = { fromDate: this.from_date, toDate: this.to_date, data: { ...this.unassignedDates, ...data } };
        this.calendarData = { ...this.calendarData, unassignedDates: data };
        addUnassignedDates(data);
      }
      this.socket = io('https://realtime.igloorooms.com/');
      this.socket.on('MSG', async msg => {
        await this.handleSocketMessage(msg);
      });
    } catch (error) {
      console.error('Initializing Calendar Error', error);
    }
  }

  private async handleSocketMessage(msg: string) {
    const msgAsObject = JSON.parse(msg);
    if (!msgAsObject) {
      return;
    }

    const { REASON, KEY, PAYLOAD }: { REASON: bookingReasons; KEY: any; PAYLOAD: any } = msgAsObject;

    if (KEY.toString() !== this.property_id.toString()) {
      return;
    }

    let result: any;
    if (['DELETE_CALENDAR_POOL', 'GET_UNASSIGNED_DATES'].includes(REASON)) {
      result = PAYLOAD;
    } else {
      result = JSON.parse(PAYLOAD);
    }
    console.log(KEY, result);
    const reasonHandlers: { [key: string]: Function } = {
      DORESERVATION: this.handleDoReservation,
      BLOCK_EXPOSED_UNIT: this.handleBlockExposedUnit,
      ASSIGN_EXPOSED_ROOM: this.handleAssignExposedRoom,
      REALLOCATE_EXPOSED_ROOM_BLOCK: this.handleReallocateExposedRoomBlock,
      DELETE_CALENDAR_POOL: this.handleDeleteCalendarPool,
      GET_UNASSIGNED_DATES: this.handleGetUnassignedDates,
      UPDATE_CALENDAR_AVAILABILITY: this.handleUpdateCalendarAvailability,
      CHANGE_IN_DUE_AMOUNT: this.handleChangeInDueAmount,
      CHANGE_IN_BOOK_STATUS: this.handleChangeInBookStatus,
      NON_TECHNICAL_CHANGE_IN_BOOKING: this.handleNonTechnicalChangeInBooking,
      ROOM_STATUS_CHANGED: this.handleRoomStatusChanged,
      UNIT_HK_STATUS_CHANGED: this.handleUnitHKStatusChanged,
    };

    const handler = reasonHandlers[REASON];
    if (handler) {
      await handler.call(this, result);
    } else {
      console.warn(`Unhandled REASON: ${REASON}`);
    }
  }
  private handleRoomStatusChanged(result: any) {
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: [
        ...this.calendarData.bookingEvents.map(e => {
          if (e.IDENTIFIER === result.room_identifier) {
            const STATUS = getRoomStatus({
              from_date: e.FROM_DATE,
              to_date: e.TO_DATE,
              in_out: { ...e.ROOM_INFO.in_out, code: result.status },
              status_code: e.BASE_STATUS_CODE,
            });
            return {
              ...e,
              CHECKIN: result.status === '001',
              CHECKOUT: result.status === '002',
              STATUS,
            };
          }
          return e;
        }),
      ],
    };
  }
  private handleUnitHKStatusChanged(result: UnitHkStatusChangePayload) {
    console.log('hk unit change', result);
    const updatedRooms: RoomType[] = [...this.calendarData.roomsInfo];
    const changedRoomTypeIdx = updatedRooms.findIndex((roomType: RoomType) => roomType.id === result.ROOM_CATEGORY_ID);
    if (changedRoomTypeIdx !== -1) {
      const changedRoomType = { ...updatedRooms[changedRoomTypeIdx] };
      const changedPhysicalRoomIdx = changedRoomType.physicalrooms.findIndex(room => room.id === result.PR_ID);
      if (changedPhysicalRoomIdx !== -1) {
        const updatedPhysicalRooms = [...changedRoomType.physicalrooms];
        const targetPhysicalRoom = { ...updatedPhysicalRooms[changedPhysicalRoomIdx] };
        targetPhysicalRoom.hk_status = result.HKS_CODE;
        updatedPhysicalRooms[changedPhysicalRoomIdx] = targetPhysicalRoom;
        changedRoomType.physicalrooms = updatedPhysicalRooms;
        updatedRooms[changedRoomTypeIdx] = changedRoomType;
        this.calendarData = {
          ...this.calendarData,
          roomsInfo: updatedRooms,
        };
      }
    }
  }
  private async handleDoReservation(result: any) {
    const transformedBooking = transformNewBooking(result);
    this.AddOrUpdateRoomBookings(transformedBooking);
  }

  private async handleBlockExposedUnit(result: any) {
    const transformedBooking = [await transformNewBLockedRooms(result)];
    this.AddOrUpdateRoomBookings(transformedBooking);
  }

  private async handleAssignExposedRoom(result: any) {
    console.log(result);
    const transformedBooking = transformNewBooking(result);
    this.AddOrUpdateRoomBookings(transformedBooking);
  }

  private async handleReallocateExposedRoomBlock(result: any) {
    await this.handleBlockExposedUnit(result);
  }

  private async handleDeleteCalendarPool(result: any) {
    console.log('delete calendar pool');
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: this.calendarData.bookingEvents.filter(e => e.POOL !== result),
    };
  }

  private async handleGetUnassignedDates(result: any) {
    const parsedResult = this.parseDateRange(result);
    if (
      !this.calendarData.is_vacation_rental &&
      new Date(parsedResult.FROM_DATE).getTime() >= this.calendarData.startingDate &&
      new Date(parsedResult.TO_DATE).getTime() <= this.calendarData.endingDate
    ) {
      const data = await this.toBeAssignedService.getUnassignedDates(
        this.property_id,
        dateToFormattedString(new Date(parsedResult.FROM_DATE)),
        dateToFormattedString(new Date(parsedResult.TO_DATE)),
      );
      addUnassignedDates(data);
      this.unassignedDates = {
        fromDate: dateToFormattedString(new Date(parsedResult.FROM_DATE)),
        toDate: dateToFormattedString(new Date(parsedResult.TO_DATE)),
        data,
      };
      if (Object.keys(data).length === 0) {
        removeUnassignedDates(dateToFormattedString(new Date(parsedResult.FROM_DATE)), dateToFormattedString(new Date(parsedResult.TO_DATE)));
        this.reduceAvailableUnitEvent.emit({
          fromDate: dateToFormattedString(new Date(parsedResult.FROM_DATE)),
          toDate: dateToFormattedString(new Date(parsedResult.TO_DATE)),
        });
      }
    }
  }

  private parseDateRange(str: string): Record<string, string> {
    const result: Record<string, string> = {};
    const pairs = str.split('|');

    pairs.forEach(pair => {
      const res = pair.split(':');
      result[res[0]] = res[1];
    });
    return result;
  }

  private handleUpdateCalendarAvailability(result: any) {
    this.totalAvailabilityQueue.push(result);
    if (this.totalAvailabilityQueue.length > 0) {
      clearTimeout(this.availabilityTimeout);
    }
    this.availabilityTimeout = setTimeout(() => {
      this.updateTotalAvailability();
    }, 1000);
  }

  private handleChangeInDueAmount(result: any) {
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: this.calendarData.bookingEvents.map(event => {
        if (result.pools.includes(event.ID)) {
          return { ...event, BALANCE: result.due_amount };
        }
        return event;
      }),
    };
  }

  private handleChangeInBookStatus(result: any) {
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: this.calendarData.bookingEvents.map(event => {
        if (result.pools.includes(event.ID)) {
          return {
            ...event,
            STATUS: event.STATUS !== 'IN-HOUSE' ? bookingStatus[result.status_code] : result.status_code === '001' ? bookingStatus[result.status_code] : 'IN-HOUSE',
          };
        }
        return event;
      }),
    };
  }

  private handleNonTechnicalChangeInBooking(result: any) {
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: this.calendarData.bookingEvents.map(event => {
        if (event.BOOKING_NUMBER === result.booking_nbr) {
          return { ...event, PRIVATE_NOTE: getPrivateNote(result.extras) };
        }
        return event;
      }),
    };
  }

  private checkBookingAvailability(data) {
    return this.calendarData.bookingEvents.some(
      booking => booking.ID === data.ID || (booking.FROM_DATE === data.FROM_DATE && booking.TO_DATE === data.TO_DATE && booking.PR_ID === data.PR_ID),
    );
  }

  private updateBookingEventsDateRange(eventData) {
    console.log('updating booking event');
    const now = moment();
    eventData.forEach(bookingEvent => {
      bookingEvent.legendData = this.calendarData.formattedLegendData;
      bookingEvent.defaultDateRange = {};
      bookingEvent.defaultDateRange.fromDate = new Date(bookingEvent.FROM_DATE + 'T00:00:00');
      bookingEvent.defaultDateRange.fromDateStr = this.getDateStr(bookingEvent.defaultDateRange.fromDate);
      bookingEvent.defaultDateRange.fromDateTimeStamp = bookingEvent.defaultDateRange.fromDate.getTime();

      bookingEvent.defaultDateRange.toDate = new Date(bookingEvent.TO_DATE + 'T00:00:00');
      bookingEvent.defaultDateRange.toDateStr = this.getDateStr(bookingEvent.defaultDateRange.toDate);
      bookingEvent.defaultDateRange.toDateTimeStamp = bookingEvent.defaultDateRange.toDate.getTime();

      bookingEvent.defaultDateRange.dateDifference = bookingEvent.NO_OF_DAYS;
      bookingEvent.roomsInfo = [...this.calendarData.roomsInfo];
      if (!isBlockUnit(bookingEvent.STATUS_CODE)) {
        if (calendar_data.checkin_enabled) {
          if (bookingEvent.CHECKOUT) {
            if (!calendar_data.is_automatic_check_in_out) {
              const toDate = moment(bookingEvent.TO_DATE, 'YYYY-MM-DD');
              const fromDate = moment(bookingEvent.FROM_DATE, 'YYYY-MM-DD');

              if (now.isSame(toDate, 'days') && now.isAfter(fromDate, 'days') && now.hour() >= 12) {
                bookingEvent.STATUS = bookingStatus['003'];
              } else {
                bookingEvent.STATUS = bookingStatus['002'];
              }
            } else {
              bookingEvent.STATUS = bookingStatus['003'];
            }
          }
          if (bookingEvent.CHECKIN) {
            bookingEvent.STATUS = bookingStatus['000'];
          }
        } else {
          const toDate = moment(bookingEvent.TO_DATE, 'YYYY-MM-DD');
          const fromDate = moment(bookingEvent.FROM_DATE, 'YYYY-MM-DD');
          if (bookingEvent.STATUS !== 'PENDING') {
            if (fromDate.isSame(now, 'day') && now.hour() >= 12) {
              bookingEvent.STATUS = bookingStatus['000'];
            } else if (now.isAfter(fromDate, 'day') && now.isBefore(toDate, 'day')) {
              bookingEvent.STATUS = bookingStatus['000'];
            } else if (toDate.isSame(now, 'day') && now.hour() < 12) {
              bookingEvent.STATUS = bookingStatus['000'];
            } else if ((toDate.isSame(now, 'day') && now.hour() >= 12) || toDate.isBefore(now, 'day')) {
              bookingEvent.STATUS = bookingStatus['003'];
            }
          }
        }
      }
    });
  }

  private updateTotalAvailability() {
    let days = [...calendar_dates.days];
    this.totalAvailabilityQueue.forEach(queue => {
      let selectedDate = new Date(queue.date);
      selectedDate.setMilliseconds(0);
      selectedDate.setSeconds(0);
      selectedDate.setMinutes(0);
      selectedDate.setHours(0);
      //find the selected day
      const index = days.findIndex(day => day.currentDate === selectedDate.getTime());
      if (index != -1) {
        //find room_type_id
        const room_type_index = days[index].rate.findIndex(room => room.id === queue.room_type_id);
        if (room_type_index != -1) {
          days[index].rate[room_type_index].exposed_inventory.rts = queue.availability;
        }
      }
    });
    calendar_dates.days = [...days];
  }

  private setRoomsData(roomServiceResp) {
    let roomsData: RoomDetail[] = new Array();
    if (roomServiceResp.My_Result?.roomtypes?.length) {
      roomsData = roomServiceResp.My_Result.roomtypes;
      roomServiceResp.My_Result.roomtypes.forEach(roomCategory => {
        roomCategory.expanded = true;
      });
    }
    calendar_data.roomsInfo = roomsData;
    this.calendarData.roomsInfo = roomsData;
  }

  private getLegendData(aData) {
    return aData['My_Result'].calendar_legends;
  }

  private getDateStr(date, locale = 'default') {
    return date.getDate() + ' ' + date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }

  private scrollToElement(goToDate) {
    this.scrollContainer = this.scrollContainer || this.element.querySelector('.calendarScrollContainer');
    const topLeftCell = this.element.querySelector('.topLeftCell');
    const gotoDay = this.element.querySelector('.day-' + goToDate);
    if (gotoDay) {
      this.scrollContainer.scrollTo({ left: 0 });
      const gotoRect = gotoDay.getBoundingClientRect();
      const containerRect = this.scrollContainer.getBoundingClientRect();
      const topLeftCellRect = topLeftCell.getBoundingClientRect();
      this.scrollContainer.scrollTo({
        left: gotoRect.left - containerRect.left - topLeftCellRect.width - gotoRect.width,
      });
    }
  }
  private AddOrUpdateRoomBookings(data: RoomBlockDetails[] | RoomBookingDetails[], pool: string | undefined = undefined) {
    let bookings = [...this.calendarData.bookingEvents];
    data.forEach(d => {
      if (!this.checkBookingAvailability(d)) {
        bookings = bookings.filter(booking => booking.ID !== d.ID);
      }
    });
    this.updateBookingEventsDateRange(data);
    if (pool) {
      bookings = bookings.filter(booking => booking.POOL === pool);
    }
    data.forEach(d => {
      if (!bookings.some(booking => booking.ID === d.ID)) {
        bookings.push(d);
      }
    });
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: bookings,
    };
  }
  private transformDateForScroll(date: Date) {
    return moment(date).format('D_M_YYYY');
  }

  shouldRenderCalendarView() {
    // console.log("rendering...")
    return this.calendarData && this.calendarData.days && this.calendarData.days.length;
  }
  onOptionSelect(event: CustomEvent<{ [key: string]: any }>) {
    const opt: { [key: string]: any } = event.detail;
    const calendarElement = this.element.querySelector('#iglooCalendar');
    switch (opt.key) {
      case 'showAssigned':
        calendarElement.classList.remove('showLegend');
        calendarElement.classList.remove('showToBeAssigned');
        calendarElement.classList.toggle('showToBeAssigned');

        this.showLegend = false;
        this.showToBeAssigned = true;
        break;
      case 'showLegend':
        calendarElement.classList.remove('showToBeAssigned');
        calendarElement.classList.remove('showLegend');
        calendarElement.classList.toggle('showLegend');

        this.showLegend = true;
        this.showToBeAssigned = false;
        break;
      case 'calendar':
        let dt = new Date();
        if (opt.data.start !== undefined && opt.data.end !== undefined) {
          dt = opt.data.start.toDate();
          this.handleDateSearch(opt.data);
        } else {
          //scroll to unassigned dates
          dt = new Date(opt.data);
          dt.setDate(dt.getDate() + 1);
          if (!opt?.noScroll) {
            this.scrollToElement(dt.getDate() + '_' + (dt.getMonth() + 1) + '_' + dt.getFullYear());
          }
        }
        this.highlightedDate = this.transformDateForScroll(dt);
        break;
      case 'search':
        break;
      case 'add':
        //console.log('data:', opt.data);
        if (opt.data.event_type !== 'EDIT_BOOKING') {
          this.bookingItem = opt.data;
        } else {
          this.editBookingItem = opt.data;
        }
        break;
      case 'gotoToday':
        this.scrollToElement(this.today);
        break;
      case 'closeSideMenu':
        this.closeSideMenu();
        this.highlightedDate = '';
        this.showBookProperty = false;
        break;
    }
  }

  private async addDatesToCalendar(fromDate: string, toDate: string) {
    const results = await this.bookingService.getCalendarData(this.property_id, fromDate, toDate);
    const newBookings = results.myBookings || [];
    this.updateBookingEventsDateRange(newBookings);
    if (new Date(fromDate).getTime() < new Date(this.calendarData.startingDate).getTime()) {
      this.calendarData.startingDate = new Date(fromDate).getTime();
      this.calendarData.from_date = fromDate;
      calendar_dates.fromDate = this.calendarData.from_date;
      this.days = [...results.days, ...this.days];
      let newMonths = [...results.months];
      if (this.calendarData.monthsInfo[0].monthName === results.months[results.months.length - 1].monthName) {
        this.calendarData.monthsInfo[0].daysCount = this.calendarData.monthsInfo[0].daysCount + results.months[results.months.length - 1].daysCount;
        newMonths.pop();
      }
      let bookings = JSON.parse(JSON.stringify(newBookings));
      bookings = bookings.filter(newBooking => {
        const existingBookingIndex = this.calendarData.bookingEvents.findIndex(event => event.ID === newBooking.ID);
        if (existingBookingIndex !== -1) {
          this.calendarData.bookingEvents[existingBookingIndex].FROM_DATE = newBooking.FROM_DATE;
          this.calendarData.bookingEvents[existingBookingIndex].NO_OF_DAYS = calculateDaysBetweenDates(
            newBooking.FROM_DATE,
            this.calendarData.bookingEvents[existingBookingIndex].TO_DATE,
          );
          return false;
        }
        return true;
      });
      calendar_dates.days = this.days as any;
      this.calendarData = {
        ...this.calendarData,
        days: this.days,
        monthsInfo: [...newMonths, ...this.calendarData.monthsInfo],
        bookingEvents: [...this.calendarData.bookingEvents, ...bookings],
      };
    } else {
      this.calendarData.endingDate = new Date(toDate).getTime();
      this.calendarData.to_date = toDate;
      calendar_dates.toDate = this.calendarData.to_date;
      let newMonths = [...results.months];
      this.days = [...this.days, ...results.days];
      if (this.calendarData.monthsInfo[this.calendarData.monthsInfo.length - 1].monthName === results.months[0].monthName) {
        this.calendarData.monthsInfo[this.calendarData.monthsInfo.length - 1].daysCount =
          this.calendarData.monthsInfo[this.calendarData.monthsInfo.length - 1].daysCount + results.months[0].daysCount;
        newMonths.shift();
      }
      let bookings = JSON.parse(JSON.stringify(newBookings));
      bookings = bookings.filter(newBooking => {
        const existingBookingIndex = this.calendarData.bookingEvents.findIndex(event => event.ID === newBooking.ID);
        if (existingBookingIndex !== -1) {
          this.calendarData.bookingEvents[existingBookingIndex].TO_DATE = newBooking.TO_DATE;
          this.calendarData.bookingEvents[existingBookingIndex].NO_OF_DAYS = calculateDaysBetweenDates(
            this.calendarData.bookingEvents[existingBookingIndex].FROM_DATE,
            newBooking.TO_DATE,
          );
          return false;
        }
        return true;
      });
      calendar_dates.days = this.days as any;
      //calendar_dates.months = bookingResp.months;
      this.calendarData = {
        ...this.calendarData,
        days: this.days,
        monthsInfo: [...this.calendarData.monthsInfo, ...newMonths],
        bookingEvents: [...this.calendarData.bookingEvents, ...bookings],
      };
      const data = await this.toBeAssignedService.getUnassignedDates(this.property_id, fromDate, toDate);
      this.calendarData.unassignedDates = { ...this.calendarData.unassignedDates, ...data };
      this.unassignedDates = {
        fromDate,
        toDate,
        data,
      };
      addUnassignedDates(data);
    }
  }
  async handleDateSearch(dates: { start: Moment; end: Moment }) {
    const startDate = moment(dates.start).toDate();
    const defaultFromDate = moment(this.calDates.from).toDate();
    const endDate = dates.end.toDate();
    const defaultToDate = this.calendarData.endingDate;
    if (startDate.getTime() < new Date(this.calDates.from).getTime()) {
      await this.addDatesToCalendar(moment(startDate).add(-1, 'days').format('YYYY-MM-DD'), moment(defaultFromDate).add(-1, 'days').format('YYYY-MM-DD'));
      this.calDates = { ...this.calDates, from: dates.start.add(-1, 'days').format('YYYY-MM-DD') };
      this.scrollToElement(this.transformDateForScroll(startDate));
    } else if (startDate.getTime() > defaultFromDate.getTime() && startDate.getTime() < defaultToDate && endDate.getTime() < defaultToDate) {
      this.scrollToElement(this.transformDateForScroll(startDate));
    } else if (startDate.getTime() > defaultToDate) {
      const nextDay = getNextDay(new Date(this.calendarData.endingDate));
      await this.addDatesToCalendar(nextDay, moment(endDate).add(2, 'months').format('YYYY-MM-DD'));
      this.scrollToElement(this.transformDateForScroll(startDate));
    }
  }

  private closeSideMenu() {
    const calendarElement = this.element.querySelector('#iglooCalendar');
    calendarElement.classList.remove('showToBeAssigned');
    calendarElement.classList.remove('showLegend');

    this.showLegend = false;
    this.showToBeAssigned = false;
  }

  private scrollViewDragPos = { top: 0, left: 0, x: 0, y: 0 };
  private dragScrollContent(event: MouseEvent) {
    this.scrollViewDragging = false;
    let isPreventPageScroll = event && event.target ? this.hasAncestorWithClass(event.target as HTMLElement, 'preventPageScroll') : false;
    if (!isPreventPageScroll && event.buttons === 1) {
      this.scrollViewDragPos = {
        left: this.scrollContainer.scrollLeft,
        top: this.scrollContainer.scrollTop,
        x: event.clientX,
        y: event.clientY,
      };
      document.addEventListener('mousemove', this.onScrollContentMoveHandler);
      document.addEventListener('mouseup', this.onScrollContentMoveEndHandler);
    }
  }

  private onScrollContentMoveHandler: EventListener = (event: MouseEvent) => {
    if (event.buttons !== 1) {
      return;
    }

    const dx = event.clientX - this.scrollViewDragPos.x;
    const dy = event.clientY - this.scrollViewDragPos.y;

    this.scrollContainer.scrollTop = this.scrollViewDragPos.top - dy;
    this.scrollContainer.scrollLeft = this.scrollViewDragPos.left - dx;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      this.scrollViewDragging = true;
    }
  };

  private onScrollContentMoveEndHandler: EventListener = () => {
    document.removeEventListener('mousemove', this.onScrollContentMoveHandler);
    document.removeEventListener('mouseup', this.onScrollContentMoveEndHandler);
  };

  private calendarScrolling() {
    if (this.scrollContainer) {
      if (this.highlightedDate) {
        const highlightedElement = document.querySelector(`.day-${this.highlightedDate}`);
        if (highlightedElement) {
          const { left, right } = highlightedElement.getBoundingClientRect();
          const isVisible = left >= 0 && right <= window.innerWidth;
          if (!isVisible) {
            this.highlightedDate = '';
          }
        }
      }
      const containerRect = this.scrollContainer.getBoundingClientRect();
      let leftSideMenuSize = 170;
      let maxWidth = containerRect.width - leftSideMenuSize;
      let leftX = containerRect.x + leftSideMenuSize;
      let rightX = containerRect.x + containerRect.width;

      let cells = Array.from(this.element.querySelectorAll('.monthCell')) as HTMLElement[];

      if (cells.length) {
        cells.map(async (monthContainer: HTMLElement) => {
          let monthRect = monthContainer.getBoundingClientRect();
          if (cells.indexOf(monthContainer) === cells.length - 1) {
            if (monthRect.x + monthRect.width <= rightX && !this.reachedEndOfCalendar) {
              this.reachedEndOfCalendar = true;
              //await this.addNextTwoMonthsToCalendar();
              const nextTwoMonths = addTwoMonthToDate(new Date(this.calendarData.endingDate));
              const nextDay = getNextDay(new Date(this.calendarData.endingDate));
              await this.addDatesToCalendar(nextDay, nextTwoMonths);
              this.reachedEndOfCalendar = false;
            }
          }
          if (monthRect.x + monthRect.width < leftX) {
            // item end is scrolled outside view, in -x
          } else if (monthRect.x > rightX) {
            // item is outside scrollview, in +x
          } else {
            let titleElement = monthContainer.querySelector('.monthTitle') as HTMLElement;
            let marginLeft = 0;
            let monthWidth = monthRect.width;
            if (monthRect.x < leftX) {
              marginLeft = Math.abs(monthRect.x) - leftX;
              marginLeft = monthRect.x < 0 ? Math.abs(monthRect.x) + leftX : Math.abs(marginLeft);
              monthWidth = monthRect.x + monthRect.width > rightX ? maxWidth : monthRect.x + monthRect.width - leftX;
            } else {
              monthWidth = maxWidth - monthWidth > monthWidth ? monthWidth : maxWidth - monthRect.x + leftX;
            }
            titleElement.style.marginLeft = marginLeft + 'px';
            titleElement.style.width = monthWidth + 'px';
          }
        });
      }
    }
  }

  private hasAncestorWithClass(element: HTMLElement, className: string): boolean {
    let currentElement = element;
    while (currentElement !== null) {
      if (currentElement.matches(`.${className}`)) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }

  private async highlightDragOver(hightLightElement, currentPosition) {
    let xElement, yElement;
    if (currentPosition) {
      xElement = this.visibleCalendarCells.x.find(pos => pos.left < currentPosition.x && currentPosition.x <= pos.left + pos.width);
      yElement = this.visibleCalendarCells.y.find(pos => pos.top < currentPosition.y && currentPosition.y <= pos.top + pos.height);
    }
    // console.log(hightLightElement+":::"+yElement.id+"_"+xElement.id);
    if (hightLightElement && xElement && yElement) {
      this.dragOverHighlightElement.emit({
        dragOverElement: yElement.id + '_' + xElement.id,
      });
    } else {
      this.dragOverHighlightElement.emit({ dragOverElement: '' });
    }
    if (!hightLightElement) {
      this.moveBookingTo.emit({
        bookingId: currentPosition.id,
        fromRoomId: currentPosition.fromRoomId,
        toRoomId: (yElement && yElement.id) || 'revert',
        moveToDay: (xElement && xElement.id) || 'revert',
        pool: currentPosition.pool,
        from_date: convertDMYToISO(xElement && xElement.id),
        to_date: computeEndDate(xElement && xElement.id, currentPosition.nbOfDays),
      });
    }
  }
  private handleModalConfirm() {
    // Helper to reset modal state
    const resetModalState = () => {
      this.dialogData = null;
    };

    try {
      switch (this.dialogData?.reason) {
        case 'checkin':
        case 'checkout': {
          const { bookingNumber, roomIdentifier } = this.dialogData;
          const status = this.dialogData.reason === 'checkin' ? '001' : '002';
          this.bookingService.handleExposedRoomInOut({ booking_nbr: bookingNumber, room_identifier: roomIdentifier, status }).finally(resetModalState);
          if (this.dialogData.reason === 'checkin') {
            this.openCalendarSidebar.emit({ type: 'room-guests', payload: this.dialogData.sidebarPayload });
          }
          break;
        }
        case 'reallocate': {
          if (!this.dialogData) {
            console.warn('No dialog data available for reallocation.');
            return;
          }
          const { pool, toRoomId, from_date, to_date } = this.dialogData;

          // Handle room reallocation
          this.eventsService
            .reallocateEvent(pool, toRoomId, from_date, to_date)
            .then(resetModalState)
            .catch(() => {
              console.error('Reallocation failed. Reverting booking.');
              this.revertBooking.emit(pool);
            })
            .finally(resetModalState);
          break;
        }

        default:
          resetModalState();
          break;
      }
    } catch (error) {
      console.error('Error handling modal confirm:', error);
      resetModalState();
    }
  }
  private handleModalCancel() {
    if (this.dialogData?.reason === 'reallocate') {
      this.revertBooking.emit(this.dialogData.pool);
    }
    this.dialogData = null;
  }
  private handleRoomNightsDialogClose(e: CustomEvent<IRoomNightsDataEventPayload>) {
    if (e.detail.type === 'cancel') {
      this.revertBooking.emit(this.roomNightsData.pool);
    }
    this.roomNightsData = null;
  }
  private handleSideBarToggle(e: CustomEvent<boolean>) {
    if (e.detail) {
      this.calendarSidebarState = null;
      if (this.editBookingItem) {
        this.editBookingItem = null;
      }
      if (this.roomNightsData) {
        this.revertBooking.emit(this.roomNightsData.pool);
        this.roomNightsData = null;
      }
      if (this.dialogData?.reason === 'reallocate') {
        this.revertBooking.emit(this.dialogData.pool);
        this.dialogData = null;
      }
    }
  }
  private handleCloseBookingWindow() {
    this.bookingItem = null;
  }
  render() {
    // if (!this.isAuthenticated) {
    //   return <ir-login onAuthFinish={() => this.auth.setIsAuthenticated(true)}></ir-login>;
    // }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <div id="iglooCalendar" class="igl-calendar">
          {this.shouldRenderCalendarView() ? (
            [
              this.showToBeAssigned ? (
                <igl-to-be-assigned
                  unassignedDatesProp={this.unassignedDates}
                  to_date={this.to_date}
                  from_date={this.from_date}
                  propertyid={this.property_id}
                  class="tobeAssignedContainer"
                  calendarData={this.calendarData}
                  onOptionEvent={evt => this.onOptionSelect(evt)}
                ></igl-to-be-assigned>
              ) : null,
              this.showLegend ? (
                <igl-legends class="legendContainer" legendData={this.calendarData.legendData} onOptionEvent={evt => this.onOptionSelect(evt)}></igl-legends>
              ) : null,
              <div class="calendarScrollContainer" onMouseDown={event => this.dragScrollContent(event)} onScroll={() => this.calendarScrolling()}>
                <div id="calendarContainer">
                  <igl-cal-header
                    unassignedDates={this.unassignedDates}
                    to_date={this.to_date}
                    propertyid={this.property_id}
                    today={this.today}
                    calendarData={this.calendarData}
                    highlightedDate={this.highlightedDate}
                    onOptionEvent={evt => this.onOptionSelect(evt)}
                  ></igl-cal-header>
                  <igl-cal-body
                    propertyId={this.property_id}
                    language={this.language}
                    countries={this.countries}
                    currency={this.calendarData.currency}
                    today={this.today}
                    highlightedDate={this.highlightedDate}
                    isScrollViewDragging={this.scrollViewDragging}
                    calendarData={this.calendarData}
                  ></igl-cal-body>
                  <igl-cal-footer
                    highlightedDate={this.highlightedDate}
                    today={this.today}
                    calendarData={this.calendarData}
                    onOptionEvent={evt => this.onOptionSelect(evt)}
                  ></igl-cal-footer>
                </div>
              </div>,
            ]
          ) : (
            <ir-loading-screen message="Preparing Calendar Data"></ir-loading-screen>
          )}
        </div>
        {this.bookingItem && (
          <igl-book-property
            allowedBookingSources={this.calendarData.allowedBookingSources}
            adultChildConstraints={this.calendarData.adultChildConstraints}
            showPaymentDetails={this.showPaymentDetails}
            countries={this.countries}
            currency={this.calendarData.currency}
            language={this.language}
            propertyid={this.property_id}
            bookingData={this.bookingItem}
            onCloseBookingWindow={() => this.handleCloseBookingWindow()}
          ></igl-book-property>
        )}
        <ir-sidebar
          onIrSidebarToggle={this.handleSideBarToggle.bind(this)}
          open={!!this.calendarSidebarState || this.roomNightsData !== null || (this.editBookingItem && this.editBookingItem.event_type === 'EDIT_BOOKING')}
          showCloseButton={false}
          sidebarStyles={{
            width: this.calendarSidebarState?.type === 'room-guests' ? '60rem' : this.editBookingItem ? '80rem' : 'var(--sidebar-width,40rem)',
            background: this.editBookingItem ? '#F2F3F8' : 'white',
          }}
        >
          {this.roomNightsData && (
            <ir-room-nights
              slot="sidebar-body"
              pool={this.roomNightsData.pool}
              onCloseRoomNightsDialog={this.handleRoomNightsDialogClose.bind(this)}
              language={this.language}
              bookingNumber={this.roomNightsData.bookingNumber}
              identifier={this.roomNightsData.identifier}
              toDate={this.roomNightsData.to_date}
              fromDate={this.roomNightsData.from_date}
              defaultDates={this.roomNightsData.defaultDates}
              ticket={this.ticket}
              propertyId={this.property_id}
            ></ir-room-nights>
          )}
          {this.editBookingItem && this.editBookingItem.event_type === 'EDIT_BOOKING' && (
            <ir-booking-details
              slot="sidebar-body"
              hasPrint
              hasReceipt
              hasCloseButton
              onCloseSidebar={() => (this.editBookingItem = null)}
              is_from_front_desk
              propertyid={this.property_id}
              hasRoomEdit
              hasRoomDelete
              bookingNumber={this.editBookingItem.BOOKING_NUMBER}
              ticket={this.ticket}
              language={this.language}
              hasRoomAdd
            ></ir-booking-details>
          )}
          {this.calendarSidebarState?.type === 'room-guests' && (
            <ir-room-guests
              countries={this.countries}
              language={this.language}
              identifier={this.calendarSidebarState?.payload?.identifier}
              bookingNumber={this.calendarSidebarState?.payload.bookingNumber}
              roomName={this.calendarSidebarState?.payload?.roomName}
              totalGuests={this.calendarSidebarState?.payload?.totalGuests}
              sharedPersons={this.calendarSidebarState?.payload?.sharing_persons}
              slot="sidebar-body"
              checkIn={this.calendarSidebarState?.payload?.checkin}
              onCloseModal={() => (this.calendarSidebarState = null)}
            ></ir-room-guests>
          )}
        </ir-sidebar>
        <ir-modal
          ref={el => (this.calendarModalEl = el)}
          modalTitle={''}
          rightBtnActive={this.dialogData?.reason === 'reallocate' ? !this.dialogData.hideConfirmButton : true}
          leftBtnText={locales?.entries?.Lcz_Cancel}
          rightBtnText={locales?.entries?.Lcz_Confirm}
          modalBody={this.renderModalBody()}
          onConfirmModal={this.handleModalConfirm.bind(this)}
          onCancelModal={this.handleModalCancel.bind(this)}
        ></ir-modal>
      </Host>
    );
  }
}
