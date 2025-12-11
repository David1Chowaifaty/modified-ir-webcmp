import { Component, Element, Event, EventEmitter, Listen, Method, State, Watch, h, Host, Prop } from '@stencil/core';
import WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { NativeWaInput } from '../ir-input/ir-input';

export interface IrComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type PickerItemElement = HTMLIrPickerItemElement & {
  active: boolean;
  selected: boolean;
};

export interface IrComboboxSelectEventDetail {
  item: IrComboboxOption;
}

@Component({
  tag: 'ir-picker',
  styleUrl: 'ir-picker.css',
  shadow: true,
})
export class IrPicker {
  /** Selected value (also shown in the input when `mode="select"`). */
  @Prop({ reflect: true, mutable: true }) value: string = '';

  @Prop({ reflect: true }) loading = false;

  @Prop() mode: 'select' | 'default' = 'default';

  @Prop({ reflect: true }) pill: boolean = false;
  /** Placeholder shown inside the input when there is no query. */
  @Prop() placeholder: string = '';
  /** Optional label applied to the text field. */
  @Prop() label?: string;
  /** The default value of the form control. Primarily used for resetting the form control. */
  @Prop({ reflect: true }) defaultValue: NativeWaInput['defaultValue'];

  /** The input's size. */
  @Prop({ reflect: true }) size: NativeWaInput['size'] = 'small';
  /** The input's visual appearance. */
  @Prop({ reflect: true }) appearance: NativeWaInput['appearance'];

  /** Delay (in milliseconds) before filtering results after user input. */
  @Prop() debounce: number = 0;

  private static idCounter = 0;
  private readonly componentId = ++IrPicker.idCounter;
  private readonly listboxId = `ir-combobox-listbox-${this.componentId}`;
  private readonly listboxLabelId = `ir-combobox-label-${this.componentId}`;
  private readonly emptyStateId = `ir-combobox-empty-${this.componentId}`;

  private inputRef?: WaInput;
  private nativeInput?: HTMLInputElement;
  private slotRef?: HTMLSlotElement;
  private debounceTimer?: number;

  @Element() hostEl!: HTMLElement;

  @State() isOpen = false;
  @State() query = '';
  @State() activeIndex = -1;
  @State() filteredItems: PickerItemElement[] = [];
  @State() liveRegionMessage = '';
  @State() slottedPickerItems: PickerItemElement[] = [];

  /** Emitted when a value is selected from the combobox list. */
  @Event({ eventName: 'combobox-select' }) comboboxSelect!: EventEmitter<IrComboboxSelectEventDetail>;

  /** Emitted when the text input value changes. */
  @Event({ eventName: 'text-change' }) textChange!: EventEmitter<string>;

  componentWillLoad() {
    const hostItems = Array.from(this.hostEl?.querySelectorAll('ir-picker-item') ?? []) as PickerItemElement[];
    if (hostItems.length) {
      this.processPickerItems(hostItems);
    } else {
      this.updateLiveRegion(0);
    }
  }

  componentDidRender() {
    if (this.inputRef) {
      this.nativeInput = this.inputRef.input;
    }
    this.applyAriaAttributes();
  }

  @Method()
  async open() {
    if (this.isOpen) {
      this.focusInput();
      return;
    }
    this.isOpen = true;
    requestAnimationFrame(() => this.focusInput());
    if (this.filteredItems.length) {
      const selectedIndex = this.filteredItems.findIndex(item => item.value === this.value);
      if (selectedIndex >= 0) {
        const nextIndex = this.findNearestEnabledIndex(selectedIndex + 1, 1);
        if (nextIndex >= 0) {
          this.activeIndex = nextIndex;
        } else {
          this.focusEdgeItem('start');
        }
      } else if (this.activeIndex === -1) {
        this.focusEdgeItem('start');
      }
    }
    this.scrollSelectedIntoView();
  }

  @Method()
  async close() {
    this.isOpen = false;
  }

  @Listen('keydown')
  handleKeyDown(e) {
    this.handleInputKeydown(e);
  }

  @Listen('click', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    if (!this.isOpen) return;
    const path = event.composedPath ? event.composedPath() : [];
    if ((path.length && path.includes(this.hostEl)) || this.hostEl.contains(event.target as Node)) return;
    this.closeCombobox();
  }

