import { BookingService } from '@/services/booking.service';
import calendar_data from '@/stores/calendar-data';
import { ReloadInterceptor } from '@/utils/ReloadInterceptor';
import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import moment, { Moment } from 'moment';
import { z, ZodError } from 'zod';
export type SelectedRooms = { id: string | number; result: 'open' | 'closed' };
// export type SelectedRooms = Record<string | number, (number|string)[]>;
export interface Weekday {
  value: number;
  label: string;
}
@Component({
  tag: 'igl-bulk-stop-sale',
  styleUrls: ['igl-bulk-stop-sale.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IglBulkStopSale {
  @Prop() maxDatesLength = 8;

  @State() selectedRoomTypes: SelectedRooms[] = [];
  @State() errors: 'dates' | 'rooms';
  @State() isLoading: boolean;
  @State() dates: {
    from: Moment | null;
    to: Moment | null;
  }[] = [{ from: null, to: null }];

  private weekdays: Weekday[] = [
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'Th' },
    { value: 5, label: 'Fr' },
    { value: 6, label: 'Sa' },
    { value: 0, label: 'Su' },
  ];
  @State() selectedWeekdays: Set<number> = new Set(
    Array(7)
      .fill(null)
      .map((_, i) => i),
  );

  @Event() closeModal: EventEmitter<null>;

  private sidebar: HTMLIrSidebarElement;
  private dateRefs: { from?: HTMLIrDatePickerElement; to?: HTMLIrDatePickerElement }[] = [];
  // private allRoomTypes: SelectedRooms[] = [];
  private reloadInterceptor: ReloadInterceptor;
  private minDate = moment().format('YYYY-MM-DD');
  private bookingService = new BookingService();
  private getDayIndex(dateStr: string): number {
    return moment(dateStr, 'YYYY-MM-DD').day();
  }
  private datesSchema = z.array(
    z.object({
      from: z
        .any()
        .refine((val): val is Moment => moment.isMoment(val), {
          message: "Invalid 'from' date; expected a Moment object.",
        })
        .transform((val: Moment) => val.format('YYYY-MM-DD')),
      to: z
        .any()
        .refine((val): val is Moment => moment.isMoment(val), {
          message: "Invalid 'to' date; expected a Moment object.",
        })
        .transform((val: Moment) => val.format('YYYY-MM-DD')),
    }),
  );

  componentWillLoad() {
    // this.selectAllRoomTypes();
  }
  componentDidLoad() {
    this.reloadInterceptor = new ReloadInterceptor({ autoActivate: false });
    this.sidebar = document.querySelector('ir-sidebar') as HTMLIrSidebarElement;
  }

  disconnectedCallback() {
    this.reloadInterceptor.deactivate();
  }

  @Listen('beforeSidebarClose', { target: 'body' })
  handleBeforeSidebarClose(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (window.confirm('Do you really want to proceed?')) {
      this.deactivate();
      this.sidebar.toggleSidebar();
    }
  }

  // private toggleAllRoomTypes(e: CustomEvent) {
  //   e.stopImmediatePropagation();
  //   e.stopPropagation();
  //   if (!e.detail) {
  //     this.selectedRoomTypes = [];
  //     return;
  //   }
  //   this.selectedRoomTypes = this.allRoomTypes;
  // }

  // private selectAllRoomTypes() {
  //   this.allRoomTypes = calendar_data.roomsInfo.map(rt => ({
  //     [rt.id]: rt.physicalrooms.map(room => room.id),
  //   }));
  //   this.selectedRoomTypes = this.allRoomTypes;
  // }

  // private toggleRoom({ checked, roomId, roomTypeId }: { checked: boolean; roomTypeId: number; roomId: number }): void {
  //   // clone current selection
  //   const selected = [...this.selectedRoomTypes];
  //   // find existing entry for this roomType
  //   const idx = selected.findIndex(entry => Object.keys(entry)[0] === roomTypeId.toString());

  //   if (checked) {
  //     // add the room
  //     if (idx > -1) {
  //       const rooms = selected[idx][roomTypeId];
  //       if (!rooms.includes(roomId)) {
  //         selected[idx] = { [roomTypeId]: [...rooms, roomId] };
  //       }
  //     } else {
  //       selected.push({ [roomTypeId]: [roomId] });
  //     }
  //   } else {
  //     // remove the room
  //     if (idx > -1) {
  //       const filtered = selected[idx][roomTypeId].filter(id => id !== roomId);
  //       if (filtered.length) {
  //         selected[idx] = { [roomTypeId]: filtered };
  //       } else {
  //         selected.splice(idx, 1);
  //       }
  //     }
  //   }

  //   this.selectedRoomTypes = selected;
  // }

  // private toggleRoomType({ checked, roomTypeId }: { checked: boolean; roomTypeId: number }): void {
  //   const selected = [...this.selectedRoomTypes];
  //   const idx = selected.findIndex(entry => Object.keys(entry)[0] === roomTypeId.toString());

  //   if (checked) {
  //     const roomType = calendar_data.roomsInfo.find(rt => rt.id === roomTypeId);
  //     const allRooms = roomType ? roomType.physicalrooms.map(r => r.id) : [];

  //     if (idx > -1) {
  //       selected[idx] = { [roomTypeId]: allRooms };
  //     } else {
  //       selected.push({ [roomTypeId]: allRooms });
  //     }
  //   } else {
  //     if (idx > -1) {
  //       selected.splice(idx, 1);
  //     }
  //   }

  //   this.selectedRoomTypes = selected;
  // }

  private async addBlockDates() {
    try {
      this.errors = null;
      this.isLoading = true;
      if (this.selectedRoomTypes.length === 0) {
        return (this.errors = 'rooms');
      }
      const periods = this.datesSchema.parse(this.dates);
      this.activate();
      const periods_to_modify = [];
      for (const period of periods) {
        let current = period.from;
        const lastDay = moment(period.to, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
        while (current !== lastDay) {
          const nextDay = moment(current, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD');
          if (!this.selectedWeekdays.has(this.getDayIndex(current))) {
            current = nextDay;
            continue;
          }
          for (const selectedRoom of this.selectedRoomTypes) {
            periods_to_modify.push({
              room_type_id: selectedRoom.id,
              night: current,
            });
          }
          current = nextDay;
        }
      }
      const isAllOpen = this.selectedRoomTypes.every(e => e.result === 'open');
      const isAllClosed = this.selectedRoomTypes.every(e => e.result === 'closed');
      if (isAllClosed || isAllOpen) {
        await this.bookingService.setExposedRestrictionPerRoomType({
          is_closed: isAllClosed,
          restrictions: periods_to_modify,
        });
      } else {
        for (const room of this.selectedRoomTypes) {
          const periods = periods_to_modify.filter(f => f.room_type_id === room.id);
          await this.bookingService.setExposedRestrictionPerRoomType({
            is_closed: room.result === 'closed',
            restrictions: periods,
          });
        }
      }

      this.deactivate();
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        this.errors = 'dates';
      }
    } finally {
      this.isLoading = false;
    }
  }
  private activate() {
    this.reloadInterceptor.activate();
    if (this.sidebar) this.sidebar.preventClose = true;
  }
  private deactivate() {
    this.reloadInterceptor.deactivate();
    if (this.sidebar) this.sidebar.preventClose = false;
  }
  private toggleWeekDays({ checked, weekDay }: { checked: boolean; weekDay: number }): void {
    const prev = new Set(this.selectedWeekdays);
    if (checked) {
      if (!this.selectedWeekdays.has(weekDay)) {
        prev.add(weekDay);
        this.selectedWeekdays = new Set(prev);
      }
    } else {
      prev.delete(weekDay);
      this.selectedWeekdays = new Set(prev);
    }
  }

  // private handleToDateChange({ index, date }: { index: number; date: Moment }) {
  //   const dates = [...this.dates];
  //   dates[index] = { ...dates[index], to: date };
  //   for (let i = index + 1; i < dates.length; i++) {
  //     const prevToDate = dates[i - 1].to;
  //     if (!prevToDate) continue;
  //     if (!dates[i].from || dates[i].from.isSameOrBefore(prevToDate, 'day')) {
  //       dates[i] = {
  //         ...dates[i],
  //         from: moment(prevToDate).add(1, 'day'),
  //         to: dates[i].to && dates[i].to.isBefore(moment(prevToDate).add(1, 'day'), 'day') ? null : dates[i].to,
  //       };
  //     }
  //   }
  //   this.dates = [...dates];
  //   if (index < this.dates.length - 1) {
  //     setTimeout(() => {
  //       this.dateRefs[index + 1]?.from.openDatePicker();
  //     }, 100);
  //   }
  // }

  // private handleFromDateChange({ index, date }: { index: number; date: Moment }) {
  //   const dates = [...this.dates];
  //   dates[index] = { ...dates[index], from: date };
  //   if (dates[index].to && dates[index].to.isBefore(date, 'day')) {
  //     dates[index] = { ...dates[index], to: null };
  //   }
  //   for (let i = index + 1; i < dates.length; i++) {
  //     const prevToDate = dates[i - 1].to;
  //     if (!prevToDate) continue;
  //     if (!dates[i].from || dates[i].from.isSameOrBefore(prevToDate, 'day')) {
  //       dates[i] = {
  //         ...dates[i],
  //         from: moment(prevToDate).add(1, 'day'),
  //         to: dates[i].to && dates[i].to.isBefore(moment(prevToDate).add(1, 'day'), 'day') ? null : dates[i].to,
  //       };
  //     }
  //   }
  //   this.dates = [...dates];
  //   setTimeout(() => {
  //     this.dateRefs[index]?.to.openDatePicker();
  //   }, 100);
  // }
  private handleToDateChange({ index, date }: { index: number; date: Moment }) {
    // 1) clone and set the new “to”
    const dates = [...this.dates];
    dates[index] = { ...dates[index], to: date };

    // 2) clear every row beneath it
    for (let i = index + 1; i < dates.length; i++) {
      dates[i] = { from: null, to: null };
    }

    // 3) commit
    this.dates = dates;

    // 4) focus the first empty “from” in the list
    const nextFrom = dates.findIndex(d => d.from === null);
    if (nextFrom > -1) {
      setTimeout(() => this.dateRefs[nextFrom]?.from.openDatePicker(), 100);
    }
  }

  private handleFromDateChange({ index, date }: { index: number; date: Moment }) {
    // 1) clone and set the new “from”
    const dates = [...this.dates];
    dates[index] = { ...dates[index], from: date };

    // 2) if the existing “to” is now before it, wipe it out
    if (dates[index].to && dates[index].to.isBefore(date, 'day')) {
      dates[index] = { ...dates[index], to: null };
    }

    // 3) clear every row beneath it
    for (let i = index + 1; i < dates.length; i++) {
      dates[i] = { from: null, to: null };
    }

    // 4) commit
    this.dates = dates;

    // 5) focus the “to” for this same row so they can finish that range
    setTimeout(() => this.dateRefs[index]?.to.openDatePicker(), 100);
  }
  private addDateRow() {
    const last_dates = this.dates[this.dates.length - 1];
    if (!last_dates.from || !last_dates.to) {
      this.errors = 'dates';
      return;
    }
    this.errors = null;
    this.dates = [...this.dates, { from: null, to: null }];
    setTimeout(() => {
      this.dateRefs[this.dates.length - 1].to?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
  render() {
    // const selectedRoomsByType = this.selectedRoomTypes.reduce((acc, entry) => {
    //   const typeId = Number(Object.keys(entry)[0]);
    //   acc[typeId] = entry[typeId];
    //   return acc;
    // }, {} as Record<number, (string | number)[]>);
    // const allFullySelected = calendar_data.roomsInfo.every(({ id, physicalrooms }) => {
    //   const sel = selectedRoomsByType[id] || [];
    //   return sel.length === physicalrooms.length;
    // });

    // const shouldShowAllRooms = !allFullySelected;
    console.log(this.selectedRoomTypes);
    return (
      <form
        class={'bulk-sheet-container'}
        onSubmit={e => {
          e.preventDefault();
          this.addBlockDates();
        }}
      >
        <div class="sheet-header d-flex align-items-center">
          <ir-title
            onCloseSideBar={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              if (this.isLoading) {
                return;
              }
              this.closeModal.emit(null);
            }}
            class="px-1 mb-0"
            label="Bulk Open / Stop Sale"
            displayContext="sidebar"
          ></ir-title>
        </div>
        <div class="sheet-body px-1">
          <div class="text-muted text-left py-0 my-0">
            {calendar_data.is_vacation_rental ? <p>Select the listings that you want to open or stop sale.</p> : <p>Select the unit(s) that you want to open or stop sale.</p>}
          </div>
          {/* <p class="text-left text-muted">Select room types to block</p> */}
          {/* <div class="d-flex flex-column" style={{ gap: '1rem' }}>
            <ir-checkbox
              indeterminate={this.selectedRoomTypes?.length > 0 && shouldShowAllRooms}
              checked={!shouldShowAllRooms}
              onCheckChange={e => this.toggleAllRoomTypes(e)}
              label="All property"
              labelClass="m-0 p-0 ml-1"
            ></ir-checkbox>
            {shouldShowAllRooms &&
              calendar_data.roomsInfo.map(roomType => {
                const selectedRoomType = this.selectedRoomTypes.find(rt => !!rt[roomType.id]);
                const selectedRooms = selectedRoomType ? selectedRoomType[roomType.id] : [];
                const physicalRoomsLength = roomType.physicalrooms.length;
                return (
                  <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
                    <ir-checkbox
                      onCheckChange={e => this.toggleRoomType({ checked: e.detail, roomTypeId: roomType.id })}
                      checked={selectedRooms?.length === physicalRoomsLength}
                      indeterminate={selectedRooms?.length > 0 && selectedRooms?.length < physicalRoomsLength}
                      label={roomType.name}
                      labelClass="m-0 p-0 ml-1"
                    ></ir-checkbox>
                    <div class="d-flex ml-1 flex-column" style={{ gap: '0.5rem' }}>
                      {roomType.physicalrooms.map(room => (
                        <ir-checkbox
                          checked={!!selectedRooms.find(r => r === room.id)}
                          onCheckChange={e => this.toggleRoom({ checked: e.detail, roomTypeId: roomType.id, roomId: room.id })}
                          label={room.name}
                          labelClass="m-0 p-0 ml-1"
                        ></ir-checkbox>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div> */}
          <table>
            <thead>
              <tr>
                <th class="sr-only">choice</th>
                <th class="sr-only">room type</th>
              </tr>
            </thead>
            <tbody>
              {calendar_data.roomsInfo.map((roomType, i) => {
                const row_style = i === calendar_data.roomsInfo.length - 1 ? '' : 'pb-1';
                return (
                  <tr key={roomType.id}>
                    <td class={`choice-row ${row_style}`}>
                      <div class={'d-flex justify-content-end'}>
                        <ir-select
                          LabelAvailable={false}
                          data={[
                            { value: 'open', text: 'Open' },
                            { value: 'closed', text: 'Stop Sale' },
                          ]}
                          onSelectChange={e => {
                            const choice = e.detail as 'open' | 'closed' | undefined;
                            // drop any existing entry for this roomType
                            const rest = this.selectedRoomTypes.filter(entry => entry.id !== roomType.id);
                            // if they actually picked something, append it
                            if (choice) {
                              rest.push({ id: roomType.id, result: choice });
                            }
                            this.selectedRoomTypes = rest;
                          }}
                        ></ir-select>
                      </div>
                    </td>
                    <td class={`pl-1 text-left ${row_style}`}>{roomType.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p class="text-left mt-2 text-muted">Select days to open or stop sale</p>
          <div class="my-1 d-flex align-items-center" style={{ gap: '1.5rem' }}>
            {this.weekdays.map(w => (
              <ir-checkbox
                checked={this.selectedWeekdays.has(w.value)}
                onCheckChange={e => this.toggleWeekDays({ checked: e.detail, weekDay: w.value })}
                label={w.label}
                labelClass="m-0 p-0"
                class="days-checkbox"
              ></ir-checkbox>
            ))}
          </div>
          <p class="text-left mt-2 text-muted">Add date range(s) to open or stop sale</p>

          {/* Dates */}
          <table class="mt-1">
            <thead>
              <tr>
                <th class="text-left">From</th>
                <th class="text-left">to (inclusive)</th>
                <td>
                  {this.dates.length !== this.maxDatesLength && (
                    <ir-button
                      variant="icon"
                      icon_name="plus"
                      onClickHandler={() => {
                        this.addDateRow();
                      }}
                    ></ir-button>
                  )}
                </td>
              </tr>
            </thead>
            <tbody>
              {this.dates.map((d, i) => {
                if (!this.dateRefs[i]) {
                  this.dateRefs[i] = {};
                }

                return (
                  <tr key={`date_${i}`}>
                    <td class="pr-1 pb-1">
                      <ir-date-picker
                        ref={el => {
                          this.dateRefs[i].from = el;
                        }}
                        forceDestroyOnUpdate
                        minDate={i > 0 ? this.dates[i - 1]?.to?.format('YYYY-MM-DD') : this.minDate}
                        data-testid="pickup_arrival_date"
                        date={d.from?.format('YYYY-MM-DD')}
                        emitEmptyDate={true}
                        aria-invalid={String(this.errors === 'dates' && !d.from)}
                        onDateChanged={evt => {
                          evt.stopImmediatePropagation();
                          evt.stopPropagation();
                          this.handleFromDateChange({ index: i, date: evt.detail.start });
                        }}
                      >
                        <input
                          type="text"
                          slot="trigger"
                          value={d.from ? d.from.format('MMM DD, YYYY') : null}
                          class={`form-control input-sm ${this.errors === 'dates' && !d.to ? 'border-danger' : ''} text-center`}
                          style={{ width: '100%' }}
                        ></input>
                      </ir-date-picker>
                    </td>
                    <td class="pr-1 pb-1">
                      <ir-date-picker
                        forceDestroyOnUpdate
                        ref={el => {
                          this.dateRefs[i].to = el;
                        }}
                        data-testid="pickup_arrival_date"
                        date={d.to?.format('YYYY-MM-DD')}
                        emitEmptyDate={true}
                        minDate={this.dates[i].from ? this.dates[i]?.from?.clone().add(1, 'days').format('YYYY-MM-DD') : this.minDate}
                        aria-invalid={String(this.errors === 'dates' && !d.to)}
                        onDateChanged={evt => {
                          evt.stopImmediatePropagation();
                          evt.stopPropagation();
                          this.handleToDateChange({ index: i, date: evt.detail.start });
                        }}
                        onDatePickerFocus={e => {
                          e.stopImmediatePropagation();
                          e.stopPropagation();
                          if (!this.dates[i].from) {
                            this.dateRefs[i].from.openDatePicker();
                          }
                        }}
                      >
                        <input
                          type="text"
                          slot="trigger"
                          value={d.to ? d.to.format('MMM DD, YYYY') : null}
                          class={`form-control input-sm 
                          ${this.errors === 'dates' && !d.to ? 'border-danger' : ''}
                          text-center`}
                          style={{ width: '100%' }}
                        ></input>
                      </ir-date-picker>
                    </td>
                    {i > 0 && (
                      <td class="pb-1">
                        <ir-button
                          variant="icon"
                          icon_name="minus"
                          onClickHandler={() => {
                            this.dates = this.dates.filter((_, j) => j !== i);
                          }}
                        ></ir-button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div class={'sheet-footer'}>
          <ir-button text="Cancel" btn_color="secondary" class={'flex-fill'} onClickHandler={() => this.closeModal.emit(null)}></ir-button>
          <ir-button isLoading={this.isLoading} text="Save" btn_type="submit" class="flex-fill"></ir-button>
        </div>
      </form>
    );
  }
}
