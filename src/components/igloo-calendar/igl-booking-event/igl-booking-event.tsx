import { Component, Element, Event, EventEmitter, Fragment, Host, Listen, Prop, State, h } from '@stencil/core';
import { BookingService } from '@/services/booking.service';
import { buildSplitIndex, calculateDaysBetweenDates, getSplitRole, transformNewBooking } from '@/utils/booking';
import { checkMealPlan, formatAmount, isBlockUnit } from '@/utils/utils';
import { IRoomNightsData, CalendarModalEvent } from '@/models/property-types';
import moment from 'moment';
import { IToast } from '@components/ui/ir-toast/toast';
import { EventsService } from '@/services/events.service';
import locales from '@/stores/locales.store';
import { ICountry } from '@/models/IBooking';
import calendar_dates from '@/stores/calendar-dates.store';
import calendar_data from '@/stores/calendar-data';
import { ClickOutside } from '@/decorators/ClickOutside';
export type BarPosition = { top: string; left: string; width: string; height: string };
@Component({
  tag: 'igl-booking-event',
  styleUrl: 'igl-booking-event.css',
  scoped: true,
})
export class IglBookingEvent {
  @Element() private element: HTMLElement;

  @Prop() currency;
  @Prop() is_vacation_rental: boolean = false;
  @Prop() language: string;
  @Prop({ mutable: true }) bookingEvent: { [key: string]: any };
  @Prop() allBookingEvents: { [key: string]: any } = [];
  @Prop() countries: ICountry[];

  @Event({ bubbles: true, composed: true }) hideBubbleInfo: EventEmitter;
  @Event() updateEventData: EventEmitter;
  @Event() dragOverEventData: EventEmitter;
  @Event() showRoomNightsDialog: EventEmitter<IRoomNightsData>;
  @Event() showDialog: EventEmitter<CalendarModalEvent>;
  @Event() resetStretchedBooking: EventEmitter<string>;
  @Event() toast: EventEmitter<IToast>;
  @Event() updateBookingEvent: EventEmitter<{ [key: string]: any }>;

  @State() renderElement: boolean = false;
  @State() position: { [key: string]: any };
  @State() isShrinking: boolean | null = null;

  private dayWidth: number = 0;
  private eventSpace: number = 8;

  private vertSpace: number = 10;

  /* show bubble */
  private showInfoPopup: boolean = false;
  private bubbleInfoTopSide: boolean = false;
  private isStretch = false;
  /*Services */
  private eventsService = new EventsService();
  private bookingService = new BookingService();
  /* Resize props */
  private resizeSide: string = '';
  private isDragging: boolean = false;
  private initialX: number;
  private initialY: number;
  private currentX: number;
  private currentY: number;
  private initialWidth: number;
  private initialLeft: number;
  private finalWidth: number;
  private dragInitPos: { [key: string]: any };
  private dragEndPos: { [key: string]: any };
  elementRect: { [key: string]: any };
  private isTouchStart: boolean;
  private moveDifferenceX: number;
  private moveDifferenceY: number;
  private animationFrameId: number | null = null;

  private handleMouseMoveBind = this.handleMouseMove.bind(this);
  private handleMouseUpBind = this.handleMouseUp.bind(this);

  private role: string = '';

  componentWillLoad() {}

  componentDidLoad() {
    if (this.isNewEvent()) {
      if (!this.bookingEvent.hideBubble) {
        /* auto matically open the popup, calling the method shows bubble either top or bottom based on available space. */
        setTimeout(async () => {
          if (['003', '002', '004'].includes(this.bookingEvent.STATUS_CODE)) {
            this.showEventInfo(true);
          } else if (['IN-HOUSE', 'CONFIRMED', 'PENDING-CONFIRMATION', 'CHECKED-OUT'].includes(this.bookingEvent.STATUS)) {
            await this.fetchAndAssignBookingData();
          } else {
            this.showEventInfo(true);
          }
          this.renderAgain();
        }, 1);
      }
    }
  }

  disconnectedCallback() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  @Listen('hideBubbleInfo', { target: 'window' })
  hideBubbleInfoPopup(event: CustomEvent) {
    if (event.detail.currentInfoBubbleId != this.getBookingId() || (event.detail.key === 'hidebubble' && event.detail.currentInfoBubbleId === this.getBookingId())) {
      this.showInfoPopup = false;
      this.renderAgain();
    }
  }

