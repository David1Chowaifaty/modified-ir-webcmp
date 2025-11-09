import { Component, Host, h } from '@stencil/core';
import { mpoCoreDetailSchemas, mpoManagementStore, updateMpoManagementField } from '@/stores/mpo-management.store';

@Component({
  tag: 'ir-mpo-core-details',
  styleUrls: ['ir-mpo-core-details.css', '../ir-mpo-management-common.css'],
  scoped: true,
})
export class IrMpoCoreDetails {
  private store = mpoManagementStore;

  private handleInputChange(field: Parameters<typeof updateMpoManagementField>[0], value?: string | null) {
    updateMpoManagementField(field, value ?? '');
  }
  render() {
    return (
      <Host>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <ir-validator schema={mpoCoreDetailSchemas.companyName} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  placeholder="Company name"
                  label="Company name *"
                  labelPosition="side"
                  value={this.store.form.companyName}
                  onInput-change={event => this.handleInputChange('companyName', event.detail)}
                ></ir-input>
              </ir-validator>
              <div>
                <div class="mpo-management__credentials-container">
                  <ir-validator class={'flex-fill'} schema={mpoCoreDetailSchemas.username} valueEvent="input-change" blurEvent="input-blur">
                    <ir-input
                      class="mpo-management__input "
                      label="Credentials *"
                      placeholder="Username"
                      labelPosition="side"
                      value={this.store.form.username}
                      onInput-change={event => this.handleInputChange('username', event.detail)}
                    ></ir-input>
                  </ir-validator>

                  <ir-validator class={'flex-fill'} schema={mpoCoreDetailSchemas.password} valueEvent="input-change" blurEvent="input-blur">
                    <ir-input
                      class="mpo-management__input mpo-management__input-password "
                      label="Password *"
                      type="password"
                      placeholder="Password"
                      value={this.store.form.password}
                      onInput-change={event => this.handleInputChange('password', event.detail)}
                      labelPosition="side"
                    ></ir-input>
                  </ir-validator>
                </div>
                <div class={'d-flex justify-content-end'}>
                  {this.store.form.password && <ir-password-validator password={this.store.form.password} style={{ marginLeft: 'calc(130px + 0.5rem)' }}></ir-password-validator>}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <div class="mpo-management__country-container">
                <ir-validator class={'flex-fill'} schema={mpoCoreDetailSchemas.country} valueEvent="select-change" blurEvent="select-blur">
                  <ir-native-select
                    label="Country *"
                    class="mpo-management__input flex-fill"
                    options={this.store.selects.countries}
                    value={this.store.form.country}
                    onSelect-change={event => this.handleInputChange('country', event.detail?.value?.toString() ?? '')}
                    labelPosition="side"
                  ></ir-native-select>
                </ir-validator>

                <ir-validator class={'flex-fill'} schema={mpoCoreDetailSchemas.city} valueEvent="input-change" blurEvent="input-blur">
                  <ir-input
                    class="mpo-management__input mpo-management__input-city flex-fill"
                    label="City"
                    placeholder="City"
                    labelPosition="side"
                    value={this.store.form.city}
                    onInput-change={event => this.handleInputChange('city', event.detail)}
                  ></ir-input>
                </ir-validator>
              </div>
              <ir-validator schema={mpoCoreDetailSchemas.billingCurrency} valueEvent="select-change" blurEvent="select-blur">
                <ir-native-select
                  onSelect-change={event => this.handleInputChange('billingCurrency', event.detail as any)}
                  class="mpo-management__input"
                  label="Billing *"
                  labelPosition="side"
                  options={[{ label: 'Select...', value: '' }]}
                ></ir-native-select>
              </ir-validator>
              <ir-validator schema={mpoCoreDetailSchemas.address} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  label="Address *"
                  labelPosition="side"
                  placeholder="Address"
                  value={this.store.form.address}
                  onInput-change={event => this.handleInputChange('address', event.detail)}
                ></ir-input>
              </ir-validator>
            </div>
          </div>
        </section>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <ir-validator schema={mpoCoreDetailSchemas.mainContact} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  placeholder="Main contact"
                  label="Main contact *"
                  labelPosition="side"
                  value={this.store.form.mainContact}
                  onInput-change={event => this.handleInputChange('mainContact', event.detail)}
                ></ir-input>
              </ir-validator>
              <ir-validator schema={mpoCoreDetailSchemas.email} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  type="email"
                  label="Email *"
                  placeholder="Email"
                  labelPosition="side"
                  value={this.store.form.email}
                  onInput-change={event => this.handleInputChange('email', event.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator schema={mpoCoreDetailSchemas.phone} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  label="Phone *"
                  placeholder="Phone"
                  labelPosition="side"
                  value={this.store.form.phone}
                  onInput-change={event => this.handleInputChange('phone', event.detail)}
                ></ir-input>
              </ir-validator>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
