import { Component, Host, h } from '@stencil/core';
import { affiliateFormStore, affiliateFormSchemas, updateAffiliateFormField } from '@/stores/affiliate-form.store';

@Component({
  tag: 'ir-affiliate-form',
  styleUrls: ['ir-affiliate-form.css', '../../ir-mpo-management-common.css'],
  scoped: true,
})
export class IrAffiliateForm {
  private store = affiliateFormStore;

  private handleInputChange(field: Parameters<typeof updateAffiliateFormField>[0], value?: string | boolean | null) {
    updateAffiliateFormField(field, value ?? '');
  }

  render() {
    return (
      <Host>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <div class="checkbox-card">
                <ir-checkbox
                  style={{ gap: '0.5rem' }}
                  label="Active"
                  checked={this.store.form.active}
                  onCheckChange={event => this.handleInputChange('active', event.detail)}
                ></ir-checkbox>
                {/* <p class="field-hint">Get updates about your account and important changes</p> */}
              </div>
              <ir-input
                class="mpo-management__input flex-fill"
                label="Code"
                placeholder="Affiliate code"
                labelPosition="side"
                readonly
                value={this.store.form.code}
                onInput-change={ev => this.handleInputChange('code', ev.detail)}
              ></ir-input>

              <ir-validator schema={affiliateFormSchemas.companyName} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Company name"
                  required
                  placeholder="Company name"
                  labelPosition="side"
                  value={this.store.form.companyName}
                  onInput-change={ev => this.handleInputChange('companyName', ev.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator class={'flex-fill'} schema={affiliateFormSchemas.country} valueEvent="select-change" blurEvent="select-blur">
                <ir-native-select
                  class="mpo-management__input flex-fill"
                  label="Country"
                  required
                  labelPosition="side"
                  options={this.store.selects.countries}
                  value={this.store.form.country}
                  onSelect-change={ev => this.handleInputChange('country', ev.detail?.value?.toString() ?? '')}
                ></ir-native-select>
              </ir-validator>

              <ir-validator class={'flex-fill'} schema={affiliateFormSchemas.city} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input mpo-management__input-city flex-fill"
                  label="City"
                  required
                  placeholder="City"
                  labelPosition="side"
                  value={this.store.form.city}
                  onInput-change={ev => this.handleInputChange('city', ev.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator schema={affiliateFormSchemas.address} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Address"
                  required
                  placeholder="Address"
                  labelPosition="side"
                  value={this.store.form.address}
                  onInput-change={ev => this.handleInputChange('address', ev.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator schema={affiliateFormSchemas.phone} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Phone"
                  required
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
                  label="Email"
                  required
                  placeholder="Email"
                  labelPosition="side"
                  value={this.store.form.email}
                  onInput-change={ev => this.handleInputChange('email', ev.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator schema={affiliateFormSchemas.website} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Website"
                  required
                  placeholder="yourdomain.com (without www)"
                  labelPosition="side"
                  value={this.store.form.website}
                  onInput-change={ev => this.handleInputChange('website', ev.detail)}
                ></ir-input>
              </ir-validator>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
