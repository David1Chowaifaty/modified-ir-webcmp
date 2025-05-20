import calendar_data from '@/stores/calendar-data';
import { Component, h, Prop, State } from '@stencil/core';
import moment, { Moment } from 'moment';
import { z, ZodError } from 'zod';
export type SelectedRooms = Record<string | number, (string | number)[]>;
export interface Weekday {
  value: number;
  label: string;
}
@Component({
  tag: 'igl-bulk-blocks',
  styleUrls: ['igl-bulk-blocks.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IglBulkBlocks {
  @Prop() maxDatesLength = 10;

  @State() selectedRoomTypes: SelectedRooms[] = [];
  @State() errors: 'dates' | 'rooms';
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
  @State() selectedWeekdays: number[] = Array(7)
    .fill(null)
    .map((_, i) => i);

  private dateRefs: { from?: HTMLIrDatePickerElement; to?: HTMLIrDatePickerElement }[] = [];
  private total: number;
  private allRoomTypes: SelectedRooms[] = [];
  private minDate = moment().format('YYYY-MM-DD');
  private datesSchema = z.array(
    z.object({
      from: z.string().nonempty(),
      to: z.string().nonempty(),
    }),
  );

  componentWillLoad() {
    this.total = calendar_data.roomsInfo.length;
    this.selectAllRoomTypes();
  }

  private toggleAllRoomTypes(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (!e.detail) {
      this.selectedRoomTypes = [];
      return;
    }
    this.selectedRoomTypes = this.allRoomTypes;
  }

  private selectAllRoomTypes() {
    this.allRoomTypes = calendar_data.roomsInfo.map(rt => ({
      [rt.id]: rt.physicalrooms.map(room => room.id),
    }));
    // this.selectedRoomTypes = this.allRoomTypes;
  }

  private toggleRoom({ checked, roomId, roomTypeId }: { checked: boolean; roomTypeId: number; roomId: number }): void {
    // clone current selection
    const selected = [...this.selectedRoomTypes];
    // find existing entry for this roomType
    const idx = selected.findIndex(entry => Object.keys(entry)[0] === roomTypeId.toString());

    if (checked) {
      // add the room
      if (idx > -1) {
        const rooms = selected[idx][roomTypeId];
        if (!rooms.includes(roomId)) {
          selected[idx] = { [roomTypeId]: [...rooms, roomId] };
        }
      } else {
        selected.push({ [roomTypeId]: [roomId] });
      }
    } else {
      // remove the room
      if (idx > -1) {
        const filtered = selected[idx][roomTypeId].filter(id => id !== roomId);
        if (filtered.length) {
          selected[idx] = { [roomTypeId]: filtered };
        } else {
          selected.splice(idx, 1);
        }
      }
    }

    this.selectedRoomTypes = selected;
  }

  private toggleRoomType({ checked, roomTypeId }: { checked: boolean; roomTypeId: number }): void {
    const selected = [...this.selectedRoomTypes];
    const idx = selected.findIndex(entry => Object.keys(entry)[0] === roomTypeId.toString());

    if (checked) {
      const roomType = calendar_data.roomsInfo.find(rt => rt.id === roomTypeId);
      const allRooms = roomType ? roomType.physicalrooms.map(r => r.id) : [];

      if (idx > -1) {
        selected[idx] = { [roomTypeId]: allRooms };
      } else {
        selected.push({ [roomTypeId]: allRooms });
      }
    } else {
      if (idx > -1) {
        selected.splice(idx, 1);
      }
    }

    this.selectedRoomTypes = selected;
  }

  private addBlockDates() {
    try {
      this.errors = null;
      if (this.selectedRoomTypes.length === 0) {
        return (this.errors = 'rooms');
      }
      this.datesSchema.parse(this.dates);
    } catch (error) {
      if (error instanceof ZodError) {
        this.errors = 'dates';
      }
    }
  }
  private toggleWeekDays({ checked, weekDay }: { checked: boolean; weekDay: number }): void {
    if (checked) {
      if (!this.selectedWeekdays.includes(weekDay)) {
        this.selectedWeekdays = [...this.selectedWeekdays, weekDay];
      }
    } else {
      this.selectedWeekdays = this.selectedWeekdays.filter(day => day !== weekDay);
    }
  }
  render() {
    const selectedRoomsByType = this.selectedRoomTypes.reduce((acc, entry) => {
      const typeId = Number(Object.keys(entry)[0]);
      acc[typeId] = entry[typeId];
      return acc;
    }, {} as Record<number, (string | number)[]>);
    const allFullySelected = calendar_data.roomsInfo.every(({ id, physicalrooms }) => {
      const sel = selectedRoomsByType[id] || [];
      return sel.length === physicalrooms.length;
    });

    const shouldShowAllRooms = !allFullySelected;
    return (
      <form
        class={'bulk-sheet-container'}
        onSubmit={e => {
          e.preventDefault();
          this.addBlockDates();
        }}
      >
        <div class="sheet-header d-flex align-items-center">
          <ir-title class="px-1" label="Bulk Block Dates" displayContext="sidebar"></ir-title>
        </div>
        <div class="sheet-body px-1">
          <div class="text-muted text-left mb-3">
            {1 === 1 ? <p>Select the listings that you want to block.</p> : <p>Select the roomtypes and units that you want to block.</p>}
          </div>
          <p class="text-left text-muted">Select room types to block</p>
          <div class="d-flex flex-column" style={{ gap: '1rem' }}>
            <ir-checkbox
              indeterminate={this.selectedRoomTypes?.length > 0 && this.selectedRoomTypes?.length < this.allRoomTypes?.length}
              checked={this.selectedRoomTypes.length === this.total}
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
          </div>
          <p class="text-left mt-2 text-muted">Select which days to block</p>
          <div class="my-1 d-flex align-items-center" style={{ gap: '1.5rem' }}>
            {this.weekdays.map(w => (
              <ir-checkbox
                checked={this.selectedWeekdays.findIndex(r => r.toString() === w.value.toString()) !== -1}
                onCheckChange={e => this.toggleWeekDays({ checked: e.detail, weekDay: w.value })}
                label={w.label}
                labelClass="m-0 p-0 ml-1"
              ></ir-checkbox>
            ))}
          </div>
          <p class="text-left mt-2 text-muted">Add date range(s) to block</p>

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
                        this.dates = [...this.dates, { from: null, to: null }];
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
                    <td class="pr-1">
                      <ir-date-picker
                        ref={el => {
                          this.dateRefs[i].from = el;
                        }}
                        minDate={this.minDate}
                        data-testid="pickup_arrival_date"
                        date={d.from?.format('YYYY-MM-DD')}
                        emitEmptyDate={true}
                        aria-invalid={String(this.errors === 'dates' && !d.from)}
                        onDateChanged={evt => {
                          console.log(evt.detail);
                          const dates = [...this.dates];
                          dates[i] = { ...dates[i], from: evt.detail.start };
                          if (dates[i].to && dates[i].to.isBefore(evt.detail.start, 'dates') && evt.detail.start) {
                            dates[i] = { ...dates[i], to: null };
                          }
                          this.dates = [...dates];
                          setTimeout(() => {
                            this.dateRefs[i]?.to.openDatePicker();
                          }, 100);
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
                    <td class="pr-1">
                      <ir-date-picker
                        forceDestroyOnUpdate
                        ref={el => {
                          this.dateRefs[i].to = el;
                        }}
                        data-testid="pickup_arrival_date"
                        date={d.to?.format('YYYY-MM-DD')}
                        emitEmptyDate={true}
                        minDate={this.dates[i]?.from ? this.dates[i].from.format('YYYY-MM-DD') : this.minDate}
                        aria-invalid={String(this.errors === 'dates' && !d.to)}
                        onDateChanged={evt => {
                          const dates = [...this.dates];
                          dates[i] = { ...dates[i], to: evt.detail.start };
                          this.dates = [...dates];
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
                      <td>
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
          <ir-button text="Cancel" btn_color="secondary" class={'flex-fill'}></ir-button>
          <ir-button text="Save" btn_type="submit" class="flex-fill"></ir-button>
        </div>
      </form>
    );
  }
}
