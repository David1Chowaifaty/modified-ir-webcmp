import { Option } from '@/models/property-types';

export type TaskFilters = {
  cleaning_periods: { code: string };
  housekeepers: { id: number }[];
  cleaning_frequencies: Option;
  dusty_units: { code: string };
  highlight_check_ins: { code: string };
};
