import { Component, Event, EventEmitter, h, State } from '@stencil/core';
import { TaskFilters } from '../types';
import moment from 'moment';

@Component({
  tag: 'ir-tasks-filters',
  styleUrl: 'ir-tasks-filters.css',
  scoped: true,
})
export class IrTasksFilters {
  @State() filters: TaskFilters = {
    period: '',
    housekeepers: '',
    cleaning_frequency: '',
    dusty_units: '',
    highlight_check_ins: '',
  };
  @State() collapsed: boolean = false;

  @Event() applyClicked: EventEmitter<TaskFilters>;
  @Event() resetClicked: EventEmitter<TaskFilters>;

  private generateDaysFilter() {
    let list = [{ code: '0', value: 'Do not include' }];
    for (let i = 3; i <= 7; i++) {
      list.push({ code: i.toString(), value: `Cleaned ${i} ago` });
    }
    return list;
  }
  private generateCheckinsDaysFilter() {
    let list = [{ code: '0', value: 'No' }];
    for (let i = 2; i <= 10; i++) {
      list.push({ code: i.toString(), value: `Cleaned ${i} ago` });
    }
    return list;
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
                LabelAvailable={false}
                showFirstOption={false}
                data={[
                  { code: '001', value: 'For today' },
                  { code: '002', value: `Until ${moment().format('DD MMM')}` },
                  { code: '002', value: `Until ${moment().add(10, 'days').format('DD MMM')}` },
                ].map(v => ({
                  text: v.value,
                  value: v.code,
                }))}
              ></ir-select>
            </fieldset>
            <fieldset>
              <p class="m-0 p-0">Housekeepers</p>
              <ir-select
                LabelAvailable={false}
                showFirstOption={false}
                data={this.generateDaysFilter().map(v => ({
                  text: v.value,
                  value: v.code,
                }))}
              ></ir-select>
            </fieldset>
            <fieldset>
              <p class="m-0 p-0">Cleaning frequency</p>
              <ir-select
                LabelAvailable={false}
                showFirstOption={false}
                data={this.generateDaysFilter().map(v => ({
                  text: v.value,
                  value: v.code,
                }))}
              ></ir-select>
            </fieldset>
            <fieldset>
              <p class="m-0 p-0">Dusty units</p>
              <ir-select showFirstOption={false} LabelAvailable={false} data={[{ text: 'test', value: 'hello' }]}></ir-select>
            </fieldset>
            <fieldset class="mb-1">
              <p class="m-0 p-0">Highlight check-ins</p>
              <ir-select
                LabelAvailable={false}
                showFirstOption={false}
                data={this.generateCheckinsDaysFilter().map(v => ({
                  text: v.value,
                  value: v.code,
                }))}
              ></ir-select>
            </fieldset>
            <div class="d-flex align-items-center justify-content-end" style={{ gap: '1rem' }}>
              <ir-button text="Reset" size="sm" btn_color="outline"></ir-button>
              <ir-button text="Apply" size="sm"></ir-button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
