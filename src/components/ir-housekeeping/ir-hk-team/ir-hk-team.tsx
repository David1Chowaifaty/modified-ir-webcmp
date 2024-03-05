import { IHouseKeepers } from '@/models/housekeeping';
import housekeeping_store from '@/stores/housekeeping.store';
import { Component, Host, State, h } from '@stencil/core';

@Component({
  tag: 'ir-hk-team',
  styleUrl: 'ir-hk-team.css',
  scoped: true,
})
export class IrHkTeam {
  @State() hkData = false;

  renderAssignedUnits(hk: IHouseKeepers) {
    if (hk.assigned_units.length === 0) {
      return <span>0 - Assign</span>;
    }
    return <span>{hk.assigned_units.length} - Edit</span>;
  }

  render() {
    return (
      <Host class="card p-1">
        <section>
          <div>
            <h4>Room or Unit Status</h4>
            <div></div>
          </div>
          <p>As an option,create housekeepers (as inividuals or teams) and assign units to them to notify them seperatlely.</p>
        </section>
        <section class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Username</th>
                <th>Password</th>
                <th>Note</th>
                <th>Units assigned</th>
                <th class="text-center">
                  <ir-icon onIconClickHandler={() => (this.hkData = true)}>
                    <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="17.5" viewBox="0 0 448 512">
                      <path
                        fill="currentColor"
                        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                      />
                    </svg>
                  </ir-icon>
                </th>
              </tr>
            </thead>
            <tbody>
              {housekeeping_store.hk_criteria.housekeepers.map(hk => (
                <tr key={hk.id}>
                  <td>{hk.name}</td>
                  <td>{hk.mobile}</td>
                  <td>{hk.username}</td>
                  <td>
                    <input type="password" value={hk.password} />
                  </td>
                  <td>{hk.note}</td>
                  <td>{this.renderAssignedUnits(hk)}</td>
                  <td>
                    <div class="icons-container">
                      <ir-icon onIconClickHandler={() => (this.hkData = true)} icon="ft-save color-ir-light-blue-hover h5 pointer sm-margin-right">
                        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="16" width="14.25" viewBox="0 0 448 512">
                          <path
                            fill="#6b6f82"
                            d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
                          />
                        </svg>
                      </ir-icon>
                      <span> &nbsp;</span>
                      <ir-icon icon="ft-trash-2 danger h5 pointer">
                        <svg slot="icon" fill="#ff2441" xmlns="http://www.w3.org/2000/svg" height="16" width="14.25" viewBox="0 0 448 512">
                          <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                        </svg>
                      </ir-icon>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <ir-sidebar open={this.hkData} onIrSidebarToggle={() => (this.hkData = false)}>
          <h1>Hello</h1>
        </ir-sidebar>
      </Host>
    );
  }
}
