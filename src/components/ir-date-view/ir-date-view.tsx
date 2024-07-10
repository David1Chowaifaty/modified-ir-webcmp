import locales from '@/stores/locales.store';
import { calculateDaysBetweenDates } from '@/utils/booking';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-date-view',
  styleUrl: 'ir-date-view.css',
  scoped: true,
})
export class IrDateView {
  @Prop() from_date: string | Date | moment.Moment;
  @Prop() to_date: string | Date | moment.Moment;
  @Prop() showDateDifference: boolean = true;
  @Prop() dateOption: string = 'YYYY-MM-DD';
  @State() dates: { from_date: string; to_date: string; date_diffrence: number };
  componentWillLoad() {
    this.initializeDates();
  }
  @Watch('from_date')
  handleFromDateChange(newVal: any, oldVal: any) {
    if (newVal !== oldVal) {
      this.initializeDates();
    }
  }

  @Watch('to_date')
  handleToDateChange(newVal: any, oldVal: any) {
    if (newVal !== oldVal) {
      this.initializeDates();
    }
  }

  initializeDates() {
    this.convertDate('from_date', this.from_date);
    this.convertDate('to_date', this.to_date);
    const fromDate = moment(this.dates.from_date, 'MMM DD, YYYY').format('YYYY-MM-DD');
    const toDate = moment(this.dates.to_date, 'MMM DD, YYYY').format('YYYY-MM-DD');
    this.dates.date_diffrence = calculateDaysBetweenDates(fromDate, toDate);
  }

  convertDate(key: 'from_date' | 'to_date', date: string | Date | moment.Moment) {
    this.dates = this.dates || {
      from_date: '',
      to_date: '',
      date_diffrence: 0,
    };

    if (typeof date === 'string') {
      this.dates[key] = moment(date, this.dateOption).format('MMM DD, YYYY');
    } else if (date instanceof Date) {
      this.dates[key] = moment(date).format('MMM DD, YYYY');
    } else if (moment.isMoment(date)) {
      this.dates[key] = date.format('MMM DD, YYYY');
    } else {
      console.error('Unsupported date type');
    }
  }
  render() {
    return (
      <Host class="d-flex align-items-center">
        <span>{this.dates.from_date}</span>{' '}
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-01" height="14" width="14" viewBox="0 0 512 512">
          <path
            fill="currentColor"
            d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
          />
        </svg>
        <span>
          {this.dates.to_date}{' '}
          {this.showDateDifference && (
            <span class="mx-01">
              {this.dates.date_diffrence}
              {'   '}
              {this.dates.date_diffrence > 1 ? ` ${locales.entries.Lcz_Nights}` : ` ${locales.entries.Lcz_Night}`}
            </span>
          )}
        </span>
      </Host>
    );
  }
}
