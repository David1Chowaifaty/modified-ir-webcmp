import { IPendingActions } from '@/models/housekeeping';
import { Component, Host, Prop, State, h, Element } from '@stencil/core';

export interface Task {
  id: number;
  date: string; // e.g. '2025-10-28'
  unit: number; // e.g. 228, 501
  status: string; // e.g. 'INHOUSE', 'CHECKIN', 'DUSTY'
  hint?: string; // e.g. 'Noon-2PM'
  a: number; // numeric field (example)
  c: number; // numeric field (example)
  i: number; // numeric field (example)
  housekeeper: string; // e.g. 'Maria'
}
const initialData: Task[] = [
  {
    id: 1,
    date: '20 Jan',
    unit: 228,
    status: 'INHOUSE',
    hint: '27 Oct - 3 Nov',
    a: 4,
    c: 2,
    i: 1,
    housekeeper: 'Maria',
  },
  {
    id: 2,
    date: '20 Jan',
    unit: 501,
    status: 'CHECKIN',
    hint: 'Noon-2PM',
    a: 2,
    c: 0,
    i: 0,
    housekeeper: 'Clean Plus',
  },
  {
    id: 3,
    date: '20 Jan',
    unit: 600,
    status: 'VACANT',
    hint: '',
    a: 1,
    c: 1,
    i: 1,
    housekeeper: 'Petros',
  },
  {
    id: 4,
    date: '20 Jan',
    unit: 102,
    status: 'TURNOVER',
    hint: '10PM-Midnight',
    a: 1,
    c: 1,
    i: 1,
    housekeeper: 'Clean Plus',
  },
  {
    id: 5,
    date: '20 Jan',
    unit: 109,
    status: 'DUSTY',
    hint: '',
    a: 1,
    c: 0,
    i: 1,
    housekeeper: 'Clean Plus',
  },
  {
    id: 6,
    date: '20 Jan',
    unit: 501,
    status: 'CHECKOUT',
    hint: '',
    a: 2,
    c: 2,
    i: 2,
    housekeeper: 'Clean Plus',
  },
  {
    id: 7,
    date: '20 Jan',
    unit: 228,
    status: 'CHECKIN',
    hint: 'Noon-2PM',
    a: 4,
    c: 2,
    i: 1,
    housekeeper: 'Maria',
  },
  {
    id: 8,
    date: '20 Jan',
    unit: 228,
    status: 'CHECKOUT',
    hint: '',
    a: 4,
    c: 2,
    i: 1,
    housekeeper: 'Maria',
  },
];
@Component({
  tag: 'ir-hk-tasks',
  styleUrl: 'ir-hk-tasks.css',
  scoped: true,
})
export class IrHkTasks {
  @Element() el: HTMLElement;

  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;

  @State() isLoading = false;
  @State() selectedDuration = '';
  @State() selectedHouseKeeper = '0';
  @State() selectedRoom: IPendingActions | null = null;
  @State() archiveOpened = false;
  @State() property_id: number;

  // private modalOpenTimeOut: NodeJS.Timeout;
  // private roomService = new RoomService();
  // private houseKeepingService = new HouseKeepingService();
  // private token = new Token();

  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <section class="p-2 d-flex flex-column" style={{ gap: '1rem' }}>
          <ir-tasks-header></ir-tasks-header>
          <div class="d-flex flex-column flex-md-row mt-1 " style={{ gap: '1rem' }}>
            <ir-tasks-filters></ir-tasks-filters>
            <ir-tasks-table class="flex-grow-1 w-100" tasks={initialData}></ir-tasks-table>
          </div>
        </section>
        {/* <ir-title class="d-none d-md-flex" label={locales.entries.Lcz_HousekeepingTasks} justifyContent="space-between">
            <ir-button slot="title-body" text={locales.entries.Lcz_Archive} size="sm"></ir-button>
          </ir-title> */}
      </Host>
    );
  }
}
