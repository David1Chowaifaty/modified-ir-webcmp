export interface IExposedHouseKeepingSetup {
  statuses: IHKStatuses[];
  housekeepers: IHouseKeepers[];
  units_assignments: IUnitAssignments[];
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
  username: string;
  assigned_units: IUnit[];
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
