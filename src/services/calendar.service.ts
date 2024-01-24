import calendarDataState from '@/stores/calendar-data.store';
import { BookingService } from './booking.service';
import { RoomService } from './room.service';
import { formatLegendColors } from '@/utils/utils';
import { bookingReasons } from '@/models/IBooking';
import { Socket, io } from 'socket.io-client';

export class CalendarService {
  private bookingService: BookingService;
  private roomService: RoomService;
  private socket: Socket;
  constructor() {
    this.bookingService = new BookingService();
    this.roomService = new RoomService();
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
    // Logic for booking updates
  }

  private handleDeleteCalendarPool(payload: any) {
    // Logic for handling DELETE_CALENDAR_POOL
  }

  private async handleGetUnassignedDates(payload: any) {
    // Logic for handling GET_UNASSIGNED_DATES
  }
}
