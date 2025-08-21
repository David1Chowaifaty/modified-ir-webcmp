import { Component, Host, h, Element, State, Listen, Prop, Event, EventEmitter, Watch, Method } from '@stencil/core';
import { v4 } from 'uuid';
import { ComboboxOption, DataMode } from './types';

@Component({
  tag: 'ir-m-combobox',
  styleUrl: 'ir-m-combobox.css',
  scoped: true,
})
export class IrMCombobox {
  @Element() el: HTMLElement;

  /**
   * Placeholder text displayed in the input when no option is selected.
   */
  @Prop() placeholder: string;

  /**
   * Determines how the options are loaded into the component.
   * - 'static': Uses the options passed through the `options` prop or the default internal list.
   * - 'external': Emits search events for external handling, options updated via `options` prop.
   *
   * @default 'static'
   */
  @Prop() dataMode: DataMode = 'static';

  /**
   * List of available options for the combobox when using static data mode.
   * If empty, falls back to a default internal option list.
   */
  @Prop() options: ComboboxOption[] = [];

  /**
   * Debounce delay in milliseconds for search events when using external data mode.
   * @default 300
   */
  @Prop() debounceDelay: number = 300;

  /**
   * Whether to show loading state
   */
  @Prop() loading: boolean = false;

  /**
   * Whether to use slot content for custom dropdown rendering
   */
  @Prop({ mutable: true }) useSlot: boolean = false;

  @State() isOpen: boolean = false;
  @State() selectedOption: ComboboxOption;
  @State() focusedIndex: number = -1;
  @State() filteredOptions: ComboboxOption[] = [];
  @State() slotElements: HTMLElement[] = [];
  @State() hasPrefix: boolean = false;
  @State() hasSuffix: boolean = false;
  @State() itemChildren: HTMLIrMComboboxItemElement[] = [];

  /**
   * Emitted when a user selects an option from the combobox.
   * The event payload contains the selected `ComboboxOption` object.
   */
  @Event() optionChange: EventEmitter<ComboboxOption>;

  /**
   * Emitted when the user types in the input field (debounced).
   * Used for external data fetching in 'external' data mode.
   */
  @Event() searchQuery: EventEmitter<string>;

  /**
   * Public method to select an option from external slot content
   */
  @Method()
  async selectOptionFromSlot(option: ComboboxOption) {
    this.selectOption(option);
  }

  private inputRef: HTMLInputElement;
  private dropdownRef: HTMLElement;
  private id = v4();
  private dropdownId = `dropdown-${this.id}`;
  private debounceTimeout: NodeJS.Timeout;
  private prefixSlotRef: HTMLSlotElement;
  private suffixSlotRef: HTMLSlotElement;
  private mo: MutationObserver | null = null;

  private get isCompositionMode() {
    return this.itemChildren.length > 0;
  }

  @Watch('options')
  watchOptionsChanged(newOptions: ComboboxOption[]) {
    this.filteredOptions = newOptions || [];
    if (this.useSlot) {
      this.updateSlotElements();
    }
  }

  @Watch('useSlot')
  watchUseSlotChanged() {
    if (this.useSlot) {
      setTimeout(() => this.updateSlotElements(), 0);
    }
  }

  componentWillLoad() {
    this.initializeOptions();
    // discover items on first paint
    this.collectItemChildren();

    // watch DOM changes to children
    this.mo = new MutationObserver(() => this.collectItemChildren());
    this.mo.observe(this.el, { childList: true, subtree: true });
  }

  componentDidLoad() {
    document.addEventListener('click', this.handleDocumentClick.bind(this));

    // existing stuff
    if (this.useSlot) {
      setTimeout(() => this.updateSlotElements(), 0);
    }
    setTimeout(() => this.updateAffixPresence(), 0);
    this.prefixSlotRef?.addEventListener('slotchange', this.updateAffixPresence);
    this.suffixSlotRef?.addEventListener('slotchange', this.updateAffixPresence);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
    if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
    this.prefixSlotRef?.removeEventListener('slotchange', this.updateAffixPresence);
    this.suffixSlotRef?.removeEventListener('slotchange', this.updateAffixPresence);
    this.mo?.disconnect();
  }

  @Listen('keydown', { target: 'document' })
  handleDocumentKeyDown(event: KeyboardEvent) {
    if (!this.isOpen) return;

    if (event.key === 'Escape') {
      this.closeDropdown();
      this.inputRef?.focus();
    }
  }
  @Listen('comboboxItemSelect')
  handleComboboxItemSelect(ev: CustomEvent<ComboboxOption>) {
    ev.stopPropagation();
    console.log(ev.detail);
    this.selectOption(ev.detail);
  }

