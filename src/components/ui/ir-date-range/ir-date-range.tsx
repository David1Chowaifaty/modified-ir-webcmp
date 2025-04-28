import { Component, h, Element, Prop, Event, EventEmitter, Host, Watch, Method } from '@stencil/core';
import moment, { Moment } from 'moment';

@Component({
  tag: 'ir-date-range',
  styleUrl: 'ir-date-range.css',
  scoped: true,
})
export class IrDateRange {
  @Element() private element: HTMLElement;
  @Prop() fromDate: Moment;
  @Prop() toDate: Moment;
  @Prop() date: Moment;

  @Prop() opens: 'left' | 'right' | 'center';
  @Prop() autoApply: boolean;
  @Prop() firstDay: number = 1;
  @Prop() monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  @Prop() daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  @Prop() format: string = 'MMM DD, YYYY';
  @Prop() separator: string = ' - ';
  @Prop() applyLabel: string = 'Apply';
  @Prop() cancelLabel: string = 'Cancel';
  @Prop() fromLabel: string = 'Form';
  @Prop() toLabel: string = 'To';
  @Prop() customRangeLabel: string = 'Custom';
  @Prop() weekLabel: string = 'W';
  @Prop() disabled: boolean = false;
  @Prop() singleDatePicker = false;
  @Prop() minDate: string | Moment;
  @Prop() maxDate: string | Moment;
  @Prop() maxSpan: moment.DurationInputArg1 = {
    days: 240,
  };

  private openDatePickerTimeout: NodeJS.Timeout;

  @Event() dateChanged: EventEmitter<{
    start: moment.Moment;
    end: moment.Moment;
  }>;
  dateRangeInput: HTMLElement;

  @Watch('minDate')
  handleMinDateChange() {
    $(this.dateRangeInput).data('daterangepicker').remove();
    this.initializeDateRangePicker();
  }
  @Watch('date')
  datePropChanged() {
    this.updateDateRangePickerDates();
  }
  @Method()
  async openDatePicker() {
    this.openDatePickerTimeout = setTimeout(() => {
      this.dateRangeInput.click();
    }, 20);
  }
  updateDateRangePickerDates() {
    const picker = $(this.dateRangeInput).data('daterangepicker');
    if (!picker) {
      console.error('Date range picker not initialized.');
      return;
    }

    // Adjust how dates are set based on whether it's a single date picker or range picker.
    if (this.singleDatePicker) {
      const newDate = this.date ? this.date : moment();
      picker.setStartDate(newDate);
      picker.setEndDate(newDate); // For single date picker, start and end date might be the same.
    } else {
      const newStartDate = this.fromDate ? this.fromDate : moment();
      const newEndDate = this.toDate ? this.toDate : newStartDate.clone().add(1, 'days');
      picker.setStartDate(newStartDate);
      picker.setEndDate(newEndDate);
    }
  }
  componentWillLoad() {
    if (!document.getElementById('ir-daterangepicker-style')) {
      const style = document.createElement('style');
      style.id = 'ir-daterangepicker-style';
      style.textContent = `
        .daterangepicker {
          margin-top: 14px;
        }
      `;
      document.head.appendChild(style);
    }
  }
  componentDidLoad() {
    this.dateRangeInput = this.element.querySelector('.date-range-input');
    this.initializeDateRangePicker();
    this.updateDateRangePickerDates();
  }

  initializeDateRangePicker() {
    $(this.dateRangeInput).daterangepicker(
      {
        singleDatePicker: this.singleDatePicker,
        opens: this.opens,
        startDate: this.fromDate,
        endDate: this.toDate,
        minDate: moment(this.minDate || moment().format('YYYY-MM-DD')),
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
  disconnectedCallback() {
    if (this.openDatePickerTimeout) {
      clearTimeout(this.openDatePickerTimeout);
    }
    $(this.dateRangeInput).data('daterangepicker').remove();
  }
  render() {
    return (
      <Host>
        <input class="date-range-input" type="text" disabled={this.disabled} />
      </Host>
    );
  }
}
