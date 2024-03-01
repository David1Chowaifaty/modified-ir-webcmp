export interface IExposedHouseKeepingSetup {
  statuses: IHKStatuses[];
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
