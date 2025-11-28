import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-unit-tag',
  styleUrl: 'ir-unit-tag.css',
  scoped: true,
})
export class IrUnitTag {
  @Prop() unit: string;
  render() {
    return (
      <wa-tag class="unit-tag__el" size="small" appearance="filled" variant="brand">
        <span class="unit-tag__content">{this.unit}</span>
      </wa-tag>
    );
  }
}
