export type FooterButtonType = 'cancel' | 'next';
export type BookUserParams = [
  any,
  boolean,
  Date,
  Date,
  any,
  number,
  { code: string; description: string },
  number,
  { id: number; code: string },
  string | undefined,
  any | undefined,
  any | undefined,
  number | undefined,
  string | undefined,
];
export type TPropertyButtonsTypes = 'cancel' | 'save' | 'back' | 'book' | 'bookAndCheckIn' | 'next' | 'check';
export type TSourceOption = { code: string; description: string; tag: string };
export type TSourceOptions = { id: string; value: string; tag: string; type: string };
export type TAdultChildConstraints = { adult_max_nbr: number | null; child_max_nbr: number | null; child_max_age: number | null };
