import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-image-gallery',
  styleUrl: 'ir-image-gallery.css',
  shadow: true,
})
export class IrImageGallery {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
