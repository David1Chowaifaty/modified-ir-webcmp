export type ReportDate = {
  description: string;
  firstOfMonth: string;
  lastOfMonth: string;
};
export type DailyReport = {
  date: string;
  rooms: number;
};
export type DailyReportFilter = {
  date: ReportDate;
  include_previous_year: boolean;
};
