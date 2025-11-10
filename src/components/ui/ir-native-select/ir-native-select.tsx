import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { v4 } from 'uuid';

export type SelectOption = { label: string; value: string | number };

@Component({
  tag: 'ir-native-select',
  styleUrls: ['ir-native-select.css', '../../../common/global.css'],
  shadow: true,
})
export class IrNativeSelect {
  @Element() el: HTMLIrNativeSelectElement;

  /** Options rendered in the select dropdown. */
  @Prop() options: SelectOption[] = [];

  /** Currently selected value. */
  @Prop({ reflect: true, mutable: true }) value?: string | number | null;

  /** Optional placeholder rendered as a disabled option. */
  @Prop() placeholder?: string;

  /** Disables the select when true. */
  @Prop({ reflect: true }) disabled: boolean;

  /** Sets the "required" attribute on the select. */
  @Prop({ reflect: true }) required: boolean;

  /** Controls where the label is positioned. */
  @Prop({ attribute: 'label-position', reflect: true }) labelPosition: 'default' | 'side' | 'floating' = 'default';

  /** The label text displayed alongside or above the select. */
  @Prop() label?: string;

  /** Hides the prefix slot content from assistive technologies when true. */
  @Prop({ attribute: 'prefix-hidden' }) prefixHidden = true;

  /** Hides the suffix slot content from assistive technologies when true. */
  @Prop({ attribute: 'suffix-hidden' }) suffixHidden = true;

  /** Fired when the select value changes. */
  @Event({ eventName: 'select-change', bubbles: true, composed: true }) selectChange!: EventEmitter<{ value?: string | number | null }>;

  /** Fired when the select receives focus. */
  @Event({ eventName: 'select-focus', bubbles: true, composed: true }) selectFocus!: EventEmitter<FocusEvent>;

  /** Fired when the select loses focus. */
  @Event({ eventName: 'select-blur', bubbles: true, composed: true }) selectBlur!: EventEmitter<FocusEvent>;

  @State() selectFocused = false;

  private id: string;
  private prefixSlotEl?: HTMLSlotElement;
  private resizeObs?: ResizeObserver;
  private selectRef: HTMLSelectElement;

  componentWillLoad() {
    this.id = this.el.id || `native-select-${v4()}`;
  }

  componentDidLoad() {
    if (this.el.hasAttribute('data-testid')) {
      this.selectRef.setAttribute('data-testid', this.el.getAttribute('data-testid'));
      this.el.removeAttribute('data-testid');
    }
    this.prefixSlotEl = this.el.shadowRoot?.querySelector('slot[name="prefix"]') as HTMLSlotElement;
    if (this.prefixSlotEl) {
      this.prefixSlotEl.addEventListener('slotchange', this.handlePrefixSlotChange);
      this.measureAndSetPrefixWidth();

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

  private handlePrefixSlotChange = () => {
    this.measureAndSetPrefixWidth();
  };

  /** Measures prefix width and writes CSS var --ir-prefix-width on the host. */
  private measureAndSetPrefixWidth() {
    const slot = this.prefixSlotEl;
    if (!slot) return;

    const assigned = slot.assignedElements({ flatten: true }) as HTMLElement[];
    const hasPrefix = assigned.length > 0;

    this.el.toggleAttribute('has-prefix', hasPrefix);

    if (!hasPrefix) {
      this.el.style.setProperty('--ir-prefix-width', '0px');
      return;
    }

    const node = assigned[0];
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    const mLeft = parseFloat(style.marginLeft || '0') || 0;
    const mRight = parseFloat(style.marginRight || '0') || 0;
    const width = Math.max(0, rect.width + mLeft + mRight);

    const hostStyle = getComputedStyle(this.el);
    const gapStr = hostStyle.getPropertyValue('--ir-gap').trim();
    const gap = gapStr.endsWith('rem') || gapStr.endsWith('px') ? parseFloat(gapStr) : 0;

    const total = width + (isNaN(gap) ? 0 : gap);
    this.el.style.setProperty('--ir-prefix-width', `${total + 8}px`);
  }

  private handleSelectChange = (event: Event) => {
    const next = (event.target as HTMLSelectElement).value;
    const resolved = this.options.find(option => String(option.value) === next)?.value ?? next;
    this.value = resolved;
    this.selectChange.emit({ value: resolved });
  };

  private handleSelectFocus = (event: FocusEvent) => {
    this.selectFocused = true;
    this.selectFocus.emit(event);
  };

  private handleSelectBlur = (event: FocusEvent) => {
    this.selectFocused = false;
    this.selectBlur.emit(event);
  };

  private hasSelection() {
    if (this.value === undefined || this.value === null) {
      return false;
    }

    return String(this.value).length > 0;
  }

  private renderOptions(hasSelection: boolean) {
    type InternalOption = SelectOption & { placeholder?: boolean };
    const options: InternalOption[] = this.options.map(option => ({ ...option }));
    const shouldShowPlaceholder = Boolean(this.placeholder) && !this.hasSelection();
    const normalizedValue = hasSelection && this.value !== undefined && this.value !== null ? String(this.value) : '';

    if (shouldShowPlaceholder) {
      options.unshift({ label: this.placeholder!, value: '', placeholder: true });
    }

    return options.map(option => (
      <option selected={normalizedValue === option.value} value={String(option.value)} disabled={option.placeholder} hidden={option.placeholder}>
        {option.label}
      </option>
    ));
  }

  render() {
    const hasSelection = this.hasSelection();
    const activeLabel = hasSelection || this.selectFocused;

    return (
      <Host>
        {this.label && (
          <label class="select-label" htmlFor={this.id} part="label" data-active={String(activeLabel)}>
            <slot name="label">
              {this.label} {this.required && <span style={{ color: 'red' }}>*</span>}
            </slot>
          </label>
        )}

        <div class="select-wrapper" part="wrapper">
          <div class="select-prefix" part="prefix" aria-hidden={String(this.prefixHidden)}>
            <slot name="prefix"></slot>
          </div>

          <select
            id={this.id}
            ref={el => (this.selectRef = el)}
            class="select-field"
            disabled={this.disabled}
            required={this.required}
            aria-label={this.label || this.placeholder || 'Select field'}
            onFocus={this.handleSelectFocus}
            onBlur={this.handleSelectBlur}
            onInput={this.handleSelectChange}
          >
            {this.renderOptions(hasSelection)}
          </select>

          <div class="select-suffix" part="suffix" aria-hidden={String(this.suffixHidden)}>
            <slot name="suffix"></slot>
          </div>
        </div>
      </Host>
    );
  }
}
