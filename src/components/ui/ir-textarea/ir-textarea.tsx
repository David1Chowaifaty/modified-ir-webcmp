import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-textarea',
  styleUrl: 'ir-textarea.css',
  scoped: true,
})
export class IrTextArea {
  @Prop() rows = 3;
  @Prop() cols = 5;
  @Prop() text = '';
  @Prop() label = '<label>';
  @Prop() placeholder = '<placeholder>';
  @Prop() value = '';
  @Prop() maxLength: number = 250;
  @Prop() textareaClassname: string;
  @Prop() variant: 'default' | 'prepend' = 'default';
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;
  @State() error = false;

  @Event() textChange: EventEmitter<string>;

  @Watch('aria-invalid')
  handleAriaInvalidChange(newValue) {
    this.error = newValue === 'true';
  }
  connectedCallback() {}
  disconnectedCallback() {}
  render() {
    if (this.variant === 'prepend') {
      return (
        <fieldset class="input-group">
          <div class={`input-group-prepend col-${this.labelWidth} prepend-textarea`}>
            <span class="input-group-text ta-prepend-text">{this.label}</span>
          </div>
          <textarea
            value={this.value}
            class={`form-control`}
            style={{ height: '7rem' }}
            maxLength={this.maxLength}
            onChange={e => this.textChange.emit((e.target as HTMLTextAreaElement).value)}
            aria-label={this.label}
          ></textarea>
        </fieldset>
      );
    }
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