  @Listen('moveBookingTo', { target: 'window' })
  async moveBookingToHandler(event: CustomEvent) {
    try {
      if (event.detail.bookingId !== this.getBookingId()) {
        this.showEventInfo(false);
        return;
      }

      if (event.detail.moveToDay === 'revert' || event.detail.toRoomId === 'revert') {
        event.detail.moveToDay = this.bookingEvent.FROM_DATE;
        event.detail.toRoomId = event.detail.fromRoomId;
        if (this.isTouchStart && this.moveDifferenceX <= 5 && this.moveDifferenceY <= 5 && !this.isStretch) {
          if (isBlockUnit(this.bookingEvent.STATUS_CODE)) {
            this.showEventInfo(true);
          } else if (['IN-HOUSE', 'CONFIRMED', 'PENDING-CONFIRMATION', 'CHECKED-OUT'].includes(this.bookingEvent.STATUS)) {
            await this.fetchAndAssignBookingData();
          }
        } else {
          this.animationFrameId = requestAnimationFrame(() => {
            this.resetBookingToInitialPosition();
          });
          return;
        }
      } else {
        if (this.isTouchStart && this.moveDifferenceX <= 5 && this.moveDifferenceY <= 5 && !this.isStretch) {
          if (isBlockUnit(this.bookingEvent.STATUS_CODE)) {
            this.showEventInfo(true);
          } else if (['IN-HOUSE', 'CONFIRMED', 'PENDING-CONFIRMATION', 'CHECKED-OUT'].includes(this.bookingEvent.STATUS)) {
            await this.fetchAndAssignBookingData();
          }
        } else {
          const { pool, to_date, from_date, toRoomId } = event.detail as any;
          const previousToDate = moment(to_date, 'YYYY-MM-DD').add(-1, 'days').format('YYYY-MM-DD');
          console.log(this.findRoomType(Number(this.bookingEvent.PR_ID)), this.findRoomType(Number(toRoomId)));
          if (
            (!moment(this.bookingEvent.TO_DATE, 'YYYY-MM-DD').isSame(moment(to_date, 'YYYY-MM-DD'), 'dates') ||
              this.findRoomType(Number(this.bookingEvent.PR_ID)) !== this.findRoomType(Number(toRoomId))) &&
            (calendar_dates.disabled_cells.get(`${toRoomId}_${from_date}`)?.disabled ||
              (calendar_dates.disabled_cells.get(`${toRoomId}_${to_date}`)?.disabled && calendar_dates.disabled_cells.get(`${toRoomId}_${previousToDate}`)?.disabled)) &&
            !this.isStretch
          ) {
            this.reset('This room isn’t available for the entire selected period. Please choose different dates or a different room.');
          }
          if (this.checkIfSlotOccupied(toRoomId, from_date, to_date)) {
            this.reset('Overlapping Dates');
          }
          if (pool) {
            if (isBlockUnit(this.bookingEvent.STATUS_CODE)) {
              // let fromDate = moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(moment(new Date(from_date)))
              //   ? this.bookingEvent.defaultDates.from_date
              //   : from_date;
              // console.log('room', fromDate, this.bookingEvent.defaultDates.from_date, from_date);
              await this.eventsService.reallocateEvent(pool, toRoomId, from_date, to_date).catch(() => {
                this.resetBookingToInitialPosition();
              });
            } else {
              if (this.isShrinking || !this.isStretch) {
                // try {
                //   if (this.bookingEvent.PR_ID.toString() === toRoomId.toString()) {
                //     await this.eventsService.reallocateEvent(pool, toRoomId, from_date, to_date);
                //     return;
                //   }
                // } catch (error) {
                //   this.resetBookingToInitialPosition();
                //   return;
                // }
                const { description, status, newRatePlans } = this.getModalDescription(toRoomId, from_date, to_date);
                let hideConfirmButton = false;
                if (status === '400') {
                  hideConfirmButton = true;
                }
                const oldFromDate = this.bookingEvent.defaultDates.from_date;
                const oldToDate = this.bookingEvent.defaultDates.to_date;
                const diffDays = calculateDaysBetweenDates(oldFromDate, oldToDate);

                let shrinkingDirection = null;
                let fromDate = oldFromDate;
                let toDate = oldToDate;
                if (this.isShrinking) {
                  if (moment(from_date, 'YYYY-MM-DD').isAfter(moment(oldFromDate, 'YYYY-MM-DD')) && moment(to_date, 'YYYY-MM-DD').isBefore(moment(oldToDate, 'YYYY-MM-DD'))) {
                    fromDate = oldFromDate;
                    toDate = to_date;
                  } else {
                    shrinkingDirection = moment(from_date, 'YYYY-MM-DD').isAfter(moment(oldFromDate, 'YYYY-MM-DD'))
                      ? 'left'
                      : moment(to_date, 'YYYY-MM-DD').isBefore(moment(oldToDate, 'YYYY-MM-DD'))
                      ? 'right'
                      : null;
                    if (shrinkingDirection === 'left') {
                      fromDate = from_date;
                    }

                    if (shrinkingDirection === 'right') {
                      toDate = to_date;
                    }
                  }
                } else {
                  console.log('stretching');
                  if (moment(from_date, 'YYYY-MM-DD').isBefore(moment(oldFromDate, 'YYYY-MM-DD'))) {
                    fromDate = from_date;
                    const newToDate = moment(from_date, 'YYYY-MM-DD').add(diffDays, 'days');
                    toDate = newToDate.isBefore(moment(to_date, 'YYYY-MM-DD'), 'days') ? to_date : newToDate.format('YYYY-MM-DD');
                  } else if (moment(to_date, 'YYYY-MM-DD').isAfter(moment(oldToDate, 'YYYY-MM-DD'))) {
                    toDate = to_date;
                    fromDate = moment(to_date, 'YYYY-MM-DD').subtract(diffDays, 'days').format('YYYY-MM-DD');
                  }
                }
                console.warn({ fromDate, toDate });
                this.showDialog.emit({
                  reason: 'reallocate',
                  ...event.detail,
                  description,
                  title: '',
                  rateplans: newRatePlans,
                  hideConfirmButton,
                  from_date: fromDate,
                  to_date: toDate,
                });
              } else {
                // if (this.checkIfSlotOccupied(toRoomId, from_date, to_date)) {
                //   this.animationFrameId = requestAnimationFrame(() => {
                //     this.resetBookingToInitialPosition();
                //   });
                //   throw new Error('Overlapping Dates');
                // } else {

                // let stretchDirection: "left" | "right"
                const oldFromDate = this.bookingEvent.defaultDates.from_date;
                const oldToDate = this.bookingEvent.defaultDates.to_date;
                // const diffDays = calculateDaysBetweenDates(oldFromDate, oldToDate);

                // let fromDate = oldFromDate;

                // if (moment(from_date, 'YYYY-MM-DD').isBefore(moment(oldFromDate, 'YYYY-MM-DD'))) {
                //   fromDate = from_date;
                //   const newToDate = moment(from_date, 'YYYY-MM-DD').add(diffDays, 'days');
                //   toDate = newToDate.isBefore(moment(to_date, 'YYYY-MM-DD'), 'days') ? to_date : newToDate.format('YYYY-MM-DD');
                // } else if (moment(to_date, 'YYYY-MM-DD').isAfter(moment(oldToDate, 'YYYY-MM-DD'))) {
                //   toDate = to_date;
                //   fromDate = moment(to_date, 'YYYY-MM-DD').subtract(diffDays, 'days').format('YYYY-MM-DD');
                // }
                const validateDates = (base_date: string, to_date: string) => {
                  let cursor = base_date;
                  let counter = 0;
                  while (cursor !== to_date) {
                    if (calendar_dates.disabled_cells.get(`${toRoomId}_${cursor}`)?.disabled) {
                      counter++;
                    }
                    cursor = moment(cursor, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
                  }
                  if (counter >= 1) {
                    this.reset(locales.entries.Lcz_ThisUnitIsNotAvailable);
                  }
                };

                if (moment(oldToDate, 'YYYY-MM-DD').isBefore(moment(to_date), 'dates')) {
                  validateDates(oldToDate, to_date);
                } else if (moment(oldFromDate, 'YYYY-MM-DD').isAfter(moment(from_date, 'YYYY-MM-DD'), 'dates')) {
                  validateDates(from_date, oldFromDate);
                }
                const payload: IRoomNightsData = {
                  booking: this.bookingEvent,
                  bookingNumber: this.bookingEvent.BOOKING_NUMBER,
                  identifier: this.bookingEvent.IDENTIFIER,
                  to_date,
                  pool,
                  from_date,
                  defaultDates: this.bookingEvent.defaultDates,
                };
                if (!this.bookingEvent.is_direct) {
                  this.showDialog.emit({ reason: 'stretch', ...payload });
                } else {
                  this.showRoomNightsDialog.emit(payload);
                }
                // }
              }
            }
            this.isShrinking = null;
          }
        }
      }
    } catch (error) {
      this.toast.emit({
        position: 'top-right',
        title: error.message,
        description: '',
        type: 'error',
      });
      console.log('something went wrong');
    }
  }

  @ClickOutside()
  closeEventBubble() {
    this.showEventInfo(false);
  }
  private async fetchAndAssignBookingData() {
    try {
      console.log('clicked on book#', this.bookingEvent.BOOKING_NUMBER);

      const validStatuses = ['IN-HOUSE', 'CONFIRMED', 'PENDING-CONFIRMATION', 'CHECKED-OUT'];
      if (!validStatuses.includes(this.bookingEvent.STATUS)) {
        return;
      }

      const data = await this.bookingService.getExposedBooking(this.bookingEvent.BOOKING_NUMBER, 'en');
      const base_booking = { ...data };
      const filteredRooms = data.rooms.filter(room => room['assigned_units_pool'] === this.bookingEvent.ID);

      if (filteredRooms.length === 0) {
        throw new Error(`booking#${this.bookingEvent.BOOKING_NUMBER} has an empty array`);
      }

      if (filteredRooms.some(room => room['assigned_units_pool'] === null)) {
        throw new Error(`booking#${this.bookingEvent.BOOKING_NUMBER} has an empty pool`);
      }

      data.rooms = filteredRooms;

      const transformedBooking = transformNewBooking(data)[0];
      const {
        ID,
        TO_DATE,
        FROM_DATE,
        NO_OF_DAYS,
        STATUS,
        NAME,
        IDENTIFIER,
        origin,
        TOTAL_PRICE,
        PR_ID,
        POOL,
        BOOKING_NUMBER,
        NOTES,
        is_direct,
        BALANCE,
        channel_booking_nbr,
        ...otherBookingData
      } = transformedBooking;
      this.bookingEvent = {
        ...otherBookingData,
        ...this.bookingEvent,
        channel_booking_nbr,
        booking: data,
        base_booking,
        DEPARTURE_TIME: otherBookingData.DEPARTURE_TIME,
        PHONE: otherBookingData.PHONE,
        PHONE_PREFIX: otherBookingData.PHONE_PREFIX,
        PRIVATE_NOTE: otherBookingData.PRIVATE_NOTE,
        origin,
        BALANCE,
        TOTAL_PRICE,
        ROOM_INFO: { ...this.bookingEvent.ROOM_INFO, sharing_persons: otherBookingData.ROOM_INFO.sharing_persons },
      };
      this.updateBookingEvent.emit(this.bookingEvent);
      this.showEventInfo(true);
    } catch (error) {
      console.error(error.message);
    }
  }

  private reset(message: string) {
    this.animationFrameId = requestAnimationFrame(() => {
      this.resetBookingToInitialPosition();
    });
    throw new Error(message);
  }

  private findRoomType = (roomId: number) => {
    let roomType = this.bookingEvent.roomsInfo.filter(room => room.physicalrooms.some(r => r.id === +roomId));
    if (roomType.length) {
      return roomType[0].id;
    }
    return null;
  };

  private buildBarIds() {
    const bookingId = this.getBookingId();
    return {
      bar: `event_${bookingId}`,
      lateCheckout: `event_late_checkout_${bookingId}`,
      balance: `event_balance_${bookingId}`,
    };
  }

  private getModalDescription(toRoomId: number, from_date, to_date): { status: '200' | '400'; description: string; newRatePlans?: any[] } {
    if (!this.bookingEvent.is_direct) {
      if (this.isShrinking) {
        return {
          description: locales.entries.Lcz_OTA_Modification_Alter,
          status: '200',
        };
        // return {
        //   description: `${locales.entries.Lcz_YouWillLoseFutureUpdates}.`,
        //   status: '200',
        // };
      } else {
        if (
          moment(from_date, 'YYYY-MM-DD').isSame(moment(this.bookingEvent.FROM_DATE, 'YYYY-MM-DD')) &&
          moment(to_date, 'YYYY-MM-DD').isSame(moment(this.bookingEvent.TO_DATE, 'YYYY-MM-DD'))
        ) {
          const initialRT = this.findRoomType(this.bookingEvent.PR_ID);
          const targetRT = this.findRoomType(toRoomId);
          if (initialRT === targetRT) {
            return { description: `${locales.entries.Lcz_AreYouSureWantToMoveAnotherUnit}?`, status: '200' };
          } else {
            const mealPlans = checkMealPlan({
              rateplan_id: this.bookingEvent.RATE_PLAN_ID,
              roomTypeId: targetRT,
              roomTypes: calendar_data?.property?.roomtypes,
            });
            return {
              description: locales.entries.Lcz_OTA_Modification_Alter,
              status: '200',
              newRatePlans: Array.isArray(mealPlans) ? mealPlans : undefined,
            };
            // return {
            //   description: `${locales.entries.Lcz_YouWillLoseFutureUpdates} ${this.bookingEvent.origin ? this.bookingEvent.origin.Label : ''}. ${
            //     locales.entries.Lcz_SameRatesWillBeKept + '.'
            //   }`,
            //   status: '200',
            // };
          }
        }
        return { description: locales.entries.Lcz_CannotChangeCHBookings + '.', status: '400' };
      }
    } else {
      if (!this.isShrinking) {
        const initialRT = this.findRoomType(Number(this.bookingEvent.PR_ID));
        const targetRT = this.findRoomType(Number(toRoomId));
        if (initialRT === targetRT) {
          console.log('same rt');
          if (this.bookingEvent.PR_ID.toString() === toRoomId.toString()) {
            //TODO add the description
            return { description: locales.entries.Lcz_ConfrmModiication + '.', status: '200' };
          }
          return { description: `${locales.entries.Lcz_AreYouSureWantToMoveAnotherUnit}?`, status: '200' };
        } else {
          const mealPlans = checkMealPlan({
            rateplan_id: this.bookingEvent.RATE_PLAN_ID,
            roomTypeId: targetRT,
            roomTypes: calendar_data?.property?.roomtypes,
          });

          return {
            description: locales.entries.Lcz_SameRatesWillBeKept,
            status: '200',
            newRatePlans: Array.isArray(mealPlans) ? mealPlans : undefined,
          };
        }
      }
      return { description: locales.entries.Lcz_ConfrmModiication + '.', status: '200' };
    }
  }

  private resetBookingToInitialPosition() {
    if (this.isStretch) {
      this.element.style.left = `${this.initialLeft}px`;
      this.element.style.width = `${this.initialWidth}px`;
      this.isStretch = false;
      this.finalWidth = this.initialWidth;
      this.isShrinking = null;
    } else {
      this.element.style.top = `${this.dragInitPos.top}px`;
      this.element.style.left = `${this.dragInitPos.left}px`;
    }
  }

  @Listen('revertBooking', { target: 'window' })
  handleRevertBooking(event: CustomEvent<string>) {
    if (this.bookingEvent.POOL === event.detail) {
      this.resetBookingToInitialPosition();
    }
  }

  /**
   * Checks if the target room already has a booking overlapping the given date range.
   *
   * @param toRoomId   - Room ID to check.
   * @param from_date  - Start date (YYYY-MM-DD).
   * @param to_date    - End date (YYYY-MM-DD).
   * @returns `true` if another booking occupies the slot, otherwise `false`.
   */
  private checkIfSlotOccupied(toRoomId: number, from_date: string, to_date: string) {
    const fromTime = moment(from_date, 'YYYY-MM-DD');
    const toTime = moment(to_date, 'YYYY-MM-DD');
    const isOccupied = this.allBookingEvents.some(event => {
      if (event.POOL === this.bookingEvent.POOL) {
        return false;
      }
      const eventFromTime = moment(event.FROM_DATE, 'YYYY-MM-DD').add(1, 'days');
      const eventToTime = moment(event.TO_DATE, 'YYYY-MM-DD');
      return event.PR_ID === +toRoomId && toTime.isSameOrAfter(eventFromTime) && fromTime.isBefore(eventToTime);
    });
    return isOccupied;
  }

  renderAgain() {
    this.renderElement = !this.renderElement;
  }

  getUniqueId() {
    return new Date().getTime();
  }

  isSplitBooking() {
    return !!this.bookingEvent.SPLIT_BOOKING;
  }

  isNewEvent() {
    return this.getBookingId() === 'NEW_TEMP_EVENT';
  }

  isHighlightEventType() {
    return this.getEventType() === 'HIGH_LIGHT';
  }

  getBookingId() {
    return this.bookingEvent.ID;
  }

  getBookingStatus() {
    return this.bookingEvent.STATUS;
  }

  getBookedBy() {
    return this.bookingEvent.NAME;
  }

  getBookedRoomId() {
    return this.bookingEvent.PR_ID;
  }

  getEventStartingDate() {
    return new Date(this.bookingEvent.FROM_DATE);
  }

  getEventEndingDate() {
    return new Date(this.bookingEvent.TO_DATE);
  }

  getEventType() {
    return this.bookingEvent.event_type;
  }

  getEventLegend() {
    // console.log(this.getBookingStatus());
    let status = this.bookingEvent?.legendData.statusId[this.getBookingStatus()];
    let orderRide = this.isNewEvent() ? { color: '#f9f9c9' } : {};
    return {
      ...this.bookingEvent?.legendData[status.id],
      ...status,
      ...orderRide,
    };
  }

  getLegendOfStatus(aStatusId) {
    // console.log(aStatusId);
    let status = this.bookingEvent?.legendData.statusId[aStatusId];
    return { ...this.bookingEvent.legendData[status.id], ...status };
  }

  getNoteNode() {
    if (this.bookingEvent.NOTES || this.bookingEvent.INTERNAL_NOTE || this.bookingEvent.PRIVATE_NOTE) {
      return this.getLegendOfStatus('NOTES');
    }
    return null;
  }

  getBalanceNode() {
    if (this.bookingEvent.BALANCE !== null && this.bookingEvent.BALANCE >= 1) {
      return this.getLegendOfStatus('OUTSTANDING-BALANCE');
    }
    return null;
  }

  setStayDays(aStayDays: number) {
    this.bookingEvent.NO_OF_DAYS = aStayDays;
    this.renderAgain();
    // this.updateData({id: this.getBookedRoomId(), data: { NO_OF_DAYS: aStayDays }});
  }

  getStayDays() {
    return this.bookingEvent.NO_OF_DAYS;
  }
  /**
   * Calculates the booking bar position and width in the calendar grid.
   *
   * @returns {{ top: string; left: string; width: string; height: string }}
   *          Inline style values used to place the event.
   */
  private getPosition(): BarPosition {
    let startingDate = this.getEventStartingDate();
    let startingCellClass = '.room_' + this.getBookedRoomId() + '_' + startingDate.getDate() + '_' + (startingDate.getMonth() + 1) + '_' + startingDate.getFullYear();
    let bodyContainer = document.querySelector('.bodyContainer');
    let startingCell = document.querySelector(startingCellClass);
    let pos = { top: '0', left: '0', width: '0', height: '20px' };

    if (!startingCell && bodyContainer && startingCell.getBoundingClientRect() && bodyContainer.getBoundingClientRect()) {
      console.warn('Failed to locate event cell', startingCellClass, this.bookingEvent);
      return pos;
    }
    let bodyContainerRect = bodyContainer.getBoundingClientRect();
    let boundingRect = startingCell.getBoundingClientRect();
    this.dayWidth = this.dayWidth || boundingRect.width;
    pos.top = boundingRect.top + boundingRect.height / 2 - this.vertSpace - bodyContainerRect.top + 'px';
    // pos.left = boundingRect.left + this.dayWidth / 2 + this.eventSpace / 2 - bodyContainerRect.left + 'px';
    // pos.width = this.getStayDays() * this.dayWidth - this.eventSpace + 'px';
    pos.left =
      boundingRect.left +
      (!this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)) ? 0 : this.dayWidth / 2) +
      this.eventSpace / 2 -
      bodyContainerRect.left +
      'px';
    pos.width =
      (this.getStayDays() + (!this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)) ? 0.5 : 0)) *
        this.dayWidth -
      this.eventSpace +
      'px';
    return pos;
  }

  private getNumber(aData: string) {
    return aData ? parseFloat(aData) : 0;
  }

  startDragging(event: any, side: string) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (this.isNewEvent() || this.isHighlightEventType()) {
      return null;
    }

    this.resizeSide = side;
    this.isDragging = true;

    this.showEventInfo(false);
    this.isStretch = side !== 'move';
    if (side === 'move') {
      this.initialX = event.clientX || event.touches[0].clientX;
      this.initialY = event.clientY || event.touches[0].clientY;
      this.elementRect = this.element.getBoundingClientRect();
      const offsetX = 0;
      const offsetY = 0;
      this.dragInitPos = {
        id: this.getBookingId(),
        fromRoomId: this.getBookedRoomId(),
        top: this.getNumber(this.element.style.top) + offsetY,
        left: this.getNumber(this.element.style.left) + offsetX,
      };
      this.dragInitPos.x = this.dragInitPos.left;
      this.dragInitPos.y = this.dragInitPos.top;
      this.dragEndPos = { ...this.dragInitPos };
      this.element.style.top = `${this.dragInitPos.top}px`;
      this.element.style.left = `${this.dragInitPos.left}px`;
      this.isTouchStart = true; // !!(event.touches && event.touches.length);
      this.dragOverEventData.emit({
        id: 'CALCULATE_DRAG_OVER_BOUNDS',
        data: this.dragInitPos,
      });
    } else {
      this.initialWidth = this.element.offsetWidth;
      this.initialLeft = this.element.offsetLeft;
      this.initialX = event.clientX || event.touches[0].clientX;
      this.dragOverEventData.emit({
        id: 'CALCULATE_DRAG_OVER_BOUNDS',
        data: {
          id: this.getBookingId(),
          fromRoomId: this.getBookedRoomId(),
          top: this.getNumber(this.element.style.top),
          left: this.initialLeft,
          x: this.initialX,
          y: event.clientY || event.touches[0].clientY,
        },
      });
    }

    document.addEventListener('mousemove', this.handleMouseMoveBind);
    document.addEventListener('touchmove', this.handleMouseMoveBind);
    document.addEventListener('pointermove', this.handleMouseMoveBind);

    document.addEventListener('mouseup', this.handleMouseUpBind);
    document.addEventListener('touchup', this.handleMouseUpBind);
    document.addEventListener('pointerup', this.handleMouseUpBind);
  }

  handleMouseMove(event: any) {
    if (this.isDragging) {
      this.currentX = event.clientX || event.touches[0].clientX;
      let distanceX = this.currentX - this.initialX;
      if (this.resizeSide === 'move') {
        this.currentY = event.clientY || event.touches[0].clientY;
        let distanceY = this.currentY - this.initialY;
        this.element.style.top = `${this.dragInitPos.top + distanceY}px`;
        this.element.style.left = `${this.dragInitPos.left + distanceX}px`;
        this.dragEndPos = {
          id: this.getBookingId(),
          fromRoomId: this.getBookedRoomId(),
          top: this.dragInitPos.top + distanceY,
          left: this.dragInitPos.left + distanceX,
        };
        this.dragEndPos.x = this.dragEndPos.left; // + 18;
        this.dragEndPos.y = this.dragEndPos.top; // + (this.elementRect.height/2);
        this.dragOverEventData.emit({ id: 'DRAG_OVER', data: this.dragEndPos });
      } else {
        // if (this.bookingEvent.is_direct && !isBlockUnit(this.bookingEvent.STATUS_CODE)) {
        //   return;
        // }
        if (this.role === 'fullSplit') {
          return;
        }
        const baseCondition = !this.bookingEvent.is_direct && !isBlockUnit(this.bookingEvent.STATUS_CODE);
        let newWidth = this.initialWidth;
        if (this.resizeSide == 'rightSide') {
          newWidth = this.initialWidth + distanceX;
          newWidth = Math.min(newWidth, this.initialX + this.element.offsetWidth);
          newWidth = Math.max(this.dayWidth - this.eventSpace, newWidth);
          this.isShrinking = distanceX < 0;
          if (!this.isShrinking && baseCondition) {
            return;
          }
          if (this.role === 'rightSplit') {
            return;
          }
          this.element.style.width = `${newWidth}px`;
        } else if (this.resizeSide == 'leftSide') {
          this.isShrinking = distanceX > 0;
          if (!this.isShrinking && baseCondition) {
            return;
          }
          if (this.role === 'leftSplit') {
            return;
          }
          newWidth = Math.max(this.dayWidth - this.eventSpace, this.initialWidth - distanceX);
          let newLeft = this.initialLeft + (this.initialWidth - newWidth);
          this.element.style.left = `${newLeft}px`;
          this.element.style.width = `${newWidth}px`;
        }
        this.finalWidth = newWidth;
      }
    } else {
      console.log('still mouse move listening...');
    }
  }

  handleMouseUp() {
    if (this.isDragging) {
      if (this.resizeSide === 'move') {
        // console.log("Initial X::"+this.dragInitPos.x);
        // console.log("Initial Y::"+this.dragInitPos.y);
        // console.log("End X::"+this.dragEndPos.x);
        // console.log("End Y::"+this.dragEndPos.y);
        if (this.isTouchStart) {
          this.moveDifferenceX = Math.abs(this.dragEndPos.x - this.dragInitPos.x);
          this.moveDifferenceY = Math.abs(this.dragEndPos.y - this.dragInitPos.y);
        }
        this.dragOverEventData.emit({
          id: 'DRAG_OVER_END',
          data: {
            ...this.dragEndPos,
            pool: this.bookingEvent.POOL,
            nbOfDays: this.bookingEvent.NO_OF_DAYS,
          },
        });
      } else {
        const finalWidth =
          this.finalWidth -
          (!this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)) ? this.dayWidth / 2 : 0);
        const numberOfDays = Math.round(finalWidth / this.dayWidth);
        console.log(finalWidth, this.dayWidth, numberOfDays);
        let initialStayDays = this.getStayDays();
        if (initialStayDays != numberOfDays && !isNaN(numberOfDays)) {
          //this.setStayDays(numberOfDays);
          if (this.resizeSide == 'leftSide') {
            this.element.style.left = `${this.initialLeft + (initialStayDays - numberOfDays) * this.dayWidth}px`;
            // set FROM_DATE = TO_DATE - numberOfDays
          } else {
            if (numberOfDays < initialStayDays) {
              this.isShrinking = true;
            }
            // set TO_DATE = FROM_DATE + numberOfDays
          }
          // const nbrOfDays =
          // !this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)) ? numberOfDays - 1 : numberOfDays;
          this.dragOverEventData.emit({
            id: 'STRETCH_OVER_END',
            data: {
              id: this.getBookingId(),
              fromRoomId: +this.getBookedRoomId(),
              x: +this.element.style.left.replace('px', ''),
              y: +this.element.style.top.replace('px', ''),
              pool: this.bookingEvent.POOL,
              nbOfDays: numberOfDays,
            },
          });
          const offset = !this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)) ? +this.dayWidth / 2 : 0;
          this.element.style.width = `${numberOfDays * this.dayWidth - this.eventSpace + offset}px`;
        } else {
          this.element.style.left = `${this.initialLeft}px`;
          this.element.style.width = `${numberOfDays * this.dayWidth - this.eventSpace}px`;
        }
      }
    } else {
      console.log('still mouse up listening...');
    }
    this.isDragging = false;

    document.removeEventListener('mousemove', this.handleMouseMoveBind);
    document.removeEventListener('touchmove', this.handleMouseMoveBind);
    document.removeEventListener('pointermove', this.handleMouseMoveBind);

    document.removeEventListener('mouseup', this.handleMouseUpBind);
    document.removeEventListener('touchup', this.handleMouseUpBind);
    document.removeEventListener('pointerup', this.handleMouseUpBind);
  }

  updateData(data: any) {
    this.updateEventData.emit(data);
  }
  private calculateHoverPosition() {
    const barRect = this.element.getBoundingClientRect();
    const barWidth = barRect.width;
    const barLeft = barRect.left;
    const screenWidth = window.innerWidth;

    let hoverLeft;

    if (barWidth <= screenWidth) {
      hoverLeft = barWidth / 2;
    } else {
      hoverLeft = screenWidth / 2 - barLeft;
    }
    return {
      position: 'absolute',
      left: `${hoverLeft}px`,
      transform: 'translateX(-50%)',
    };
  }
  private renderEventBookingNumber() {
    if (this.bookingEvent.STATUS === 'TEMP-EVENT' || this.bookingEvent.ID === 'NEW_TEMP_EVENT') {
      return '';
    }
    if (isBlockUnit(this.bookingEvent.STATUS_CODE)) {
      return '';
    }
    if (!this.bookingEvent.is_direct) {
      return ` - ${this.bookingEvent.channel_booking_nbr}`;
    }
    return ` - ${this.bookingEvent.BOOKING_NUMBER}`;
  }

  private showEventInfo(showInfo: boolean) {
    if (this.isHighlightEventType() || this.bookingEvent.hideBubble) {
      return null;
    }

    if (showInfo) {
      // Calculate which side we need to show the bubble, top side or bottom.
      let bodyContainer = document.querySelector('.calendarScrollContainer');
      let bodyContainerRect: { [key: string]: any } = bodyContainer.getBoundingClientRect();
      let elementRect: { [key: string]: any } = this.element.getBoundingClientRect();
      let midPoint = bodyContainerRect.height / 2 + bodyContainerRect.top + 50;

      if (elementRect.top < midPoint) {
        this.bubbleInfoTopSide = false;
      } else {
        this.bubbleInfoTopSide = true;
      }
    }

    if (showInfo) {
      this.hideBubbleInfo.emit({
        key: 'hidePopup',
        currentInfoBubbleId: this.getBookingId(),
      });
    }
    this.showInfoPopup = showInfo;
    this.renderAgain();
  }

  /**
   * Checks if the booking's departure time is later than the hotel's configured check-out time.
   *
   * @returns {boolean} `true` if departure is after `check_out_till`, otherwise `false`.
   */
  private isDepartureAfterHotelCheckout(): boolean {
    const departureTime = this.bookingEvent.DEPARTURE_TIME;
    if (!departureTime?.code) {
      return false;
    }
    const t1 = moment(calendar_data.property.time_constraints.check_out_till, 'HH:mm');
    const t2 = moment(departureTime.description, 'HH:mm');
    return t1.isBefore(t2);
  }
  private computeSplitRole() {
    const SPLIT_INDEX = buildSplitIndex(this.bookingEvent.ROOMS);
    let splitRole = null;
    if (SPLIT_INDEX) {
      splitRole = getSplitRole(SPLIT_INDEX, this.bookingEvent.IDENTIFIER) ?? '';
    }
    return splitRole;
  }

  render() {
    let legend = this.getEventLegend();

    let noteNode = this.getNoteNode();
    let balanceNode = this.getBalanceNode();

    let backgroundColor = this.bookingEvent.ROOM_INFO?.calendar_extra ? this.bookingEvent.ROOM_INFO.calendar_extra?.booking_color?.color ?? legend.color : legend.color;

    const { foreground, stripe } = calendar_data.colorsForegrounds?.[backgroundColor] ?? {
      foreground: '',
      checkout: '',
    };
    backgroundColor = this.bookingEvent.STATUS === 'CHECKED-OUT' ? legend.color : backgroundColor;
    const isDepartureAfterHotelCheckout = this.isDepartureAfterHotelCheckout();
    const { balance, bar, lateCheckout } = this.buildBarIds();
    const splitRole = this.computeSplitRole();

    return (
      <Host class={`bookingEvent  ${this.isNewEvent() || this.isHighlightEventType() ? 'newEvent' : ''} ${legend.clsName} `} style={this.getPosition()} id={bar}>
        <div
          class={{
            'bookingEventBase': true,
            'skewedLeft': !this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)),
            'skewedRight': !this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.to_date)).isAfter(new Date(this.bookingEvent.TO_DATE)),
            'striped-bar vertical': this.bookingEvent.STATUS === 'IN-HOUSE',
            'striped-bar animated': isBlockUnit(this.bookingEvent.STATUS_CODE) && this.bookingEvent.STATUS_CODE === '003',
            'border border-dark ota-booking-event':
              !this.bookingEvent.is_direct && !isBlockUnit(this.bookingEvent.STATUS_CODE) && this.bookingEvent.STATUS !== 'TEMP-EVENT' && this.bookingEvent.ID !== 'NEW_TEMP_EVENT',
            [splitRole]: true,
          }}
          style={{
            'backgroundColor': backgroundColor,
            '--ir-event-bg': backgroundColor,
            '--ir-event-bg-stripe-color': stripe,
          }}
          onTouchStart={event => this.startDragging(event, 'move')}
          onMouseDown={event => this.startDragging(event, 'move')}
        ></div>
        {isDepartureAfterHotelCheckout && <wa-tooltip for={lateCheckout}>Departure time: {this.bookingEvent.DEPARTURE_TIME?.description}</wa-tooltip>}
        {balanceNode && <wa-tooltip for={balance}>Balance: {formatAmount(calendar_data.property.currency.symbol, this.bookingEvent.BALANCE)}</wa-tooltip>}
        {noteNode ? <div class="legend_circle noteIcon" style={{ backgroundColor: noteNode.color }}></div> : null}
        {(balanceNode || isDepartureAfterHotelCheckout) && (
          <div class="balanceIcon d-flex">
            {isDepartureAfterHotelCheckout && <div id={lateCheckout} class="legend_circle" style={{ backgroundColor: '#999999' }}></div>}
            {balanceNode ? <div id={balance} class="legend_circle" style={{ backgroundColor: '#f34752' }}></div> : null}
          </div>
        )}

        <div
          class="bookingEventTitle"
          style={{ color: foreground }}
          onTouchStart={event => this.startDragging(event, 'move')}
          onMouseDown={event => this.startDragging(event, 'move')}
        >
          {this.getBookedBy()}
          {this.renderEventBookingNumber()}
        </div>
        <Fragment>
          <div
            class={`bookingEventDragHandle leftSide ${
              !this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)) ? 'skewedLeft' : ''
            }
            ${!this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.to_date)).isAfter(new Date(this.bookingEvent.TO_DATE)) ? 'skewedRight' : ''}`}
            onTouchStart={event => this.startDragging(event, 'leftSide')}
            onMouseDown={event => this.startDragging(event, 'leftSide')}
          ></div>
          <div
            class={`bookingEventDragHandle rightSide ${
              !this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.from_date)).isBefore(new Date(this.bookingEvent.FROM_DATE)) ? 'skewedLeft' : ''
            }
              ${!this.isNewEvent() && moment(new Date(this.bookingEvent.defaultDates.to_date)).isAfter(new Date(this.bookingEvent.TO_DATE)) ? 'skewedRight' : ''}`}
            onTouchStart={event => this.startDragging(event, 'rightSide')}
            onMouseDown={event => this.startDragging(event, 'rightSide')}
          ></div>
        </Fragment>

        {this.showInfoPopup ? (
          <igl-booking-event-hover
            is_vacation_rental={this.is_vacation_rental}
            countries={this.countries}
            currency={this.currency}
            class="top"
            bookingEvent={this.bookingEvent}
            bubbleInfoTop={this.bubbleInfoTopSide}
            style={this.calculateHoverPosition()}
          ></igl-booking-event-hover>
        ) : null}
      </Host>
    );
  }
}
