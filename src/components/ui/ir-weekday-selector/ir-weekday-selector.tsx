import { Component, Event, EventEmitter, h, Host, Prop, State, Watch } from '@stencil/core';
export interface Weekday {
  value: number;
  label: string;
}
@Component({
  tag: 'ir-weekday-selector',
  styleUrl: 'ir-weekday-selector.css',
  scoped: true,
})
export class IrWeekdaySelector {
  /**
   * Initial list of selected weekdays (numeric values).
   */
  @Prop() weekdays: number[] = [];

  /**
   * Internal state tracking currently selected weekdays.
   */
  @State() selectedWeekdays: Set<number> = new Set(this.weekdays);

  /**
   * Emits an updated list of selected weekday values when the selection changes.
   *
   * Example:
   * ```tsx
   * <ir-weekday-selector onWeekdayChange={(e) => console.log(e.detail)} />
   * ```
   */
  @Event() weekdayChange: EventEmitter<number[]>;

  private _weekdays: Weekday[] = [
    { value: 1, label: 'M' },
    { value: 2, label: 'T' },
    { value: 3, label: 'W' },
    { value: 4, label: 'Th' },
    { value: 5, label: 'Fr' },
    { value: 6, label: 'Sa' },
    { value: 0, label: 'Su' },
  ];

  @Watch('weekdays')
  handleWeekdayChange(newDays: number[], oldDays: number[]) {
    if (newDays.length !== oldDays.length && newDays.length !== this.selectedWeekdays.size) {
      this.selectedWeekdays = new Set(newDays);
    }
  }
  /**
   * Toggles the selected state of a specific weekday.
   * Updates internal state and emits `weekdayChange` event.
   *
   * @param checked - Whether the checkbox is checked.
   * @param weekDay - The numeric value of the weekday.
   */
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
    this.weekdayChange.emit(Array.from(this.selectedWeekdays));
  }
  render() {
    return (
      <Host class="my-1 d-flex align-items-center" style={{ gap: '1.5rem' }}>
        {this._weekdays.map(w => (
          <ir-checkbox
            checked={this.selectedWeekdays.has(w.value)}
            onCheckChange={e => this.toggleWeekDays({ checked: e.detail, weekDay: w.value })}
            label={w.label}
            labelClass="m-0 p-0"
            class="days-checkbox"
          ></ir-checkbox>
        ))}
      </Host>
    );
  }
}
