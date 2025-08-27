import { Component, Element, Event, EventEmitter, Host, Method, Prop, h } from '@stencil/core';
import { DropdownItem } from '../ir-dropdown/ir-dropdown';

@Component({
  tag: 'ir-dropdown-item',
  styleUrl: 'ir-dropdown-item.css',
  scoped: true,
})
export class IrDropdownItem {
  @Element() el: HTMLIrDropdownItemElement;
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
  @Event({ eventName: 'dropdownItemSelect' }) dropdownItemSelect: EventEmitter<DropdownItem['value']>;

  /**
   * Inform the parent this item exists (parent will index and manage focus)
   */
  @Event({ eventName: 'dropdownItemRegister' }) dropdownItemRegister: EventEmitter<void>;

  /**
   * Inform the parent this item is gone
   */
  @Event({ eventName: 'dropdownItemUnregister' }) dropdownItemUnregister: EventEmitter<void>;

  componentDidLoad() {
    this.dropdownItemRegister.emit();
  }

  disconnectedCallback() {
    this.dropdownItemUnregister.emit();
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
    this.dropdownItemSelect.emit(this.value);
  };
  render() {
    return (
      <Host role="option" tabindex="-1" aria-selected="false" class={{ 'dropdown-item': true }} onClick={this.handleClick}>
        {this.html_content ? <span innerHTML={this.html_content}></span> : <slot></slot>}
      </Host>
    );
  }
}
