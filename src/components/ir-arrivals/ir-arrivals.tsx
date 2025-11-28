import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-arrivals',
  styleUrls: ['ir-arrivals.css', '../../global/app.css', '../../assets/webawesome/component/host.css'],
  scoped: true,
})
export class IrArrivals {
  render() {
    return (
      <Host>
        <h3 class="page-title">Arrivals</h3>
        <ir-arrivals-filters></ir-arrivals-filters>
        <ir-arrivals-table></ir-arrivals-table>
      </Host>
    );
  }
}
