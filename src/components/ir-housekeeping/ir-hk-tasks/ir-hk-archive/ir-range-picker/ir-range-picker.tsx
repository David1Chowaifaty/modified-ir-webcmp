import { Component, Host, Listen, Prop, Event, EventEmitter, h, State } from '@stencil/core';
import moment, { Moment } from 'moment';

@Component({
  tag: 'ir-range-picker',
  styleUrl: 'ir-range-picker.css',
  scoped: true,
})
export class IrRangePicker {
  /**
   * The earliest date that can be selected.
   */
  @Prop() minDate?: string | Date;

  /**
   * The latest date that can be selected.
   */
  @Prop() maxDate?: string | Date;
  /**
   * The start date of the range.
   */
  @Prop() fromDate: Moment;
  /**
   * The end date of the range.
   */
  @Prop() toDate: Moment;

  /**
   * Whether to show the overlay before the date is selected.
   */
  @Prop() withOverlay: boolean = true;
  /**
   * Whether to all the emitted dates to be null.
   */
  @Prop() allowNullDates: boolean = true;

  @State() lastFocusedPicker: string;

  @Event() dateRangeChanged: EventEmitter<{ fromDate: Moment; toDate: Moment; wasFocused?: boolean }>;

  private minSelectableDate = moment().subtract(90, 'days').toDate();
  private fromDatePicker: HTMLIrDatePickerElement;
  private toDatePicker: HTMLIrDatePickerElement;
  private date_container: HTMLDivElement;
  private focusTimeout: NodeJS.Timeout;

  @Listen('dateChanged')
  async handleDateChanged(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const selectedDate = e.detail.start ? moment(e.detail.start) : null;
    if (!this.lastFocusedPicker) {
      return;
    }
    if ((e.target as HTMLElement).id === 'fromDate') {
      let updatedToDate = this.toDate;
      if (!selectedDate) {
        this.dateRangeChanged.emit({ fromDate: null, toDate: null, wasFocused: !!this.lastFocusedPicker });
        return;
      }
      if (!updatedToDate || updatedToDate.isBefore(selectedDate, 'day')) {
        updatedToDate = selectedDate;
      }

      this.dateRangeChanged.emit({ fromDate: selectedDate, toDate: updatedToDate, wasFocused: !!this.lastFocusedPicker });
      await this.toDatePicker.openDatePicker();
    } else {
      if (!selectedDate) {
        this.dateRangeChanged.emit({ fromDate: this.fromDate, toDate: this.fromDate, wasFocused: !!this.lastFocusedPicker });
        return;
      }
      this.dateRangeChanged.emit({ fromDate: this.fromDate, toDate: selectedDate, wasFocused: !!this.lastFocusedPicker });
    }
    this.lastFocusedPicker = null;
  }
  @Listen('datePickerFocus')
  handleDatePickerFocus(e: CustomEvent) {
    e.stopPropagation();
    clearTimeout(this.focusTimeout);
    this.date_container.classList.add('focused');
    (e.target as HTMLIrRangePickerElement).classList.add('focused');
  }
  @Listen('datePickerBlur')
  handleDatePickerBlur(e: CustomEvent) {
    e.stopPropagation();
    (e.target as HTMLIrRangePickerElement).classList.remove('focused');
    this.focusTimeout = setTimeout(() => {
      this.date_container.classList.remove('focused');
    }, 10);
  }
  disconnectedCallback() {
    clearTimeout(this.focusTimeout);
  }
  private renderDatePicker(id: string, date: Moment, minDate: string | Date, refCallback: (el: HTMLIrDatePickerElement) => void, additionalProps: any = {}) {
    return (
      <ir-date-picker
        class={{
          'range-picker__date-picker': true,
          'range-picker__date-picker--hidden': this.withOverlay && !this.fromDate,
        }}
        customPicker
        ref={el => refCallback(el)}
        minDate={minDate}
        maxDate={this.maxDate}
        date={date?.toDate()}
        id={id}
        onDatePickerFocus={() => {
          this.lastFocusedPicker = id;
        }}
        emitEmptyDate={this.allowNullDates}
        {...additionalProps}
      >
        <p class="range-picker__date-picker-button" slot="trigger">
          {date?.format('YYYY-MM-DD') ?? '2025-03-02'}
        </p>
      </ir-date-picker>
    );
  }

  render() {
    return (
      <Host>
        <div class="form-control range-picker__container" ref={el => (this.date_container = el)}>
          {this.withOverlay && (
            <div
              class={{
                'range-picker__overlay': true,
                'range-picker__overlay--active': !this.fromDate,
              }}
              onClick={() => this.fromDatePicker.openDatePicker()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style={{ height: '14px', width: '14px' }}>
                <path
                  fill="currentColor"
                  d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"
                ></path>
              </svg>
              <p class="m-0">
                <slot name="message">Cleaned on</slot>
              </p>
            </div>
          )}
          <svg
            class={{
              'range-picker__calendar-icon': true,
              'range-picker__icon--hidden': this.withOverlay && !this.fromDate,
            }}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            style={{ height: '14px', width: '14px' }}
          >
            <path
              fill="currentColor"
              d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"
            ></path>
          </svg>
          {this.renderDatePicker('fromDate', this.fromDate, this.minDate, el => (this.fromDatePicker = el))}
          <svg
            class={{
              'range-picker__arrow-icon': true,
              'range-picker__icon--hidden': this.withOverlay && !this.fromDate,
            }}
            xmlns="http://www.w3.org/2000/svg"
            height="14"
            width="14"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
            />
          </svg>
          {this.renderDatePicker('toDate', this.toDate, this.fromDate?.toDate() || this.minSelectableDate, el => (this.toDatePicker = el), {
            forceDestroyOnUpdate: false,
          })}
        </div>
      </Host>
    );
  }
}
