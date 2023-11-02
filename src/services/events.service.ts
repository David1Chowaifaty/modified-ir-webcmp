import axios from "axios";
import { BookingService } from "./booking.service";
import { getReleaseHoursString } from "../utils/utils";

export class EventsService {
  private readonly bookingService: BookingService = new BookingService();

  async reallocateEvent(
    pool: string,
    destination_pr_id: number,
    from_date: string,
    to_date: string
  ) {
    try {
      const token = JSON.parse(sessionStorage.getItem("token"));
      if (token) {
        console.log(pool, destination_pr_id, from_date, to_date);
        const { data } = await axios.post(
          `/ReAllocate_Exposed_Room?Ticket=${token}`,
          { pool, destination_pr_id, from_date, to_date }
        );
        if (data.ExceptionMsg !== "") {
          throw new Error(data.ExceptionMsg);
        }
        console.log(data);
        return data;
      } else {
        throw new Error("Invalid Token");
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async deleteEvent(POOL: string) {
    try {
      const token = JSON.parse(sessionStorage.getItem("token"));
      if (token) {
        const { data } = await axios.post(
          `/UnBlock_Exposed_Unit?Ticket=${token}`,
          {
            POOL,
          }
        );
        if (data.ExceptionMsg !== "") {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      } else {
        throw new Error("Invalid Token");
      }
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  public async updateBlockedEvent(bookingEvent: any) {
    try {
      const token = JSON.parse(sessionStorage.getItem("token"));
      if (token) {
        const releaseData = getReleaseHoursString(
          +bookingEvent.RELEASE_AFTER_HOURS
        );
        await this.deleteEvent(bookingEvent.POOL);
        await this.bookingService.blockUnit({
          from_date: this.formatDate(bookingEvent.FROM_DATE),
          to_date: this.formatDate(bookingEvent.TO_DATE),
          pr_id: bookingEvent.PR_ID,
          STAY_STATUS_CODE: bookingEvent.OUT_OF_SERVICE
            ? "004"
            : bookingEvent.RELEASE_AFTER_HOURS === 0
            ? "002"
            : "003",
          DESCRIPTION: bookingEvent.RELEASE_AFTER_HOURS || "",
          NOTES: bookingEvent.OPTIONAL_REASON || "",
          ...releaseData,
        });
      } else {
        throw new Error("Invalid Token");
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  private formatDate(date: string) {
    return date.split("/").join("-");
  }
}
