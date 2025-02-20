export interface IExposedHouseKeepingSetup {
  statuses: IHKStatuses[];
  housekeepers: IHouseKeepers[];
  units_assignments: IUnitAssignments;
  cleaning_frequencies: ExposedHKSetup[];
  cleaning_periods: ExposedHKSetup[];
  dusty_periods: ExposedHKSetup[];
  highlight_checkin_options: ExposedHKSetup[];
}
export interface ExposedHKSetup {
  code: string;
  description: string;
}

export interface IHouseKeepers {
  id: number;
  is_active: boolean;
  is_soft_deleted: boolean;
  mobile: string;
  name: string;
  note: string;
  password: string;
  property_id: number;
  phone_prefix: string;
  username: string;
  assigned_units: IUnit[];
}
export type THKUser = Omit<IHouseKeepers, 'is_soft_deleted' | 'is_active' | 'assigned_units'>;
export type TPendingHkSetupParams = {
  property_id: number;
  bracket: {
    code: string;
  };
  housekeeper: {
    id: number;
  };
};
export interface IHKTasks {
  brackets: IBrackets[];
  housekeepers: IHouseKeepers[];
}
export interface IBrackets {
  code: string;
  description: string;
}
export interface IUnit {
  calendar_cell: string | null;
  housekeeper: null;
  id: number;
  name: string;
}
export interface IUnitAssignments {
  assigned: number;
  total: number;
  un_assigned: number;
  unassigned_units: IUnit[];
}
export interface IHKStatuses {
  action: string;
  code: string;
  description: string;
  inspection_mode: IInspectionMode;
  style: IHKStatusesStyle;
}
export interface IHKStatusesStyle {
  color: string;
  shape: TShape;
}
export interface IInspectionMode {
  is_active: boolean;
  window: number;
}
export type TShape = 'smallcircle' | 'bigcircle';

export interface ICauseBase {
  type: string;
}
export interface IUnassignedUnitsCause extends ICauseBase {
  type: 'unassigned_units';
  user: IHouseKeepers | null;
}
export interface IUserCause extends ICauseBase {
  type: 'user';
  isEdit: boolean;
  user: THKUser | null;
}
export interface IDeleteCause extends ICauseBase {
  type: 'delete';
  user: IHouseKeepers;
}

export type THousekeepingTrigger = IUnassignedUnitsCause | IUserCause | IDeleteCause;
export interface IPropertyHousekeepingAssignment {
  hkm_id: number;
  unit_id: number;
  is_to_assign: boolean;
}
export interface IPendingActions {
  arrival: string;
  arrival_time: string;
  housekeeper: IHouseKeepers;
  status: IHKStatuses;
  unit: IUnit;
}

export interface Task {
  id: string;
  adult: number;
  child: number;
  date: string;
  hint: string;
  hkm_id: number;
  infant: number;
  status: TaskStatus;
  unit: IUnit;
  housekeeper: string;
}
export type TaskStatus = {
  code: string;
  description: string;
};
export type TaskStatusCode = 'IH' | 'CI' | 'CO' | 'VA';
