import { Component, Host, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-tasks-header',
  styleUrl: 'ir-tasks-header.css',
  scoped: true,
})
export class IrTasksHeader {
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
      <Host>
        <div class="d-flex">
          <h4>Housekeeping Tasks</h4>
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
          <ir-select
            LabelAvailable={false}
            showFirstOption={false}
            data={this.generateDaysFilter().map(v => ({
              text: v.value,
              value: v.code,
            }))}
          ></ir-select>
          <ir-select
            LabelAvailable={false}
            showFirstOption={false}
            data={this.generateDaysFilter().map(v => ({
              text: v.value,
              value: v.code,
            }))}
          ></ir-select>
          <ir-select
            LabelAvailable={false}
            showFirstOption={false}
            data={this.generateCheckinsDaysFilter().map(v => ({
              text: v.value,
              value: v.code,
            }))}
          ></ir-select>
        </div>
      </Host>
    );
  }
}
