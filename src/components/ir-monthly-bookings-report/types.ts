export type ReportDate = {
  description: string;
  firstOfMonth: string;
  lastOfMonth: string;
};
export type BaseDailyReport = {
  day: string;
  occupancy_percent: number;
  units_booked: number;
};
export type DailyReport = BaseDailyReport & {
  last_year?: BaseDailyReport;
};
export type DailyReportFilter = {
  date: ReportDate;
  include_previous_year: boolean;
};
