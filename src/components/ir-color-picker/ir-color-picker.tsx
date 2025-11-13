import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { v4 } from 'uuid';

export type ColorPickerChangeSource = 'picker' | 'input' | 'clear' | 'prop';

export interface ColorPickerChangeDetail {
  value?: string;
  source: ColorPickerChangeSource;
  isValid: boolean;
}

const HEX_MASK = {
  mask: '#HHHHHH',
  placeholderChar: '_',
  definitions: {
    // Single hex digit
    H: /[0-9a-fA-F]/,
  },
  // Normalize input to uppercase
  // prepare: (str: string) => str.toUpperCase(),
};

@Component({
  tag: 'ir-color-picker',
  styleUrl: 'ir-color-picker.css',
  shadow: true,
})
export class IrColorPicker {
  /** Label rendered inside the hex input. */
  @Prop() label: string;

  /** Required color. */
  @Prop() required: boolean;

  /** Helper text displayed below the input. */
  @Prop() message?: string;

  /** Disables the picker. */
  @Prop({ reflect: true }) disabled: boolean = false;

  /** Optional hex value to control the picker externally. */
  @Prop() value?: string;

  @State() private colorValue?: string;
  @State() private hexValue: string = '';

  private colorInputEl?: HTMLInputElement;
  private _id: string;

  @Event({ eventName: 'color-change', bubbles: true, composed: true }) colorChange: EventEmitter<ColorPickerChangeDetail>;
  @Event({ eventName: 'color-input-blur', bubbles: true, composed: true }) colorInputBlur: EventEmitter<FocusEvent>;

  componentWillLoad() {
    this.syncFromProp(this.value, false);
    this._id = `color-picker-${v4()}`;
  }

  @Watch('value')
  protected handleValueChange(next?: string) {
    this.syncFromProp(next);
  }

  private syncFromProp(next?: string, emit = true) {
    const normalized = this.normalizeHex(next);
    this.colorValue = normalized || undefined;
    this.hexValue = normalized ? normalized.slice(1) : '';
    if (emit) {
      this.emitChange('prop', Boolean(normalized));
    }
  }

  private handleSwatchClick = () => {
    if (this.disabled) return;
    this.colorInputEl?.click();
  };

  private handleNativeColorInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target?.value) return;
    const normalized = this.normalizeHex(target.value);
    if (!normalized) return;
    this.setColor(normalized, 'picker');
  };

  private handleHexInputChange = (event: CustomEvent<string>) => {
    const next = (event.detail || '').toUpperCase();
    this.hexValue = next;

    const normalized = this.normalizeHex(next);
    if (normalized) {
      this.setColor(normalized, 'input');
      return;
    }

    if (next === '') {
      this.clearColor('input');
      return;
    }
  };

  private handleHexCleared = () => {
    this.clearColor('clear');
  };

  private setColor(value: string, source: ColorPickerChangeSource) {
    this.colorValue = value;
    this.hexValue = value.startsWith('#') ? value.slice(1) : value;
    if (this.colorInputEl && this.colorInputEl.value !== value) {
      this.colorInputEl.value = value;
    }
    this.emitChange(source, true);
  }

  private clearColor(source: ColorPickerChangeSource) {
    if (!this.colorValue && !this.hexValue) {
      this.emitChange(source, false);
      return;
    }
    this.colorValue = undefined;
    this.hexValue = '';
    if (this.colorInputEl) {
      this.colorInputEl.value = '#000000';
    }
    this.emitChange(source, false);
  }

  private emitChange(source: ColorPickerChangeSource, isValid: boolean) {
    this.colorChange.emit({ value: this.colorValue, source, isValid });
  }

  private normalizeHex(value?: string | null): string | null {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const prefixed = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(prefixed)) {
      return prefixed.toUpperCase();
    }
    return null;
  }

  render() {
    const previewStyle = this.colorValue ? { backgroundColor: this.colorValue } : undefined;
    return (
      <Host>
        <label part="label" class="picker-label" htmlFor={this._id}>
          {this.label} {this.required && <span style={{ color: 'red' }}>*</span>}
        </label>
        <div class="picker" part="picker" data-disabled={this.disabled ? 'true' : 'false'}>
          <button class="picker__swatch" type="button" onClick={this.handleSwatchClick} disabled={this.disabled} aria-label="Choose color">
            <span class={{ 'picker__swatch-bg': true, 'picker__swatch-bg--empty': !this.colorValue }} style={previewStyle}></span>
          </button>

          <input
            id={this._id}
            class="picker__native"
            type="color"
            value={this.colorValue || '#000000'}
            ref={el => (this.colorInputEl = el)}
            disabled={this.disabled}
            onInput={this.handleNativeColorInput}
            onBlur={e => this.colorInputBlur.emit(e)}
          />
          <ir-input
            onInput-blur={e => this.colorInputBlur.emit(e.detail)}
            style={{ flex: '1 1 0%' }}
            value={this.hexValue}
            placeholder="#000000"
            clearable={!this.disabled}
            disabled={this.disabled}
            mask={HEX_MASK}
            onInput-change={this.handleHexInputChange}
            onCleared={this.handleHexCleared}
          >
            <ir-copy-button class="copy-button" slot="suffix" text={this.hexValue ? `#${this.hexValue}` : ''} disabled={!this.hexValue}></ir-copy-button>
          </ir-input>
        </div>
      </Host>
    );
  }
}
