import { Component, Host, h, Prop, State, Event, EventEmitter, Element, Listen } from '@stencil/core';

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type ComboboxType = 'select' | 'editable' | 'multiselect';

@Component({
  tag: 'ir-m-combobox',
  styleUrl: 'ir-m-combobox.css',
  scoped: true,
})
export class IrMCombobox {
  @Element() el: HTMLElement;

  @Prop() type: ComboboxType = 'select';
  @Prop() label: string = '';
  @Prop() placeholder: string = '';
  @Prop() options: ComboboxOption[] = [];
  @Prop() value: string | string[] = '';
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;

  @State() isOpen: boolean = false;
  @State() activeOptionIndex: number = -1;
  @State() inputValue: string = '';
  @State() selectedOptions: ComboboxOption[] = [];

  @Event() irChange: EventEmitter<string | string[]>;
  @Event() irInput: EventEmitter<string>;
  @Event() irFocus: EventEmitter<void>;
  @Event() irBlur: EventEmitter<void>;

  private comboboxId = `combo-${Math.random().toString(36).substr(2, 9)}`;
  private listboxId = `listbox-${this.comboboxId}`;
  private labelId = `label-${this.comboboxId}`;

  componentWillLoad() {
    this.initializeValue();
  }

  @Listen('click', { target: 'document' })
  handleDocumentClick(event: Event) {
    if (!this.el.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  @Listen('keydown')
  handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.selectCurrentOption();
        break;
      case 'Escape':
        this.isOpen = false;
        break;
    }
  }

  private initializeValue() {
    if (this.type === 'multiselect' && Array.isArray(this.value)) {
      this.selectedOptions = this.options.filter(option => 
        (this.value as string[]).includes(option.value)
      );
    } else if (typeof this.value === 'string') {
      this.inputValue = this.value;
      const selectedOption = this.options.find(option => option.value === this.value);
      if (selectedOption && this.type === 'multiselect') {
        this.selectedOptions = [selectedOption];
      }
    }
  }

  private navigateOptions(direction: number) {
    if (!this.isOpen) {
      this.isOpen = true;
      return;
    }

    const newIndex = this.activeOptionIndex + direction;
    if (newIndex >= 0 && newIndex < this.options.length) {
      this.activeOptionIndex = newIndex;
    }
  }

  private selectCurrentOption() {
    if (this.activeOptionIndex >= 0 && this.activeOptionIndex < this.options.length) {
      this.selectOption(this.options[this.activeOptionIndex]);
    }
  }

  private selectOption(option: ComboboxOption) {
    if (option.disabled) return;

    if (this.type === 'multiselect') {
      const isSelected = this.selectedOptions.some(selected => selected.value === option.value);
      if (isSelected) {
        this.selectedOptions = this.selectedOptions.filter(selected => selected.value !== option.value);
      } else {
        this.selectedOptions = [...this.selectedOptions, option];
      }
      this.irChange.emit(this.selectedOptions.map(opt => opt.value));
    } else {
      this.inputValue = option.label;
      this.isOpen = false;
      this.irChange.emit(option.value);
    }
  }

  private handleInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.inputValue = target.value;
    this.irInput.emit(this.inputValue);
    
    if (!this.isOpen) {
      this.isOpen = true;
    }
  }

  private handleInputFocus() {
    this.irFocus.emit();
    if (this.type !== 'editable' || this.options.length > 0) {
      this.isOpen = true;
    }
  }

  private handleInputBlur() {
    this.irBlur.emit();
  }

  private toggleCombobox() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
    }
  }

  private removeSelectedOption(option: ComboboxOption) {
    this.selectedOptions = this.selectedOptions.filter(selected => selected.value !== option.value);
    this.irChange.emit(this.selectedOptions.map(opt => opt.value));
  }

  private getFilteredOptions() {
    if (this.type !== 'editable' || !this.inputValue) {
      return this.options;
    }
    return this.options.filter(option => 
      option.label.toLowerCase().includes(this.inputValue.toLowerCase())
    );
  }

  render() {
    const filteredOptions = this.getFilteredOptions();

    return (
      <Host>
        {this.label && (
          <label id={this.labelId} class="combo-label">
            {this.label}
          </label>
        )}

        {this.type === 'multiselect' && this.selectedOptions.length > 0 && (
          <ul class="selected-options">
            {this.selectedOptions.map(option => (
              <li key={option.value}>
                <button
                  type="button"
                  class="remove-option"
                  onClick={() => this.removeSelectedOption(option)}
                  aria-label={`Remove ${option.label}`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div class={`combo ${this.isOpen ? 'open' : ''}`}>
          {this.type === 'select' ? (
            <div
              id={this.comboboxId}
              class="combo-input"
              role="combobox"
              aria-expanded={this.isOpen.toString()}
              aria-haspopup="listbox"
              aria-controls={this.listboxId}
              aria-labelledby={this.label ? this.labelId : undefined}
              tabindex={this.disabled ? -1 : 0}
              onClick={() => this.toggleCombobox()}
              onFocus={() => this.handleInputFocus()}
              onBlur={() => this.handleInputBlur()}
            >
              {this.inputValue || this.placeholder}
            </div>
          ) : (
            <input
              id={this.comboboxId}
              class="combo-input"
              type="text"
              role="combobox"
              aria-expanded={this.isOpen.toString()}
              aria-haspopup="listbox"
              aria-controls={this.listboxId}
              aria-labelledby={this.label ? this.labelId : undefined}
              value={this.inputValue}
              placeholder={this.placeholder}
              disabled={this.disabled}
              readonly={this.readonly}
              onInput={(e) => this.handleInputChange(e)}
              onFocus={() => this.handleInputFocus()}
              onBlur={() => this.handleInputBlur()}
            />
          )}

          {this.isOpen && (
            <div class="combo-menu" role="listbox" id={this.listboxId}>
              {filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  class={`combo-option ${index === this.activeOptionIndex ? 'option-current' : ''} ${
                    this.type === 'multiselect' && this.selectedOptions.some(selected => selected.value === option.value) 
                      ? 'option-selected' 
                      : ''
                  }`}
                  role="option"
                  aria-selected={
                    this.type === 'multiselect' 
                      ? this.selectedOptions.some(selected => selected.value === option.value).toString()
                      : (this.inputValue === option.label).toString()
                  }
                  onClick={() => this.selectOption(option)}
                >
                  {option.label}
                </div>
              ))}
              {filteredOptions.length === 0 && (
                <div class="combo-option">No options available</div>
              )}
            </div>
          )}
        </div>
      </Host>
    );
  }
}
