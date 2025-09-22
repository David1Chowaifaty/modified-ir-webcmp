import { Component, Element, Event, EventEmitter, Host, Method, Prop, h } from '@stencil/core';
import { DropdownItem } from '../ir-dropdown/ir-dropdown';

@Component({
  tag: 'ir-dropdown-item',
  styleUrl: 'ir-dropdown-item.css',
  scoped: true,
})
export class IrDropdownItem {
  @Element() el: HTMLIrDropdownItemElement;

  private isComponentConnected: boolean = true;
  private hasRegistered: boolean = false;

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
    if (this.isComponentConnected && !this.hasRegistered) {
      this.hasRegistered = true;
      // Use RAF to ensure parent is ready
      requestAnimationFrame(() => {
        if (this.isComponentConnected) {
          this.dropdownItemRegister.emit();
        }
      });
    }
  }

  disconnectedCallback() {
    this.isComponentConnected = false;

    // Only emit unregister if we previously registered and parent might still be connected
    if (this.hasRegistered && this.el.parentElement) {
      // Check if parent dropdown still exists in DOM
      const parentDropdown = this.el.closest('ir-dropdown');
      if (parentDropdown && document.contains(parentDropdown)) {
        this.dropdownItemUnregister.emit();
      }
    }
    this.hasRegistered = false;
  }

  @Method()
  async matchesQuery(query: string): Promise<boolean> {
    if (!this.isComponentConnected) return false;

    const q = query.toLowerCase();
    const hay = (this.label ?? this.el.textContent ?? '').toLowerCase();
    return hay.includes(q);
  }

  @Method()
  async setHidden(next: boolean) {
    if (this.isComponentConnected) {
      this.hidden = next;
    }
  }

  private handleClick = (event: Event) => {
    event.stopPropagation();

    if (!this.isComponentConnected) return;

    this.dropdownItemSelect.emit(this.value);
  };

  render() {
    return (
      <Host role="option" tabindex="-1" aria-selected="false" class={{ 'dropdown-item': true, 'hidden': this.hidden }} onClick={this.handleClick} data-value={this.value}>
        {this.html_content ? <span innerHTML={this.html_content}></span> : <slot></slot>}
      </Host>
    );
  }
}
