import calendarDataState from '@/stores/calendar-data.store';
import { BookingService } from './booking.service';
import { RoomService } from './room.service';
import { formatLegendColors } from '@/utils/utils';
import { RoomBlockDetails, RoomBookingDetails, bookingReasons } from '@/models/IBooking';
import { Socket, io } from 'socket.io-client';
import { Token } from '@/models/Token';
import { transformNewBLockedRooms, transformNewBooking } from '@/utils/booking';
import { addBookings, getBookings } from '@/stores/booking-store';

export class CalendarService extends Token {
  private bookingService: BookingService;
  private roomService: RoomService;
  private socket: Socket;

  constructor() {
    super();
    this.bookingService = new BookingService();
    this.roomService = new RoomService();
    const token = this.getToken();
    this.bookingService.setToken(token);
    this.roomService.setToken(token);
  }

  public async Init(language: string, property_id: number, from_date: string, to_date: string) {
    const [defaultTexts, roomResp, bookingResp, countryNodeList] = await Promise.all([
      this.roomService.fetchLanguage(language),
      this.roomService.fetchData(property_id, language),
      this.bookingService.getCalendarData(property_id, from_date, to_date),
      this.bookingService.getCountries(language),
    ]);
    calendarDataState.language = language;
    this.setUpCalendarData(roomResp, bookingResp);
    this.initializeSocket(property_id);
    return { defaultTexts, roomResp, bookingResp, countryNodeList };
  }
  private setUpCalendarData(roomResp, bookingResp) {
    calendarDataState.currency = roomResp['My_Result'].currency;
    calendarDataState.allowedBookingSources = roomResp['My_Result'].allowed_booking_sources;
    calendarDataState.adultChildConstraints = roomResp['My_Result'].adult_child_constraints;
    calendarDataState.is_vacation_rental = roomResp['My_Result'].is_vacation_rental;
    calendarDataState.legendData = roomResp['My_Result'].calendar_legends;
    calendarDataState.startingDate = new Date(bookingResp.My_Params_Get_Rooming_Data.FROM).getTime();
    calendarDataState.endingDate = new Date(bookingResp.My_Params_Get_Rooming_Data.TO).getTime();
    calendarDataState.formattedLegendData = formatLegendColors(roomResp['My_Result'].calendar_legends);
  }
  private initializeSocket(property_id: number) {
    this.socket = io('https://realtime.igloorooms.com/');
    this.socket.on('MSG', async msg => {
      this.handleSocketMessage(msg, property_id);
    });
  }
  private async handleSocketMessage(msg: string, property_id: number) {
    let msgAsObject = JSON.parse(msg);
    if (msgAsObject && msgAsObject.KEY.toString() === property_id.toString()) {
      const { REASON, PAYLOAD } = msgAsObject;
      switch (REASON) {
        case 'DORESERVATION':
        case 'BLOCK_EXPOSED_UNIT':
        case 'ASSIGN_EXPOSED_ROOM':
        case 'REALLOCATE_EXPOSED_ROOM_BLOCK':
          await this.handleBookingUpdates(REASON, PAYLOAD);
          break;
        case 'DELETE_CALENDAR_POOL':
          this.handleDeleteCalendarPool(PAYLOAD);
          break;
        case 'GET_UNASSIGNED_DATES':
          await this.handleGetUnassignedDates(PAYLOAD);
          break;
        default:
          return;
      }
    }
  }
  private async handleBookingUpdates(reason: bookingReasons, payload: any) {
    let transformedBooking: RoomBookingDetails[] | RoomBlockDetails[];
    if (reason === 'BLOCK_EXPOSED_UNIT' || reason === 'REALLOCATE_EXPOSED_ROOM_BLOCK') {
      transformedBooking = [await transformNewBLockedRooms(payload)];
    } else {
      transformedBooking = transformNewBooking(payload);
    }
    addBookings(transformedBooking);
    // Logic for booking updates
  }
  checkBookingAvailability(data) {
    return getBookings().some(booking => booking.ID === data.ID || (booking.FROM_DATE === data.FROM_DATE && booking.TO_DATE === data.TO_DATE && booking.PR_ID === data.PR_ID));
  }
  updateBookingEventsDateRange(eventData) {
    // const now = moment();
    // eventData.forEach(bookingEvent => {
    //   bookingEvent.legendData = calendar_data.formattedLegendData;
    //   bookingEvent.defaultDateRange = {};
    //   bookingEvent.defaultDateRange.fromDate = new Date(bookingEvent.FROM_DATE + 'T00:00:00');
    //   bookingEvent.defaultDateRange.fromDateStr = this.getDateStr(bookingEvent.defaultDateRange.fromDate);
    //   bookingEvent.defaultDateRange.fromDateTimeStamp = bookingEvent.defaultDateRange.fromDate.getTime();
    //   bookingEvent.defaultDateRange.toDate = new Date(bookingEvent.TO_DATE + 'T00:00:00');
    //   bookingEvent.defaultDateRange.toDateStr = this.getDateStr(bookingEvent.defaultDateRange.toDate);
    //   bookingEvent.defaultDateRange.toDateTimeStamp = bookingEvent.defaultDateRange.toDate.getTime();
    //   bookingEvent.defaultDateRange.dateDifference = bookingEvent.NO_OF_DAYS;
    //   bookingEvent.roomsInfo = [...calendar_data.roomsInfo];
    //   if (!isBlockUnit(bookingEvent.STATUS_CODE)) {
    //     const toDate = moment(bookingEvent.TO_DATE, 'YYYY-MM-DD');
    //     const fromDate = moment(bookingEvent.FROM_DATE, 'YYYY-MM-DD');
    //     if (bookingEvent.STATUS !== 'PENDING') {
    //       if (fromDate.isSame(now, 'day') && now.hour() >= 12) {
    //         bookingEvent.STATUS = bookingStatus['000'];
    //       } else if (now.isAfter(fromDate, 'day') && now.isBefore(toDate, 'day')) {
    //         bookingEvent.STATUS = bookingStatus['000'];
    //       } else if (toDate.isSame(now, 'day') && now.hour() < 12) {
    //         bookingEvent.STATUS = bookingStatus['000'];
    //       } else if ((toDate.isSame(now, 'day') && now.hour() >= 12) || toDate.isBefore(now, 'day')) {
    //         bookingEvent.STATUS = bookingStatus['003'];
    //       }
    //     }
    //   }
    // });
  }
  private handleDeleteCalendarPool(payload: any) {
    
  }
  public async handleGetUnassignedDates(payload: any) {
    // Logic for handling GET_UNASSIGNED_DATES
  }
}
