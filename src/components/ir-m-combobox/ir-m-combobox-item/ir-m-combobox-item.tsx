// src/components/ir-m-combobox-item/ir-m-combobox-item.tsx
import { Component, h, Prop, Event, EventEmitter, Element, Method, Host } from '@stencil/core';
import { ComboboxOption } from '../types';

@Component({
  tag: 'ir-m-combobox-item',
  styleUrl: 'ir-m-combobox-item.css',
  scoped: true,
})
export class IrMComboboxItem {
  @Element() el: HTMLElement;

  /**
   * Required value for the option
   */
  @Prop() value!: string;

  /**
   * Optional label (falls back to textContent)
   */
  @Prop() label?: string;

  /**
   * Optional html_content (when you want rich content);
   * If omitted, the component will render its own slot content.
   */
  @Prop() html_content?: string;

  /**
   * When true, visually hide the item (used for filtering).
   */
  @Prop({ mutable: true, reflect: true }) hidden: boolean = false;

  /**
   * Emit when this item is chosen. Parent listens and closes dropdown.
   */
  @Event({ eventName: 'comboboxItemSelect' }) comboboxItemSelect: EventEmitter<ComboboxOption>;

  /**
   * Inform the parent this item exists (parent will index and manage focus)
   */
  @Event({ eventName: 'comboboxItemRegister' }) comboboxItemRegister: EventEmitter<void>;

  /**
   * Inform the parent this item is gone
   */
  @Event({ eventName: 'comboboxItemUnregister' }) comboboxItemUnregister: EventEmitter<void>;

  componentDidLoad() {
    this.comboboxItemRegister.emit();
  }

  disconnectedCallback() {
    this.comboboxItemUnregister.emit();
  }

  private toOption(): ComboboxOption {
    const label = (this.label ?? this.el.textContent ?? '').trim();
    return {
      value: this.value,
      label,
      html_content: this.html_content,
    };
  }

  @Method()
  async matchesQuery(query: string): Promise<boolean> {
    const q = query.toLowerCase();
    const hay = (this.label ?? this.el.textContent ?? '').toLowerCase();
    return hay.includes(q);
  }

  @Method()
  async setHidden(next: boolean) {
    this.hidden = next;
  }

  private handleClick = () => {
    this.comboboxItemSelect.emit(this.toOption());
  };

  render() {
    // Render either provided html_content or the slotted content
    return (
      <Host role="option" tabindex="-1" aria-selected="false" class={{ 'dropdown-item': true }} onClick={this.handleClick}>
        {this.html_content ? <span innerHTML={this.html_content}></span> : <slot></slot>}
      </Host>
    );
  }
}
