import { IToast } from '@/components';
import locales from '@/stores/locales.store';
import { Component, Prop, State, h, Element, Event, EventEmitter, Listen, Watch, Fragment } from '@stencil/core';
import { v4 } from 'uuid';

export type ComboboxItem = { id: string; name: string; image?: string; occupancy?: number };
@Component({
  tag: 'ir-combobox',
  styleUrl: 'ir-combobox.css',
  scoped: true,
})
export class IrCombobox {
  @Element() el: HTMLElement;

  /**
   * The list of items displayed in the combobox.
   */
  @Prop({ mutable: true }) data: ComboboxItem[] = [];

  /**
   * Debounce duration in milliseconds for search input.
   */
  @Prop() duration: number = 300;

  /**
   * Placeholder text for the input field.
   */
  @Prop() placeholder: string;

  /**
   * The current value of the input field.
   */
  @Prop() value: string;

  /**
   * Disables the combobox input when set to true.
   */
  @Prop() disabled: boolean = false;

  /**
   * Autofocuses the input field when true.
   */
  @Prop() autoFocus: boolean = false;

  /**
   * Unique identifier for the input element.
   */
  @Prop() input_id: string = v4();

  /**
   * The index of the currently selected item.
   */
  @State() selectedIndex: number = -1;

  /**
   * Tracks the actual focused index during keyboard navigation.
   */
  @State() actualIndex: number = -1;

  /**
   * Whether the dropdown is visible.
   */
  @State() isComboBoxVisible: boolean = false;

  /**
   * Indicates if the component is in loading state.
   */
  @State() isLoading: boolean = true;

  /**
   * Whether a selection was made before blur.
   */
  @State() isItemSelected: boolean;

  /**
   * The current input value typed by the user.
   */
  @State() inputValue: string = '';

  /**
   * Filtered list based on user input.
   */
  @State() filteredData: ComboboxItem[] = [];

  /**
   * Determines if the input should automatically receive focus.
   */
  @State() componentShouldAutoFocus: boolean = false;

  /**
   * Emitted when a selection is made from the combobox.
   */
  @Event({ bubbles: true, composed: true }) comboboxValueChange: EventEmitter<{ key: string; data: unknown }>;

  /**
   * Emitted when the input is cleared by the user.
   */
  @Event() inputCleared: EventEmitter<null>;

  /**
   * Emits a toast notification.
   */
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;

  private inputRef: HTMLInputElement;
  private debounceTimer: any;
  private blurTimeout: NodeJS.Timeout;

  componentWillLoad() {
    this.filteredData = this.data;
  }

  componentDidLoad() {
    if (this.autoFocus) {
      this.focusInput();
    }
  }

