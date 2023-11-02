import axios from "axios";
import {
  PhysicalRoomType,
  MonthType,
  CellType,
  STATUS,
} from "../models/IBooking";
import { dateDifference } from "./utils";

export async function getMyBookings(months: MonthType[]): Promise<any[]> {
  const myBookings: any[] = [];
  const stayStatus = await getStayStatus();
  for (const month of months) {
    for (const day of month.days) {
      for (const room of day.room_types) {
        assignBooking(room.physicalrooms, myBookings, stayStatus);
      }
    }
  }

  return myBookings;
}

function assignBooking(
  physicalRoom: PhysicalRoomType[],
  myBookings: any[],
  stayStatus: { code: string; value: string }[]
): void {
  for (const room of physicalRoom) {
    for (const key in room.calendar_cell) {
      if (room.calendar_cell[key].Is_Available === false) {
        addOrUpdateBooking(room.calendar_cell[key], myBookings, stayStatus);
      }
    }
  }
}
function formatName(firstName: string | null, lastName: string | null) {
  if (firstName === null && lastName === null) return "";
  if (lastName !== null) {
    return `${firstName ?? ""} , ${lastName ?? ""}`;
  }
  return firstName;
}
async function getStayStatus() {
  try {
    const token = JSON.parse(sessionStorage.getItem("token"));
    if (token) {
      const { data } = await axios.post(
        `/Get_Setup_Entries_By_TBL_NAME_Multi?Ticket=${token}`,
        {
          TBL_NAMES: ["_STAY_STATUS"],
        }
      );
      return data.My_Result.map((d) => ({
        code: d.CODE_NAME,
        value: d.CODE_VALUE_EN,
      }));
    } else {
      throw new Error("Invalid Token");
    }
  } catch (error) {
    console.log(error);
  }
}

const status: Record<string, STATUS> = {
  "004": "BLOCKED",
  "003": "BLOCKED-WITH-DATES",
  "002": "BLOCKED",
  "001": "IN-HOUSE",
};

function getDefaultData(
  cell: CellType,
  stayStatus: { code: string; value: string }[]
): any {
  if (["003", "002", "004"].includes(cell.STAY_STATUS_CODE)) {
    // console.log("blocked cells",cell);
    return {
      ID: cell.POOL,
      NOTES: cell.My_Block_Info.NOTES,
      BALANCE: "",
      NAME:
        stayStatus.find((st) => st.code === cell.STAY_STATUS_CODE).value || "",
      RELEASE_AFTER_HOURS: cell.My_Block_Info.DESCRIPTION,
      PR_ID: cell.My_Block_Info.pr_id,
      ENTRY_DATE: cell.My_Block_Info.BLOCKED_TILL_DATE,
      ENTRY_HOUR: cell.My_Block_Info.BLOCKED_TILL_HOUR,
      ENTRY_MINUTE: cell.My_Block_Info.BLOCKED_TILL_MINUTE,
      OPTIONAL_REASON: cell.My_Block_Info.NOTES,
      FROM_DATE: cell.DATE,
      TO_DATE: cell.DATE,
      NO_OF_DAYS: 1,
      STATUS: status[cell.STAY_STATUS_CODE],
      POOL: cell.POOL,
      STATUS_CODE: cell.STAY_STATUS_CODE,
      OUT_OF_SERVICE: cell.STAY_STATUS_CODE === "004",
      FROM_DATE_STR: cell.My_Block_Info.format.from_date,
      TO_DATE_STR: cell.My_Block_Info.format.to_date,
    };
  }
  //console.log("booked cells",cell);
  return {
    ID: cell.booking.booking_nbr,
    TO_DATE: cell.DATE,
    FROM_DATE: cell.DATE,
    NO_OF_DAYS: 1,
    IS_EDITABLE: cell.booking.is_editable,
    STATUS: status[cell.STAY_STATUS_CODE],
    NAME: formatName(cell.room.guest.first_name, cell.room.guest.last_name),
    PHONE: cell.booking.guest.mobile ?? "",
    ENTRY_DATE: cell.booking.booked_on.date,
    RATE: cell.room.total,
    RATE_PLAN: cell.room.rateplan.name,
    SPLIT_BOOKING: false,
    RATE_PLAN_ID: cell.room.rateplan.id,
    IDENTIFIER: cell.room.identifier,
    RATE_TYPE: 1,
    ADULTS_COUNT: cell.room.occupancy.adult_nbr,
    CHILDREN_COUNT: cell.room.occupancy.children_nbr,
    PR_ID: cell.pr_id,
    POOL: cell.POOL,
    GUEST: cell.booking.guest,
    rooms: cell.booking.rooms,
    TOTAL_PRICE: cell.room.total,
    COUNTRY: cell.booking.guest.country_id,
    FROM_DATE_STR: cell.booking.format.from_date,
    TO_DATE_STR: cell.booking.format.to_date,
  };
}

function updateBookingWithStayData(data: any, cell: CellType): any {
  data.NO_OF_DAYS = dateDifference(data.FROM_DATE, cell.DATE);
  data.TO_DATE = cell.DATE;

  if (cell.booking) {
    const { arrival } = cell.booking;
    Object.assign(data, {
      ARRIVAL_TIME: arrival.description,
    });
  }

  return data;
}

function addOrUpdateBooking(
  cell: CellType,
  myBookings: any[],
  stayStatus: { code: string; value: string }[]
): void {
  const index = myBookings.findIndex((booking) => booking.POOL === cell.POOL);

  if (index === -1) {
    const newData = getDefaultData(cell, stayStatus);
    myBookings.push(newData);
  } else {
    const updatedData = updateBookingWithStayData(myBookings[index], cell);
    myBookings[index] = updatedData;
  }
}
