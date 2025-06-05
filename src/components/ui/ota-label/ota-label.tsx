import { Component, Host, Prop, State, h } from '@stencil/core';
import { v4 } from 'uuid';
import { IOtaNotes } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
@Component({
  tag: 'ota-label',
  styleUrl: 'ota-label.css',
  scoped: true,
})
export class OtaLabel {
  /**
   * Label displayed as the section title.
   */
  @Prop() label: string;

  /**
   * Array of OTA notes to display in the list.
   */
  @Prop() remarks: IOtaNotes[];

  /**
   * Maximum number of remarks to display before showing the "Show More" button.
   */
  @Prop() maxVisibleItems: number = 3;

  /**
   * Internal state that determines whether all remarks are shown or only the limited number.
   */
  @State() showAll: boolean = false;

  /**
   * Toggles between showing all remarks or only a limited number.
   *
   * Example:
   * ```ts
   * this.toggleShowAll(); // flips showAll state
   * ```
   */
  private toggleShowAll = () => {
    this.showAll = !this.showAll;
  };

  render() {
    if (!this.remarks) {
      return null;
    }

    const displayedRemarks = this.showAll ? this.remarks : this.remarks.slice(0, this.maxVisibleItems);

    return (
      <Host>
        <p class={'label_title'}>{this.label}</p>
        <ul class="ota-message-list">
          {displayedRemarks.map((remark, index) => (
            <li key={v4()} class="ota-message-item">
              {remark.statement}{' '}
              {this.remarks.length > this.maxVisibleItems && index === displayedRemarks.length - 1 && (
                <button class="ota-visibility-toggle" onClick={this.toggleShowAll}>
                  {this.showAll ? locales.entries.Lcz_ShowLess : locales.entries.Lcz_ShowMore}
                </button>
              )}
            </li>
          ))}
        </ul>
        {/* Show toggle button if there are more remarks than `maxVisibleItems` */}
      </Host>
    );
  }
}
