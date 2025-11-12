import { colorVariants } from '@/components/ui/ir-icons/icons';
import { IToast } from '@/components/ui/ir-toast/toast';
import { mpoManagementStore, removeMarketPlace } from '@/stores/mpo-management.store';
import { Component, Event, EventEmitter, Host, State, h } from '@stencil/core';

@Component({
  tag: 'ir-marketplace',
  styleUrls: ['ir-marketplace.css', '../../../common/table.css'],
  scoped: true,
})
export class IrMarketplace {
  @State() selectedCountry: string;
  @State() selectedMarketplace: string;

  @Event() toast: EventEmitter<IToast>;

  private store = mpoManagementStore;

  private async addMarketPlace(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    // this.marketPlaces = [...this.marketPlaces, { country: this.selectedCountry, marketplace: this.selectedMarketplace }];
    this.toast.emit({
      position: 'top-right',
      title: 'Marketplace was saved successfully',
      description: '',
      type: 'success',
    });
  }

  render() {
    const marketPlaces = this.selectedCountry
      ? this.store.selects.marketPlaces.find(m => m.id.toString() === this.selectedCountry)?.market_places?.map(mp => ({ label: mp.name, value: mp.id.toString() }))
      : [];
    return (
      <Host>
        {/* <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1b2a4b' }}>Marketplaces</p> */}
        <div class={'d-flex align-items-center mb-1'} style={{ gap: '0.5rem' }}>
          <ir-native-select
            class="flex-fill"
            onSelect-change={e => (this.selectedCountry = e.detail.value.toString())}
            options={[{ label: 'Select a country', value: '' }, ...this.store.selects.marketPlaces.map(m => ({ label: m.name, value: m.id }))]}
          ></ir-native-select>

          <ir-native-select
            class="flex-fill"
            disabled={!this.selectedCountry}
            onSelect-change={e => (this.selectedMarketplace = e.detail.value.toString())}
            options={[{ label: 'Select a marketplace', value: '' }, ...marketPlaces]}
          ></ir-native-select>

          <ir-button onClickHandler={this.addMarketPlace.bind(this)} btn_disabled={!this.selectedCountry && !this.selectedMarketplace} variant="icon" icon_name="plus"></ir-button>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Marketplace</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {this.store.marketPlaces.length === 0 && (
              <tr class={'ir-table-row'}>
                <td colSpan={3} class="text-center">
                  No data
                </td>
              </tr>
            )}
            {this.store.marketPlaces.map(m => {
              const country = this.store.selects.marketPlaces.find(c => c.id.toString() === m.country_id.toString());
              return (
                <tr class={'ir-table-row'}>
                  <td>{country?.name}</td>
                  <td>{m?.name}</td>
                  <td>
                    <ir-button
                      class="payment-item__action-button"
                      onClickHandler={() => {
                        removeMarketPlace(m.id);
                      }}
                      variant="icon"
                      style={colorVariants.danger}
                      icon_name="trash"
                    ></ir-button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Host>
    );
  }
}
