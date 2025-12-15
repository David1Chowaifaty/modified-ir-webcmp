import { Component, h, State, Event, EventEmitter, Prop, Watch } from '@stencil/core';
import { IToast } from '@components/ui/ir-toast/toast';
import locales from '@/stores/locales.store';
import { calculateDaysBetweenDates } from '@/utils/booking';
import moment from 'moment';

@Component({
  tag: 'igl-date-range',
  styleUrl: 'igl-date-range.css',
  shadow: true,
})
export class IglDateRange {
  @Prop({ reflect: true }) size: 'small' | 'medium' | 'large' = 'small';
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
  @State() fromDate: Date = moment().toDate();
  @State() toDate: Date = moment().add(1, 'day').toDate();

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
    if (this.defaultData) {
      if (this.defaultData.fromDate) {
        this.fromDate = new Date(this.defaultData.fromDate);
        this.fromDate.setHours(0, 0, 0, 0);
      }
      if (this.defaultData.toDate) {
        this.toDate = new Date(this.defaultData.toDate);
        this.toDate.setHours(0, 0, 0, 0);
      }
    }
    if (this.fromDate && this.toDate) {
      this.calculateTotalNights();
    }
  }

  private calculateTotalNights() {
    this.totalNights = calculateDaysBetweenDates(moment(this.fromDate).format('YYYY-MM-DD'), moment(this.toDate).format('YYYY-MM-DD'));
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
  // private renderDateSummary(showNights: boolean) {
  //   const fromDateDisplay = moment(this.fromDate).format('MMM DD, YYYY');
  //   const toDateDisplay = moment(this.toDate).format('MMM DD, YYYY');
  //   const shouldRenderNights = showNights && this.totalNights > 0;

  //   return (
  //     <div
  //       class={{
  //         'date-range-display': true,
  //         'date-range-display--disabled': this.disabled,
  //       }}
  //     >
  //       <wa-icon variant="regular" name="calendar"></wa-icon>
  //       <span class="date-range-date">{fromDateDisplay}</span>
  //       <wa-icon name="arrow-right"></wa-icon>
  //       <span class="date-range-date">{toDateDisplay}</span>
  //       {shouldRenderNights && (
  //         <span class="date-range-nights">{this.totalNights + (this.totalNights > 1 ? ` ${locales.entries.Lcz_Nights}` : ` ${locales.entries.Lcz_Night}`)}</span>
  //       )}
  //     </div>
  //   );
  // }
  private get dates() {
    const fromDate = moment(this.fromDate).format('YYYY-MM-DD');
    const toDate = moment(this.toDate).format('YYYY-MM-DD');
    return [fromDate, toDate];
  }
  render() {
    const showNights = this.variant === 'booking' && this.withDateDifference;
    return (
      // <Host size={this.size}>
      //   <div class={`date-range-shell ${this.disabled ? 'disabled' : ''} ${this.variant === 'booking' ? 'picker' : ''}`}>
      //     <ir-date-range
      //       maxDate={this.maxDate}
      //       class={'date-range-input'}
      //       disabled={this.disabled}
      //       fromDate={this.fromDate}
      //       toDate={this.toDate}
      //       minDate={this.minDate}
      //       autoApply
      //       data-state={this.disabled ? 'disabled' : 'active'}
      //       onDateChanged={evt => {
      //         this.handleDateChange(evt);
      //       }}
      //     ></ir-date-range>
      //     {this.renderDateSummary(showNights)}
      //   </div>
      // </Host>
      <ir-custom-date-picker
        disabled={this.disabled}
        class="custom-picker"
        minDate={this.minDate}
        maxDate={this.maxDate}
        onDateChanged={e => this.handleDateChange(e)}
        range
        dates={this.dates}
      >
        <wa-icon slot="start" variant="regular" name="calendar"></wa-icon>
        {showNights && (
          <span slot="end" class="date-range-nights">
            {this.totalNights + (this.totalNights > 1 ? ` ${locales.entries.Lcz_Nights}` : ` ${locales.entries.Lcz_Night}`)}
          </span>
        )}
      </ir-custom-date-picker>
    );
  }
}
