import { SharedPerson } from '@/models/booking.dto';
import moment from 'moment';
import IMask, { FactoryArg } from 'imask';

export const defaultGuest: SharedPerson = {
  id: -1,
  full_name: '',
  country_id: null,
  dob: '',
  id_info: {
    type: {
      code: null,
      description: null,
    },
    number: '',
  },
  address: null,
  alternative_email: null,
  cci: null,
  city: null,
  country: undefined,
  country_phone_prefix: null,
  email: null,
  first_name: '',
  last_name: '',
  mobile: null,
  nbr_confirmed_bookings: 0,
  notes: null,
  password: null,
  subscribe_to_news_letter: null,
};
/**Date of birth mask for room guests  with min */
export const dateMask: FactoryArg = {
  mask: Date,
  pattern: 'DD/MM/YYYY',
  lazy: false,
  min: new Date(1900, 0, 1),
  max: new Date(),
  format: date => moment(date).format('DD/MM/YYYY'),
  parse: str => moment(str, 'DD/MM/YYYY').toDate(),
  autofix: true,
  blocks: {
    YYYY: {
      mask: IMask.MaskedRange,
      from: 1970,
      to: new Date().getFullYear(),
      placeholderChar: 'Y',
    },
    MM: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 12,
      placeholderChar: 'M',
    },
    DD: {
      mask: IMask.MaskedRange,
      from: 1,
      to: 31,
      placeholderChar: 'D',
    },
  },
};
