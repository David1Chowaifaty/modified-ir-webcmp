import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { TaskFilters } from '../types';
import housekeeping_store from '@/stores/housekeeping.store';
export type ModifiedTaskFilters = Omit<TaskFilters, 'housekeepers'> & { housekeepers: string };
@Component({
  tag: 'ir-tasks-filters',
  styleUrl: 'ir-tasks-filters.css',
  scoped: true,
})
export class IrTasksFilters {
  @Prop() isLoading: boolean;

  @State() filters: ModifiedTaskFilters = {
    cleaning_periods: {
      code: '',
    },
    housekeepers: '000',
    cleaning_frequencies: { code: '' },
    dusty_units: { code: '' },
    highlight_check_ins: { code: '' },
  };

  @State() collapsed: boolean = false;

  @Event() applyFilters: EventEmitter<TaskFilters>;

  private baseFilters: TaskFilters;

  componentWillLoad() {
    this.baseFilters = {
      cleaning_periods: housekeeping_store?.hk_criteria?.cleaning_periods[0],
      housekeepers: { ids: housekeeping_store.hk_criteria.housekeepers?.map(h => h.id) },
      cleaning_frequencies: housekeeping_store?.hk_criteria?.cleaning_frequencies[0],
      dusty_units: housekeeping_store?.hk_criteria?.dusty_periods[0],
      highlight_check_ins: housekeeping_store?.hk_criteria?.highlight_checkin_options[0],
    };
    this.filters = { ...this.baseFilters, housekeepers: '000' };
  }

  private updateFilter(params: Partial<ModifiedTaskFilters>) {
    this.filters = { ...this.filters, ...params };
  }
  private applyFiltersEvt(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.applyFilters.emit({
      ...this.filters,
      housekeepers: {
        ids: this.filters.housekeepers === '000' ? this.baseFilters.housekeepers.ids : [Number(this.filters.housekeepers)],
      },
    });
  }
  private resetFilters(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.filters = { ...this.baseFilters, housekeepers: '000' };
    this.applyFilters.emit({
      ...this.filters,
      housekeepers: {
        ids: this.filters.housekeepers === '000' ? this.baseFilters.housekeepers.ids : [Number(this.filters.housekeepers)],
      },
    });
  }
  render() {
    return (
      <div class="card mb-0 p-1 d-flex flex-column">
        <div class="d-flex align-items-center justify-content-between">
          <div class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height={18} width={18}>
              <path
                fill="currentColor"
                d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"
              />
            </svg>
            <h4 class="m-0 p-0 flex-grow-1">Filters</h4>
          </div>
          <ir-button
            variant="icon"
            id="drawer-icon"
            data-toggle="collapse"
            data-target="#hkTasksFiltersCollapse"
            aria-expanded={this.collapsed ? 'true' : 'false'}
            aria-controls="hkTasksFiltersCollapse"
            class="mr-1 collapse-btn"
            icon_name={this.collapsed ? 'closed_eye' : 'open_eye'}
            onClickHandler={() => {
              this.collapsed = !this.collapsed;
            }}
            style={{ '--icon-size': '1.6rem' }}
          ></ir-button>
        </div>
        <div class="m-0 p-0 collapse" id="hkTasksFiltersCollapse">
          <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
            <fieldset class="pt-1">
              <p class="m-0 p-0">Period</p>
              <ir-select
                testId="period"
                selectedValue={this.filters?.cleaning_periods?.code}
                LabelAvailable={false}
                showFirstOption={false}
                data={housekeeping_store?.hk_criteria?.cleaning_periods.map(v => ({
                  text: v.description,
                  value: v.code,
                }))}
                onSelectChange={e => {
                  this.updateFilter({ cleaning_periods: { code: e.detail } });
                }}
              ></ir-select>
            </fieldset>
            <fieldset>
              <p class="m-0 p-0">Housekeepers</p>
              <ir-select
                testId="housekeepers"
                selectedValue={this.filters?.housekeepers}
                LabelAvailable={false}
                showFirstOption={false}
                data={[
                  { text: 'All housekeepers', value: '000' },
                  ...housekeeping_store?.hk_criteria?.housekeepers.map(v => ({
                    text: v.name,
                    value: v.id.toString(),
                  })),
                ]}
                onSelectChange={e => {
                  // if (e.detail === '000') {
                  //   this.updateFilter({ housekeepers: { ids: this.baseFilters?.housekeepers?.ids } });
                  // } else {
                  //   this.updateFilter({ housekeepers: { ids: [e.detail] } });
                  // }
                  this.updateFilter({ housekeepers: e.detail });
                }}
              ></ir-select>
            </fieldset>
            <fieldset>
              <p class="m-0 p-0">Cleaning frequency</p>
              <ir-select
                testId="cleaning_frequency"
                selectedValue={this.filters?.cleaning_frequencies?.code}
                LabelAvailable={false}
                showFirstOption={false}
                data={housekeeping_store?.hk_criteria?.cleaning_frequencies.map(v => ({
                  text: v.description,
                  value: v.code,
                }))}
                onSelectChange={e => {
                  this.updateFilter({ cleaning_frequencies: { code: e.detail } });
                }}
              ></ir-select>
            </fieldset>
            <fieldset>
              <p class="m-0 p-0">Dusty units</p>
              <ir-select
                testId="dusty_units"
                showFirstOption={false}
                LabelAvailable={false}
                selectedValue={this.filters?.dusty_units?.code}
                data={housekeeping_store.hk_criteria?.dusty_periods?.map(v => ({
                  text: v.description,
                  value: v.code,
                }))}
                onSelectChange={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.updateFilter({ dusty_units: { code: e.detail } });
                }}
              ></ir-select>
            </fieldset>
            <fieldset class="mb-1">
              <p class="m-0 p-0">Highlight check-ins</p>
              <ir-select
                testId="highlight_check_ins"
                selectedValue={this.filters?.highlight_check_ins?.code}
                LabelAvailable={false}
                showFirstOption={false}
                onSelectChange={e => {
                  this.updateFilter({ highlight_check_ins: { code: e.detail } });
                }}
                data={housekeeping_store.hk_criteria?.highlight_checkin_options?.map(v => ({
                  text: v.description,
                  value: v.code,
                }))}
              ></ir-select>
            </fieldset>
            <div class="d-flex align-items-center justify-content-end" style={{ gap: '1rem' }}>
              <ir-button btn_type="button" data-testid="reset" text="Reset" size="sm" btn_color="outline" onClickHandler={e => this.resetFilters(e)}></ir-button>
              <ir-button btn_type="button" data-testid="apply" isLoading={this.isLoading} text="Apply" size="sm" onClickHandler={e => this.applyFiltersEvt(e)}></ir-button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
