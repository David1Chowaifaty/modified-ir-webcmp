import { mpoManagementStore } from '@/stores/mpo-management.store';
import { Component, Host, State, h } from '@stencil/core';

@Component({
  tag: 'ir-affiliate-table',
  styleUrls: ['ir-affiliate-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrAffiliateTable {
  @State() isOpen: boolean;
  private store = mpoManagementStore;
  render() {
    const { affiliates } = this.store;
    return (
      <Host>
        <table class="table">
          <thead>
            <tr>
              <th>Active</th>
              <th>Company name</th>
              <th>Website</th>
              <th>
                <ir-button
                  variant="icon"
                  icon_name="plus"
                  onClickHandler={() => {
                    this.isOpen = true;
                  }}
                ></ir-button>
              </th>
            </tr>
          </thead>
          <tbody>
            {affiliates.length === 0 ? (
              <tr class="ir-table-row">
                <td colSpan={4} class="text-center">
                  No Data
                </td>
              </tr>
            ) : (
              affiliates.map(a => {
                return (
                  <tr class="ir-table-row">
                    <td>{String(a.active)}</td>
                    <td>{a.companyName}</td>
                    <td>{a.website}</td>
                    <td>
                      <ir-button variant="icon" icon_name="edit"></ir-button>
                      <ir-button variant="icon" icon_name="trash"></ir-button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <ir-sidebar
          showCloseButton={false}
          open={this.isOpen}
          onIrSidebarToggle={_ => {
            this.isOpen = !this.isOpen;
          }}
        >
          {this.isOpen && <ir-affiliate slot="sidebar-body"></ir-affiliate>}
        </ir-sidebar>
      </Host>
    );
  }
}
