import { CountrySalesParams } from '@/services/property.service';
import { ICountry } from '@/models/IBooking';

type BaseSalesRecord = { id: string; country: string; number_of_guests?: number; country_id: number; nights: number; percentage: number; revenue: number };
type SalesRecord = BaseSalesRecord & { last_year: Omit<BaseSalesRecord, 'id'> };

type CountrySalesFilter = Omit<CountrySalesParams, 'is_export_to_excel' | 'AC_ID'> & {
  include_previous_year: boolean;
};
type MappedCountries = Map<ICountry['id'], Pick<ICountry, 'name' | 'flag'>>;

export { SalesRecord, BaseSalesRecord, CountrySalesFilter, MappedCountries };
