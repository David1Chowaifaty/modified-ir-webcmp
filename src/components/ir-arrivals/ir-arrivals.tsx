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
        <h4>Arrivals</h4>
        <ir-arrivals-filters></ir-arrivals-filters>
        <ir-arrivals-table></ir-arrivals-table>
      </Host>
    );
  }
}
