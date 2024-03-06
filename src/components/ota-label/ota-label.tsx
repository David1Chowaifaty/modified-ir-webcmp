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
  @Prop() label: string;
  @Prop() remarks: IOtaNotes[];
  @Prop() maxVisibleItems: number = 3;

  @State() showAll: boolean = false;

  toggleShowAll = () => {
    this.showAll = !this.showAll;
  };

  render() {
    if (!this.remarks) {
      return null;
    }

    const displayedRemarks = this.showAll ? this.remarks : this.remarks.slice(0, this.maxVisibleItems);

    return (
      <Host>
        <strong>{this.label}</strong>
        <ul>
          {displayedRemarks.map((remark, index) => (
            <li key={v4()}>
              - {remark.statement}{' '}
              {this.remarks.length > this.maxVisibleItems && index === displayedRemarks.length - 1 && (
                <button onClick={this.toggleShowAll}>{this.showAll ? locales.entries.Lcz_ShowLess : locales.entries.Lcz_ShowMore}</button>
              )}
            </li>
          ))}
        </ul>
        {/* Show toggle button if there are more remarks than `maxVisibleItems` */}
      </Host>
    );
  }
}