  @Listen('focusin', { target: 'document' })
  handleDocumentFocus(event: FocusEvent) {
    if (!this.isOpen) return;
    if (this.hostEl.contains(event.target as Node)) return;
    this.closeCombobox();
  }

  @Watch('activeIndex')
  protected handleActiveIndexChange() {
    this.updateActiveItemIndicators();
    this.applyAriaAttributes();
    this.scrollActiveOptionIntoView();
  }

  @Watch('value')
  protected handleValueChange(newValue: string) {
    this.updateSelectedFromValue(newValue);
    this.syncQueryWithValue(newValue);
    if (this.mode === 'select') {
      this.applyFilter('', { updateQuery: false, emitEvent: false });
    }
  }

  private closeCombobox(options: { restoreFocus?: boolean } = {}) {
    this.isOpen = false;
    if (options.restoreFocus) {
      this.focusInput();
    }
  }

  private handleInput = (event: Event) => {
    const target = event.target as WaInput;
    this.applyFilter(target?.value ?? '');
    this.open();
  };

  private handleInputFocus = () => {
    if (!this.isOpen) {
      this.open();
    }
  };

  private handleInputKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open();
        this.moveActiveIndex(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.open();
        this.moveActiveIndex(-1);
        break;
      case 'Enter':
        if (!this.isOpen) return;
        event.preventDefault();
        this.selectActiveItem();
        break;
      case 'Escape':
        if (!this.isOpen) return;
        event.preventDefault();
        this.closeCombobox({ restoreFocus: true });
        break;
      case 'Home':
        if (!this.isOpen) return;
        event.preventDefault();
        this.focusEdgeItem('start');
        break;
      case 'End':
        if (!this.isOpen) return;
        event.preventDefault();
        this.focusEdgeItem('end');
        break;
      case 'Tab':
        this.closeCombobox();
        break;
    }
  };

  /** Applies the filter after the debounce delay and emits text-change when requested. */
  private applyFilter(value: string, options: { updateQuery?: boolean; emitEvent?: boolean } = {}) {
    // Clear any pending debounce run
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    const runFilter = () => {
      const { updateQuery = true, emitEvent = true } = options;

      // Emit AFTER debounce only when caller requested it.
      if (emitEvent) {
        this.textChange.emit(value);
      }

      if (updateQuery) {
        this.query = value;
      }

      const normalizedQuery = value.trim().toLowerCase();
      const items = this.slottedPickerItems;

      const filtered = normalizedQuery ? items.filter(item => this.matchesQuery(item, normalizedQuery)) : [...items];

      const previousActiveItem = this.activeIndex >= 0 ? this.filteredItems[this.activeIndex] : undefined;

      this.filteredItems = filtered;
      this.updateItemVisibility(filtered);

      let nextIndex = previousActiveItem ? filtered.indexOf(previousActiveItem) : -1;

      if (filtered.length === 0) {
        this.activeIndex = -1;
      } else {
        if (nextIndex === -1) {
          nextIndex = this.findNearestEnabledIndex(0, 1);
        }
        this.activeIndex = nextIndex;
      }

      this.updateActiveItemIndicators();

      const context = normalizedQuery ? `"${value.trim()}"` : undefined;
      this.updateLiveRegion(filtered.length, context);
    };

    // No debounce → run immediately
    if (!this.debounce) {
      runFilter();
      return;
    }

    // Debounced execution
    this.debounceTimer = window.setTimeout(runFilter, this.debounce);
  }

  private syncQueryWithValue(value: string) {
    if (this.mode !== 'select') {
      return;
    }

    if (!value) {
      this.query = '';
      return;
    }

    const match = this.slottedPickerItems.find(item => item.value === value);
    if (match) {
      this.query = this.getItemDisplayLabel(match);
    }
  }

  private selectActiveItem() {
    if (this.activeIndex < 0) return;
    const selected = this.filteredItems[this.activeIndex];
    if (!selected || selected.disabled) return;
    this.handleSelection(selected);
  }

  private handleSelection(item: PickerItemElement) {
    const detail: IrComboboxOption = {
      value: item.value,
      label: this.getItemDisplayLabel(item),
      disabled: item.disabled,
    };
    this.value = item.value;
    this.updateSelectedFromValue();
    this.comboboxSelect.emit({ item: detail });
    this.closeCombobox({ restoreFocus: true });
    if (this.mode === 'select') {
      this.query = this.getItemDisplayLabel(item);
      this.applyFilter('', { updateQuery: false, emitEvent: false });
    } else {
      this.applyFilter('', { emitEvent: false });
    }
    this.activeIndex = -1;
  }

  private focusInput() {
    this.inputRef?.focus();
    this.nativeInput?.focus();
  }

  private applyAriaAttributes() {
    if (!this.nativeInput) return;
    this.nativeInput.setAttribute('role', 'combobox');
    this.nativeInput.setAttribute('aria-autocomplete', 'list');
    this.nativeInput.setAttribute('aria-expanded', String(this.isOpen));
    this.nativeInput.setAttribute('aria-controls', this.listboxId);
    if (this.activeIndex >= 0) {
      const activeItem = this.filteredItems[this.activeIndex];
      if (activeItem?.id) {
        this.nativeInput.setAttribute('aria-activedescendant', activeItem.id);
      }
    } else {
      this.nativeInput.removeAttribute('aria-activedescendant');
    }
  }

  private scrollActiveOptionIntoView() {
    if (this.activeIndex < 0) return;
    const item = this.filteredItems[this.activeIndex];
    if (!item) return;
    this.runAfterNextFrame(() => {
      item.scrollIntoView({ block: 'center' });
    });
  }

  private scrollSelectedIntoView() {
    if (!this.isOpen || !this.value) {
      return;
    }
    const match = this.filteredItems.find(item => item.value === this.value) ?? this.slottedPickerItems.find(item => item.value === this.value);
    if (!match) {
      return;
    }
    this.runAfterNextFrame(() => {
      match.scrollIntoView({ block: 'center' });
    });
  }

  private capturePickerItemsFromSlot(slot: HTMLSlotElement = this.slotRef) {
    if (!slot) {
      return;
    }
    const assigned = slot.assignedElements({ flatten: true });
    const pickerItems = assigned.filter((el): el is PickerItemElement => el.tagName === 'IR-PICKER-ITEM');
    this.processPickerItems(pickerItems);
  }

  private processPickerItems(pickerItems: PickerItemElement[]) {
    this.slottedPickerItems = [...pickerItems];
    this.ensureItemIds();
    this.applyFilter(this.query, { emitEvent: false });
    this.updateSelectedFromValue(this.value);
    this.syncQueryWithValue(this.value);
    if (this.mode === 'select' && this.value) {
      this.applyFilter('', { updateQuery: false, emitEvent: false });
    }
  }

  private ensureItemIds() {
    this.slottedPickerItems.forEach((item, index) => {
      if (!item.id) {
        item.id = `${this.listboxId}-option-${index}`;
      }
    });
  }

  private getItemDisplayLabel(item: PickerItemElement) {
    return item.label || item.textContent?.trim() || '';
  }

  private matchesQuery(item: PickerItemElement, normalizedQuery: string) {
    const haystack = `${item.label ?? ''} ${item.value ?? ''}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  }

  private updateItemVisibility(visibleItems: PickerItemElement[]) {
    const visibleSet = new Set(visibleItems);
    this.slottedPickerItems.forEach(item => {
      const shouldShow = visibleSet.has(item);
      item.hidden = !shouldShow;
      if (shouldShow) {
        item.removeAttribute('aria-hidden');
      } else {
        item.setAttribute('aria-hidden', 'true');
      }
      item.active = false;
    });
  }

  private updateSelectedFromValue(value: string = this.value) {
    if (!this.slottedPickerItems.length) {
      return;
    }
    this.slottedPickerItems.forEach(item => {
      item.selected = Boolean(value) && item.value === value;
    });
  }

  private updateActiveItemIndicators() {
    this.slottedPickerItems.forEach(item => (item.active = false));
    if (this.activeIndex < 0) {
      return;
    }
    const activeItem = this.filteredItems[this.activeIndex];
    if (activeItem) {
      activeItem.active = true;
    }
  }

  private findNearestEnabledIndex(startIndex: number, direction: 1 | -1) {
    const items = this.filteredItems;
    const length = items.length;
    if (!length) {
      return -1;
    }
    let normalizedIndex = ((startIndex % length) + length) % length;
    let attempts = 0;
    while (attempts < length) {
      const candidate = items[normalizedIndex];
      if (candidate && !candidate.disabled) {
        return normalizedIndex;
      }
      normalizedIndex = (((normalizedIndex + direction) % length) + length) % length;
      attempts += 1;
    }
    return -1;
  }

  private focusEdgeItem(edge: 'start' | 'end') {
    if (!this.filteredItems.length) {
      this.activeIndex = -1;
      return;
    }
    const direction = edge === 'start' ? 1 : -1;
    const startIndex = edge === 'start' ? 0 : this.filteredItems.length - 1;
    this.activeIndex = this.findNearestEnabledIndex(startIndex, direction);
  }

  private moveActiveIndex(direction: 1 | -1) {
    const hasItems = this.filteredItems.length > 0;
    if (!hasItems) {
      this.activeIndex = -1;
      return;
    }
    if (this.activeIndex === -1) {
      this.focusEdgeItem(direction === 1 ? 'start' : 'end');
      return;
    }
    this.activeIndex = this.findNearestEnabledIndex(this.activeIndex + direction, direction);
  }

  private findPickerItemFromEvent(event: Event): PickerItemElement | undefined {
    const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
    for (const target of path) {
      if (target && (target as HTMLElement).tagName === 'IR-PICKER-ITEM') {
        return target as PickerItemElement;
      }
    }
    return undefined;
  }

  private handleResultsClick = (event: MouseEvent) => {
    const item = this.findPickerItemFromEvent(event);
    if (!item || item.disabled) {
      return;
    }
    event.preventDefault();
    this.handleSelection(item);
  };

  private handleResultsPointerDown = (event: PointerEvent) => {
    const item = this.findPickerItemFromEvent(event);
    if (!item) {
      return;
    }
    event.preventDefault();
  };

  private handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    this.slotRef = slot;
    this.capturePickerItemsFromSlot(slot);
  };
  render() {
    const hasResults = this.filteredItems.length > 0;
    const emptyDescriptionId = hasResults ? undefined : this.emptyStateId;

    return (
      <Host>
        <wa-popup flip shift placement="bottom" sync="width" auto-size="vertical" auto-size-padding={10} active={this.isOpen}>
          <wa-input
            slot="anchor"
            class="search-bar"
            // withClear
            size={this.size}
            value={this.query}
            defaultValue={this.defaultValue}
            ref={el => (this.inputRef = el)}
            appearance={this.appearance}
            label={this.label}
            pill={this.pill}
            autocomplete="off"
            placeholder={this.placeholder || 'Search'}
            oninput={this.handleInput}
            onfocus={this.handleInputFocus}
            onwa-clear={() => {
              this.applyFilter('');
              this.open();
            }}
          >
            {this.loading && <wa-spinner slot="end"></wa-spinner>}

            <wa-icon slot="start" name="magnifying-glass" aria-hidden="true"></wa-icon>
          </wa-input>
          {!this.loading && (
            <div class="menu" role="presentation">
              <p class="sr-only" id={this.listboxLabelId}>
                Available search shortcuts
              </p>
              <ul
                class="results"
                id={this.listboxId}
                role="listbox"
                aria-labelledby={this.listboxLabelId}
                aria-describedby={emptyDescriptionId}
                onClick={this.handleResultsClick}
                onPointerDown={this.handleResultsPointerDown}
              >
                <slot onSlotchange={this.handleSlotChange}></slot>
                {!hasResults && (
                  <li class="empty-state" role="presentation" id={this.emptyStateId}>
                    <wa-icon name="circle-info" aria-hidden="true"></wa-icon>
                    <p>No results found</p>
                  </li>
                )}
              </ul>
            </div>
          )}
        </wa-popup>
        <span class="sr-only" aria-live="polite">
          {this.liveRegionMessage}
        </span>
      </Host>
    );
  }

  private updateLiveRegion(resultCount: number, context?: string) {
    if (!resultCount) {
      this.liveRegionMessage = context ? `No results for ${context}` : 'No results available';
      return;
    }
    const plural = resultCount === 1 ? 'result' : 'results';
    this.liveRegionMessage = context ? `${resultCount} ${plural} for ${context}` : `${resultCount} ${plural} available`;
  }

  private runAfterNextFrame(callback: () => void) {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => callback());
      return;
    }
    setTimeout(callback, 0);
  }
}
