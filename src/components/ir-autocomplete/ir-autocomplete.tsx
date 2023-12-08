import { Component, Host, Prop, State, h, Event, EventEmitter, Listen, Element } from '@stencil/core';
import { v4 } from 'uuid';
import { BookingService } from '../../services/booking.service';

@Component({
  tag: 'ir-autocomplete',
  styleUrl: 'ir-autocomplete.css',
  scoped: true,
})
export class IrAutocomplete {
  @Prop() duration: number = 300;
  @Prop() placeholder: string = '';
  @Prop() propertyId: number;
  @Prop() type: 'email' | 'text' | 'password' | 'number' | 'search' = 'text';
  @Prop() name: string = '';
  @Prop() inputId: string = v4();
  @Prop() required: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() value: string;
  @State() inputValue: string = '';
  @State() data: any[] = [];
  @State() selectedIndex: number = -1;
  @State() isComboBoxVisible: boolean = false;
  @Event({ bubbles: true, composed: true }) comboboxValue: EventEmitter<{ key: string; data: unknown }>;
  @State() isItemSelected: boolean;
  @Element() el: HTMLElement;
  private inputRef: HTMLInputElement;
  private debounceTimer: any;
  private bookingService = new BookingService();
  handleKeyDown(event: KeyboardEvent) {
    const dataSize = this.data.length;
    const itemHeight = this.getHeightOfPElement();
    if (dataSize > 0) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          this.selectedIndex = (this.selectedIndex - 1 + dataSize) % dataSize;
          this.adjustScrollPosition(itemHeight);
          break;
        case 'ArrowDown':
          event.preventDefault();
          this.selectedIndex = (this.selectedIndex + 1) % dataSize;
          this.adjustScrollPosition(itemHeight);
          break;
        case 'Enter':
        case ' ':
        case 'ArrowRight':
          event.preventDefault();
          this.selectItem(this.selectedIndex);
          break;
        case 'Escape':
          this.inputRef?.blur();
          this.isComboBoxVisible = false;
          break;
      }
    }
  }
  getHeightOfPElement() {
    const combobox = this.el.querySelector('.combobox');
    if (combobox) {
      const pItem = combobox.querySelector('p');
      return pItem ? pItem.offsetHeight : 0;
    }
    return 0;
  }
  adjustScrollPosition(itemHeight, visibleHeight = 250) {
    const combobox = this.el.querySelector('.combobox');
    if (combobox) {
      const margin = 2;
      const itemTotalHeight = itemHeight + margin;
      const selectedPosition = itemTotalHeight * this.selectedIndex;
      let newScrollTop = selectedPosition - visibleHeight / 2 + itemHeight / 2;
      newScrollTop = Math.max(0, Math.min(newScrollTop, combobox.scrollHeight - visibleHeight));
      combobox.scrollTo({
        top: newScrollTop,
        behavior: 'auto',
      });
    }
  }

  setInputValue(item) {
    if (item && item.email) {
      this.inputValue = item.email;
    }
  }

  selectItem(index) {
    if (this.data[index]) {
      this.isItemSelected = true;
      this.comboboxValue.emit({ key: 'select', data: this.data[index] });
      this.inputValue = '';
      this.resetCombobox();
    }
  }

  debounceFetchData() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.fetchData();
    }, this.duration);
  }

  async fetchData() {
    try {
      const data = await this.bookingService.fetchExposedGuest(this.inputValue, this.propertyId);
      if (data) {
        this.data = data;
        if (!this.isComboBoxVisible) {
          this.isComboBoxVisible = true;
        }
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  handleInputChange(event: Event) {
    this.inputValue = (event.target as HTMLInputElement).value;
    if (this.inputValue) {
      this.debounceFetchData();
    } else {
      clearTimeout(this.debounceTimer);
      this.resetCombobox(false);
    }
  }

  @Listen('click', { target: 'document' })
  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!this.el.contains(target)) {
      this.isComboBoxVisible = false;
    }
  }
  handleBlur() {
    setTimeout(() => {
      if (this.isDropdownItem(document.activeElement)) {
        return;
      }
      if (!this.isItemSelected) {
        this.comboboxValue.emit({ key: 'blur', data: this.inputValue });
        this.inputValue = '';
        this.resetCombobox();
      } else {
        this.isItemSelected = false;
      }
    }, 200);
  }
  isDropdownItem(element) {
    return element && element.closest('.combobox');
  }

  disconnectedCallback() {
    clearTimeout(this.debounceTimer);
    this.inputRef?.removeEventListener('blur', this.handleBlur);
    this.inputRef?.removeEventListener('click', this.selectItem);
    this.inputRef?.removeEventListener('keydown', this.handleKeyDown);
    this.inputRef?.removeEventListener('focus', this.handleFocus);
  }
  handleItemKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowRight') {
      this.selectItem(index);
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.isComboBoxVisible = false;
      this.inputRef?.blur();
      event.preventDefault();
    } else {
      return;
    }
  }
  renderDropdown() {
    if (this.data.length > 0) {
      return (
        <div class="position-absolute border rounded border-light combobox">
          {this.data.map((d, index) => (
            <p role="button" onKeyDown={e => this.handleItemKeyDown(e, index)} data-selected={this.selectedIndex === index} tabIndex={0} onClick={() => this.selectItem(index)}>
              {`${d.email} - ${d.first_name} ${d.last_name}`}
            </p>
          ))}
        </div>
      );
    }
  }
  handleFocus() {
    this.isComboBoxVisible = true;
  }
  clearInput() {
    this.inputValue = '';
    this.resetCombobox();
  }
  resetCombobox(withblur: boolean = true) {
    if (withblur) {
      this.inputRef?.blur();
    }
    this.data = [];
    this.selectedIndex = -1;
    this.isComboBoxVisible = false;
  }
  render() {
    return (
      <Host>
        <div class={'d-flex align-items-center '}>
          <input
            required={this.required}
            disabled={this.disabled}
            id={this.inputId}
            onKeyDown={this.handleKeyDown.bind(this)}
            class={'form-control input-sm flex-full'}
            type={this.type}
            name={this.name}
            value={this.value || this.inputValue}
            placeholder={this.placeholder}
            onBlur={this.handleBlur.bind(this)}
            onInput={this.handleInputChange.bind(this)}
            onFocus={this.handleFocus.bind(this)}
            ref={el => (this.inputRef = el)}
          />
          {this.inputValue && (
            <button type="button" class={'position-absolute d-flex align-items-center justify-content-center '} onClick={this.clearInput.bind(this)}>
              <p class={'sr-only'}>clear input</p>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          )}
        </div>
        {this.isComboBoxVisible && this.renderDropdown()}
      </Host>
    );
  }
}
