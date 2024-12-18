import { Component, Element, h, Prop } from '@stencil/core';

@Component({
  tag: 'ir-phone-combobox',
  styleUrl: 'ir-phone-combobox.css',
  shadow: true,
})
export class IrPhoneCombobox {
  @Element() el: HTMLElement;

  @Prop() options: { id: string | number; value: string | number }[];

  private focusListItem(listItemNode) {
    const id = listItemNode.id;
    input.setAttribute('aria-activedescendant', id);
    listItemNode.focus();
  }

  private selectValue(listItemNode) {
    const value = listItemNode.innerText;
    input.value = value;
    listItemNode.setAttribute('aria-selected', 'true');
    input.removeAttribute('aria-activedescendant');
    input.focus();
    closeDropdown();
  }

  render() {
    return (
      <div class="autocomplete__container" role="combobox" aria-labelledby="autocomplete-label">
        <input role="textbox" aria-expanded="false" aria-controls="autocomplete-results" id="autocomplete-input" class="autocomplete__input" />

        <button aria-label="toggle dropdown" class="autocomplete__dropdown-arrow">
          <svg width="10" height="5" viewBox="0 0 10 5" fill-rule="evenodd">
            <title>Open drop down</title>
            <path d="M10 0L5 5 0 0z"></path>
          </svg>
        </button>
        <ul role="listbox" id="autocomplete-results" class="autocomplete__results">
          {this.options?.map(option => (
            <li key={option.id} class="autocomplete-item" id="autocomplete-item-index" role="listitem" tabindex="0">
              {option.value}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
