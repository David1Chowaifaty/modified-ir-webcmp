import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { DailyFinancialActionsFilter } from '../types';
import moment from 'moment';
import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-financial-filters',
  styleUrl: 'ir-financial-filters.css',
  scoped: true,
})
export class IrFinancialFilters {
  @Prop() isLoading: boolean;

  @State() collapsed: boolean = false;
  @State() filters: DailyFinancialActionsFilter;
  private baseFilters: DailyFinancialActionsFilter = {
    date: moment().format('YYYY-MM-DD'),
    sourceCode: '001',
  };

  @Event() fetchNewReports: EventEmitter<DailyFinancialActionsFilter>;

  componentWillLoad() {
    this.filters = { ...this.baseFilters };
  }

  private applyFiltersEvt(e: CustomEvent): void {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.fetchNewReports.emit(this.filters);
  }

  private resetFilters(e: CustomEvent): void {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.filters = { ...this.baseFilters };
    this.fetchNewReports.emit(this.filters);
  }

  private updateFilter(params: Partial<DailyFinancialActionsFilter>) {
    this.filters = { ...this.filters, ...params };
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
            <h4 class="m-0 p-0 flex-grow-1">{locales.entries?.Lcz_Filters}</h4>
          </div>
          <ir-button
            variant="icon"
            id="drawer-icon"
            data-toggle="collapse"
            data-target="#financialFilterCollapse"
            aria-expanded={this.collapsed ? 'true' : 'false'}
            aria-controls="financialFilterCollapse"
            class="mr-1 collapse-btn toggle-collapse-btn"
            icon_name={this.collapsed ? 'closed_eye' : 'open_eye'}
            onClickHandler={() => {
              this.collapsed = !this.collapsed;
            }}
            style={{ '--icon-size': '1.6rem' }}
          ></ir-button>
        </div>
        <div class="m-0 p-0 collapse filters-section" id="financialFilterCollapse">
          <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
            <fieldset class="pt-1 filter-group">
              <label htmlFor="rooms" class="m-0 px-0" style={{ paddingBottom: '0.25rem' }}>
                Select a date
              </label>
              <div class="w-100 d-flex">
                <style>
                  {`
                  .ir-date-picker-trigger{
                    width:100%;
                  }
                  `}
                </style>
                <ir-date-picker
                  data-testid="pickup_date"
                  date={this.filters?.date}
                  class="w-100"
                  emitEmptyDate={true}
                  maxDate={moment().format('YYYY-MM-DD')}
                  onDateChanged={evt => {
                    evt.stopImmediatePropagation();
                    evt.stopPropagation();
                    this.updateFilter({ date: evt.detail.start?.format('YYYY-MM-DD') });
                  }}
                >
                  <input
                    slot="trigger"
                    type="text"
                    value={this?.filters?.date}
                    class={`financial-filters__date-picker-input form-control w-100 input-sm  text-left`}
                    style={{ width: '100%' }}
                  ></input>
                </ir-date-picker>
              </div>
            </fieldset>
            <fieldset class=" filter-group">
              <label htmlFor="rooms" class="m-0 px-0" style={{ paddingBottom: '0.25rem' }}>
                Users
              </label>
              <ir-select
                selectedValue={this.filters?.sourceCode}
                selectId="rooms"
                firstOption="All"
                onSelectChange={e =>
                  this.updateFilter({
                    sourceCode: e.detail,
                  })
                }
                data={Array.from([]).map(u => ({
                  text: u,
                  value: u,
                }))}
              ></ir-select>
            </fieldset>
            <div class="d-flex mt-1 align-items-center justify-content-end filter-actions" style={{ gap: '1rem' }}>
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
