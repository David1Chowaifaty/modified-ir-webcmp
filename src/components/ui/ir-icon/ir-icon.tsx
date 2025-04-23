import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-icon',
  styleUrl: 'ir-icon.css',
  scoped: true,
})
export class IrIcon {
  @Prop() icon = 'ft-check';
  @Prop() type: 'button' | 'submit' | 'reset' = 'button';

  @Event({ bubbles: true, composed: true }) iconClickHandler: EventEmitter;

  render() {
    return (
      <button type={this.type} class="icon-button" onClick={() => this.iconClickHandler.emit()}>
        <slot name="icon"></slot>
      </button>
    );
  }
}
