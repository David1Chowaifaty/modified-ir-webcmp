import { createPopper } from '@popperjs/core';
import { Component, h, Prop, Element, Event, EventEmitter, Method, Watch, State } from '@stencil/core';
import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';
import moment from 'moment';

@Component({
  tag: 'ir-date-picker',
  styleUrl: 'ir-date-picker.css',
  shadow: false,
})
export class IrDatePicker {
  @Element() el: HTMLElement;

  /**
   * Determines whether the date picker is rendered inline or in a pop-up.
   * If `true`, the picker is always visible inline.
   */
  @Prop() inline: boolean = false;

  /**
   * The initially selected date; can be a `Date` object or a string recognized by `AirDatepicker`.
   */
  @Prop({ mutable: true, reflect: true }) date: string | Date | null = null;

  /**
   * Enables multiple dates.
   * If `true`, multiple selection is allowed.
   * If you pass a number (e.g. 3), that is the maximum number of selectable dates.
   */
  @Prop() multipleDates: boolean | number = false;

  /**
   * Whether the picker should allow range selection (start and end date).
   */
  @Prop() range: boolean = false;

  /**
   * Format for the date as it appears in the input field.
   * Follows the `AirDatepicker` format rules.
   */
  @Prop() dateFormat: string = 'yyyy-MM-dd';

  /**
   * Enables the timepicker functionality (select hours and minutes).
   */
  @Prop() timepicker: boolean = false;

  /**
   * The earliest date that can be selected.
   */
  @Prop() minDate?: string | Date;

  /**
   * The latest date that can be selected.
   */
  @Prop() maxDate?: string | Date;

  /**
   * Disables the input and prevents interaction.
   */
  @Prop() disabled: boolean = false;

  /**
   * Closes the picker automatically after a date is selected.
   */
  @Prop() autoClose: boolean = true;

  /**
   * Shows days from previous/next month in the current month's calendar.
   */
  @Prop() showOtherMonths: boolean = true;

  /**
   * Allows selecting days from previous/next month shown in the current view.
   */
  @Prop() selectOtherMonths: boolean = true;

  /**
   * Controls how the date picker is triggered.
   * - **`true`**: The picker can be triggered by custom UI elements (provided via a `<slot name="trigger">`).
   * - **`false`**: A default button input is used to open the picker.
   *
   * Defaults to `true`.
   */
  @Prop() customPicker: boolean = true;

  /**
   * Pass a container element if you need the date picker to be appended to a specific element
   * for styling or positioning (particularly for arrow rendering).
   * If not provided, it defaults to `this.el`.
   */
  @Prop() container?: HTMLElement;

  /**
   * If `true`, the date picker instance is destroyed and rebuilt each time the `date` prop changes.
   * This can be useful if you need the picker to fully re-initialize in response to dynamic changes,
   * but note that it may affect performance if triggered frequently.
   * Defaults to `false`.
   */
  @Prop() forceDestroyOnUpdate: boolean = false;

  /**
   * If `true`, the component will emit a `dateChanged` event when the selected date becomes empty (null).
   * Otherwise, empty-date changes will be ignored (no event emitted).
   *
   * Defaults to `false`.
   */
  @Prop() emitEmptyDate: boolean = false;

  @State() currentDate: Date | null = null;

  @Event() dateChanged: EventEmitter<{
    start: moment.Moment;
    end: moment.Moment;
  }>;
  @Event() datePickerFocus: EventEmitter<void>;
  @Event() datePickerBlur: EventEmitter<void>;

  private pickerRef!: HTMLInputElement;
  private datePicker!: AirDatepicker<HTMLElement>;
  private openDatePickerTimeout?: ReturnType<typeof setTimeout>;
  private triggerSlot: HTMLElement | null = null;

  componentWillLoad() {
    // Sync initial @Prop to internal state
    if (this.date) {
      this.currentDate = this.toValidDate(this.date);
    }
  }

  componentDidLoad() {
    this.initializeDatepicker();
    this.setupTriggerFocusHandling();
  }

  /**
   * Set up focus handling for the custom trigger slot
   */
  private setupTriggerFocusHandling() {
    if (!this.customPicker) return;

    // Get the slot element
    const slotEl = this.el.querySelector('[slot="trigger"]') as HTMLSlotElement;
    if (!slotEl) return;

    // We'll consider the first assigned element as our trigger
    this.triggerSlot = slotEl as HTMLElement;

    // Add focus event listener to the trigger element
    this.triggerSlot.addEventListener('focus', this.handleTriggerFocus.bind(this));

    // Also handle click events on the trigger
    this.triggerSlot.addEventListener('click', this.handleTriggerClick.bind(this));
  }

