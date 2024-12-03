import { Component, Host, h, State, Event, EventEmitter, Prop, Watch } from '@stencil/core';
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
  @Prop() withDateDifference: boolean = true;
  @Prop() variant: 'booking' | 'default' = 'default';

  @State() renderAgain: boolean = false;

  @Event() dateSelectEvent: EventEmitter<{ [key: string]: any }>;
  @Event() toast: EventEmitter<IToast>;

  private totalNights: number = 0;
  private fromDate: Date;
  private toDate: Date;
  private fromDateStr: string = 'from';
  private toDateStr: string = 'to';

  componentWillLoad() {
    this.initializeDates();
  }

  @Watch('defaultData')
  handleDataChange(newValue: any, oldValue: any) {
    if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
      this.initializeDates();
    }
  }

  private initializeDates() {
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
      // this.handleDateSelectEvent('selectedDateRange', {
      //   fromDate: this.fromDate.getTime(),
      //   toDate: this.toDate.getTime(),
      //   fromDateStr: this.fromDateStr,
      //   toDateStr: this.toDateStr,
      //   dateDifference: this.totalNights,
      // });
    }
    return [this.fromDateStr, this.toDateStr];
  }

  private calculateTotalNights() {
    this.totalNights = calculateDaysBetweenDates(moment(this.fromDate).format('YYYY-MM-DD'), moment(this.toDate).format('YYYY-MM-DD'));
  }
  private getFormattedDateString(dt) {
    return dt.getDate() + ' ' + dt.toLocaleString('default', { month: 'short' }).toLowerCase() + ' ' + dt.getFullYear();
  }

  private handleDateSelectEvent(key, data: any = '') {
    this.dateSelectEvent.emit({ key, data });
  }
  private handleDateChange(evt) {
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
    if (this.variant === 'booking') {
      return (
        <div class={`p-0 m-0 date-range-container-cn`}>
          <ir-date-picker
            maxDate={this.maxDate}
            class={'date-range-input'}
            disabled={this.disabled}
            fromDate={this.fromDate}
            toDate={this.toDate}
            minDate={this.minDate}
            autoApply
            data-state={this.disabled ? 'disabled' : 'active'}
            onDateChanged={evt => {
              this.handleDateChange(evt);
            }}
          ></ir-date-picker>
          <div class={`d-flex align-items-center m-0  date-range-container ${this.disabled ? 'disabled' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" class="m-0 p-0" height="14" width="14" viewBox="0 0 448 512">
              <path
                fill="currentColor"
                d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"
              />
            </svg>
            <span>{moment(this.fromDate).format('MMM DD, YYYY')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="m-0 p-0" height="14" width="14" viewBox="0 0 512 512">
              <path
                fill="currentColor"
                d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
              />
            </svg>
            <span>{moment(this.toDate).format('MMM DD, YYYY')}</span>
            {this.totalNights && <span class="m-0 p-0">{this.totalNights + (this.totalNights > 1 ? ` ${locales.entries.Lcz_Nights}` : ` ${locales.entries.Lcz_Night}`)}</span>}
          </div>
        </div>
      );
    }
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
            data-state={this.disabled ? 'disabled' : 'active'}
            onDateChanged={evt => {
              this.handleDateChange(evt);
            }}
          ></ir-date-picker>
          <div data-state={this.disabled ? 'disabled' : 'active'} class="date-view">
            <svg xmlns="http://www.w3.org/2000/svg" height="12" width="10.5" viewBox="0 0 448 512">
              <path
                fill="currentColor"
                d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"
              />
            </svg>
            <ir-date-view showDateDifference={this.disabled} from_date={this.fromDate} to_date={this.toDate}></ir-date-view>
          </div>
        </div>
        {this.withDateDifference && (
          <span>
            {this.totalNights && !this.disabled ? (
              <span class="iglRangeNights mx-1">{this.totalNights + (this.totalNights > 1 ? ` ${locales.entries.Lcz_Nights}` : ` ${locales.entries.Lcz_Night}`)}</span>
            ) : (
              ''
            )}
          </span>
        )}
      </Host>
    );
  }
}
