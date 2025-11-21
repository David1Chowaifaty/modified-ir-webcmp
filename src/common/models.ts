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
