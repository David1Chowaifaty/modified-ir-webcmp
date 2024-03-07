import { IInspectionMode } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import housekeeping_store from '@/stores/housekeeping.store';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-unit-status',
  styleUrl: 'ir-unit-status.css',
  scoped: true,
})
export class IrUnitStatus {
  private housekeepingService = new HouseKeepingService();
  componentWillLoad() {
    this.housekeepingService.setToken(housekeeping_store.default_properties.token);
  }
  async handleSelectChange(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const window = e.detail;
    let mode: IInspectionMode;
    if (window === '') {
      mode = {
        is_active: false,
        window: -1,
      };
    } else {
      mode = {
        is_active: true,
        window: +window,
      };
    }
    await this.housekeepingService.setExposedInspectionMode(housekeeping_store.default_properties.property_id, mode);
  }
  render() {
    return (
      <Host class="card p-1">
        <h4>Room or Unit Status</h4>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th class={'text-center'}>Code</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {housekeeping_store.hk_criteria.statuses?.map(status => (
                <tr key={status.code}>
                  <td>
                    <div class="status-container">
                      <span class={`circle ${status.style.shape} ${status.style.color}`}></span>
                      <p>{status.description}</p>
                    </div>
                  </td>
                  <td>{status.code}</td>
                  <td>
                    <div class="action-container">
                      <p class={'m-0'}>{status.action}</p>
                      {status.inspection_mode?.is_active && (
                        <div>
                          <ir-select
                            //selectedValue={status.inspection_mode?.window.toString()}
                            LabelAvailable={false}
                            firstOption="No"
                            onSelectChange={this.handleSelectChange.bind(this)}
                            data={Array.from(Array(status.inspection_mode.window + 1), (_, i) => i).map(i => {
                              const text = i === 0 ? 'Yes on the same day.' : i.toString() + ' day prior.';
                              return {
                                text,
                                value: i.toString(),
                              };
                            })}
                          ></ir-select>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Host>
    );
  }
}
