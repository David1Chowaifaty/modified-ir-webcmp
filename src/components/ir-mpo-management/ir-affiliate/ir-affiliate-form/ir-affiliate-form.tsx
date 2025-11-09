import { Component, Host, h } from '@stencil/core';
import { affiliateFormStore, affiliateFormSchemas, updateAffiliateFormField } from '@/stores/affiliate-form.store';

@Component({
  tag: 'ir-affiliate-form',
  styleUrl: 'ir-affiliate-form.css',
  scoped: true,
})
export class IrAffiliateForm {
  private store = affiliateFormStore;

  private handleInputChange(field: Parameters<typeof updateAffiliateFormField>[0], value?: string | null) {
    updateAffiliateFormField(field, value ?? '');
  }

  render() {
    return (
      <Host>
        {/* Panel 1: Status / Code / Company */}
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <div class="mpo-management__country-container">
                <ir-validator class={'flex-fill'} schema={affiliateFormSchemas.active} valueEvent="select-change" blurEvent="select-blur">
                  <ir-native-select
                    class="mpo-management__input flex-fill"
                    label="Active"
                    labelPosition="side"
                    options={[
                      { label: 'Active', value: 'true' },
                      { label: 'Inactive', value: 'false' },
                    ]}
                    value={this.store.form.active}
                    onSelect-change={ev => this.handleInputChange('active', ev.detail?.value?.toString() ?? '')}
                  ></ir-native-select>
                </ir-validator>

                <ir-validator class={'flex-fill'} schema={affiliateFormSchemas.code} valueEvent="input-change" blurEvent="input-blur">
                  <ir-input
                    class="mpo-management__input flex-fill"
                    label="Code"
                    placeholder="Affiliate code"
                    labelPosition="side"
                    value={this.store.form.code}
                    onInput-change={ev => this.handleInputChange('code', ev.detail)}
                  ></ir-input>
                </ir-validator>
              </div>

              <ir-validator schema={affiliateFormSchemas.companyName} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Company name *"
                  placeholder="Company name"
                  labelPosition="side"
                  value={this.store.form.companyName}
                  onInput-change={ev => this.handleInputChange('companyName', ev.detail)}
                ></ir-input>
              </ir-validator>
            </div>
          </div>
        </section>

        {/* Panel 2: Location / Address / Billing-like (Country + City) */}
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <div class="mpo-management__country-container">
                <ir-validator class={'flex-fill'} schema={affiliateFormSchemas.country} valueEvent="select-change" blurEvent="select-blur">
                  <ir-native-select
                    class="mpo-management__input flex-fill"
                    label="Country *"
                    labelPosition="side"
                    options={this.store.selects.countries}
                    value={this.store.form.country}
                    onSelect-change={ev => this.handleInputChange('country', ev.detail?.value?.toString() ?? '')}
                  ></ir-native-select>
                </ir-validator>

                <ir-validator class={'flex-fill'} schema={affiliateFormSchemas.city} valueEvent="input-change" blurEvent="input-blur">
                  <ir-input
                    class="mpo-management__input mpo-management__input-city flex-fill"
                    label="City *"
                    placeholder="City"
                    labelPosition="side"
                    value={this.store.form.city}
                    onInput-change={ev => this.handleInputChange('city', ev.detail)}
                  ></ir-input>
                </ir-validator>
              </div>

              <ir-validator schema={affiliateFormSchemas.address} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Address *"
                  placeholder="Address"
                  labelPosition="side"
                  value={this.store.form.address}
                  onInput-change={ev => this.handleInputChange('address', ev.detail)}
                ></ir-input>
              </ir-validator>
            </div>
          </div>
        </section>

        {/* Panel 3: Contact */}
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <ir-validator schema={affiliateFormSchemas.phone} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Phone *"
                  placeholder="Phone"
                  labelPosition="side"
                  value={this.store.form.phone}
                  onInput-change={ev => this.handleInputChange('phone', ev.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator schema={affiliateFormSchemas.email} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  type="email"
                  label="Email *"
                  placeholder="Email"
                  labelPosition="side"
                  value={this.store.form.email}
                  onInput-change={ev => this.handleInputChange('email', ev.detail)}
                ></ir-input>
              </ir-validator>
            </div>
          </div>
        </section>

        {/* Panel 4: Website / CTA color / Logo */}
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <ir-validator schema={affiliateFormSchemas.website} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Website *"
                  placeholder="yourdomain.com (without www)"
                  labelPosition="side"
                  value={this.store.form.website}
                  onInput-change={ev => this.handleInputChange('website', ev.detail)}
                ></ir-input>
              </ir-validator>

              {/* <ir-validator schema={affiliateFormSchemas.ctaColor} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  type="color"
                  label="Call-to-action button color *"
                  placeholder="#000000"
                  labelPosition="side"
                  value={this.store.form.ctaColor}
                  onInput-change={ev => this.handleInputChange('ctaColor', ev.detail)}
                ></ir-input>
              </ir-validator> */}

              {/* <ir-validator schema={affiliateFormSchemas.logo} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  type="file"
                  label="Logo"
                  placeholder="Upload logo"
                  labelPosition="side"
                  value={this.store.form.logo}
                  onInput-change={ev => this.handleInputChange('logo', ev.detail)}
                ></ir-input>
              </ir-validator> */}
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
