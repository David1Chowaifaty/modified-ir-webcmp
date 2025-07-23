import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { DailyReportFilter, ReportDate } from '../types';
import moment from 'moment';
import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-monthly-bookings-report-filter',
  styleUrl: 'ir-monthly-bookings-report-filter.css',
  scoped: true,
})
export class IrMonthlyBookingsReportFilter {
  @Prop() isLoading: boolean;
  @Prop() baseFilters: DailyReportFilter;

  @State() filters: DailyReportFilter;

  @State() collapsed: boolean = false;
  @State() window: string;

  @Event() applyFilters: EventEmitter<DailyReportFilter>;

  private dates: ReportDate[] = [];

  componentWillLoad() {
    this.dates = this.generateMonths();
    this.filters = this.baseFilters;
  }

  private updateFilter(params: Partial<DailyReportFilter>) {
    this.filters = { ...this.filters, ...params };
  }

  private applyFiltersEvt(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.applyFilters.emit(this.filters);
  }
  private resetFilters(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.filters = this.baseFilters;
    this.applyFilters.emit(this.filters);
  }

  private generateMonths(): ReportDate[] {
    const firstOfThisMonth = moment().startOf('month');
    const startDate = moment().subtract(1, 'year').startOf('month');
    const dates = [];
    const format = 'YYYY-MM-DD';

    let cursor = startDate.clone();

    while (cursor.format(format) !== firstOfThisMonth.format(format)) {
      dates.push({
        description: cursor.format('MMM YYYY'),
        firstOfMonth: cursor.format('YYYY-MM-DD'),
        lastOfMonth: cursor.clone().endOf('month').format('YYYY-MM-DD'),
      });
      cursor.add(1, 'month');
    }

    dates.push({
      description: firstOfThisMonth.format('MMM YYYY'),
      firstOfMonth: firstOfThisMonth.format('YYYY-MM-DD'),
      lastOfMonth: firstOfThisMonth.clone().endOf('month').format('YYYY-MM-DD'),
    });

    return dates;
  }

  render() {
    return (
      <div class="card mb-0 p-1 d-flex flex-column sales-filters-card">
        <div class="d-flex align-items-center justify-content-between sales-filters-header">
          <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height={18} width={18}>
              <path
                fill="currentColor"
                d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"
              />
            </svg>
            <h4 class="m-0 p-0 flex-grow-1">{locales.entries?.Lcz_Filters || 'Filters'}</h4>
          </div>
        </div>
        <div class="m-0 p-0 collapse filters-section" id="salesFiltersCollapse">
          <fieldset class="pt-1 filter-group">
            <label htmlFor="rooms" class="m-0 px-0" style={{ paddingBottom: '0.25rem' }}>
              From
            </label>
            <ir-select
              showFirstOption={false}
              selectedValue={this.filters?.date?.description}
              onSelectChange={e => {
                this.updateFilter({ date: this.dates.find(d => d.description === e.detail) });
              }}
              LabelAvailable={false}
              data={this.dates.map(d => ({
                text: d.description,
                value: d.description,
              }))}
            ></ir-select>
          </fieldset>
          <div class="d-flex align-items-center mt-1 mb-2 compare-year-toggle" style={{ gap: '0.5rem' }}>
            <label htmlFor="compare-prev-year" style={{ paddingBottom: '0.25rem' }}>
              Compare with previous year
            </label>
            <ir-checkbox
              checked={this.filters?.include_previous_year}
              checkboxId="compare-prev-year"
              onCheckChange={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.updateFilter({ include_previous_year: e.detail });
              }}
            ></ir-checkbox>
          </div>

          <div class="d-flex align-items-center justify-content-end filter-actions" style={{ gap: '1rem' }}>
            <ir-button
              btn_type="button"
              data-testid="reset"
              text={locales.entries?.Lcz_Reset ?? 'Reset'}
              size="sm"
              btn_color="secondary"
              onClickHandler={e => this.resetFilters(e)}
            ></ir-button>
            <ir-button
              btn_type="button"
              data-testid="apply"
              isLoading={this.isLoading}
              text={locales.entries?.Lcz_Apply ?? 'Apply'}
              size="sm"
              onClickHandler={e => this.applyFiltersEvt(e)}
            ></ir-button>
          </div>
        </div>
      </div>
    );
  }
}
