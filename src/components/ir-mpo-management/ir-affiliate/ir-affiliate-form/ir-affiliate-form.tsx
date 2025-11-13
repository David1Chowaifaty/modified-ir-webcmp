import { Component, Host, h } from '@stencil/core';
import { affiliateFormSchemas, mpoManagementStore, updateAffiliateFormField } from '@/stores/mpo-management.store';

@Component({
  tag: 'ir-affiliate-form',
  styleUrls: ['ir-affiliate-form.css', '../../ir-mpo-management-common.css'],
  scoped: true,
})
export class IrAffiliateForm {
  private store = mpoManagementStore;

  private handleInputChange(field: Parameters<typeof updateAffiliateFormField>[0], value?: string | boolean | null) {
    updateAffiliateFormField(field, value ?? '');
  }

  render() {
    const { affiliateNewForm, selects } = this.store;
    return (
      <Host>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <div class="form-switch-row">
                <span>Active</span>
                <ir-switch checked={affiliateNewForm.active} onCheckChange={event => this.handleInputChange('active', event.detail)}></ir-switch>
              </div>
              <ir-input
                class="mpo-management__input flex-fill"
                label="Code"
                placeholder="Affiliate code"
                labelPosition="side"
                readonly
                value={affiliateNewForm.code}
                onInput-change={ev => this.handleInputChange('code', ev.detail)}
              ></ir-input>

              <ir-validator schema={affiliateFormSchemas.companyName} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input"
                  label="Company name"
                  required
                  placeholder="Company name"
                  labelPosition="side"
                  value={affiliateNewForm.companyName}
                  onInput-change={ev => this.handleInputChange('companyName', ev.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator class={'flex-fill'} schema={affiliateFormSchemas.country} valueEvent="select-change" blurEvent="select-blur">
                <ir-native-select
                  class="mpo-management__input flex-fill"
                  label="Country"
                  required
                  labelPosition="side"
                  options={[{ label: 'Select a country', value: '' }, ...selects.countries.map(c => ({ label: c.name, value: c.id.toString() }))]}
                  value={affiliateNewForm.country}
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
                  value={affiliateNewForm.city}
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
                  value={affiliateNewForm.address}
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
                  value={affiliateNewForm.phone}
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
                  value={affiliateNewForm.email}
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
                  value={affiliateNewForm.website}
                  onInput-change={ev => this.handleInputChange('website', ev.detail)}
                ></ir-input>
              </ir-validator>
              <ir-validator schema={affiliateFormSchemas.ctaColor} valueEvent="color-change" blurEvent="input-blur">
                <ir-color-picker
                  onColor-change={e => this.handleInputChange('ctaColor', e.detail.value)}
                  class="mpo-management__input picker"
                  label="Call-to-action button color"
                  required
                  value={affiliateNewForm.website}
                ></ir-color-picker>
              </ir-validator>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
