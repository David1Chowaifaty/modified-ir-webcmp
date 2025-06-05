import { Component, h, Element, Prop, Event, EventEmitter, Host, Watch, Method } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-date-range',
  styleUrl: 'ir-date-range.css',
  scoped: true,
})
export class IrDateRange {
  @Element() private element: HTMLElement;
  /**
   * Start date for the date range.
   */
  @Prop() fromDate: Date;

  /**
   * End date for the date range.
   */
  @Prop() toDate: Date;

  /**
   * Single date selection value (used in single date picker mode).
   */
  @Prop() date: Date;

  /**
   * Defines which side the calendar opens to.
   * Options: `'left'`, `'right'`, `'center'`.
   */
  @Prop() opens: 'left' | 'right' | 'center';

  /**
   * Whether to apply the selected range automatically without clicking 'Apply'.
   */
  @Prop() autoApply: boolean;

  /**
   * First day of the week (0 = Sunday, 1 = Monday, ...).
   */
  @Prop() firstDay: number = 1;

  /**
   * Month names shown in the calendar header.
   */
  @Prop() monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  /**
   * Abbreviated names of the days of the week.
   */
  @Prop() daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  /**
   * Date format used in the input and picker.
   */
  @Prop() format: string = 'MMM DD, YYYY';

  /**
   * Separator string used between start and end dates.
   */
  @Prop() separator: string = ' - ';

  /**
   * Text shown on the Apply button.
   */
  @Prop() applyLabel: string = 'Apply';

  /**
   * Text shown on the Cancel button.
   */
  @Prop() cancelLabel: string = 'Cancel';

  /**
   * Label for the "From" date input.
   */
  @Prop() fromLabel: string = 'Form';

  /**
   * Label for the "To" date input.
   */
  @Prop() toLabel: string = 'To';

  /**
   * Label used for the custom date range option.
   */
  @Prop() customRangeLabel: string = 'Custom';

  /**
   * Label for the week column in the calendar.
   */
  @Prop() weekLabel: string = 'W';

  /**
   * Disables the date range input when true.
   */
  @Prop() disabled: boolean = false;

  /**
   * Enables single date selection mode.
   */
  @Prop() singleDatePicker = false;

  /**
   * Minimum selectable date.
   */
  @Prop() minDate: string | Date;

  /**
   * Maximum selectable date.
   */
  @Prop() maxDate: string | Date;

  /**
   * Maximum range span (e.g., `{ days: 240 }`).
   */
  @Prop() maxSpan: moment.DurationInputArg1 = { days: 240 };

  /**
   * Emits when a new date range is selected.
   *
   * Example:
   * ```tsx
   * <ir-date-range onDateChanged={(e) => console.log(e.detail)} />
   * ```
   */
  @Event() dateChanged: EventEmitter<{
    start: moment.Moment;
    end: moment.Moment;
  }>;

  private openDatePickerTimeout: NodeJS.Timeout;
  private dateRangeInput: HTMLElement;
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
  disconnectedCallback() {
    if (this.openDatePickerTimeout) {
      clearTimeout(this.openDatePickerTimeout);
    }
    $(this.dateRangeInput).data('daterangepicker').remove();
  }
  @Watch('minDate')
  handleMinDateChange() {
    $(this.dateRangeInput).data('daterangepicker').remove();
    this.initializeDateRangePicker();
  }
  @Watch('date')
  datePropChanged() {
    this.updateDateRangePickerDates();
  }
  /**
   * Opens the date picker programmatically.
   *
   * Example:
   * ```ts
   * const el = document.querySelector('ir-date-range');
   * await el.openDatePicker();
   * ```
   */
  @Method()
  async openDatePicker() {
    this.openDatePickerTimeout = setTimeout(() => {
      this.dateRangeInput.click();
    }, 20);
  }
  /**
   * Updates the current dates displayed in the picker
   * (used when props change externally).
   */
  private updateDateRangePickerDates() {
    const picker = $(this.dateRangeInput).data('daterangepicker');
    if (!picker) {
      console.error('Date range picker not initialized.');
      return;
    }

    // Adjust how dates are set based on whether it's a single date picker or range picker.
    if (this.singleDatePicker) {
      const newDate = this.date ? moment(this.date) : moment();
      picker.setStartDate(newDate);
      picker.setEndDate(newDate); // For single date picker, start and end date might be the same.
    } else {
      const newStartDate = this.fromDate ? moment(this.fromDate) : moment();
      const newEndDate = this.toDate ? moment(this.toDate) : newStartDate.clone().add(1, 'days');
      picker.setStartDate(newStartDate);
      picker.setEndDate(newEndDate);
    }
  }
  /**
   * Initializes the date range picker using jQuery plugin with given props.
   */
  private initializeDateRangePicker() {
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
        <input class="date-range-input" type="button" disabled={this.disabled} />
      </Host>
    );
  }
}
