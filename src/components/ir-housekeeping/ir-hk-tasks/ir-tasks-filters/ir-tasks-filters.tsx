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
      <div class="card mb-0 p-1 d-flex flex-column" style={{ gap: '0.5rem' }}>
        <h4>Filters</h4>
        <fieldset>
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
    );
  }
}
