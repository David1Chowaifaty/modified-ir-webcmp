import { createStore } from '@stencil/store';
export type TIrInterceptor = 'pending' | 'done' | null;
const initialState: { status: TIrInterceptor } = { status: null };

export const { state: interceptor_requests, onChange: onCalendarDatesChange } = createStore<{ status: TIrInterceptor }>(initialState);

export default interceptor_requests;
