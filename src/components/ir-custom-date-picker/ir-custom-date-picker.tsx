import { Component, h, Prop, Element, Event, EventEmitter, Method, Watch, State, Host } from '@stencil/core';
import AirDatepicker from 'air-datepicker';
import localeEn from 'air-datepicker/locale/en';
import moment from 'moment';
import { ClickOutside } from '../../decorators/ClickOutside';

@Component({
  tag: 'ir-custom-date-picker',
  styleUrls: ['ir-custom-date-picker.css'],
  shadow: false,
})
export class IrCustomDatePicker {
  @Element() el: HTMLElement;

  @Prop() withClear: boolean;

  @Prop() placeholder: string;

  @Prop() label: string;

  @Prop() dates: string[];

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
   * Defaults to `false`.
   */
  @Prop() customPicker: boolean = false;

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

  /**
   * Styles for the trigger container
   */
  @Prop() triggerContainerStyle: string = '';

  @State() currentDate: Date | null = null;
  @State() isActive: boolean = false;
  @State() isPickerInvalid: boolean;

  @Event() dateChanged: EventEmitter<{
    start: moment.Moment;
    end: moment.Moment;
  }>;
  @Event() datePickerFocus: EventEmitter<void>;
  @Event() datePickerBlur: EventEmitter<void>;

  private pickerRef!: HTMLInputElement;
  private calendarContainerRef?: HTMLDivElement;
  private datePicker?: AirDatepicker<HTMLInputElement>;

  componentWillLoad() {
    const hasAriaInvalidAttr = this.el.hasAttribute('aria-invalid');
    if (hasAriaInvalidAttr) {
      this.isPickerInvalid = JSON.parse(this.el.getAttribute('aria-invalid'));
    }

    if (this.date) {
      const initialDate = this.toValidDate(this.date);
      if (initialDate) {
        this.currentDate = initialDate;
      }
    }
  }

  componentDidLoad() {
    this.initializeDatepicker();
  }

  disconnectedCallback() {
    this.datePicker?.destroy?.();
  }

