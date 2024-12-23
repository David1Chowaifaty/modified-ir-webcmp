//Sidebar
export type BookingDetailsSidebarEvents = 'guest' | 'pickup' | 'extra_note' | 'extra_service';
export type OpenSidebarEvent = {
  type: BookingDetailsSidebarEvents;
  payload?: unknown;
};
//Dialog
export type BookingDetailsDialogEvents = 'pms' | 'events-log';
export type OpenDialogEvent = {
  type: BookingDetailsDialogEvents;
  payload?: unknown;
};
