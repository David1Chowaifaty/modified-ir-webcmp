import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-icon',
  styleUrl: 'ir-icon.css',
  scoped: true,
})
export class IrIcon {
  @Prop() icon = 'ft-check';

  @Event({ bubbles: true, composed: true }) iconClickHandler: EventEmitter;

  render() {
    return (
      <button class="icon-button" onClick={() => this.iconClickHandler.emit()}>
        <slot name="icon"></slot>
      </button>
    );
  }
}
