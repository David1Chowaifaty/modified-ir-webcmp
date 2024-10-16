import axios from 'axios';
import { IAvailableRoom, IRoomCategory, IUnassignedDates, InnerRecord } from '../models/tobeassigned';
import { dateDifference, dateToFormattedString, extras } from '../utils/utils';
import Token from '@/models/Token';
import moment from 'moment';

export class ToBeAssignedService extends Token {
  public async getUnassignedDates(propertyid: number, from_date: string, to_date: string) {
    try {
      const { data } = await axios.post(`/Get_UnAssigned_Dates`, {
        propertyid,
        from_date,
        to_date,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return this.convertUnassignedDates(data.My_Result);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getUnassignedRooms(calendarFromDates: { from_date: string; to_date: string }, propertyid: number, specific_date: string, roomInfo: any, formattedLegendData: any) {
    try {
      const { data } = await axios.post(`/Get_Aggregated_UnAssigned_Rooms`, {
        propertyid,
        specific_date,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return this.transformToAssignable(calendarFromDates, data, roomInfo, formattedLegendData);
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async assignUnit(booking_nbr: string, identifier: string, pr_id: number) {
    try {
      const { data } = await axios.post(`/Assign_Exposed_Room`, {
        booking_nbr,
        identifier,
        pr_id,
        extras,
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      console.log(data);
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  private cleanSpacesAndSpecialChars(str: string) {
    const regex = /[^a-zA-Z0-9]+/g;
    return str.replace(regex, '');
  }

  private transformToAssignable(calendarFromDates: { from_date: string; to_date: string }, data: any, roomInfo, formattedLegendData): IRoomCategory[] {
    const result: IRoomCategory[] = [];
    data.My_Result.forEach((customer: any) => {
      customer.unassigned_rooms.forEach((room: any) => {
        let roomCategory: IRoomCategory = {
          roomTypeName: room.room_type_name,
          ID: room.identifier,
          NAME: room.guest_name,
          identifier: room.identifier,
          FROM_DATE: room.unassigned_date,
          TO_DATE: room.unassigned_date,
          BOOKING_NUMBER: room.book_nbr,
          STATUS: 'IN-HOUSE',
          defaultDateRange: {
            fromDate: undefined,
            toDate: undefined,
            fromDateTimeStamp: 0,
            toDateTimeStamp: 0,
            fromDateStr: '',
            toDateStr: '',
            dateDifference: 0,
          },
          NO_OF_DAYS: 1,
          roomsInfo: roomInfo,
          legendData: formattedLegendData,
          availableRooms: [],
          RT_ID: this.getRoomTypeId(room.room_type_name, roomInfo),
        };
        this.updateAvailableRooms(calendarFromDates, room, roomCategory, formattedLegendData, roomInfo);
        this.addDefaultDateRange(roomCategory);
        result.push(roomCategory);
      });
    });
    return result;
  }
  addDefaultDateRange(roomCategory: IRoomCategory) {
    roomCategory.defaultDateRange.fromDate = new Date(roomCategory.FROM_DATE + 'T00:00:00');
    roomCategory.defaultDateRange.fromDateStr = dateToFormattedString(roomCategory.defaultDateRange.fromDate);
    roomCategory.defaultDateRange.fromDateTimeStamp = roomCategory.defaultDateRange.fromDate.getTime();

    roomCategory.defaultDateRange.toDate = new Date(roomCategory.TO_DATE + 'T00:00:00');
    roomCategory.defaultDateRange.toDateStr = dateToFormattedString(roomCategory.defaultDateRange.toDate);
    roomCategory.defaultDateRange.toDateTimeStamp = roomCategory.defaultDateRange.toDate.getTime();

    roomCategory.defaultDateRange.dateDifference = roomCategory.NO_OF_DAYS;
  }
  private getRoomTypeId(roomName: string, roomInfo: any) {
    return roomInfo.find(room => this.cleanSpacesAndSpecialChars(room.name) === this.cleanSpacesAndSpecialChars(roomName)).id || null;
  }
  private updateAvailableRooms(calendarFromDates: { from_date: string; to_date: string }, room: any, roomCategory: IRoomCategory, formattedLegendData, roomsInfo): void {
    const rooms: IAvailableRoom[] = [];
    room.assignable_units.forEach((unit: any) => {
      if (unit.Is_Fully_Available && !unit.Is_Not_Available) {
        const days = dateDifference(unit.from_date, unit.to_date);
        const fromDate = moment(new Date(calendarFromDates.from_date)).isAfter(moment(new Date(unit.from_date))) ? calendarFromDates.from_date : unit.from_date;
        const toDate =
          moment(new Date(calendarFromDates.to_date)).isBefore(moment(new Date(unit.to_date))) &&
          moment(new Date(calendarFromDates.to_date)).isAfter(moment(new Date(unit.from_date)))
            ? calendarFromDates.to_date
            : unit.to_date;
        rooms.push({
          RT_ID: roomCategory.RT_ID,
          STATUS: 'PENDING-CONFIRMATION',
          FROM_DATE: fromDate,
          roomName: unit.name,
          PR_ID: unit.pr_id,
          TO_DATE: toDate,
          NO_OF_DAYS: days,
          ID: 'NEW_TEMP_EVENT',
          NAME: '',
          NOTES: '',
          BALANCE: '',
          INTERNAL_NOTE: '',
          hideBubble: true,
          legendData: formattedLegendData,
          roomsInfo,
        });
        roomCategory.TO_DATE = unit.to_date;
        roomCategory.NO_OF_DAYS = days;
      }
    });
    roomCategory.availableRooms = rooms;
  }

  private convertUnassignedDates(dates: IUnassignedDates[]): Record<number, InnerRecord> {
    let convertedDates: Record<number, InnerRecord> = {};
    dates.forEach(date => {
      let newDate = new Date(date.date);
      newDate.setHours(0, 0, 0, 0);
      convertedDates[newDate.getTime()] = {
        categories: {},
        dateStr: date.description,
      };
    });
    return convertedDates;
  }
}
