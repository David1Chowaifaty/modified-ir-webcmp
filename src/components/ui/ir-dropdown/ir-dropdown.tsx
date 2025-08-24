import { Component, Prop, State, h, Event, EventEmitter, Host, Element, Listen, Watch } from '@stencil/core';

export type DropdownItem = {
  value: string | number;
};
@Component({
  tag: 'ir-dropdown',
  styleUrl: 'ir-dropdown.css',
  scoped: true,
})
export class IrDropdown {
  @Element() el: HTMLIrDropdownElement;

  @Prop({ reflect: true, mutable: true }) value: DropdownItem['value'];

  @State() isOpen: boolean = false;
  @State() selectedOption: DropdownItem['value'];
  @State() focusedIndex: number = -1;
  @State() slotElements: HTMLIrDropdownItemElement[] = [];
  @State() itemChildren: HTMLIrDropdownItemElement[] = [];

  private mo: MutationObserver | null = null;
  private dropdownRef: HTMLDivElement;

  /**
   * Emitted when a user selects an option from the combobox.
   * The event payload contains the selected `ComboboxOption` object.
   */
  @Event() optionChange: EventEmitter<DropdownItem['value']>;

  componentWillLoad() {
    this.collectItemChildren();
    this.selectedOption = this.value;
    // watch DOM changes to children
    this.mo = new MutationObserver(() => this.collectItemChildren());
    this.mo.observe(this.el, { childList: true, subtree: true });
  }

  componentDidLoad() {
    document.addEventListener('click', this.handleDocumentClick.bind(this));
    setTimeout(() => this.updateSlotElements(), 0);
    if (this.value) {
      setTimeout(() => this.updateDropdownItemValue(this.value), 100);
    }
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
    this.mo?.disconnect();
  }

  @Listen('keydown', { target: 'document' })
  handleDocumentKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      this.closeDropdown();
    }
  }
  @Listen('dropdownItemSelect')
  handleDropdownItemSelect(ev: CustomEvent<DropdownItem['value']>) {
    ev.stopPropagation();
    this.selectOption(ev.detail);
    (ev.target as HTMLIrDropdownItemElement).setAttribute('aria-selected', 'true');
  }

  @Listen('dropdownItemRegister')
  handleDropdownItemRegister() {
    this.collectItemChildren();
  }

  @Listen('dropdownItemUnregister')
  handleDropdownItemUnregister() {
    this.collectItemChildren();
  }

  @Watch('value')
  handleValueChange(newValue: DropdownItem['value'], oldValue: DropdownItem['value']) {
    if (newValue !== oldValue) {
      this.updateDropdownItemValue(newValue);
    }
  }

  private updateDropdownItemValue(value: DropdownItem['value']) {
    const el = this.slotElements?.find(el => el.value === value);
    if (el) {
      el.setAttribute('aria-selected', 'true');
    }
  }

  private openDropdown() {
    this.isOpen = true;
    this.focusedIndex = -1;
    setTimeout(() => this.updateSlotElements());
  }

  private closeDropdown() {
    this.isOpen = false;
    this.focusedIndex = -1;
    this.removeSlotFocus();
  }

  private handleDocumentClick = (event: Event) => {
    if (!this.el.contains(event.target as Node)) {
      this.closeDropdown();
    }
  };

  private collectItemChildren() {
    // find *direct or nested* items inside the dropdown container
    const items = Array.from(this.el.querySelectorAll('ir-dropdown-item')) as HTMLIrDropdownItemElement[];
    this.itemChildren = items;

    setTimeout(() => this.updateSlotElementsForItems(), 0);
  }

  private updateSlotElements() {
    if (!this.dropdownRef) return;

    const slotElement = this.dropdownRef.querySelector('slot[name="dropdown-content"]');
    if (slotElement) {
      const assignedElements = (slotElement as any).assignedElements
        ? (slotElement as any).assignedElements()
        : Array.from(this.el.querySelectorAll('[slot="dropdown-content"] [data-option]'));

      this.slotElements = assignedElements.length > 0 ? assignedElements : Array.from(this.dropdownRef.querySelectorAll('[data-option], .dropdown-item[style*="cursor"]'));

      this.slotElements.forEach((element, index) => {
        element.setAttribute('data-slot-index', index.toString());
        element.setAttribute('role', 'option');
        element.setAttribute('tabindex', '-1');
      });
    }
  }

  private removeSlotFocus() {
    this.slotElements.forEach(element => {
      element.classList.remove('focused', 'active');
      element.removeAttribute('aria-selected');
    });
  }

  private focusSlotElement(index: number) {
    this.removeSlotFocus();
    if (index >= 0 && index < this.slotElements.length) {
      const element = this.slotElements[index];
      element.classList.add('focused', 'active');
      element.setAttribute('aria-selected', 'true');
      element.scrollIntoView({ block: 'nearest' });
    }
  }

  private selectSlotElement(index: number) {
    if (index >= 0 && index < this.slotElements.length) {
      const element = this.slotElements[index];
      element.click();
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const maxIndex = this.slotElements.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.focusedIndex = Math.min(this.focusedIndex + 1, maxIndex);
          this.focusSlotElement(this.focusedIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
          this.focusSlotElement(this.focusedIndex);
        } else {
          this.openDropdown();
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this.isOpen && this.focusedIndex >= 0) {
          this.selectSlotElement(this.focusedIndex);
        } else if (!this.isOpen) {
          this.openDropdown();
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.closeDropdown();
        break;

      case 'Tab':
        if (this.isOpen) {
          this.closeDropdown();
        }
        break;
    }
  };

  private selectOption(option: any) {
    this.selectedOption = option;
    this.value = option;
    this.optionChange.emit(option);
    this.closeDropdown();
  }

  private updateSlotElementsForItems() {
    // Treat the child items as "slot elements" for nav
    this.slotElements = this.itemChildren as unknown as HTMLIrDropdownItemElement[];

    // index and decorate for ARIA & focus handling
    this.slotElements.forEach((el, index) => {
      el.setAttribute('data-slot-index', String(index));
      el.setAttribute('role', 'option');
      el.setAttribute('tabindex', '-1');
    });
  }

  render() {
    return (
      <Host class={`dropdown ${this.isOpen ? 'show' : ''}`}>
        <div
          onClick={() => {
            this.isOpen = !this.isOpen;
          }}
          onKeyDown={this.handleKeyDown}
        >
          <slot name="trigger"></slot>
        </div>
        <div ref={el => (this.dropdownRef = el)} class="dropdown-menu">
          <slot></slot>
        </div>
      </Host>
    );
  }
}
