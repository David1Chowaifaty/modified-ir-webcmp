import { createStore } from '@stencil/store';
export type TIrInterceptor = 'pending' | 'done' | null;
const initialState: { status: TIrInterceptor; url: string } = { status: null, url: '' };

export const { state: interceptor_requests, onChange: onCalendarDatesChange } = createStore<{ status: TIrInterceptor; url: string }>(initialState);

export default interceptor_requests;
