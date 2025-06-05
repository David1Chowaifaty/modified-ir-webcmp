import { Component, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-textarea',
  styleUrl: 'ir-textarea.css',
  scoped: true,
})
export class IrTextArea {
  /**
   * Number of visible text lines.
   */
  @Prop() rows = 3;

  /**
   * Number of visible character columns.
   */
  @Prop() cols = 5;

  /**
   * Unused property, intended to store textarea text.
   */
  @Prop() text = '';

  /**
   * Text label displayed above or beside the textarea.
   */
  @Prop() label = '<label>';

  /**
   * Placeholder text shown when input is empty.
   */
  @Prop() placeholder = '<placeholder>';

  /**
   * Current value of the textarea (supports two-way binding).
   */
  @Prop() value = '';

  /**
   * Maximum number of characters allowed.
   */
  @Prop() maxLength: number = 250;

  /**
   * Additional classes for the textarea element.
   */
  @Prop() textareaClassname: string;

  /**
   * Layout style of the textarea:
   * `'default'` shows label above, `'prepend'` shows label on the left.
   */
  @Prop() variant: 'default' | 'prepend' = 'default';

  /**
   * Width of the label in grid columns (for `variant="prepend"`).
   */
  @Prop() labelWidth: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 = 3;

  /**
   * Inline styles applied directly to the textarea.
   */
  @Prop() styles: { [key: string]: string };

  /**
   * `data-testid` for targeting in tests.
   */
  @Prop() testId: string;

  /**
   * Indicates if the field is in an error state.
   */
  @State() error = false;

  /**
   * Emits when the textarea content changes.
   *
   * Example:
   * ```tsx
   * <ir-textarea onTextChange={(e) => console.log(e.detail)} />
   * ```
   */
  @Event() textChange: EventEmitter<string>;

  @Watch('aria-invalid')
  handleAriaInvalidChange(newValue) {
    this.error = newValue === 'true';
  }
  render() {
    if (this.variant === 'prepend') {
      return (
        <fieldset class="input-group">
          <div class={`input-group-prepend col-${this.labelWidth} prepend-textarea`}>
            <span class="input-group-text ta-prepend-text">{this.label}</span>
          </div>
          <textarea
            data-testid={this.testId}
            value={this.value}
            class={`form-control`}
            style={{ height: '7rem', ...this.styles }}
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
          data-testid={this.testId}
          style={this.styles}
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
