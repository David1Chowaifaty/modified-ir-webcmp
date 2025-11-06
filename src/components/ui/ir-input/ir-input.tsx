import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-input',
  styleUrl: 'ir-input.css',
  shadow: true,
})
export class IrInput {
  @Element() el: HTMLIrInputElement;

  /** Placeholder text displayed inside the input when empty. */
  @Prop() placeholder: string;

  /** The label text displayed alongside or above the input. */
  @Prop() label: string;

  /** Type of input element — can be 'text', 'password', 'email', or 'number'. */
  @Prop({ reflect: true }) type: 'text' | 'password' | 'email' | 'number' = 'text';

  /** Controls where the label is positioned: 'default', 'side', or 'floating'. */
  @Prop({ attribute: 'label-position', reflect: true }) labelPosition: 'default' | 'side' | 'floating' = 'default';

  /** If true, displays a clear (X) button when the input has a value. */
  @Prop({ reflect: true }) clearable: boolean;

  /** Hides the prefix slot content from assistive technologies when true. */
  @Prop({ reflect: true, attribute: 'prefix-hidden' }) prefixHidden = true;

  /** Hides the suffix slot content from assistive technologies when true. */
  @Prop({ reflect: true, attribute: 'suffix-hidden' }) suffixHidden = true;

  @State() _type: string;
  @State() value: string;
  @State() inputFocused: boolean;

  /** Fired on any value change (typing, programmatic set, or clear). */
  @Event({ eventName: 'input-change', bubbles: true, composed: true }) inputChange!: EventEmitter<{ value: string }>;
  /** Fired only when the clear button is pressed. */
  @Event({ eventName: 'cleared', bubbles: true, composed: true }) cleared!: EventEmitter<void>;
  /** Fired only when the input is focused. */
  @Event({ eventName: 'input-focus', bubbles: true, composed: true }) inputFocus!: EventEmitter<FocusEvent>;
  /** Fired only when the input is blurred. */
  @Event({ eventName: 'input-blur', bubbles: true, composed: true }) inputBlur!: EventEmitter<FocusEvent>;

  private id: string;
  private prefixSlotEl!: HTMLSlotElement;
  private resizeObs?: ResizeObserver;

  // ─────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────
  componentWillLoad() {
    this.id = this.el.id || `input-${v4()}`;
    this._type = this.type;
  }

  componentDidLoad() {
    // track slotted prefix to compute width
    this.prefixSlotEl = this.el.shadowRoot!.querySelector('slot[name="prefix"]') as HTMLSlotElement;
    if (this.prefixSlotEl) {
      this.prefixSlotEl.addEventListener('slotchange', this.handlePrefixSlotChange);
      this.measureAndSetPrefixWidth();

      // watch size changes (icons/text may load later or change)
      const assigned = this.prefixSlotEl.assignedElements({ flatten: true }) as HTMLElement[];
      const target = assigned[0];
      if (target && 'ResizeObserver' in window) {
        this.resizeObs = new ResizeObserver(() => this.measureAndSetPrefixWidth());
        this.resizeObs.observe(target);
      }
    }
  }

  disconnectedCallback() {
    this.prefixSlotEl?.removeEventListener('slotchange', this.handlePrefixSlotChange);
    this.resizeObs?.disconnect();
  }

  // ─────────────────────────────────────────────────────────────
  // Methods (extracted handlers)
  // ─────────────────────────────────────────────────────────────
  private handleInput = (nextValue: string) => {
    this.value = nextValue;
    this.inputChange.emit({ value: this.value });
  };

  private onInput = (e: Event) => {
    const next = (e.target as HTMLInputElement).value;
    this.handleInput(next);
  };

  private clearValue = () => {
    // Per requirement: clear calls the same input-change method…
    this.handleInput('');
    // …and also emits its own event only when the clear button is pressed
    this.cleared.emit();
  };

  private toggleVisibility = () => {
    this._type = this._type === 'text' ? 'password' : 'text';
  };

  private handlePrefixSlotChange = () => {
    this.measureAndSetPrefixWidth();
  };

  /** Measures prefix width and writes CSS var --ir-prefix-width on the host. */
  private measureAndSetPrefixWidth() {
    const slot = this.prefixSlotEl;
    if (!slot) return;

    const assigned = slot.assignedElements({ flatten: true }) as HTMLElement[];
    const hasPrefix = assigned.length > 0;

    // reflect presence as an attribute for CSS if needed
    this.el.toggleAttribute('has-prefix', hasPrefix);

    if (!hasPrefix) {
      // fall back to 0px when no prefix
      this.el.style.setProperty('--ir-prefix-width', '0px');
      return;
    }

    const node = assigned[0];

    // Compute width (content width + horizontal margin)
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    const mLeft = parseFloat(style.marginLeft || '0') || 0;
    const mRight = parseFloat(style.marginRight || '0') || 0;
    const width = Math.max(0, rect.width + mLeft + mRight);

    // Optional: include design gap between prefix and input if you use one
    const hostStyle = getComputedStyle(this.el);
    const gapStr = hostStyle.getPropertyValue('--ir-gap').trim();
    const gap = gapStr.endsWith('rem') || gapStr.endsWith('px') ? parseFloat(gapStr) : 0;

    const total = width + (isNaN(gap) ? 0 : gap);

    // Set internal CSS var used by padding calculation
    this.el.style.setProperty('--ir-prefix-width', `${total + 8}px`);
  }
  private handleInputBlur(e: FocusEvent) {
    this.inputFocused = false;
    this.inputBlur.emit(e);
  }
  private handleInputFocus(e: FocusEvent) {
    this.inputFocused = true;
    this.inputFocus.emit(e);
  }
  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  render() {
    return (
      <Host>
        <label class="input-label" htmlFor={this.id} part="label" data-active={String(Boolean(this.value) || this.inputFocused)}>
          <slot name="label">{this.label}</slot>
        </label>

        <div class="input-wrapper" part="wrapper">
          <div class="input-prefix" part="prefix" aria-hidden={String(this.prefixHidden)}>
            <slot name="prefix"></slot>
          </div>

          <input
            class="input-field"
            type={this._type}
            id={this.id}
            placeholder={this.placeholder}
            value={this.value}
            onFocus={this.handleInputFocus.bind(this)}
            onBlur={this.handleInputBlur.bind(this)}
            onInput={this.onInput}
            aria-label={this.label || this.placeholder || 'Input field'}
          />

          <div class="input-suffix" part="suffix" aria-hidden={String(this.suffixHidden)}>
            <slot name="suffix"></slot>

            {this.clearable && this.value && (
              <button type="button" class="clear-button" aria-label="Clear input" title="Clear input" part="clear-button" onClick={this.clearValue}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}

            {this.type === 'password' && (
              <button
                type="button"
                class="visibility-button"
                aria-label="Toggle password visibility"
                title="Toggle password visibility"
                part="visibility-button"
                aria-pressed={String(this._type === 'text')}
                onClick={this.toggleVisibility}
              >
                {this._type === 'text' ? (
                  /* eye-closed (password visible → click to hide) */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="m15 18-.722-3.25" />
                    <path d="M2 8a10.645 10.645 0 0 0 20 0" />
                    <path d="m20 15-1.726-2.05" />
                    <path d="m4 15 1.726-2.05" />
                    <path d="m9 18 .722-3.25" />
                  </svg>
                ) : (
                  /* eye-open (password hidden → click to show) */
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </Host>
    );
  }
}
