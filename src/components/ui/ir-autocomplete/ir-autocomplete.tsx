import { Component, Host, Prop, State, h, Event, EventEmitter, Listen, Element, Fragment } from '@stencil/core';
import { v4 } from 'uuid';
import { BookingService } from '../../../services/booking.service';
import { IToast } from '../ir-toast/toast';
import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-autocomplete',
  styleUrl: 'ir-autocomplete.css',
  scoped: true,
})
export class IrAutocomplete {
  @Prop() duration: number = 300;
  @Prop() placeholder: string = '';
  @Prop() propertyId: number;
  @Prop() isSplitBooking: boolean = false;
  @Prop() type: 'email' | 'text' | 'password' | 'number' | 'search' = 'text';
  @Prop() name: string = '';
  @Prop() inputId: string = v4();
  @Prop() required: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() value: string;
  @Prop() from_date: string = '';
  @Prop() to_date: string = '';
  @Prop() danger_border: boolean;

  @State() inputValue: string = '';
  @State() data: any[] = [];
  @State() selectedIndex: number = -1;
  @State() isComboBoxVisible: boolean = false;
  @State() isLoading: boolean = true;
  @State() isItemSelected: boolean;
  @State() inputFocused: boolean = false;

  @Event({ bubbles: true, composed: true }) comboboxValue: EventEmitter<{ key: string; data: unknown }>;
  @Event() inputCleared: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;

  @Element() el: HTMLElement;
  private inputRef: HTMLInputElement;
  private debounceTimer: any;
  private bookingService = new BookingService();
  private no_result_found = '';
  componentWillLoad() {
    this.no_result_found = locales.entries.Lcz_NoResultsFound;
  }

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
      this.isLoading = true;
      let data = [];
      if (!this.isSplitBooking) {
        data = await this.bookingService.fetchExposedGuest(this.inputValue, this.propertyId);
      } else {
        if (this.inputValue.split(' ').length === 1) {
          data = await this.bookingService.fetchExposedBookings(this.inputValue, this.propertyId, this.from_date, this.to_date);
        }
      }
      this.data = data;
      if (!this.isComboBoxVisible) {
        this.isComboBoxVisible = true;
      }
    } catch (error) {
      console.log('error', error);
    } finally {
      this.isLoading = false;
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
    this.inputFocused = false;
    setTimeout(() => {
      if (this.isDropdownItem(document.activeElement)) {
        return;
      }
      if (this.isSplitBooking) {
        if (!this.isItemSelected) {
          if (this.data.length > 0) {
            this.comboboxValue.emit({ key: 'blur', data: this.inputValue });
          } else {
            if (this.inputValue !== '') {
              this.toast.emit({
                type: 'error',
                description: '',
                title: `The Booking #${this.inputValue} is not Available`,
                position: 'top-right',
              });
              this.inputCleared.emit();
            }
          }
          this.inputValue = '';
          this.resetCombobox();
        } else {
          this.isItemSelected = false;
        }
      } else {
        if (!this.isItemSelected) {
          this.comboboxValue.emit({ key: 'blur', data: this.inputValue });
          this.inputValue = '';
          this.resetCombobox();
        } else {
          this.isItemSelected = false;
        }
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
    if (this.inputValue !== '') {
      return (
        <div class={`position-absolute border rounded combobox`}>
          {this.data?.map((d, index) => (
            <p role="button" onKeyDown={e => this.handleItemKeyDown(e, index)} data-selected={this.selectedIndex === index} tabIndex={0} onClick={() => this.selectItem(index)}>
              {this.isSplitBooking ? (
                <Fragment>{`${d.booking_nbr} ${d.guest.first_name} ${d.guest.last_name}`}</Fragment>
              ) : (
                <div class={'d-flex align-items-center flex-fill'}>
                  <p class={'p-0 m-0'}>
                    {`${d.email}`} <span class={'p-0 m-0'}>{` - ${d.first_name} ${d.last_name}`}</span>
                  </p>
                </div>
              )}
            </p>
          ))}
          {this.isLoading && (
            <div class="loader-container d-flex align-items-center justify-content-center">
              <div class="loader"></div>
            </div>
          )}
          {this.data.length === 0 && !this.isLoading && <span class={'text-center'}>{this.no_result_found}</span>}
        </div>
      );
    }
  }
  handleFocus() {
    this.isComboBoxVisible = true;
    this.inputFocused = true;
  }
  clearInput() {
    this.inputValue = '';
    this.resetCombobox();
    this.inputCleared.emit(null);
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
          <label data-state={this.inputFocused ? 'focused' : 'blured'} htmlFor={this.inputId} class={`form-control input-sm ${this.danger_border && 'border-danger'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 512 512">
              <path
                fill="currentColor"
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
              />
            </svg>
          </label>
          <input
            required={this.required}
            disabled={this.disabled}
            id={this.inputId}
            onKeyDown={this.handleKeyDown.bind(this)}
            class={`form-control input-sm flex-full ${this.danger_border && 'border-danger'}`}
            type={this.type}
            name={this.name}
            value={this.value || this.inputValue}
            placeholder={this.placeholder}
            onBlur={this.handleBlur.bind(this)}
            autoComplete="none"
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
