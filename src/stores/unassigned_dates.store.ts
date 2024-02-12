import { createStore } from '@stencil/store';

type EventCategories = {};

type EventInfo = {
  categories: EventCategories;
  dateStr: string;
};

type UnassignedDates = {
  [timestamp: string]: EventInfo;
};

const initialState: UnassignedDates = {};
let { state: unassigned_dates } = createStore<UnassignedDates>(initialState);
export function addUnassingedDates(data: UnassignedDates) {
  unassigned_dates = { ...unassigned_dates, ...data };
}
export function getUnassignedDates() {
  return unassigned_dates;
}
export function removeUnassignedDates(from_date: string, to_date: string) {
  const fromTimestamp = convertToDateTimestamp(from_date);
  const toTimestamp = convertToDateTimestamp(to_date);
  Object.keys(unassigned_dates).forEach(key => {
    const keyTimestamp = parseInt(key);
    if (fromTimestamp <= keyTimestamp && keyTimestamp <= toTimestamp) {
      delete unassigned_dates[key];
    }
  });
}
function convertToDateTimestamp(dateStr: string) {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export default unassigned_dates;
