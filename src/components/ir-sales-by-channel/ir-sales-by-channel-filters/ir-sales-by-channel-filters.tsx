import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import moment from 'moment';
import { ChannelSaleFilter } from '../types';
import { AllowedProperties } from '@/services/property.service';

@Component({
  tag: 'ir-sales-by-channel-filters',
  styleUrl: 'ir-sales-by-channel-filters.css',
  scoped: true,
})
export class IrSalesByChannelFilters {
  @Prop() isLoading: boolean;
  @Prop() baseFilters: ChannelSaleFilter;
  @Prop() allowedProperties: AllowedProperties;

  @State() filters: ChannelSaleFilter;
  @State() window: number;

  @Event() applyFilters: EventEmitter<ChannelSaleFilter>;

  componentWillLoad() {
    this.filters = { ...this.baseFilters };
    this.window = this.baseFilters.WINDOW;
  }

  private updateFilter(params: Partial<ChannelSaleFilter>) {
    this.filters = { ...this.filters, ...params };
  }

  render() {
    console.log(this.filters);
    return (
      <ir-filters-panel
        isApplyLoading={this.isLoading}
        onIrFilterApply={() => {
          this.applyFilters.emit(this.filters);
        }}
        onIrFilterReset={() => {
          this.filters = { ...this.baseFilters };
          this.applyFilters.emit(this.filters);
        }}
      >
        <fieldset class="pt-1 filter-group">
          <label htmlFor="rooms" class="m-0 px-0" style={{ paddingBottom: '0.25rem' }}>
            Rooms
          </label>
          <ir-select
            selectedValue={this.filters?.BOOK_CASE}
            selectId="rooms"
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
        {this.allowedProperties.length > 1 && (
          <fieldset class="filter-group">
            <label htmlFor="rooms" class="m-0 px-0" style={{ paddingBottom: '0.25rem' }}>
              Properties
            </label>
            <ir-m-combobox
              defaultOption={this.filters?.LIST_AC_ID?.length === this.allowedProperties?.length ? 'all' : this.filters?.LIST_AC_ID[0]?.toString()}
              onOptionChange={e => {
                const value = e.detail.value;
                if (value === 'all') {
                  this.updateFilter({
                    LIST_AC_ID: this.allowedProperties.map(p => p.id),
                  });
                } else
                  this.updateFilter({
                    LIST_AC_ID: this.allowedProperties.filter(e => e.id === Number(value)).map(p => p.id),
                  });
              }}
              options={[
                { label: 'All', value: 'all' },
                ...this.allowedProperties.map(p => ({
                  label: p.name,
                  value: p.id.toString(),
                })),
              ]}
            ></ir-m-combobox>
          </fieldset>
        )}
        <fieldset class="filter-group">
          <label htmlFor="period" class="px-0 m-0" style={{ paddingBottom: '0.25rem' }}>
            Selected period
          </label>
          <div class="d-flex flex-column date-filter-group" style={{ gap: '0.5rem' }}>
            <ir-select
              selectedValue={this.window?.toString()}
              onSelectChange={e => {
                const dateDiff = Number(e.detail);
                const today = moment();
                this.updateFilter({
                  WINDOW: dateDiff,
                  TO_DATE: today.format('YYYY-MM-DD'),
                  FROM_DATE: today.add(-dateDiff, 'days').format('YYYY-MM-DD'),
                });
                this.window = e.detail;
              }}
              selectId="period"
              // showFirstOption={false}
              firstOption="..."
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
                const { fromDate, toDate, wasFocused } = e.detail;
                this.updateFilter({
                  FROM_DATE: fromDate.format('YYYY-MM-DD'),
                  TO_DATE: toDate.format('YYYY-MM-DD'),
                });
                if (wasFocused) this.window = null;
                // this.dates = { from: fromDate, to: toDate };
              }}
              fromDate={moment(this.filters.FROM_DATE, 'YYYY-MM-DD')}
              toDate={moment(this.filters.TO_DATE, 'YYYY-MM-DD')}
              maxDate={moment().format('YYYY-MM-DD')}
              withOverlay={false}
            ></ir-range-picker>
          </div>
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
      </ir-filters-panel>
    );
  }
}
