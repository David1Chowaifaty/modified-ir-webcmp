import { Component, Host, h, State, Event, EventEmitter, Prop, Watch } from '@stencil/core';

const DEFAULT_COLOR = '#2563EB';

export type ColorPickerChangeSource = 'picker' | 'input' | 'prop';

export interface ColorPickerChangeDetail {
  value: string;
  source: ColorPickerChangeSource;
  isValid: boolean;
}

@Component({
  tag: 'ir-color-picker',
  styleUrl: 'ir-color-picker.css',
  shadow: true,
})
export class IrColorPicker {
  private colorInputId = `ir-color-picker-${Math.random().toString(36).slice(2)}`;
  /**
   * Optional label rendered above the inputs.
   */
  @Prop() label: string = 'Color';

  /**
   * Helper text displayed below the picker.
   */
  @Prop() message?: string;

  /**
   * Disables both inputs when true.
   */
  @Prop() disabled: boolean = false;

  /**
   * Hex value used to initialize the control.
   */
  @Prop() value?: string;

  @Event({ eventName: 'color-change', bubbles: true, composed: true }) colorChange: EventEmitter<ColorPickerChangeDetail>;

  @State() currentValue: string = DEFAULT_COLOR;
  @State() textValue: string = DEFAULT_COLOR;
  @State() isInvalid: boolean = false;

  componentWillLoad() {
    this.applyPropValue(this.value, { emit: false });
  }

  @Watch('value')
  handleValueChange(next?: string) {
    this.applyPropValue(next);
  }

  private applyPropValue(value?: string, options: { emit?: boolean } = {}) {
    const normalized = this.normalizeHex(value);
    if (!normalized) return;
    this.currentValue = normalized;
    this.textValue = normalized;
    this.isInvalid = false;
    if (options.emit !== false) {
      this.emitChange('prop', true);
    }
  }

  private handleColorInput(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target?.value) return;
    const normalized = this.normalizeHex(target.value);
    if (!normalized) return;
    this.currentValue = normalized;
    this.textValue = normalized;
    this.isInvalid = false;
    this.emitChange('picker', true);
  }

  private handleHexInput(value: string) {
    const raw = value.toUpperCase();
    this.textValue = raw.startsWith('#') ? raw : `#${raw}`;

    const normalized = this.normalizeHex(value);
    if (normalized) {
      this.currentValue = normalized;
      this.isInvalid = false;
      this.emitChange('input', true);
    } else {
      this.isInvalid = true;
      this.emitChange('input', false);
    }
  }

  private emitChange(source: ColorPickerChangeSource, isValid: boolean) {
    this.colorChange.emit({ value: this.currentValue, source, isValid });
  }

  private normalizeHex(value?: string): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    const upper = prefixed.toUpperCase();
    if (/^#([0-9A-F]{6})$/.test(upper)) {
      return upper;
    }
    const short = upper.match(/^#([0-9A-F]{3})$/);
    if (short) {
      const expanded = short[1]
        .split('')
        .map(char => `${char}${char}`)
        .join('');
      return `#${expanded}`;
    }
    return null;
  }

  render() {
    return (
      <Host>
        <div class={{ 'color-picker': true, 'color-picker--disabled': this.disabled }}>
          {this.label && (
            <label class="color-picker__label" htmlFor={this.colorInputId}>
              {this.label}
            </label>
          )}

          <div class="color-picker__controls">
            <div class="color-picker__swatch">
              <input id={this.colorInputId} type="color" value={this.currentValue} disabled={this.disabled} onInput={event => this.handleColorInput(event)} />
            </div>
            <ir-input onInput-change={e => this.handleHexInput(e.detail)} value={this.textValue} disabled={this.disabled} maxLength={7}>
              <ir-copy-button slot="suffix"></ir-copy-button>
            </ir-input>
          </div>
        </div>
      </Host>
    );
  }
}
