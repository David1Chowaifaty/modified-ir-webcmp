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
  @State() itemChildren: HTMLIrDropdownItemElement[] = [];

  private mo: MutationObserver | null = null;
  private dropdownRef: HTMLDivElement;
  private documentClickHandler: (event: Event) => void;
  private isComponentConnected: boolean = true;
  private updateQueued: boolean = false;

  /**
   * Emitted when a user selects an option from the combobox.
   * The event payload contains the selected `DropdownItem` object.
   */
  @Event() optionChange: EventEmitter<DropdownItem['value']>;

  componentWillLoad() {
    this.selectedOption = this.value;
    this.documentClickHandler = this.handleDocumentClick.bind(this);
    this.collectItemChildren();

    // Optimized mutation observer with debouncing
    this.mo = new MutationObserver(() => {
      if (!this.updateQueued) {
        this.updateQueued = true;
        requestAnimationFrame(() => {
          if (this.isComponentConnected) {
            this.collectItemChildren();
            this.updateQueued = false;
          }
        });
      }
    });
    this.mo.observe(this.el, { childList: true, subtree: true });
  }

  componentDidLoad() {
    document.addEventListener('click', this.documentClickHandler, { passive: true });

    // Single RAF call instead of multiple setTimeouts
    requestAnimationFrame(() => {
      if (this.isComponentConnected) {
        this.updateItemElements();
        if (this.value) {
          this.updateDropdownItemValue(this.value);
        }
      }
    });
  }

  disconnectedCallback() {
    this.isComponentConnected = false;
    document.removeEventListener('click', this.documentClickHandler);
    this.mo?.disconnect();
    this.mo = null;
  }

  @Listen('keydown', { target: 'document' })
  handleDocumentKeyDown(event: KeyboardEvent) {
    if (!this.isOpen || !this.isComponentConnected) return;

    if (event.key === 'Escape') {
      this.closeDropdown();
    }
  }

  @Listen('dropdownItemSelect')
  handleDropdownItemSelect(ev: CustomEvent<DropdownItem['value']>) {
    if (!this.isComponentConnected) return;

    ev.stopPropagation();
    this.selectOption(ev.detail);
    (ev.target as HTMLIrDropdownItemElement).setAttribute('aria-selected', 'true');
  }

  @Listen('dropdownItemRegister')
  handleDropdownItemRegister() {
    if (!this.isComponentConnected) return;
    this.collectItemChildren();
  }

  @Listen('dropdownItemUnregister')
  handleDropdownItemUnregister() {
    if (!this.isComponentConnected) return;
    this.collectItemChildren();
  }

  @Watch('value')
  handleValueChange(newValue: DropdownItem['value'], oldValue: DropdownItem['value']) {
    if (newValue !== oldValue && this.isComponentConnected) {
      this.updateDropdownItemValue(newValue);
    }
  }

  private updateDropdownItemValue(value: DropdownItem['value']) {
    // Clear previous selections immediately
    this.itemChildren.forEach(el => el.removeAttribute('aria-selected'));

    // Set new selection
    const el = this.itemChildren.find(el => el.value === value);
    if (el) {
      el.setAttribute('aria-selected', 'true');
    }
  }

  private getSelectedItemIndex(): number {
    if (!this.value) return -1;
    return this.itemChildren.findIndex(item => item.value === this.value);
  }

  private openDropdown() {
    try {
      this.isOpen = true;
      // Initialize focus to the currently selected item
      this.focusedIndex = this.getSelectedItemIndex();
      // Immediate update instead of setTimeout
      this.updateItemElements();

      // Auto-scroll to selected item if it exists
      if (this.focusedIndex >= 0) {
        requestAnimationFrame(() => {
          this.scrollToSelectedItem();
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private closeDropdown() {
    this.isOpen = false;
    this.focusedIndex = -1;
    this.removeItemFocus();
  }

  private handleDocumentClick = (event: Event) => {
    if (!this.isComponentConnected || !this.el.contains(event.target as Node)) {
      this.closeDropdown();
    }
  };

  private collectItemChildren() {
    if (!this.isComponentConnected) return;

    const items = Array.from(this.el.querySelectorAll('ir-dropdown-item')) as HTMLIrDropdownItemElement[];
    this.itemChildren = items;

    // Immediate update instead of setTimeout
    this.updateItemElements();
  }

  private updateItemElements() {
    if (!this.isComponentConnected) return;

    // Use the collected item children directly
    this.itemChildren.forEach((el, index) => {
      el.setAttribute('data-slot-index', String(index));
      el.setAttribute('role', 'option');
      el.setAttribute('tabindex', '-1');
    });
  }

  private removeItemFocus() {
    this.itemChildren.forEach(element => {
      element.classList.remove('focused', 'active');
      // Don't remove aria-selected as it indicates selection, not focus
    });
  }

  private focusItemElement(index: number) {
    this.removeItemFocus();
    if (index >= 0 && index < this.itemChildren.length) {
      const element = this.itemChildren[index];
      element.classList.add('focused', 'active');
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  private selectItemElement(index: number) {
    if (index >= 0 && index < this.itemChildren.length) {
      const element = this.itemChildren[index];
      element.click();
    }
  }

  private scrollToSelectedItem() {
    if (this.focusedIndex >= 0 && this.focusedIndex < this.itemChildren.length) {
      const selectedElement = this.itemChildren[this.focusedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
          inline: 'nearest',
        });
      }
    }
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isComponentConnected) return;

    const maxIndex = this.itemChildren.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
          // After opening, if we have a selection, start from next item
          if (this.focusedIndex >= 0 && this.focusedIndex < maxIndex) {
            this.focusedIndex++;
            this.focusItemElement(this.focusedIndex);
          } else if (this.focusedIndex === -1) {
            // No selection, start from first item
            this.focusedIndex = 0;
            this.focusItemElement(this.focusedIndex);
          } else if (this.focusedIndex === maxIndex) {
            // At last item, wrap to first
            this.focusedIndex = 0;
            this.focusItemElement(this.focusedIndex);
          }
        } else if (maxIndex >= 0) {
          this.focusedIndex = this.focusedIndex < maxIndex ? this.focusedIndex + 1 : 0;
          this.focusItemElement(this.focusedIndex);
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
          // After opening, if we have a selection, start from previous item
          if (this.focusedIndex > 0) {
            this.focusedIndex--;
            this.focusItemElement(this.focusedIndex);
          } else if (this.focusedIndex === -1) {
            // No selection, start from last item
            this.focusedIndex = maxIndex;
            this.focusItemElement(this.focusedIndex);
          } else if (this.focusedIndex === 0) {
            // At first item, wrap to last
            this.focusedIndex = maxIndex;
            this.focusItemElement(this.focusedIndex);
          }
        } else if (maxIndex >= 0) {
          this.focusedIndex = this.focusedIndex > 0 ? this.focusedIndex - 1 : maxIndex;
          this.focusItemElement(this.focusedIndex);
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this.isOpen && this.focusedIndex >= 0) {
          this.selectItemElement(this.focusedIndex);
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

  private selectOption(option: DropdownItem['value']) {
    this.selectedOption = option;
    this.value = option;
    this.optionChange.emit(option);
    this.closeDropdown();
  }

  render() {
    return (
      <Host class={`dropdown ${this.isOpen ? 'show' : ''}`}>
        <div
          onClick={() => {
            // this.isOpen = !this.isOpen;
            // if (this.isOpen) {
            //   this.updateItemElements();
            // }
            if (this.isOpen) {
              this.closeDropdown();
            } else {
              this.openDropdown();
            }
          }}
          class="position-relative"
          onKeyDown={this.handleKeyDown}
          tabindex="0"
        >
          <slot name="trigger"></slot>
          <div class="caret-icon">
            <ir-icons name={!this.isOpen ? 'angle-down' : 'angle-up'}></ir-icons>
          </div>
        </div>
        <div ref={el => (this.dropdownRef = el)} class="dropdown-menu" role="listbox" aria-expanded={this.isOpen.toString()}>
          <slot></slot>
        </div>
      </Host>
    );
  }
}
