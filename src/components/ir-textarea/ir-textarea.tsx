import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-textarea',
})
export class IrTextArea {
  @Prop() rows = 3;
  @Prop() cols = 5;
  @Prop() text = '';
  @Prop() label = '<label>';
  @Prop() placeholder = '<placeholder>';
  @Prop() value = '';
  @Prop() maxLength: number;
  @Event() textChange: EventEmitter<string>;
  connectedCallback() {}
  disconnectedCallback() {}
  render() {
    return (
      <div class="form-group">
        <label>{this.label}</label>
        <textarea
          maxLength={this.maxLength}
          rows={this.rows}
          value={this.value}
          class="form-control"
          placeholder={this.placeholder}
          onInput={e => this.textChange.emit((e.target as HTMLTextAreaElement).value)}
        ></textarea>
      </div>
    );
  }
}
