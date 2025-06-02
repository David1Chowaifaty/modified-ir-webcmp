import { BookingService } from '@/services/booking.service';
import calendar_data from '@/stores/calendar-data';
import { ReloadInterceptor } from '@/utils/ReloadInterceptor';
import { Component, Event, EventEmitter, h, Listen, Prop, State } from '@stencil/core';
import moment, { Moment } from 'moment';
import { z, ZodError } from 'zod';
import { IToast } from '@components/ui/ir-toast/toast';
export type SelectedRooms = { id: string | number; result: 'open' | 'closed' };
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
  @State() errors: 'dates' | 'rooms' | 'weekdays';
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
  @Event() toast: EventEmitter<IToast>;

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

  //sections
  private unitSections: HTMLTableElement;
  private weekdaysSections: HTMLDivElement;
  private datesSections: HTMLTableElement;

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

  private async addBlockDates() {
    const generatePeriodsToModify = periods => {
      const p = [];
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
            p.push({
              room_type_id: selectedRoom.id,
              night: current,
            });
          }
          current = nextDay;
        }
      }
      return p;
    };
    try {
      this.errors = null;
      this.isLoading = true;
      const periods = this.datesSchema.parse(this.dates);
      if (this.selectedRoomTypes.length === 0) {
        this.unitSections.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.errors = 'rooms';
        return;
      }
      if (this.selectedWeekdays.size === 0) {
        this.weekdaysSections.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.errors = 'weekdays';
        return;
      }
      this.activate();
      const periods_to_modify = generatePeriodsToModify(periods);
      const isAllOpen = this.selectedRoomTypes.every(e => e.result === 'open');
      const isAllClosed = this.selectedRoomTypes.every(e => e.result === 'closed');
      if (isAllClosed || isAllOpen) {
        await this.bookingService.setExposedRestrictionPerRoomType({
          is_closed: isAllClosed,
          restrictions: periods_to_modify,
        });
      } else {
        const payloads = [];
        for (const room of this.selectedRoomTypes) {
          const periods = periods_to_modify.filter(f => f.room_type_id === room.id);
          payloads.push({
            is_closed: room.result === 'closed',
            restrictions: periods,
          });
        }
        await Promise.all(payloads.map(p => this.bookingService.setExposedRestrictionPerRoomType(p)));
      }
      this.deactivate();
      this.toast.emit({
        type: 'success',
        title: 'Request was submitted successfully. Your changes have been queued and will be applied shortly.',
        description: '',
      });
      this.isLoading = false;
      this.closeModal.emit();
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        this.datesSections.scrollIntoView({ behavior: 'smooth', block: 'end' });
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

  private handleDateChange({ index, date, key }: { index: number; date: Moment; key: 'from' | 'to' }) {
    // 1) clone and set the new date
    const dates = [...this.dates];
    dates[index] = { ...dates[index], [key]: date };

    // 1a) if they just changed the “from”, always clear that row’s “to”
    if (key === 'from' && dates[index].to?.isBefore(date, 'dates')) {
      dates[index].to = null;
    }

    // 2) clear any subsequent rows whose “from” is on or before the changed date
    for (let i = index + 1; i < dates.length; i++) {
      const rowFrom = dates[i]?.from;
      if (rowFrom && rowFrom.isSameOrBefore(date, 'day')) {
        dates[i] = { from: null, to: null };
      }
    }

    // 3) commit
    this.dates = dates;

    // 4) open the appropriate picker
    setTimeout(() => {
      if (key === 'from') {
        this.dateRefs[index]?.to.openDatePicker();
      } else {
        const nextFrom = dates.findIndex(d => d.from === null);
        if (nextFrom > -1) {
          this.dateRefs[nextFrom]?.from.openDatePicker();
        }
      }
    }, 100);
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
      this.dateRefs[this.dates.length - 1].to?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  render() {
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
            label="Bulk Stop/Open Sale"
            displayContext="sidebar"
          ></ir-title>
        </div>
        <div class="sheet-body px-1">
          <div class="text-muted text-left py-0 my-0">
            <p>
              Select the affected unit(s). <span class="text-warning">This operation might require several minutes.</span>
            </p>
          </div>
          <div>
            {this.errors === 'rooms' && (
              <p class={'text-danger text-left smaller p-0 '} style={{ 'margin-bottom': '0.5rem' }}>
                Please select at least one {calendar_data.is_vacation_rental ? 'listing' : 'unit'}
              </p>
            )}
            <table ref={el => (this.unitSections = el)}>
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
                              { value: 'closed', text: 'Stop sale' },
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
          </div>
          <p class="text-left mt-2 text-muted">Included days</p>
          {this.errors === 'weekdays' && <p class={'text-danger text-left smaller m-0 p-0'}>Please select at least one day</p>}
          <div ref={el => (this.weekdaysSections = el)} class="my-1 d-flex align-items-center" style={{ gap: '1.5rem' }}>
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

          {/* Dates */}
          <table class="mt-1" ref={el => (this.datesSections = el)}>
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

                const fromDateMinDate = i > 0 ? this.dates[i - 1]?.to.clone().add(1, 'days')?.format('YYYY-MM-DD') ?? this.minDate : this.minDate;
                const toDateMinDate = this.dates[i].from ? this.dates[i]?.from.clone().add(1, 'days')?.format('YYYY-MM-DD') : this.minDate;
                return (
                  <tr key={`date_${i}`}>
                    <td class="pr-1 pb-1">
                      <ir-date-picker
                        ref={el => {
                          this.dateRefs[i].from = el;
                        }}
                        forceDestroyOnUpdate
                        minDate={fromDateMinDate}
                        data-testid="pickup_arrival_date"
                        date={d.from?.format('YYYY-MM-DD')}
                        emitEmptyDate={true}
                        aria-invalid={String(this.errors === 'dates' && !d.from)}
                        onDateChanged={evt => {
                          evt.stopImmediatePropagation();
                          evt.stopPropagation();
                          this.handleDateChange({ index: i, date: evt.detail.start, key: 'from' });
                        }}
                        onDatePickerFocus={e => {
                          e.stopImmediatePropagation();
                          e.stopPropagation();
                          if (i === 0) {
                            return;
                          }
                          const index = this.dates.findIndex(d => !d.from || !d.to);

                          if (!this.dates[index]?.from) {
                            this.dateRefs[index]?.from.openDatePicker();
                            return;
                          }
                          if (!this.dates[index]?.to) {
                            this.dateRefs[index].to.openDatePicker();
                          }
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
                        minDate={toDateMinDate}
                        aria-invalid={String(this.errors === 'dates' && !d.to)}
                        onDateChanged={evt => {
                          evt.stopImmediatePropagation();
                          evt.stopPropagation();
                          this.handleDateChange({ index: i, date: evt.detail.start, key: 'to' });
                        }}
                        onDatePickerFocus={e => {
                          e.stopImmediatePropagation();
                          e.stopPropagation();
                          const index = this.dates.findIndex(d => !d.from || !d.to);

                          if (!this.dates[index]?.from) {
                            this.dateRefs[index]?.from?.openDatePicker();
                            return;
                          }
                          if (!this.dates[index]?.to) {
                            this.dateRefs[index].to.openDatePicker();
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
