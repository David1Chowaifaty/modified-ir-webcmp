import { Component, Host, State, h } from '@stencil/core';

@Component({
  tag: 'ir-affiliate-table',
  styleUrls: ['ir-affiliate-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrAffiliateTable {
  @State() isOpen: boolean;
  render() {
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
            <tr class="ir-table-row">
              <td colSpan={4} class="text-center">
                No Data
              </td>
            </tr>
          </tbody>
        </table>
        <ir-sidebar
          showCloseButton={false}
          open={this.isOpen}
          onIrSidebarToggle={_ => {
            this.isOpen = !this.isOpen;
          }}
        >
          <ir-affiliate slot="sidebar-body"></ir-affiliate>
        </ir-sidebar>
      </Host>
    );
  }
}
