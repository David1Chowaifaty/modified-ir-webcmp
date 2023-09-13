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

export class guestInfoValidation extends guestInfo {
  firstNameValid: boolean = false;
  lastNameValid: boolean = false;
  emailValid: boolean = false;
  countryValid: boolean = false;
  passwordValid: boolean = false;
  mobileValid: boolean = false;
  prefixValid: boolean = false;
  setupData: boolean = false;
}
