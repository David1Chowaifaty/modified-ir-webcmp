import { DayData } from '@/models/DayType';
import { createStore } from '@stencil/store';
import { Task } from '@/models/housekeeping';
export interface ICalendarDates {
  days: DayData[];
  disabled_cells: Map<
    string,
    {
      disabled: boolean;
      reason: 'inventory' | 'stop_sale';
    }
  >;
  months: { daysCount: number; monthName: string }[];
  fromDate: string;
  toDate: string;
  cleaningTasks: Map<number, Map<string, Task>>;
}
const initialState: ICalendarDates = {
  days: [],
  months: [],
  fromDate: '',
  toDate: '',
  disabled_cells: new Map(),
  cleaningTasks: new Map(),
};
export const { state: calendar_dates, onChange: onCalendarDatesChange } = createStore<ICalendarDates>(initialState);

export default calendar_dates;

export function addCleaningTasks(tasks: Task[]) {
  const tasksMap = new Map();
  for (const task of tasks) {
    const taskMap = new Map(tasksMap.get(task.unit.id) ?? new Map());
    taskMap.set(task.date, task);
    tasksMap.set(task.unit.id, taskMap);
  }
  calendar_dates.cleaningTasks = new Map(tasksMap);
}

export function cleanRoom({ unitId, date }: { unitId: Task['unit']['id']; date: Task['date'] }) {
  const tasksMap = new Map(calendar_dates.cleaningTasks);
  if (!tasksMap.has(unitId)) {
    return;
  }
  const taskMap = new Map(tasksMap.get(unitId));
  taskMap.delete(date);
  tasksMap.set(unitId, taskMap);
  calendar_dates.cleaningTasks = new Map(tasksMap);
}

export function addRoomForCleaning({ unitId, date, task }: { unitId: Task['unit']['id']; date: Task['date']; task?: Task }) {
  const tasksMap = new Map(calendar_dates.cleaningTasks);
  const taskMap = new Map(tasksMap.get(unitId) ?? new Map());
  taskMap.set(date, task ?? date);
  tasksMap.set(unitId, taskMap);
  calendar_dates.cleaningTasks = new Map(tasksMap);
}
