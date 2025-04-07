export type SalesFilters = {
  from_date: string;
  to_date: string;
  show_previous_year: boolean;
  rooms_status: {
    code: string;
  };
};
