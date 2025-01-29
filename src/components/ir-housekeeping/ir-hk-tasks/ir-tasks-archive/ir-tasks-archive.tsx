import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-tasks-archive',
  styleUrl: 'ir-tasks-archive.css',
  scoped: true,
})
export class IrTasksArchive {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
