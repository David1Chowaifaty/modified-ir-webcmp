import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { addTwoMonthToDate, computeEndDate, convertDMYToISO, dateToFormattedString, formatLegendColors, getNextDay } from '../../utils/utils';
import io from 'socket.io-client';
import axios from 'axios';
import { EventsService } from '../../services/events.service';
import { ICountry, RoomBlockDetails, RoomBookingDetails, bookingReasons } from '../../models/IBooking';
import moment, { Moment } from 'moment';
import { ToBeAssignedService } from '../../services/toBeAssigned.service';
import { transformNewBLockedRooms, transformNewBooking } from '../../utils/booking';
import { IReallocationPayload, IRoomNightsData, IRoomNightsDataEventPayload } from '../../models/property-types';
// import { store } from '../../redux/store';
// import { addCalendarData } from '../../redux/features/calendarData';
// import { CalendarDataDetails } from '../../models/calendarData';
import { TIglBookPropertyPayload } from '../../models/igl-book-property';

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
  @Prop() baseurl: string;
  @Prop() loadingMessage: string;
  @Prop() currencyName: string;
  @Prop({ reflect: true }) ticket: string = '';
  @Element() private element: HTMLElement;
  @Event({ bubbles: true, composed: true })
  dragOverHighlightElement: EventEmitter;
  @Event({ bubbles: true, composed: true }) moveBookingTo: EventEmitter;
  @Event() calculateUnassignedDates: EventEmitter;
  @State() calendarData: { [key: string]: any } = new Object();
  @State() days: { [key: string]: any }[] = new Array();
  @State() scrollViewDragging: boolean = false;
  @State() dialogData: IReallocationPayload | null = null;
  @State() bookingItem: TIglBookPropertyPayload | null = null;
  @State() editBookingItem: TIglBookPropertyPayload | null = null;
  @State() showLegend: boolean = false;
  @State() showPaymentDetails: boolean = false;
  @State() showToBeAssigned: boolean = false;
  @State() unassignedDates = {};
  @State() roomNightsData: IRoomNightsData | null = null;
  @State() renderAgain = false;
  @Event({ bubbles: true, composed: true })
  reduceAvailableUnitEvent: EventEmitter<{ fromDate: string; toDate: string }>;
  @Event({ bubbles: true }) revertBooking: EventEmitter;
  private bookingService: BookingService = new BookingService();
  private countryNodeList: ICountry[] = [];
  private visibleCalendarCells: { x: any[]; y: any[] } = { x: [], y: [] };
  private scrollContainer: HTMLElement;
  private today: String = '';
  private roomService: RoomService = new RoomService();
  private eventsService = new EventsService();
  private toBeAssignedService = new ToBeAssignedService();
  private socket: any;
  private reachedEndOfCalendar = false;
  private defaultTexts: any;
  @State() showBookProperty: boolean = false;
  @Watch('ticket')
  ticketChanged() {
    sessionStorage.setItem('token', JSON.stringify(this.ticket));
    this.initializeApp();
  }

  componentWillLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }

    if (this.ticket !== '') {
      this.initializeApp();
    }
  }
  async initializeApp() {
    try {
      this.defaultTexts = await this.roomService.fetchLanguage(this.language);
      console.log('language', this.defaultTexts);
      this.roomService.fetchData(this.propertyid, this.language).then(roomResp => {
        this.setRoomsData(roomResp);
        this.bookingService.getCalendarData(this.propertyid, this.from_date, this.to_date).then(async bookingResp => {
          this.countryNodeList = await this.bookingService.getCountries(this.language);
          this.calendarData.currency = roomResp['My_Result'].currency;
          this.calendarData.allowedBookingSources = roomResp['My_Result'].allowed_booking_sources;
          this.calendarData.adultChildConstraints = roomResp['My_Result'].adult_child_constraints;
          this.calendarData.legendData = this.getLegendData(roomResp);
          this.calendarData.is_vacation_rental = roomResp['My_Result'].is_vacation_rental;
          this.calendarData.startingDate = new Date(bookingResp.My_Params_Get_Rooming_Data.FROM).getTime();
          this.calendarData.endingDate = new Date(bookingResp.My_Params_Get_Rooming_Data.TO).getTime();
          this.calendarData.formattedLegendData = formatLegendColors(this.calendarData.legendData);
          this.calendarData.bookingEvents = bookingResp.myBookings || [];
          this.calendarData.toBeAssignedEvents = [];
          let paymentMethods = roomResp['My_Result']['allowed_payment_methods'] as any[];
          this.showPaymentDetails = paymentMethods.some(item => item.code === '001' || item.code === '004');
          this.updateBookingEventsDateRange(this.calendarData.bookingEvents);
          this.updateBookingEventsDateRange(this.calendarData.toBeAssignedEvents);
          this.today = this.transformDateForScroll(new Date());
          let startingDay: Date = new Date(this.getStartingDateOfCalendar());
          startingDay.setHours(0, 0, 0, 0);
          this.days = bookingResp.days;
          this.calendarData.days = this.days;
          this.calendarData.monthsInfo = bookingResp.months;
          setTimeout(() => {
            this.scrollToElement(this.today);
          }, 200);
          if (!this.calendarData.is_vacation_rental) {
            const data = await this.toBeAssignedService.getUnassignedDates(this.propertyid, dateToFormattedString(new Date()), this.to_date);
            this.unassignedDates = { fromDate: this.from_date, toDate: this.to_date, data: { ...this.unassignedDates, ...data } };
            this.calendarData = { ...this.calendarData, unassignedDates: data };
          }
          this.socket = io('https://realtime.igloorooms.com/');
          this.socket.on('MSG', async msg => {
            let msgAsObject = JSON.parse(msg);
            if (msgAsObject) {
              const { REASON, KEY, PAYLOAD }: { REASON: bookingReasons; KEY: any; PAYLOAD: any } = msgAsObject;
              if (KEY.toString() === this.propertyid.toString()) {
                let result: any;
                if (REASON === 'DELETE_CALENDAR_POOL' || REASON === 'GET_UNASSIGNED_DATES') {
                  result = PAYLOAD;
                } else {
                  result = JSON.parse(PAYLOAD);
                }
                console.log(result, REASON);
                const resasons: bookingReasons[] = ['DORESERVATION', 'BLOCK_EXPOSED_UNIT', 'ASSIGN_EXPOSED_ROOM', 'REALLOCATE_EXPOSED_ROOM_BLOCK'];
                if (resasons.includes(REASON)) {
                  let transformedBooking: RoomBookingDetails[] | RoomBlockDetails[];
                  if (REASON === 'BLOCK_EXPOSED_UNIT' || REASON === 'REALLOCATE_EXPOSED_ROOM_BLOCK') {
                    transformedBooking = [await transformNewBLockedRooms(result)];
                  } else {
                    transformedBooking = transformNewBooking(result);
                  }
                  this.AddOrUpdateRoomBookings(transformedBooking, undefined);
                } else if (REASON === 'DELETE_CALENDAR_POOL') {
                  this.calendarData = {
                    ...this.calendarData,
                    bookingEvents: this.calendarData.bookingEvents.filter(e => e.POOL !== result),
                  };
                } else if (REASON === 'GET_UNASSIGNED_DATES') {
                  function parseDateRange(str: string): Record<string, string> {
                    const result: Record<string, string> = {};
                    const pairs = str.split('|');

                    pairs.forEach(pair => {
                      const res = pair.split(':');
                      result[res[0]] = res[1];
                    });
                    return result;
                  }
                  const parsedResult = parseDateRange(result);
                  if (
                    !this.calendarData.is_vacation_rental &&
                    new Date(parsedResult.FROM_DATE).getTime() >= this.calendarData.startingDate &&
                    new Date(parsedResult.TO_DATE).getTime() <= this.calendarData.endingDate
                  ) {
                    const data = await this.toBeAssignedService.getUnassignedDates(
                      this.propertyid,
                      dateToFormattedString(new Date(parsedResult.FROM_DATE)),
                      dateToFormattedString(new Date(parsedResult.TO_DATE)),
                    );
                    this.calendarData.unassignedDates = { ...this.calendarData.unassignedDates, ...data };
                    this.unassignedDates = {
                      fromDate: dateToFormattedString(new Date(parsedResult.FROM_DATE)),
                      toDate: dateToFormattedString(new Date(parsedResult.TO_DATE)),
                      data,
                    };
                    if (Object.keys(data).length === 0) {
                      this.reduceAvailableUnitEvent.emit({
                        fromDate: dateToFormattedString(new Date(parsedResult.FROM_DATE)),
                        toDate: dateToFormattedString(new Date(parsedResult.TO_DATE)),
                      });
                    }
                  }
                } else {
                  return;
                }
              }
            }
          });
        });
      });
    } catch (error) {}
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
  checkBookingAvailability(data) {
    return this.calendarData.bookingEvents.some(
      booking => booking.ID === data.ID || (booking.FROM_DATE === data.FROM_DATE && booking.TO_DATE === data.TO_DATE && booking.PR_ID === data.PR_ID),
    );
  }
  updateBookingEventsDateRange(eventData) {
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
    });
  }
  setRoomsData(roomServiceResp) {
    let roomsData: { [key: string]: any }[] = new Array();
    if (roomServiceResp.My_Result?.roomtypes?.length) {
      roomsData = roomServiceResp.My_Result.roomtypes;
      roomServiceResp.My_Result.roomtypes.forEach(roomCategory => {
        roomCategory.expanded = true;
      });
    }
    this.calendarData.roomsInfo = roomsData;
  }

  getLegendData(aData) {
    return aData['My_Result'].calendar_legends;
  }

  getStartingDateOfCalendar() {
    return this.calendarData.startingDate;
  }

  getEndingDateOfCalendar() {
    return this.calendarData.endingDate;
  }

  getDay(dt) {
    const currentDate = new Date(dt);
    const locale = 'en-US';
    const dayOfWeek = this.getLocalizedDayOfWeek(currentDate, locale);
    return dayOfWeek + ' ' + currentDate.getDate();
  }

  getLocalizedDayOfWeek(date, locale) {
    const options = { weekday: 'short' };
    return date.toLocaleDateString(locale, options);
  }

  getLocalizedMonth(date, locale = 'default') {
    return date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }
  getDateStr(date, locale = 'default') {
    return date.getDate() + ' ' + date.toLocaleString(locale, { month: 'short' }) + ' ' + date.getFullYear();
  }
  scrollToElement(goToDate) {
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
  private AddOrUpdateRoomBookings(data: RoomBlockDetails[] | RoomBookingDetails[], pool: string | undefined) {
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
    this.dialogData = event.detail;
    let modal = this.element.querySelector('ir-modal');
    if (modal) {
      modal.openModal();
    }
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
        if (opt.data.start !== undefined && opt.data.end !== undefined) {
          this.handleDateSearch(opt.data);
        } else {
          let dt = new Date(opt.data);
          this.scrollToElement(dt.getDate() + '_' + (dt.getMonth() + 1) + '_' + dt.getFullYear());
        }
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
        this.showBookProperty = false;
        break;
    }
  }
  async addDatesToCalendar(fromDate: string, toDate: string) {
    const results = await this.bookingService.getCalendarData(this.propertyid, fromDate, toDate);
    const newBookings = results.myBookings || [];
    this.updateBookingEventsDateRange(newBookings);
    if (new Date(fromDate).getTime() < new Date(this.calendarData.startingDate).getTime()) {
      this.calendarData.startingDate = new Date(fromDate).getTime();
      this.days = [...results.days, ...this.days];
      let newMonths = [...results.months];
      if (this.calendarData.monthsInfo[0].monthName === results.months[results.months.length - 1].monthName) {
        this.calendarData.monthsInfo[0].daysCount = this.calendarData.monthsInfo[0].daysCount + results.months[results.months.length - 1].daysCount;
        newMonths.pop();
      }
      this.calendarData = {
        ...this.calendarData,
        days: this.days,
        monthsInfo: [...newMonths, ...this.calendarData.monthsInfo],
        bookingEvents: [...this.calendarData.bookingEvents, ...newBookings],
      };
    } else {
      this.calendarData.endingDate = new Date(toDate).getTime();
      let newMonths = [...results.months];
      this.days = [...this.days, ...results.days];
      if (this.calendarData.monthsInfo[this.calendarData.monthsInfo.length - 1].monthName === results.months[0].monthName) {
        this.calendarData.monthsInfo[this.calendarData.monthsInfo.length - 1].daysCount =
          this.calendarData.monthsInfo[this.calendarData.monthsInfo.length - 1].daysCount + results.months[0].daysCount;
        newMonths.shift();
      }
      this.calendarData = {
        ...this.calendarData,
        days: this.days,
        monthsInfo: [...this.calendarData.monthsInfo, ...newMonths],
        bookingEvents: [...this.calendarData.bookingEvents, ...newBookings],
      };
    }
    const data = await this.toBeAssignedService.getUnassignedDates(this.propertyid, fromDate, toDate);
    this.calendarData.unassignedDates = { ...this.calendarData.unassignedDates, ...data };
    this.unassignedDates = {
      fromDate,
      toDate,
      data,
    };
  }
  async handleDateSearch(dates: { start: Moment; end: Moment }) {
    const startDate = moment(dates.start).toDate();
    const defaultFromDate = moment(this.from_date).toDate();
    const endDate = dates.end.toDate();
    const defaultToDate = this.calendarData.endingDate;
    if (startDate.getTime() < new Date(this.from_date).getTime()) {
      await this.addDatesToCalendar(moment(startDate).add(-1, 'days').format('YYYY-MM-DD'), moment(this.from_date).add(-1, 'days').format('YYYY-MM-DD'));
      this.scrollToElement(this.transformDateForScroll(startDate));
    } else if (startDate.getTime() > defaultFromDate.getTime() && startDate.getTime() < defaultToDate && endDate.getTime() < defaultToDate) {
      this.scrollToElement(this.transformDateForScroll(startDate));
    } else if (startDate.getTime() > defaultToDate) {
      const nextDay = getNextDay(new Date(this.calendarData.endingDate));
      await this.addDatesToCalendar(nextDay, moment(endDate).add(2, 'months').format('YYYY-MM-DD'));
      this.scrollToElement(this.transformDateForScroll(startDate));
    }
  }

  closeSideMenu() {
    const calendarElement = this.element.querySelector('#iglooCalendar');
    calendarElement.classList.remove('showToBeAssigned');
    calendarElement.classList.remove('showLegend');

    this.showLegend = false;
    this.showToBeAssigned = false;
  }

  scrollViewDragPos = { top: 0, left: 0, x: 0, y: 0 };
  dragScrollContent(event: MouseEvent) {
    this.scrollViewDragging = false;
    let isPreventPageScroll = event && event.target ? this.hasAncestorWithClass(event.target as HTMLElement, 'preventPageScroll') : false;
    if (!isPreventPageScroll) {
      this.scrollViewDragPos = {
        // The current scroll
        left: this.scrollContainer.scrollLeft,
        top: this.scrollContainer.scrollTop,
        // Get the current mouse position
        x: event.clientX,
        y: event.clientY,
      };
      document.addEventListener('mousemove', this.onScrollContentMoveHandler);
      document.addEventListener('mouseup', this.onScrollContentMoveEndHandler);
    }
  }

  onScrollContentMoveHandler: EventListener = (event: MouseEvent) => {
    // How far the mouse has been moved
    const dx = event.clientX - this.scrollViewDragPos.x;
    const dy = event.clientY - this.scrollViewDragPos.y;

    // Scroll the element
    this.scrollContainer.scrollTop = this.scrollViewDragPos.top - dy;
    this.scrollContainer.scrollLeft = this.scrollViewDragPos.left - dx;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      this.scrollViewDragging = true;
    }
  };

  onScrollContentMoveEndHandler: EventListener = () => {
    document.removeEventListener('mousemove', this.onScrollContentMoveHandler);
    document.removeEventListener('mouseup', this.onScrollContentMoveEndHandler);
  };

  calendarScrolling() {
    if (this.scrollContainer) {
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

  hasAncestorWithClass(element: HTMLElement, className: string): boolean {
    let currentElement = element;
    while (currentElement !== null) {
      if (currentElement.matches(`.${className}`)) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
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

  async highlightDragOver(hightLightElement, currentPosition) {
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
  handleModalConfirm() {
    const { pool, toRoomId, from_date, to_date } = this.dialogData;
    this.eventsService
      .reallocateEvent(pool, toRoomId, from_date, to_date)
      .then(() => {
        this.dialogData = null;
      })
      .catch(() => {
        this.revertBooking.emit(pool);
      });
  }
  handleModalCancel() {
    this.revertBooking.emit(this.dialogData.pool);
    this.dialogData = null;
  }
  handleRoomNightsDialogClose(e: CustomEvent<IRoomNightsDataEventPayload>) {
    if (e.detail.type === 'cancel') {
      this.revertBooking.emit(this.roomNightsData.pool);
    }
    this.roomNightsData = null;
  }
  handleSideBarToggle(e: CustomEvent<boolean>) {
    if (e.detail) {
      if (this.editBookingItem) {
        this.editBookingItem = null;
      }
      if (this.roomNightsData) {
        this.revertBooking.emit(this.roomNightsData.pool);
        this.roomNightsData = null;
      }
      if (this.dialogData) {
        this.revertBooking.emit(this.dialogData.pool);
        this.dialogData = null;
      }
    }
  }
  handleCloseBookingWindow() {
    this.bookingItem = null;
  }
  render() {
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <ir-common></ir-common>
        <div id="iglooCalendar" class="igl-calendar">
          {this.shouldRenderCalendarView() ? (
            [
              this.showToBeAssigned ? (
                <igl-to-be-assigned
                  unassignedDatesProp={this.unassignedDates}
                  to_date={this.to_date}
                  from_date={this.from_date}
                  propertyid={this.propertyid}
                  class="tobeAssignedContainer"
                  calendarData={this.calendarData}
                  onOptionEvent={evt => this.onOptionSelect(evt)}
                ></igl-to-be-assigned>
              ) : null,
              this.showLegend ? (
                <igl-legends
                  defaultTexts={this.defaultTexts}
                  class="legendContainer"
                  legendData={this.calendarData.legendData}
                  onOptionEvent={evt => this.onOptionSelect(evt)}
                ></igl-legends>
              ) : null,
              <div class="calendarScrollContainer" onMouseDown={event => this.dragScrollContent(event)} onScroll={() => this.calendarScrolling()}>
                <div id="calendarContainer">
                  <igl-cal-header
                    unassignedDates={this.unassignedDates}
                    to_date={this.to_date}
                    propertyid={this.propertyid}
                    today={this.today}
                    calendarData={this.calendarData}
                    onOptionEvent={evt => this.onOptionSelect(evt)}
                  ></igl-cal-header>
                  <igl-cal-body
                    language={this.language}
                    countryNodeList={this.countryNodeList}
                    currency={this.calendarData.currency}
                    today={this.today}
                    isScrollViewDragging={this.scrollViewDragging}
                    calendarData={this.calendarData}
                  ></igl-cal-body>
                  <igl-cal-footer today={this.today} calendarData={this.calendarData} onOptionEvent={evt => this.onOptionSelect(evt)}></igl-cal-footer>
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
            countryNodeList={this.countryNodeList}
            currency={this.calendarData.currency}
            language={this.language}
            propertyid={this.propertyid}
            bookingData={this.bookingItem}
            onCloseBookingWindow={() => this.handleCloseBookingWindow()}
          ></igl-book-property>
        )}
        <ir-sidebar
          onIrSidebarToggle={this.handleSideBarToggle.bind(this)}
          open={this.roomNightsData !== null || (this.editBookingItem && this.editBookingItem.event_type === 'EDIT_BOOKING')}
          showCloseButton={this.editBookingItem !== null}
        >
          {this.roomNightsData && (
            <ir-room-nights
              pool={this.roomNightsData.pool}
              onCloseRoomNightsDialog={this.handleRoomNightsDialogClose.bind(this)}
              language={this.language}
              bookingNumber={this.roomNightsData.bookingNumber}
              identifier={this.roomNightsData.identifier}
              toDate={this.roomNightsData.to_date}
              fromDate={this.roomNightsData.from_date}
              ticket={this.ticket}
              propertyId={this.propertyid}
            ></ir-room-nights>
          )}
          {this.editBookingItem && this.editBookingItem.event_type === 'EDIT_BOOKING' && (
            <ir-booking-details
              propertyid={this.propertyid}
              hasRoomEdit
              hasRoomDelete
              bookingNumber={this.editBookingItem.BOOKING_NUMBER}
              ticket={this.ticket}
              baseurl={this.baseurl}
              language={this.language}
            ></ir-booking-details>
          )}
        </ir-sidebar>
        <ir-modal
          modalTitle={`${this.defaultTexts?.entries.Lcz_Confirmation}!`}
          rightBtnActive={this.dialogData ? !this.dialogData.hideConfirmButton : true}
          leftBtnText={this.defaultTexts?.entries.Lcz_Cancel}
          rightBtnText={this.defaultTexts?.entries.Lcz_Ok}
          modalBody={this.dialogData ? this.dialogData.description : ''}
          onConfirmModal={this.handleModalConfirm.bind(this)}
          onCancelModal={this.handleModalCancel.bind(this)}
        ></ir-modal>
      </Host>
    );
  }
}