  @ClickOutside()
  handleClickOutside() {
    if (this.isActive) {
      this.closePopup();
    }
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
      this.datePicker?.update({ minDate: this.toValidDate(newVal) ?? undefined });
    }
  }

  @Watch('maxDate')
  maxDatePropChanged(newVal: string | Date, oldVal: string | Date) {
    if (!this.datePicker) {
      return;
    }
    if (!this.isSameDates(newVal, oldVal)) {
      this.datePicker?.update({ maxDate: this.toValidDate(newVal) ?? undefined });
    }
  }

  @Watch('disabled')
  handleDisabledChange(newVal: boolean) {
    if (newVal) {
      this.closePopup();
    }
  }
  @Watch('aria-invalid')
  handleAriaInvalidChange(newVal: string) {
    this.isPickerInvalid = JSON.parse(newVal);
  }

  @Method()
  async openDatePicker() {
    if (!this.disabled) {
      this.openPopup();
    }
  }

  @Method()
  async clearDatePicker() {
    this.datePicker?.clear();
    this.currentDate = null;
    this.date = null;
    if (this.emitEmptyDate) {
      this.dateChanged.emit({
        start: null,
        end: null,
      });
    }
  }

  private openPopup() {
    if (this.isActive) return;
    this.isActive = true;
    this.datePickerFocus.emit();
  }

  private closePopup() {
    if (!this.isActive) return;
    this.isActive = false;
    this.datePickerBlur.emit();
  }

  private handleAnchorClick = (event: MouseEvent) => {
    event.stopPropagation();
    event.stopImmediatePropagation();
    event.preventDefault();

    if (this.disabled) {
      return;
    }

    if (this.isActive) {
      this.closePopup();
    } else {
      this.openPopup();
    }
  };

  private handleAnchorKeyDown = (event: KeyboardEvent) => {
    if (this.customPicker || this.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isActive ? this.closePopup() : this.openPopup();
    }
  };

  private isSameDates(d1: string | Date | null, d2: string | Date | null): boolean {
    if (!d1 && !d2) return true;
    if (!d1 || !d2) return false;
    return moment(d1).isSame(moment(d2), 'day');
  }

  private toValidDate(value: string | Date | null): Date | null {
    if (!value) return null;
    if (typeof value === 'string') {
      return moment(value, 'YYYY-MM-DD').toDate();
    }
    return moment(value).toDate();
  }

  private updatePickerDate(newDate: string | Date | null) {
    const validDate = this.toValidDate(newDate);

    if (!validDate) {
      this.datePicker?.clear({ silent: true });
      this.currentDate = null;
      return;
    }

    if (this.currentDate && this.isSameDates(this.currentDate, validDate)) {
      return;
    }

    this.currentDate = validDate;

    if (this.forceDestroyOnUpdate && this.datePicker) {
      this.datePicker.destroy();
      this.datePicker = undefined;
      this.initializeDatepicker();
    } else {
      this.datePicker?.selectDate(validDate, { silent: true });
    }
  }

  private initializeDatepicker() {
    if (this.datePicker || !this.pickerRef) {
      return;
    }

    const containerTarget = this.container ?? this.calendarContainerRef ?? this.el;
    console.log(this.minDate, this.maxDate);
    this.datePicker = new AirDatepicker(this.pickerRef, {
      container: containerTarget,
      inline: true,
      selectedDates: this.dates ? this.dates : this.currentDate ? [this.currentDate] : [],
      multipleDates: this.multipleDates,
      range: this.range,
      dateFormat: this.dateFormat,
      timepicker: this.timepicker,
      minDate: this.toValidDate(this.minDate) ?? undefined,
      maxDate: this.toValidDate(this.maxDate) ?? undefined,
      autoClose: this.autoClose,
      locale: localeEn,
      showOtherMonths: this.showOtherMonths,
      selectOtherMonths: this.selectOtherMonths,
      onSelect: ({ date }) => this.handleDateSelect(date),
    });

    this.datePicker.$datepicker?.classList.add('ir-custom-date-picker__calendar');
    this.datePicker.$datepicker.style.borderWidth = '0px';
    this.datePicker.$datepicker.style.setProperty('--adp-cell-background-color-selected', 'var(--wa-color-brand-50)');
    this.datePicker.$datepicker.style.setProperty('--adp-cell-background-color-selected-hover', 'var(--wa-color-brand-50)');
    this.datePicker.$datepicker.style.setProperty('--adp-accent-color', 'var(--wa-color-brand-50)');
    this.datePicker.$datepicker.style.setProperty('--adp-day-name-color', 'lab(48.496% 0 0)');
  }

  private handleDateSelect(selected: Date | Date[]) {
    const dates = Array.isArray(selected) ? selected.filter(Boolean) : selected ? [selected] : [];

    if (!dates.length || !(dates[0] instanceof Date)) {
      if (this.emitEmptyDate) {
        this.dateChanged.emit({
          start: null,
          end: null,
        });
      }
      this.currentDate = null;
      this.date = null;
      return;
    }

    const startDate = dates[0];
    const endDate = this.range && dates.length > 1 ? dates[1] : startDate;

    this.currentDate = startDate;
    this.date = startDate;
    this.dateChanged.emit({
      start: startDate ? moment(startDate) : null,
      end: endDate ? moment(endDate) : null,
    });

    const shouldClose = this.autoClose && (!this.range || (this.range && dates.length > 1));
    if (shouldClose) {
      this.closePopup();
    }
  }

  private getTriggerLabel(): string {
    if (this.range) {
      return this.dates.map(d => moment(d).format('MMM DD, YYYY')).join(' → ');
    }
    if (!this.currentDate) {
      return null;
    }
    return this.timepicker ? moment(this.currentDate).format('MMM DD, YYYY, HH:mm') : moment(this.currentDate).format('MMM DD, YYYY');
  }

  render() {
    const triggerClasses = `custom-date-picker__trigger ${this.triggerContainerStyle} ${this.disabled ? 'custom-date-picker__trigger--disabled' : ''}`;

    return (
      <Host class={{ 'custom-date-picker': true, 'custom-date-picker--open': this.isActive, 'custom-date-picker--disabled': this.disabled }}>
        <wa-popup distance={8} class="custom-date-picker__popup" arrow arrow-placement="anchor" flip shift active={this.isActive}>
          <ir-input
            disabled={this.disabled}
            placeholder={this.placeholder}
            withClear={this.withClear}
            tabIndex={!this.customPicker && !this.disabled ? 0 : undefined}
            aria-expanded={!this.customPicker ? String(this.isActive) : undefined}
            aria-disabled={this.disabled ? 'true' : undefined}
            onKeyDown={this.handleAnchorKeyDown}
            aria-invalid={String(this.isPickerInvalid)}
            class={triggerClasses}
            onClick={this.handleAnchorClick}
            readonly
            slot="anchor"
            defaultValue={this.getTriggerLabel()}
            value={this.getTriggerLabel()}
            label={this.label}
          >
            <slot name="start" slot="start"></slot>
            <slot name="end" slot="end"></slot>
          </ir-input>

          <div class="picker-surface">
            <div class="picker-surface__calendar" ref={el => (this.calendarContainerRef = el)}></div>
            <input type="text" class="picker-surface__input" ref={el => (this.pickerRef = el)} aria-hidden="true" tabIndex={-1} readOnly />
          </div>
        </wa-popup>
      </Host>
    );
  }
}
