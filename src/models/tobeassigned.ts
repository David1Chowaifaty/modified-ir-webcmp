export interface InnerRecord {
  categories: any;
  dateStr: string;
}
export interface IUnassignedDates {
  date: string;
  description: string;
}
export interface IRoomCategory {
  roomTypeName: string;
  ID: string;
  NAME: string;
  identifier: string;
  FROM_DATE: string;
  TO_DATE: string;
  STATUS: string;
  NO_OF_DAYS: number;
  RT_ID: number;
  availableRooms: IAvailableRoom[];
  defaultDateRange: IDefaultDateRange;
  BOOKING_NUMBER: string;
  legendData: any;
  roomsInfo: any;
}
interface IDefaultDateRange {
  fromDate: Date;
  toDate: Date;
  fromDateTimeStamp: number;
  toDateTimeStamp: number;
  fromDateStr: string;
  toDateStr: string;
  dateDifference: number;
}

export interface IAvailableRoom {
  FROM_DATE: string;
  roomName: string;
  PR_ID: number;
  TO_DATE: string;
  NO_OF_DAYS: number;
  ID: string;
  STATUS: string;
  RT_ID: number;
  NAME: string;
  NOTES: string;
  BALANCE: string;
  INTERNAL_NOTE: string;
  hideBubble: boolean;
  legendData: any;
  roomsInfo: any;
}
