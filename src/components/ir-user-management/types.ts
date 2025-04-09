import { THKUser } from '@/models/housekeeping';

export type User = THKUser & { is_active: boolean; last_signed_in: string; created_at: string; password: string; email: string; role?: string };
