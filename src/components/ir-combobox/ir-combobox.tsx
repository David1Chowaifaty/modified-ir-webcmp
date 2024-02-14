import { IToast } from '@/components';
import { Component, Prop, State, h, Element, Event, EventEmitter, Listen } from '@stencil/core';

@Component({
  tag: 'ir-combobox',
  styleUrl: 'ir-combobox.css',
  scoped: true,
})
export class IrCombobox {
  @Prop({ mutable: true }) data: { id: number; name: string }[] = [];
  @Prop() duration: number = 300;

  @State() selectedIndex: number = -1;
  @State() isComboBoxVisible: boolean = false;
  @State() isLoading: boolean = true;
  @State() isItemSelected: boolean;
  @State() inputValue: string = '';

  @Element() el: HTMLElement;
  @Event({ bubbles: true, composed: true }) comboboxValue: EventEmitter<{ key: string; data: unknown }>;
  @Event() inputCleared: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;
  private inputRef: HTMLInputElement;
  private debounceTimer: any;

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
      // this.comboboxValue.emit({ key: 'select', data: this.data[index] });
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
  handleFocus() {
    this.isComboBoxVisible = true;
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
  async fetchData() {
    try {
      this.isLoading = true;
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
    setTimeout(() => {
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
  render() {
    return (
      <fieldset class="m-0 p-0">
        <input type="text" class="form-control" />
        <ul class="">
          <p>Room 1</p>
        </ul>
      </fieldset>
    );
  }
}
