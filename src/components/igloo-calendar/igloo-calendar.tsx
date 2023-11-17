import { Component, Element, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { RoomService } from '../../services/room.service';
import { BookingService } from '../../services/booking.service';
import { computeEndDate, convertDMYToISO, dateToFormattedString, formatLegendColors } from '../../utils/utils';

import axios from 'axios';
import { EventsService } from '../../services/events.service';
import { ICountry, RoomBlockDetails, RoomBookingDetails } from '../../models/IBooking';
import moment from 'moment';
import { ToBeAssignedService } from '../../services/toBeAssigned.service';

@Component({
  tag: 'igloo-calendar',
  styleUrl: 'igloo-calendar.css',
  scoped: true,
})
export class IglooCalendar {
  @Prop() propertyid: number;
  @Prop() from_date: string;
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

  @State() calendarData: { [key: string]: any } = new Object();
  @State() days: { [key: string]: any }[] = new Array();
  @State() scrollViewDragging: boolean = false;

  @State() bookingItem: { [key: string]: any } = null;
  @State() showLegend: boolean = false;
  @State() showPaymentDetails: boolean = false;
  @State() showToBeAssigned: boolean = false;
  private bookingService: BookingService = new BookingService();
  private countryNodeList: ICountry[] = [];
  private visibleCalendarCells: { x: any[]; y: any[] } = { x: [], y: [] };
  private scrollContainer: HTMLElement;
  private today: String = '';
  private roomService: RoomService = new RoomService();
  private eventsService = new EventsService();
  private toBeAssignedService = new ToBeAssignedService();
  @Watch('ticket')
  async ticketChanged() {
    sessionStorage.setItem('token', JSON.stringify(this.ticket));
    this.initializeApp();
  }

  async componentWillLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.initializeApp();
    }
  }
  initializeApp() {
    try {
      this.roomService.fetchData(this.propertyid, this.language).then(roomResp => {
        this.setRoomsData(roomResp);
        this.bookingService.getCalendarData(this.propertyid, this.from_date, this.to_date).then(async bookingResp => {
          this.countryNodeList = await this.bookingService.getCountries(this.language);
          this.calendarData.currency = roomResp['My_Result'].currency;
          this.calendarData.legendData = this.getLegendData(roomResp);
          this.calendarData.is_vacation_rental = roomResp['My_Result'].is_vacation_rental;
          if (!this.calendarData.is_vacation_rental) {
            this.calendarData.unassignedDates = await this.toBeAssignedService.getUnassignedDates(this.propertyid, dateToFormattedString(new Date()), this.to_date);
          }
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
        });
      });
    } catch (error) {}
  }
  componentDidLoad() {
    this.scrollToElement(this.today);
  }
  @Listen('deleteButton')
  async handledeleteEvent(ev: CustomEvent) {
    try {
      ev.stopImmediatePropagation();
      ev.preventDefault();
      const bookingEvent = [...this.calendarData.bookingEvents];
      await this.eventsService.deleteEvent(ev.detail);

      this.calendarData = {
        ...this.calendarData,
        bookingEvents: bookingEvent.filter(e => e.POOL !== ev.detail),
      };
    } catch (error) {
      //toastr.error(error);
    }
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

      bookingEvent.defaultDateRange.dateDifference = bookingEvent.NO_OF_DAYS; // (bookingEvent.defaultDateRange.toDate.getTime() - bookingEvent.defaultDateRange.fromDate.getTime())/(86400000);
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
    console.log(goToDate);
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
  @Listen('bookingCreated')
  onBookingCreation(event: CustomEvent<{ pool?: string; data: RoomBookingDetails[] }>) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    const { data, pool } = event.detail;
    this.updateBookingEventsDateRange(data);
    let bookings = [...this.calendarData.bookingEvents];
    if (pool) {
      bookings = bookings.filter(booking => booking.POOL !== pool);
    }
    bookings.push(...data);
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: bookings,
    };
    setTimeout(() => {
      this.scrollToElement(this.transformDateForScroll(new Date(data[0].FROM_DATE)));
    }, 200);
  }
  @Listen('blockedCreated')
  onBlockCreation(event: CustomEvent<RoomBlockDetails>) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.updateBookingEventsDateRange([event.detail]);
    this.calendarData = {
      ...this.calendarData,
      bookingEvents: [...this.calendarData.bookingEvents, event.detail],
    };
    // setTimeout(() => {
    //   this.scrollToElement(this.transformDateForScroll(new Date(event.detail.FROM_DATE)));
    // }, 200);
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
        let dt = new Date(opt.data);
        this.scrollToElement(dt.getDate() + '_' + (dt.getMonth() + 1) + '_' + dt.getFullYear());
        break;
      case 'search':
        break;
      case 'add':
        this.bookingItem = opt.data;
        break;
      case 'gotoToday':
        this.scrollToElement(this.today);
        break;
      case 'closeSideMenu':
        this.closeSideMenu();
        break;
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
    const containerRect = this.scrollContainer.getBoundingClientRect();
    let leftSideMenuSize = 170;
    let maxWidth = containerRect.width - leftSideMenuSize;
    let leftX = containerRect.x + leftSideMenuSize;
    let rightX = containerRect.x + containerRect.width;

    let cells = Array.from(this.element.querySelectorAll('.monthCell')) as HTMLElement[];

    if (cells.length) {
      cells.map((monthContainer: HTMLElement) => {
        let monthRect = monthContainer.getBoundingClientRect();
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

  render() {
    return (
      <Host>
        <ir-interceptor></ir-interceptor>
        <ir-common></ir-common>
        <div id="iglooCalendar" class="igl-calendar">
          {this.shouldRenderCalendarView() ? (
            [
              this.showToBeAssigned ? (
                <igl-to-be-assigned
                  loadingMessage={'Fetching unassigned units'}
                  to_date={this.to_date}
                  from_date={this.from_date}
                  propertyid={this.propertyid}
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
                    to_date={this.to_date}
                    propertyid={this.propertyid}
                    today={this.today}
                    calendarData={this.calendarData}
                    onOptionEvent={evt => this.onOptionSelect(evt)}
                  ></igl-cal-header>
                  <igl-cal-body
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
          {this.bookingItem && (
            <igl-book-property
              showPaymentDetails={this.showPaymentDetails}
              countryNodeList={this.countryNodeList}
              currency={this.calendarData.currency}
              language={this.language}
              propertyid={this.propertyid}
              bookingData={this.bookingItem}
              onCloseBookingWindow={_ => (this.bookingItem = null)}
            ></igl-book-property>
          )}
        </div>
      </Host>
    );
  }
}
