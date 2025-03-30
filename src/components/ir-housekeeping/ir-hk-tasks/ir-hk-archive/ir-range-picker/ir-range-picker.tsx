import { Component, Host, Listen, Prop, Event, EventEmitter, h } from '@stencil/core';
import moment, { Moment } from 'moment';

@Component({
  tag: 'ir-range-picker',
  styleUrl: 'ir-range-picker.css',
  scoped: true,
})
export class IrRangePicker {
  @Prop() fromDate: Moment;
  @Prop() toDate: Moment;

  @Event() dateRangeChanged: EventEmitter<{ fromDate: Moment; toDate: Moment }>;

  private minSelectableDate = moment().subtract(90, 'days').toDate();
  private maxSelectableDate = moment().toDate();
  private fromDatePicker: HTMLIrDatePickerElement;
  private toDatePicker: HTMLIrDatePickerElement;

  @Listen('dateChanged')
  async handleDateChanged(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    console.log(e.detail);
    const selectedDate = e.detail.start ? moment(e.detail.start) : null;
    if ((e.target as HTMLElement).id === 'fromDate') {
      let updatedToDate = this.toDate;
      if (!selectedDate) {
        this.dateRangeChanged.emit({ fromDate: null, toDate: null });
        return;
      }
      if (!updatedToDate || updatedToDate.isBefore(selectedDate, 'day')) {
        updatedToDate = selectedDate;
      }

      this.dateRangeChanged.emit({ fromDate: selectedDate, toDate: updatedToDate });
      await this.toDatePicker.openDatePicker();
    } else {
      if (!selectedDate) {
        this.dateRangeChanged.emit({ fromDate: this.fromDate, toDate: this.fromDate });
        return;
      }
      this.dateRangeChanged.emit({ fromDate: this.fromDate, toDate: selectedDate });
    }
  }

  private renderDatePicker(id: string, date: Moment, minDate: Date, buttonText: string, refCallback: (el: HTMLIrDatePickerElement) => void, additionalProps: any = {}) {
    return (
      <ir-date-picker
        class={{
          'range-picker__date-picker': true,
          'range-picker__date-picker--hidden': !this.fromDate,
        }}
        customPicker
        ref={el => refCallback(el)}
        minDate={minDate}
        maxDate={this.maxSelectableDate}
        date={date?.toDate()}
        id={id}
        emitEmptyDate
        {...additionalProps}
      >
        <ir-button class="range-picker__date-picker-button" btn_styles="p-0 m-0" slot="trigger" btn_color="link" text={date?.format('YYYY-MM-DD') ?? buttonText}></ir-button>
      </ir-date-picker>
    );
  }

  render() {
    return (
      <Host>
        <div class="form-control range-picker__container">
          <p
            onClick={() => this.fromDatePicker.openDatePicker()}
            class={{
              'range-picker__overlay': true,
              'range-picker__overlay--active': !this.fromDate,
            }}
          >
            Cleaned on
          </p>
          <svg
            class={{
              'range-picker__calendar-icon': true,
              'range-picker__icon--hidden': !this.fromDate,
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
          {this.renderDatePicker('fromDate', this.fromDate, this.minSelectableDate, 'from date', el => (this.fromDatePicker = el))}
          <svg
            class={{
              'range-picker__arrow-icon': true,
              'range-picker__icon--hidden': !this.fromDate,
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
          {this.renderDatePicker('toDate', this.toDate, this.fromDate?.toDate() || this.minSelectableDate, 'to date', el => (this.toDatePicker = el), {
            forceDestroyOnUpdate: true,
          })}
        </div>
      </Host>
    );
  }
}
