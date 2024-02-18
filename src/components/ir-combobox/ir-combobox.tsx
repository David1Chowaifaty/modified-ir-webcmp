import { IToast } from '@/components';
import locales from '@/stores/locales.store';
import { Component, Prop, State, h, Element, Event, EventEmitter, Listen, Watch } from '@stencil/core';

@Component({
  tag: 'ir-combobox',
  styleUrl: 'ir-combobox.css',
  scoped: true,
})
export class IrCombobox {
  @Prop({ mutable: true }) data: { id: string; name: string }[] = [];
  @Prop() duration: number = 300;
  @Prop() placeholder: string;
  @Prop() value: string;
  @Prop() autoFocus: boolean = false;

  @State() selectedIndex: number = -1;
  @State() isComboBoxVisible: boolean = false;
  @State() isLoading: boolean = true;
  @State() isItemSelected: boolean;
  @State() inputValue: string = '';
  @State() filteredData: { id: string; name: string }[] = [];

  @Element() el: HTMLElement;
  @Event({ bubbles: true, composed: true }) comboboxValueChange: EventEmitter<{ key: string; data: unknown }>;
  @Event() inputCleared: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;
  @State() componentShouldAutoFocus: boolean = false;
  private inputRef: HTMLInputElement;
  private debounceTimer: any;
  private blurTimout: NodeJS.Timeout;
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
  focusInput() {
    requestAnimationFrame(() => {
      this.inputRef?.focus();
    });
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
    this.selectedIndex = -1;
    this.isComboBoxVisible = false;
  }
  async fetchData() {
    try {
      this.isLoading = true;
      this.filteredData = this.data.filter(d => d.name.toLowerCase().startsWith(this.inputValue));
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
      this.filteredData = this.data;
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
    this.blurTimout = setTimeout(() => {
      if (!this.isItemSelected) {
        this.inputValue = '';
        this.resetCombobox();
      } else {
        this.isItemSelected = false;
      }
    }, 300);
  }
  isDropdownItem(element) {
    return element && element.closest('.combobox');
  }

  disconnectedCallback() {
    clearTimeout(this.debounceTimer);
    clearTimeout(this.blurTimout);
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
    if (!this.isComboBoxVisible) {
      return null;
    }
    return (
      <ul>
        {this.filteredData?.map((d, index) => (
          <li
            role="button"
            key={d.id}
            onKeyDown={e => this.handleItemKeyDown(e, index)}
            data-selected={this.selectedIndex === index}
            tabIndex={0}
            onClick={() => this.selectItem(index)}
          >
            {d.name}
          </li>
        ))}

        {this.filteredData.length === 0 && !this.isLoading && <span class={'text-center'}>{locales.entries.Lcz_NoResultsFound}</span>}
      </ul>
    );
  }
  render() {
    return (
      <fieldset class="m-0 p-0">
        <input
          ref={el => (this.inputRef = el)}
          type="text"
          value={this.value}
          placeholder={this.placeholder}
          class="form-control"
          onKeyDown={this.handleKeyDown.bind(this)}
          onBlur={this.handleBlur.bind(this)}
          onInput={this.handleInputChange.bind(this)}
          onFocus={this.handleFocus.bind(this)}
          autoFocus={this.autoFocus}
        />
        {this.renderDropdown()}
      </fieldset>
    );
  }
}
