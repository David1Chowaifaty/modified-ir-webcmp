import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'ir-menu-group',
  styleUrl: 'ir-menu-group.css',
  shadow: true,
})
export class IrMenuGroup {
  @Prop({ reflect: true, mutable: true }) open: boolean;
  @Prop({ reflect: true }) groupName: string;
  @Event() openChanged: EventEmitter<boolean>;

  private handleHide = (event: Event) => {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.open = false;
    this.openChanged.emit(false);
  };

  private handleShow = (event: Event) => {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.open = true;
    this.openChanged.emit(true);
  };

  render() {
    return (
      <wa-details class="menu-group__details" open={this.open} appearance="plain" name={this.groupName} onwa-hide={this.handleHide} onwa-show={this.handleShow}>
        <slot slot="summary" name="summary"></slot>
        <slot></slot>
      </wa-details>
    );
  }
}