  private handleTriggerFocus() {
    if (this.disabled) return;
    this.openDatePicker();
  }

  private handleTriggerClick(event: Event) {
    if (this.disabled) return;
    event.preventDefault();
    this.openDatePicker();
  }

  @Watch('date')
  datePropChanged(newDate: string | Date | null, oldDate: string | Date | null) {
    if (this.isSameDates(newDate, oldDate)) {
      return;
    }
    this.updatePickerDate(newDate);
  }

  @Watch('minDate')
  minDatePropChanged(newVal: string | Date, oldVal: string | Date) {
    if (!this.datePicker) {
      return;
    }
    if (!this.isSameDates(newVal, oldVal)) {
      this.datePicker?.update({ minDate: this.toValidDate(newVal) });
    }
  }

  @Watch('maxDate')
  maxDatePropChanged(newVal: string | Date, oldVal: string | Date) {
    if (!this.isSameDates(newVal, oldVal)) {
      this.datePicker?.update({ maxDate: this.toValidDate(newVal) });
    }
  }

  @Method()
  async openDatePicker() {
    // small delay to let the input mount if needed
    this.openDatePickerTimeout = setTimeout(() => {
      this.pickerRef.focus();
    }, 20);
  }

  @Method()
  async clearDatePicker() {
    this.datePicker?.clear();
  }

  private isSameDates(d1: string | Date | null, d2: string | Date | null): boolean {
    if (!d1 && !d2) return true;
    if (!d1 || !d2) return false;
    return moment(d1).isSame(moment(d2), 'day');
  }

  private toValidDate(value: string | Date | null): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private updatePickerDate(newDate: string | Date | null) {
    const valid = this.toValidDate(newDate);

    if (!valid) {
      // If invalid or null, just clear
      this.datePicker?.clear();
      this.currentDate = null;
      return;
    }

    // If it's a truly new date, select it
    if (!this.isSameDates(this.currentDate, valid)) {
      this.currentDate = valid;
      if (this.forceDestroyOnUpdate) {
        this.datePicker.destroy();
        this.datePicker = null;
        this.initializeDatepicker();
      } else {
        this.datePicker?.selectDate(valid);
      }
    }
  }

  private initializeDatepicker() {
    if (this.datePicker) return;

    this.datePicker = new AirDatepicker(this.pickerRef, {
      container: this.container,
      inline: this.inline,
      selectedDates: this.date ? [this.date] : [],
      multipleDates: this.multipleDates,
      range: this.range,
      dateFormat: this.dateFormat,
      timepicker: this.timepicker,
      minDate: this.minDate,
      maxDate: this.maxDate,
      autoClose: this.autoClose,
      locale: localeEn,
      showOtherMonths: this.showOtherMonths,
      selectOtherMonths: this.selectOtherMonths,
      onHide: () => {
        this.datePickerBlur.emit();
      },
      onShow: () => {
        this.datePickerFocus.emit();
      },
      onSelect: ({ date }) => {
        if (!date || !(date instanceof Date)) {
          if (this.emitEmptyDate) {
            this.dateChanged.emit({
              start: null,
              end: null,
            });
          }
          return;
        }
        this.currentDate = date;
        this.date = date;
        this.dateChanged.emit({
          start: moment(date),
          end: moment(date),
        });
      },

      position({ $datepicker, $target, $pointer, done }) {
        let popper = createPopper($target, $datepicker, {
          placement: 'top',
          modifiers: [
            {
              name: 'flip',
              options: { padding: { top: 0 } },
            },
            {
              name: 'offset',
              options: { offset: [0, 10] },
            },
            {
              name: 'arrow',
              options: { element: $pointer },
            },
          ],
        });

        return function completeHide() {
          popper.destroy();
          done();
        };
      },
    });
  }

  disconnectedCallback() {
    if (this.openDatePickerTimeout) {
      clearTimeout(this.openDatePickerTimeout);
    }

    // Clean up event listeners
    if (this.triggerSlot) {
      this.triggerSlot.removeEventListener('focus', this.handleTriggerFocus);
      this.triggerSlot.removeEventListener('click', this.handleTriggerClick);
    }

    this.datePicker?.destroy?.();
  }

  render() {
    return (
      <div class="ir-date-picker-trigger">
        {this.customPicker && <slot name="trigger"></slot>}
        <input type="text" disabled={this.disabled} class={this.customPicker ? 'ir-date-picker-element' : 'form-control input-sm'} ref={el => (this.pickerRef = el)} />
      </div>
    );
  }
}
