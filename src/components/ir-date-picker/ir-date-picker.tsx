import { Component, h, Element, Prop, Event, EventEmitter, Host } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-date-picker',
  styleUrl: 'ir-date-picker.css',
  scoped: true,
})
export class IrDatePicker {
  @Element() private element: HTMLElement;
  @Prop() fromDate: Date;
  @Prop() toDate: Date;

  @Prop() opens: 'left' | 'right' | 'center';
  @Prop() autoApply: boolean;
  @Prop() firstDay: number = 1;
  @Prop() monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  @Prop() daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  @Prop() format: string = 'MMM DD, YYYY';
  @Prop() separator: string = '       ';
  @Prop() applyLabel: string = 'Apply';
  @Prop() cancelLabel: string = 'Cancel';
  @Prop() fromLabel: string = 'Form';
  @Prop() toLabel: string = 'To';
  @Prop() customRangeLabel: string = 'Custom';
  @Prop() weekLabel: string = 'W';
  @Prop() disabled: boolean = false;
  @Prop() singleDatePicker = false;
  @Prop() minDate: string;
  @Prop() maxDate: string;
  @Prop() maxSpan: moment.DurationInputArg1 = {
    days: 240,
  };
  @Event() dateChanged: EventEmitter<{
    start: moment.Moment;
    end: moment.Moment;
  }>;
  dateRangeInput: HTMLElement;
  componentDidLoad() {
    this.dateRangeInput = this.element.querySelector('.date-range-input');
    $(this.dateRangeInput).daterangepicker(
      {
        singleDatePicker: this.singleDatePicker,
        opens: this.opens,
        startDate: moment(this.fromDate),
        endDate: moment(this.toDate),
        minDate: moment(this.minDate || moment(new Date()).format('YYYY-MM-DD')),
        maxDate: this.maxDate ? moment(this.maxDate) : undefined,
        maxSpan: this.maxSpan,
        autoApply: this.autoApply,
        locale: {
          format: this.format,
          separator: this.separator,
          applyLabel: this.applyLabel,
          cancelLabel: this.cancelLabel,
          fromLabel: this.fromLabel,
          toLabel: this.toLabel,
          customRangeLabel: this.customRangeLabel,
          weekLabel: this.weekLabel,
          daysOfWeek: this.daysOfWeek,
          monthNames: this.monthNames,
          firstDay: this.firstDay,
        },
      },
      (start, end) => {
        this.dateChanged.emit({ start, end });
      },
    );
  }

  render() {
    return (
      <Host>
        {!this.singleDatePicker && (
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" height="14" width="14" viewBox="0 0 512 512">
            <path
              fill="currentColor"
              d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
            />
          </svg>
        )}
        <input class="date-range-input" type="text" disabled={this.disabled} />
      </Host>
    );
  }
}
