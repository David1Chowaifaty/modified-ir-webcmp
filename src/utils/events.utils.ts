import moment from 'moment';
import { ToBeAssignedService } from '../services/toBeAssigned.service';
import { dateToFormattedString } from './utils';

export async function updateCategories(key, calendarData, property_id, unassignedDates) {
  try {
    const toBeAssignedService = new ToBeAssignedService();
    let categorisedRooms = {};
    const result = await toBeAssignedService.getUnassignedRooms(property_id, dateToFormattedString(new Date(+key)), calendarData.roomsInfo, calendarData.formattedLegendData);
    result.forEach(room => {
      if (!categorisedRooms.hasOwnProperty(room.RT_ID)) {
        categorisedRooms[room.RT_ID] = [room];
      } else {
        categorisedRooms[room.RT_ID].push(room);
      }
    });
    unassignedDates[key].categories = categorisedRooms;
  } catch (error) {
    //  toastr.error(error);
  }
}
export function transformDateFormatWithMoment(dateStr: string) {
  var dateObj = moment(dateStr, 'ddd, DD MMM YYYY');
  return dateObj.format('D_M_YYYY');
}
