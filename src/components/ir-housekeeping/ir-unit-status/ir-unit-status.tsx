import housekeeping_store from '@/stores/housekeeping.store';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-unit-status',
  styleUrl: 'ir-unit-status.css',
  scoped: true,
})
export class IrUnitStatus {
  render() {
    return (
      <Host class="card p-1">
        <h4>Room or Unit Status</h4>
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
                          LabelAvailable={false}
                          firstOption="No"
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
      </Host>
    );
  }
}
