import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-icon',
  styleUrl: 'ir-icon.css',
})
export class IrIcon {
  @Prop() icon = 'ft-check';

  @Event({ bubbles: true, composed: true }) iconClickHandler: EventEmitter;

  render() {
    return (
      <i
        onClick={() => {
          this.iconClickHandler.emit();
        }}
        class={this.icon}
      ></i>
    );
  }
}
