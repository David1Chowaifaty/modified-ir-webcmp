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
  const tasksMap = new Map(calendar_dates.cleaningTasks);
  for (const task of tasks) {
    const taskMap = new Map(tasksMap.get(task.unit.id) ?? new Map());
    taskMap.set(task.date, task);
    tasksMap.set(task.unit.id, taskMap);
  }
  calendar_dates.cleaningTasks = new Map(tasksMap);
}

export function cleanRoom(task: Task) {
  const tasksMap = new Map(calendar_dates.cleaningTasks);
  if (!tasksMap.has(task.unit.id)) {
    return;
  }
  const taskMap = new Map(tasksMap.get(task.unit.id));
  taskMap.delete(task.date);
  tasksMap.set(task.unit.id, taskMap);
  calendar_dates.cleaningTasks = new Map(tasksMap);
}

export function addRoomForCleaning(task: Task) {
  const tasksMap = new Map(calendar_dates.cleaningTasks);
  const taskMap = new Map(tasksMap.get(task.unit.id) ?? new Map());
  taskMap.set(task.date, task);
  tasksMap.set(task.unit.id, taskMap);
  calendar_dates.cleaningTasks = new Map(tasksMap);
}
