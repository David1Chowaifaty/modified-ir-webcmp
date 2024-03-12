import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-hk-archive',
  styleUrl: 'ir-hk-archive.css',
  scoped: true,
})
export class IrHkArchive {
  render() {
    return (
      <Host>
        <ir-title class="px-1" label="Archive" displayContext="sidebar"></ir-title>
        <section class="px-1">
          <h1>hello</h1>
        </section>
      </Host>
    );
  }
}
