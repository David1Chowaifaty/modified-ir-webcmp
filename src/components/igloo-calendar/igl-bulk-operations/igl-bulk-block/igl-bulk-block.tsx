import { BookingService } from '@/services/booking.service';
import calendar_data from '@/stores/calendar-data';
import { ReloadInterceptor } from '@/utils/ReloadInterceptor';
import { Component, Event, EventEmitter, Fragment, h, Prop, State } from '@stencil/core';
import moment, { Moment } from 'moment';
import { z, ZodError } from 'zod';
import { IToast } from '@components/ui/ir-toast/toast';
// import calendar_dates from '@/stores/calendar-dates.store';
import locales from '@/stores/locales.store';
export type RoomStatus = 'open' | 'closed';
export type SelectedRooms = {
  id: string | number;
  result: RoomStatus;
};

@Component({
  tag: 'igl-bulk-block',
  styleUrls: ['igl-bulk-block.css', '../../../../common/sheet.css'],
  scoped: true,
})
export class IglBulkBlock {
  @Prop() maxDatesLength = 8;
  @Prop() property_id: number;

  @State() selectedRoomTypes: Map<string | number, SelectedRooms[]> = new Map();
  @State() selectedUnit: {
    roomtype_id: number;
    unit_id: number;
  } | null = null;
  @State() errors: 'dates' | 'rooms';
  @State() isLoading: boolean;
  @State() blockState: 'block' | 'unblock' = 'block';
  @State() dates: {
    from: Moment | null;
    to: Moment | null;
  }[] = [{ from: null, to: null }];

  @Event() closeModal: EventEmitter<null>;
  @Event() toast: EventEmitter<IToast>;

  private sidebar: HTMLIrSidebarElement;
  private dateRefs: { from?: HTMLIrDatePickerElement; to?: HTMLIrDatePickerElement }[] = [];
  private reloadInterceptor: ReloadInterceptor;
  private minDate = moment().format('YYYY-MM-DD');
  private bookingService = new BookingService();

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

  private unitSections: HTMLUListElement;
  private datesSections: HTMLTableElement;

  componentDidLoad() {
    this.reloadInterceptor = new ReloadInterceptor({ autoActivate: false });
    this.sidebar = document.querySelector('ir-sidebar') as HTMLIrSidebarElement;
  }

  disconnectedCallback() {
    this.reloadInterceptor.deactivate();
  }

  private async addBlockDates() {
    try {
      this.errors = null;
      this.isLoading = true;
      const periods = this.datesSchema.parse(this.dates);
      if (!this.selectedUnit) {
        this.unitSections.scrollIntoView({ behavior: 'smooth', block: 'center' });
        this.errors = 'rooms';
        return;
      }
      if (this.blockState === 'block') {
        await this.bookingService.blockAvailabilityForBrackets({
          unit_id: this.selectedUnit?.unit_id,
          description: '',
          block_status_code: '002',
          brackets: periods.map(p => ({
            from_date: p.from,
            to_date: p.to,
          })),
        });
      } else {
        await this.bookingService.unBlockUnitByPeriod({
          unit_id: this.selectedUnit?.unit_id,
          from_date: periods[0].from,
          to_date: periods[0].to,
        });
      }
      this.activate();
      this.deactivate();
      this.toast.emit({
        type: 'success',
        title: locales.entries.Lcz_RequestSubmittedSuccessfully,
        description: '',
      });
      this.isLoading = false;
      this.closeModal.emit();
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        this.datesSections.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  private handleDateChange({ index, date, key }: { index: number; date: Moment; key: 'from' | 'to' }) {
    // 1) clone and set the new date
    const dates = [...this.dates];
    dates[index] = { ...dates[index], [key]: date };

    // 1a) if they just changed the "from", always clear that row's "to"
    if (key === 'from' && dates[index].to?.isBefore(date, 'dates')) {
      dates[index].to = null;
    }

    // 2) clear any subsequent rows whose "from" is on or before the changed date
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
        <div class="sheet-body px-1">
          <div class="text-muted text-left pt-0 my-0 d-flex align-items-center pb-1" style={{ gap: '0.5rem' }}>
            <p class="m-0 p-0">Select the unit to</p>
            <ir-select
              LabelAvailable={false}
              showFirstOption={false}
              selectedValue={this.blockState}
              data={[
                { text: 'Block', value: 'block' },
                { text: 'Unblock', value: 'unblock' },
              ]}
              onSelectChange={e => {
                this.blockState = e.detail;
              }}
            ></ir-select>
          </div>
          <div>
            {this.errors === 'rooms' && (
              <p class={'text-danger text-left smaller p-0 '} style={{ 'margin-bottom': '0.5rem' }}>
                {calendar_data.is_vacation_rental ? locales.entries.Lcz_PlzSelectOneListing : locales.entries.Lcz_PlzSelectOneUnit}
              </p>
            )}
            <ul class="room-type-list" ref={el => (this.unitSections = el)}>
              {calendar_data.roomsInfo.map((roomType, i) => {
                return (
                  <Fragment>
                    <li key={`roomTypeRow-${roomType.id}`} class={`room-type-row`}>
                      <div class={'d-flex choice-row'}>
                        <span class="pl-1 text-left room-type-name">{roomType.name}</span>
                      </div>
                    </li>
                    {roomType.physicalrooms.map((room, j) => {
                      const row_style = j === roomType.physicalrooms.length - 1 ? 'pb-1' : '';
                      return (
                        <li key={`physicalRoom-${room.id}-${j}`} class={`physical-room ${row_style}`}>
                          <div class={'d-flex choice-row'}>
                            <ir-radio
                              class="pl-1 "
                              name="unit"
                              checked={this.selectedUnit?.unit_id === room.id}
                              onCheckChange={() =>
                                (this.selectedUnit = {
                                  roomtype_id: roomType.id,
                                  unit_id: room.id,
                                })
                              }
                              label={room.name}
                            ></ir-radio>
                          </div>
                        </li>
                      );
                    })}
                  </Fragment>
                );
              })}
            </ul>
          </div>
          {/* Dates */}
          <table class="mt-1" ref={el => (this.datesSections = el)}>
            <thead>
              <tr>
                <th class="text-left">{locales.entries.Lcz_From}</th>
                <th class="text-left">{locales.entries.Lcz_ToExclusive}</th>
                <td>
                  {this.dates.length !== this.maxDatesLength && this.blockState === 'block' && (
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
                        maxDate={d.from ? moment(d.from).add(3, 'months').format('YYYY-MM-DD') : undefined}
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
          <ir-button text={locales.entries.Lcz_Cancel} btn_color="secondary" class={'flex-fill'} onClickHandler={() => this.closeModal.emit(null)}></ir-button>
          <ir-button isLoading={this.isLoading} text={locales.entries.Lcz_Confirm} btn_type="submit" class="flex-fill"></ir-button>
        </div>
      </form>
    );
  }
}
