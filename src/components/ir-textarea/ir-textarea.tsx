import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

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
  @Prop() textareaClassname: string;

  @State() error = false;

  @Event() textChange: EventEmitter<string>;

  @Watch('aria-invalid')
  handleAriaInvalidChange(newValue) {
    this.error = newValue === 'true';
  }
  connectedCallback() {}
  disconnectedCallback() {}
  render() {
    return (
      <div class={'form-group'}>
        <label>{this.label}</label>
        <textarea
          maxLength={this.maxLength}
          rows={this.rows}
          value={this.value}
          class={`form-control ${this.textareaClassname} ${this.error ? 'border-danger' : ''}`}
          placeholder={this.placeholder}
          onInput={e => this.textChange.emit((e.target as HTMLTextAreaElement).value)}
        ></textarea>
      </div>
    );
  }
}
