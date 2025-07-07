import { CountrySalesParams } from '@/services/property.service';
export type SalesRecord = { id: string; country: string; nights: number; percentage: number; last_year_percentage: number };

export type CountrySalesFilter = Omit<CountrySalesParams, 'is_export_to_excel' | 'AC_ID'> & {
  include_previous_year: boolean;
};