  @Listen('comboboxItemRegister')
  handleComboboxItemRegister() {
    this.collectItemChildren();
  }

  @Listen('comboboxItemUnregister')
  handleComboboxItemUnregister() {
    this.collectItemChildren();
  }

  private initializeOptions() {
    this.filteredOptions = this.options.length > 0 ? this.options : [];
  }

  private handleDocumentClick = (event: Event) => {
    if (!this.el.contains(event.target as Node)) {
      this.closeDropdown();
    }
  };

  // private openDropdown() {
  //   this.isOpen = true;
  //   if (this.useSlot) {
  //     this.focusedIndex = -1;
  //     setTimeout(() => this.updateSlotElements(), 0);
  //   } else {
  //     this.focusedIndex = this.selectedOption ? this.filteredOptions.findIndex(v => v.value === this.selectedOption.value) : -1;
  //   }
  // }
  private openDropdown() {
    this.isOpen = true;
    if (this.isCompositionMode || this.useSlot) {
      this.focusedIndex = -1;
      setTimeout(() => (this.isCompositionMode ? this.updateSlotElementsForItems() : this.updateSlotElements()), 0);
    } else {
      this.focusedIndex = this.selectedOption ? this.filteredOptions.findIndex(v => v.value === this.selectedOption.value) : -1;
    }
  }
  private emitSearchQuery(query: string) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.searchQuery.emit(query);
    }, this.debounceDelay);
  }

  private closeDropdown() {
    this.isOpen = false;
    this.focusedIndex = -1;
    this.removeSlotFocus();
  }

  private updateSlotElements() {
    if (!this.useSlot || !this.dropdownRef) return;

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

  private updateAffixPresence = () => {
    try {
      const prefixAssigned =
        this.prefixSlotRef && (this.prefixSlotRef as any).assignedElements
          ? (this.prefixSlotRef as any).assignedElements()
          : Array.from(this.el.querySelectorAll('[slot="prefix"]'));
      const suffixAssigned =
        this.suffixSlotRef && (this.suffixSlotRef as any).assignedElements
          ? (this.suffixSlotRef as any).assignedElements()
          : Array.from(this.el.querySelectorAll('[slot="suffix"]'));

      this.hasPrefix = Array.isArray(prefixAssigned) ? prefixAssigned.length > 0 : false;
      this.hasSuffix = Array.isArray(suffixAssigned) ? suffixAssigned.length > 0 : false;
    } catch (e) {
      const prefixFallback = this.el.querySelector('[slot="prefix"]');
      const suffixFallback = this.el.querySelector('[slot="suffix"]');
      this.hasPrefix = !!prefixFallback;
      this.hasSuffix = !!suffixFallback;
    }
  };

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
    const maxIndex = this.useSlot ? this.slotElements.length - 1 : this.filteredOptions.length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen) {
          this.openDropdown();
        } else {
          this.focusedIndex = Math.min(this.focusedIndex + 1, maxIndex);
          if (this.useSlot) {
            this.focusSlotElement(this.focusedIndex);
          } else {
            this.scrollToFocusedOption();
          }
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.isOpen) {
          this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
          if (this.useSlot) {
            this.focusSlotElement(this.focusedIndex);
          } else {
            this.scrollToFocusedOption();
          }
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this.isOpen && this.focusedIndex >= 0) {
          if (this.useSlot) {
            this.selectSlotElement(this.focusedIndex);
          } else {
            this.selectOption(this.filteredOptions[this.focusedIndex]);
          }
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

  private selectOption(option: ComboboxOption) {
    this.selectedOption = option;
    this.optionChange.emit(option);
    this.closeDropdown();
    this.inputRef.focus();
  }

  private scrollToFocusedOption() {
    if (this.focusedIndex < 0 || !this.dropdownRef || this.useSlot) return;

    const focusedElement = this.dropdownRef.querySelector(`#${this.dropdownId}-option-${this.focusedIndex}`) as HTMLElement;
    if (focusedElement) {
      focusedElement.scrollIntoView({ block: 'nearest' });
    }
  }

  // private handleInput = (event: Event) => {
  //   const target = event.target as HTMLInputElement;
  //   const value = target.value;

  //   if (this.dataMode === 'external') {
  //     this.emitSearchQuery(value);
  //   } else {
  //     const allOptions = this.options.length > 0 ? this.options : [];
  //     this.filteredOptions = value ? allOptions.filter(option => option.label.toLowerCase().includes(value.toLowerCase())) : allOptions;
  //   }

  //   this.focusedIndex = -1;
  //   if (!this.isOpen) {
  //     this.openDropdown();
  //   }
  // };
  private handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;

    if (this.dataMode === 'external' && !this.isCompositionMode) {
      this.emitSearchQuery(value);
    } else if (this.isCompositionMode) {
      // composition mode: filter child items
      this.filterComposition(value);
    } else {
      // static options mode (existing behavior)
      const allOptions = this.options.length > 0 ? this.options : [];
      this.filteredOptions = value ? allOptions.filter(option => option.label.toLowerCase().includes(value.toLowerCase())) : allOptions;
    }

    this.focusedIndex = -1;
    if (!this.isOpen) {
      this.openDropdown();
    }
  };
  private collectItemChildren() {
    // find *direct or nested* items inside the dropdown container
    const items = Array.from(this.el.querySelectorAll('ir-m-combobox-item')) as HTMLIrMComboboxItemElement[];
    this.itemChildren = items;
    console.log(items);
    // when in composition mode, use slot-like navigation on the items
    if (this.isCompositionMode) {
      this.useSlot = true; // leverage your existing slot-based keyboard handling
      setTimeout(() => this.updateSlotElementsForItems(), 0);
    }
  }

  private updateSlotElementsForItems() {
    // Treat the child items as "slot elements" for nav
    this.slotElements = this.itemChildren as unknown as HTMLElement[];

    // index and decorate for ARIA & focus handling
    this.slotElements.forEach((el, index) => {
      el.setAttribute('data-slot-index', String(index));
      el.setAttribute('role', 'option');
      el.setAttribute('tabindex', '-1');
    });
  }
  private async filterComposition(query: string) {
    // Hide/show each child according to its own matching logic
    const results: boolean[] = await Promise.all(this.itemChildren.map(item => item.matchesQuery(query)));

    await Promise.all(this.itemChildren.map((item, i) => item.setHidden(query ? !results[i] : false)));

    // refresh slotElements (only visible items should be navigable)
    this.updateSlotElementsForItems();
  }

  render() {
    return (
      <Host class={{ 'has-prefix': this.hasPrefix, 'has-suffix': this.hasSuffix }}>
        <div class="input-wrapper">
          <span class="prefix-container" aria-hidden={!this.hasPrefix}>
            <slot name="prefix" ref={el => (this.prefixSlotRef = el as HTMLSlotElement)}></slot>
          </span>
          <input
            ref={el => (this.inputRef = el)}
            type="text"
            class="form-control"
            role="combobox"
            id={this.id}
            value={this.selectedOption?.label || ''}
            placeholder={this.placeholder}
            aria-expanded={String(this.isOpen)}
            aria-autocomplete="list"
            aria-controls={this.dropdownId}
            data-reference="parent"
            aria-haspopup="listbox"
            aria-activedescendant={this.focusedIndex >= 0 ? `${this.dropdownId}-option-${this.focusedIndex}` : null}
            aria-label="Combobox"
            aria-required={true}
            onKeyDown={this.handleKeyDown}
            onInput={this.handleInput}
          />
          <span class="suffix-container" aria-hidden={!this.hasSuffix}>
            <slot name="suffix" ref={el => (this.suffixSlotRef = el as HTMLSlotElement)}></slot>
          </span>
        </div>
        <div class={`dropdown ${this.isOpen ? 'show' : ''}`}>
          <div ref={el => (this.dropdownRef = el)} class={`dropdown-menu ${this.isOpen ? 'show' : ''}`} id={this.dropdownId} role="listbox" aria-expanded={String(this.isOpen)}>
            {this.isCompositionMode ? (
              <slot></slot>
            ) : this.useSlot ? (
              <slot name="dropdown-content"></slot>
            ) : (
              [
                this.loading && <div class="dropdown-item loading">Loading...</div>,
                !this.loading && this.filteredOptions.length === 0 && <div class="dropdown-item no-results">No results found</div>,
                !this.loading &&
                  this.filteredOptions.map((option, index) => (
                    <button
                      id={`${this.dropdownId}-option-${index}`}
                      class={`dropdown-item ${this.focusedIndex === index ? 'active' : ''}`}
                      role="option"
                      aria-selected={this.selectedOption?.value === option.value ? 'true' : 'false'}
                      onClick={() => this.selectOption(option)}
                      onMouseEnter={() => (this.focusedIndex = index)}
                      innerHTML={option.html_content}
                    >
                      {option.html_content ? null : option.label}
                    </button>
                  )),
              ]
            )}
          </div>
        </div>
      </Host>
    );
  }
}
