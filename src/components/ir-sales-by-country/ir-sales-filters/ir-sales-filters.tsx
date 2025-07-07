import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';

import locales from '@/stores/locales.store';
import moment, { Moment } from 'moment';
import { CountrySalesFilter } from '../types';

@Component({
  tag: 'ir-sales-filters',
  styleUrl: 'ir-sales-filters.css',
  scoped: true,
})
export class IrSalesFilters {
  @Prop() isLoading: boolean;
  @Prop() baseFilters: CountrySalesFilter;

  @State() filters: CountrySalesFilter;

  @State() collapsed: boolean = false;
  @State() dates: { from: Moment; to: Moment } = {
    from: moment(),
    to: moment().add(1, 'days'),
  };

  @Event() applyFilters: EventEmitter<CountrySalesFilter>;

  componentWillLoad() {
    this.filters = this.baseFilters;
  }

  private updateFilter(params: Partial<CountrySalesFilter>) {
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
            <h4 class="m-0 p-0 flex-grow-1">{locales.entries.Lcz_Filters}</h4>
          </div>
          <ir-button
            variant="icon"
            id="drawer-icon"
            data-toggle="collapse"
            data-target="#salesFiltersCollapse"
            aria-expanded={this.collapsed ? 'true' : 'false'}
            aria-controls="salesFiltersCollapse"
            class="mr-1 collapse-btn toggle-collapse-btn"
            icon_name={this.collapsed ? 'closed_eye' : 'open_eye'}
            onClickHandler={() => {
              this.collapsed = !this.collapsed;
            }}
            style={{ '--icon-size': '1.6rem' }}
          ></ir-button>
        </div>
        <div class="m-0 p-0 collapse filters-section" id="salesFiltersCollapse">
          <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
            <fieldset class="pt-1 filter-group">
              <label htmlFor="rooms" class="m-0 p-0">
                Rooms
              </label>
              <ir-select
                select_id="rooms"
                LabelAvailable={false}
                showFirstOption={false}
                onSelectChange={e =>
                  this.updateFilter({
                    BOOK_CASE: e.detail,
                  })
                }
                data={[
                  { text: 'Booked', value: '001' },
                  { text: 'Stayed', value: '002' },
                ]}
              ></ir-select>
            </fieldset>
            <fieldset class="pt-1 filter-group">
              <label htmlFor="period" class="p-0 m-0">
                Selected Period
              </label>
              <div class="d-flex flex-column date-filter-group" style={{ gap: '0.5rem' }}>
                <ir-select
                  onSelectChange={e => {
                    const dateDiff = Number(e.detail);
                    const today = moment();
                    this.updateFilter({
                      WINDOW: dateDiff,
                      TO_DATE: today.format('YYYY-MM-DD'),
                      FROM_DATE: today.add(-dateDiff, 'days').format('YYYY-MM-DD'),
                    });
                  }}
                  select_id="period"
                  LabelAvailable={false}
                  showFirstOption={false}
                  data={[
                    { text: 'For the past 7 days', value: '7' },
                    { text: 'For the past 14 days', value: '14' },
                    { text: 'For the past 30 days', value: '30' },
                    { text: 'For the past 60 days', value: '60' },
                    { text: 'For the past 90 days', value: '90' },
                    { text: 'For the past 365 days', value: '365' },
                  ]}
                ></ir-select>
                <p class="m-0 p-0 text-center">Or</p>
                <ir-range-picker
                  onDateRangeChanged={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    const { fromDate, toDate } = e.detail;
                    this.updateFilter({
                      FROM_DATE: fromDate.format('YYYY-MM-DD'),
                      TO_DATE: toDate.format('YYYY-MM-DD'),
                    });
                    this.dates = { from: fromDate, to: toDate };
                  }}
                  fromDate={this.dates.from}
                  toDate={this.dates.to}
                  maxDate={moment().format('YYYY-MM-DD')}
                  withOverlay={false}
                ></ir-range-picker>
              </div>
            </fieldset>
            <div class="d-flex align-items-center mt-1 mb-2 compare-year-toggle" style={{ gap: '0.5rem' }}>
              <label htmlFor="compare-prev-year">Compare with previous year</label>
              <ir-checkbox
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
                text={locales.entries.Lcz_Reset}
                size="sm"
                btn_color="secondary"
                onClickHandler={e => this.resetFilters(e)}
              ></ir-button>
              <ir-button
                btn_type="button"
                data-testid="apply"
                isLoading={this.isLoading}
                text={locales.entries.Lcz_Apply}
                size="sm"
                onClickHandler={e => this.applyFiltersEvt(e)}
              ></ir-button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
