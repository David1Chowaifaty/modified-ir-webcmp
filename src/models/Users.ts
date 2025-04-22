import { THKUser } from './housekeeping';
export interface UserParams {
  id: number;
  username: string;
  password: string;
  email: string;
  is_active: boolean;
  mobile: string;
  type: string;
}

export type User = THKUser & { type: string; is_active: boolean; last_sign_in: string; created_on: string; password: string; email: string; role?: string };
