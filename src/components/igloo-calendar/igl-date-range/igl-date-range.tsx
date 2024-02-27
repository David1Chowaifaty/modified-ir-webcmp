import { Component, Host, h, State, Event, EventEmitter, Prop } from '@stencil/core';
import { IToast } from '../../ir-toast/toast';
import locales from '@/stores/locales.store';
import { calculateDaysBetweenDates } from '@/utils/booking';
import moment from 'moment';

@Component({
  tag: 'igl-date-range',
  styleUrl: 'igl-date-range.css',
  scoped: true,
})
export class IglDateRange {
  @Prop() defaultData: { [key: string]: any };
  @Prop({ reflect: true }) disabled: boolean = false;
  @Prop() minDate: string;
  @Prop() dateLabel: string;
  @Prop() maxDate: string;
  @Event() dateSelectEvent: EventEmitter<{ [key: string]: any }>;
  @State() renderAgain: boolean = false;
  @Event() toast: EventEmitter<IToast>;

  private totalNights: number = 0;
  private fromDate: Date;
  private toDate: Date;
  private fromDateStr: string = 'from';
  private toDateStr: string = 'to';
  dateRangeInput: HTMLElement;

  getStringDateFormat(dt: Date) {
    return dt.getFullYear() + '-' + (dt.getMonth() < 9 ? '0' : '') + (dt.getMonth() + 1) + '-' + (dt.getDate() <= 9 ? '0' : '') + dt.getDate();
  }

  componentWillLoad() {
    let dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + 1);
    if (this.defaultData) {
      if (this.defaultData.fromDate) {
        this.fromDate = new Date(this.defaultData.fromDate);
        this.fromDate.setHours(0, 0, 0, 0);
        this.fromDateStr = this.getFormattedDateString(this.fromDate);
      }
      if (this.defaultData.toDate) {
        this.toDate = new Date(this.defaultData.toDate);
        this.toDate.setHours(0, 0, 0, 0);
        this.toDateStr = this.getFormattedDateString(this.toDate);
      }
    }
    if (this.fromDate && this.toDate) {
      this.calculateTotalNights();
      this.handleDateSelectEvent('selectedDateRange', {
        fromDate: this.fromDate.getTime(),
        toDate: this.toDate.getTime(),
        fromDateStr: this.fromDateStr,
        toDateStr: this.toDateStr,
        dateDifference: this.totalNights,
      });
    }
  }

  calculateTotalNights() {
    this.totalNights = calculateDaysBetweenDates(moment(this.fromDate).format('YYYY-MM-DD'), moment(this.toDate).format('YYYY-MM-DD'));
  }
  getFormattedDateString(dt) {
    return dt.getDate() + ' ' + dt.toLocaleString('default', { month: 'short' }).toLowerCase() + ' ' + dt.getFullYear();
  }

  handleDateSelectEvent(key, data: any = '') {
    this.dateSelectEvent.emit({ key, data });
  }
  handleDateChange(evt) {
    const { start, end } = evt.detail;
    this.fromDate = start.toDate();
    this.toDate = end.toDate();
    this.calculateTotalNights();

    this.handleDateSelectEvent('selectedDateRange', {
      fromDate: this.fromDate.getTime(),
      toDate: this.toDate.getTime(),
      fromDateStr: start.format('DD MMM YYYY'),
      toDateStr: end.format('DD MMM YYYY'),
      dateDifference: this.totalNights,
    });

    this.renderAgain = !this.renderAgain;
  }
  render() {
    return (
      <Host>
        <div class="calendarPickerContainer form-control input-sm" data-state={this.disabled ? 'disabled' : 'active'}>
          <ir-date-picker
            maxDate={this.maxDate}
            class={'date-range-input'}
            disabled={this.disabled}
            fromDate={this.fromDate}
            toDate={this.toDate}
            minDate={this.minDate}
            autoApply
            onDateChanged={evt => {
              this.handleDateChange(evt);
            }}
          ></ir-date-picker>
          <ir-date-view
            data-state={this.disabled ? 'disabled' : 'active'}
            showDateDifference={this.disabled}
            class="date-view"
            from_date={this.fromDate}
            to_date={this.toDate}
          ></ir-date-view>
        </div>
        <span>
          {this.totalNights && !this.disabled ? (
            <span class="iglRangeNights mx-1">{this.totalNights + (this.totalNights > 1 ? ` ${locales.entries.Lcz_Nights}` : ` ${locales.entries.Lcz_Night}`)}</span>
          ) : (
            ''
          )}
        </span>
      </Host>
    );
  }
}
