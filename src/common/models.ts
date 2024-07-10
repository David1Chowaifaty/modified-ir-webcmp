import { Guest, ICCI } from '../models/booking.dto';

export interface IrOnlineResource {
  isJS?: boolean;
  isCSS?: boolean;
  link?: string;
}

export class selectOption {
  value: string;
  text: string;
}

export class checkboxes {
  value: string = '';
  text: string = '';
  checked: boolean = false;
}

export class guestInfo {
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  altEmail: string = '';
  password: string = '';
  country: number = -1;
  city: string = '';
  address: string = '';
  mobile: string = '';
  prefix: string = '';
  newsletter: boolean = false;
  currency: string = '';
  language: string = '';
}

export class guestInfoValidation implements Guest {
  country_phone_prefix: string;
  cci?: ICCI;
  alternative_email?: string;
  address: string;
  city: string;
  country_id: number;
  dob: string;
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  mobile: string;
  subscribe_to_news_letter: boolean;
  firstNameValid: boolean = false;
  lastNameValid: boolean = false;
  emailValid: boolean = false;
  countryValid: boolean = false;
  passwordValid: boolean = false;
  mobileValid: boolean = false;
  prefixValid: boolean = false;
  setupData: boolean = false;
}
