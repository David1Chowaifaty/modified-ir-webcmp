import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-hk-unassigned-units',
  styleUrl: 'ir-hk-unassigned-units.css',
  scoped: true,
})
export class IrHkUnassignedUnits {
  render() {
    return (
      <Host>
        <table>
          <thead>
            <th>Unit</th>
          </thead>
          <tbody></tbody>
        </table>
      </Host>
    );
  }
}
