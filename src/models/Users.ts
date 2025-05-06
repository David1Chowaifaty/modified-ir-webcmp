import { THKUser } from './housekeeping';
export interface UserParams {
  id: number;
  username: string;
  password: string;
  email: string;
  is_active: boolean;
  mobile: string;
  type: number | string;
  is_to_remove?: boolean;
  is_email_verified?: boolean;
}
interface SignIn {
  country: string;
  date: string;
  hour: number;
  ip: string;
  minute: number;
  user_agent: string;
}
export type User = THKUser & {
  type: string;
  is_active: boolean;
  sign_ins: SignIn[];
  is_email_verified?: boolean;
  created_on: string;
  password: string;
  email: string;
  role?: string;
};
