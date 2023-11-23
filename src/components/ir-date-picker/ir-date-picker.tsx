import { Component, h, Element, Prop, Event, EventEmitter } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-date-picker',
  styleUrl: 'ir-date-picker.css',
  scoped: true,
})
export class IrDatePicker {
  @Element() private element: HTMLElement;
  @Prop({ reflect: true }) fromDate: Date;
  @Prop({ reflect: true }) toDate: Date;

  @Prop({ reflect: true }) opens: 'left' | 'right' | 'center';
  @Prop({ reflect: true }) autoApply: boolean;
  @Prop({ reflect: true }) firstDay: number = 1;
  @Prop({ reflect: true }) monthNames: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  @Prop({ reflect: true }) daysOfWeek: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  @Prop({ reflect: true }) format: string = 'MMM DD,YYYY';
  @Prop({ reflect: true }) separator: string = '-';
  @Prop({ reflect: true }) applyLabel: string = 'Apply';
  @Prop({ reflect: true }) cancelLabel: string = 'Cancel';
  @Prop({ reflect: true }) fromLabel: string = 'Form';
  @Prop({ reflect: true }) toLabel: string = 'To';
  @Prop({ reflect: true }) customRangeLabel: string = 'Custom';
  @Prop({ reflect: true }) weekLabel: string = 'W';
  @Prop({ reflect: true }) disabled: boolean = false;
  @Prop({ reflect: true }) maxSpan: moment.DurationInputArg1 = {
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
        opens: this.opens,
        startDate: moment(this.fromDate),
        endDate: moment(this.toDate),
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
    return <input class="date-range-input" type="text" disabled={this.disabled} />;
  }
}
