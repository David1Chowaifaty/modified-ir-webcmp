import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-pickup',
  styleUrl: 'ir-pickup.css',
  scoped: true,
})
export class IrPickup {
  render() {
    return (
      <Host class={'card mt-1 p-1'}>
        <section class={'d-flex align-items-center'}>
          <h4 class={'m-0 p-0'}>Pickup</h4>
          <ir-select
            class={'m-0'}
            LabelAvailable={false}
            data={[
              {
                text: 'helo',
                value: 'helklo',
              },
            ]}
          ></ir-select>
          <ir-select
            class={'m-0'}
            label="Arrival date"
            data={[
              {
                text: 'helo',
                value: 'helklo',
              },
            ]}
          ></ir-select>
          <ir-input-text label="Time"></ir-input-text>
        </section>
      </Host>
    );
  }
}