  @Watch('isComboBoxVisible')
  watchHandler(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue && newValue === true) {
      this.focusInput();
    }
  }
  @Listen('click', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.el.contains(target)) {
      this.isComboBoxVisible = false;
    }
  }
  disconnectedCallback() {
    clearTimeout(this.debounceTimer);
    clearTimeout(this.blurTimeout);
    this.inputRef?.removeEventListener('blur', this.handleBlur);
    this.inputRef?.removeEventListener('click', this.selectItem);
    this.inputRef?.removeEventListener('keydown', this.handleKeyDown);
    this.inputRef?.removeEventListener('focus', this.handleFocus);
  }

  /**
   * Handles keyboard navigation and selection inside the combobox.
   */
  private handleKeyDown(event: KeyboardEvent) {
    const dataSize = this.filteredData.length;
    if (dataSize > 0) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + dataSize) % dataSize;
          this.adjustScrollPosition();
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % dataSize;
          this.adjustScrollPosition();
          break;
        // case 'Enter':
        // case ' ':
        // case 'ArrowRight':
        //   event.preventDefault();
        //   this.selectItem(this.selectedIndex);
        //   break;
        case 'Escape':
          event.stopImmediatePropagation();
          event.stopPropagation();
          this.inputRef?.blur();
          this.isComboBoxVisible = false;
          break;
      }
    }
  }
  /**
   * Focuses the combobox input element.
   */
  private focusInput() {
    requestAnimationFrame(() => {
      this.inputRef?.focus();
    });
  }
  /**
   * Scrolls the selected item into view when navigating.
   */
  private adjustScrollPosition() {
    const selectedItem = this.el?.querySelector(`[data-selected]`);
    if (!selectedItem) return;
    selectedItem.scrollIntoView({
      block: 'center',
    });
  }
  /**
   * Selects an item at the given index.
   */
  private selectItem(index) {
    if (this.filteredData[index]) {
      this.isItemSelected = true;
      this.comboboxValueChange.emit({ key: 'select', data: this.filteredData[index].id });
      this.inputValue = '';
      this.resetCombobox();
      if (this.autoFocus) {
        this.focusInput();
      }
    }
  }
  /**
   * Debounces calls to the fetch data function.
   */
  private debounceFetchData() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fetchData();
    }, this.duration);
  }
  /**
   * Makes the dropdown visible on input focus.
   */
  private handleFocus() {
    this.isComboBoxVisible = true;
  }
  /**
   * Resets the combobox state and optionally blurs the input.
   */
  private resetCombobox(withBlur: boolean = true) {
    if (withBlur) {
      this.inputRef?.blur();
    }
    this.selectedIndex = -1;
    this.isComboBoxVisible = false;
  }
  /**
   * Filters data based on input value.
   */
  private async fetchData() {
    try {
      this.isLoading = true;
      this.filteredData = this.data.filter(d => d.name.toLowerCase().startsWith(this.inputValue));
      this.selectedIndex = -1;
    } catch (error) {
      console.log('error', error);
    } finally {
      this.isLoading = false;
    }
  }
  /**
   * Updates input value and triggers search.
   */
  private handleInputChange(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;
    if (this.inputValue) {
      this.debounceFetchData();
    } else {
      this.filteredData = this.data;
    }
  }

  /**
   * Clears input or resets dropdown if nothing selected on blur.
   */
  private handleBlur() {
    this.blurTimeout = setTimeout(() => {
      if (!this.isItemSelected) {
        this.inputValue = '';
        this.resetCombobox();
      } else {
        this.isItemSelected = false;
      }
    }, 300);
  }

  /**
   * Handles key navigation on individual items.
   */
  private handleItemKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      this.selectItem(index);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.isComboBoxVisible = false;
      this.inputRef?.blur();
      event.preventDefault();
    }
  }
  /**
   * Renders the dropdown list.
   */
  private renderDropdown() {
    if (!this.isComboBoxVisible) {
      return null;
    }
    return (
      <ul data-position={this.filteredData.length > 0 && this.filteredData[0].occupancy ? 'bottom-right' : 'bottom-left'}>
        {this.filteredData?.map((d, index) => (
          <li
            onMouseEnter={() => (this.selectedIndex = index)}
            role="button"
            key={d.id}
            onKeyDown={e => this.handleItemKeyDown(e, index)}
            data-selected={this.selectedIndex === index}
            tabIndex={0}
            onClick={() => this.selectItem(index)}
          >
            {d.image && <img src={d.image} class={'list-item-image'}></img>}
            <p>{d.name}</p>
            {d.occupancy && (
              <Fragment>
                <svg xmlns="http://www.w3.org/2000/svg" height="14" width="12.25" viewBox="0 0 448 512">
                  <path
                    fill={'currentColor'}
                    d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
                  />
                </svg>
                <p>{d.occupancy}</p>
              </Fragment>
            )}
          </li>
        ))}

        {this.filteredData.length === 0 && !this.isLoading && <span class={'text-center'}>{locales.entries.Lcz_NoResultsFound}</span>}
      </ul>
    );
  }
  /**
   * Handles form submission by selecting the highlighted item.
   */
  private handleSubmit(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    console.log('object');
    if (!this.filteredData.length) {
      return;
    }
    this.selectItem(this.selectedIndex === -1 ? 0 : this.selectedIndex);
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)} class="m-0 p-0">
        <input
          type="text"
          class="form-control bg-white"
          id={this.input_id}
          ref={el => (this.inputRef = el)}
          disabled={this.disabled}
          value={this.value}
          placeholder={this.placeholder}
          onKeyDown={this.handleKeyDown.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          onInput={this.handleInputChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          autoFocus={this.autoFocus}
        />

        {this.renderDropdown()}
      </form>
    );
  }
}
