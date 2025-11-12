import { Component, Host, State, h, writeTask } from '@stencil/core';
import { mpoCoreDetailSchemas, MpoManagementForm, mpoManagementStore, RootMpoFields, updateMpoManagementField } from '@/stores/mpo-management.store';

@Component({
  tag: 'ir-mpo-core-details',
  styleUrls: ['ir-mpo-core-details.css', '../ir-mpo-management-common.css'],
  scoped: true,
})
export class IrMpoCoreDetails {
  private store = mpoManagementStore;
  @State() isPasswordValid: boolean = false;

  private handleInputChange(field: Parameters<typeof updateMpoManagementField>[0], value?: string | null) {
    updateMpoManagementField(field, value ?? '');
  }

  private handlePasswordValidationChange = (event: CustomEvent<boolean>) => {
    const nextValue = event.detail;
    if (this.isPasswordValid === nextValue) {
      return;
    }
    writeTask(() => {
      this.isPasswordValid = nextValue;
    });
  };
  private updateTextField<Field extends Exclude<RootMpoFields, 'companyLogo' | 'receiveNotificationOnEmail'>>(field: Field, value: string | null) {
    updateMpoManagementField(field, (value ?? '') as MpoManagementForm[Field]);
  }

  private toggleReceiveNotification(checked: boolean) {
    updateMpoManagementField('receiveNotificationOnEmail', checked);
  }
  render() {
    console.log(this.store.form);
    return (
      <Host>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-body">
            <div class="form-grid">
              <ir-validator schema={mpoCoreDetailSchemas.companyName} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  placeholder="Company name"
                  label="Company name"
                  required
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
                      required
                      label="Credentials "
                      readonly
                      placeholder="Username"
                      labelPosition="side"
                      value={this.store.form.username}
                    ></ir-input>
                  </ir-validator>

                  <ir-validator class={'flex-fill'} schema={mpoCoreDetailSchemas.password} valueEvent="input-change" blurEvent="input-blur">
                    <ir-input
                      required
                      class="mpo-management__input mpo-management__input-password "
                      label="Password"
                      type="password"
                      placeholder="Password"
                      value={this.store.form.password}
                      onInput-change={event => this.handleInputChange('password', event.detail)}
                      labelPosition="side"
                    >
                      <ir-popup slot="prefix" shift class="mpo-management__popup" interaction="hover" flip strategy="fixed">
                        <button slot="trigger" class={'mpo-management__popup-trigger'}>
                          {this.isPasswordValid ? (
                            <svg xmlns="http://www.w3.org/2000/svg" style={{ color: '#28d094' }} height={24} width={24} viewBox="0 0 640 640">
                              <path
                                fill="currentColor"
                                d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM438 209.7C427.3 201.9 412.3 204.3 404.5 215L285.1 379.2L233 327.1C223.6 317.7 208.4 317.7 199.1 327.1C189.8 336.5 189.7 351.7 199.1 361L271.1 433C276.1 438 282.9 440.5 289.9 440C296.9 439.5 303.3 435.9 307.4 430.2L443.3 243.2C451.1 232.5 448.7 217.5 438 209.7z"
                              />
                            </svg>
                          ) : (
                            <svg height={24} width={24} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                              <path
                                fill="currentColor"
                                d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224zM280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312C256 298.7 266.7 288 280 288z"
                              />
                            </svg>
                          )}
                        </button>

                        <ir-password-validator onPasswordValidationChange={this.handlePasswordValidationChange} password={this.store.form.password}></ir-password-validator>
                      </ir-popup>
                    </ir-input>
                  </ir-validator>
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
                    label="Country"
                    required
                    class="mpo-management__input flex-fill"
                    options={[{ label: 'Select', value: '' }, ...this.store.selects.countries.map(c => ({ label: c.name, value: c.id.toString() }))]}
                    value={this.store.form.country}
                    onSelect-change={event => this.handleInputChange('country', event.detail?.value?.toString() ?? '')}
                    labelPosition="side"
                  ></ir-native-select>
                </ir-validator>

                <ir-validator class={'flex-fill'} schema={mpoCoreDetailSchemas.city} valueEvent="input-change" blurEvent="input-blur">
                  <ir-input
                    required
                    class="mpo-management__input mpo-management__input-city flex-fill"
                    label="City"
                    placeholder="City"
                    labelPosition="side"
                    value={this.store.form.city}
                    onInput-change={event => this.handleInputChange('city', event.detail)}
                  ></ir-input>
                </ir-validator>
              </div>
              <ir-validator schema={mpoCoreDetailSchemas.address} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  label="Address"
                  required
                  labelPosition="side"
                  placeholder="Address"
                  value={this.store.form.address}
                  onInput-change={event => this.handleInputChange('address', event.detail)}
                ></ir-input>
              </ir-validator>
              <ir-validator schema={mpoCoreDetailSchemas.billingCurrency} valueEvent="select-change" blurEvent="select-blur">
                <ir-native-select
                  onSelect-change={event => this.handleInputChange('billingCurrency', event.detail as any)}
                  class="mpo-management__input"
                  required
                  label="Billing currency"
                  value={this.store.form.billingCurrency}
                  labelPosition="side"
                  options={[{ label: 'Select...', value: '' }, ...this.store.selects.currencies.map(c => ({ label: c.symbol, value: c.id.toString() }))]}
                ></ir-native-select>
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
                  label="Main contact"
                  required
                  labelPosition="side"
                  value={this.store.form.mainContact}
                  onInput-change={event => this.handleInputChange('mainContact', event.detail)}
                ></ir-input>
              </ir-validator>
              <ir-validator schema={mpoCoreDetailSchemas.email} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  type="email"
                  label="Email"
                  required
                  placeholder="Email"
                  labelPosition="side"
                  value={this.store.form.email}
                  onInput-change={event => this.handleInputChange('email', event.detail)}
                ></ir-input>
              </ir-validator>

              <ir-validator schema={mpoCoreDetailSchemas.phone} valueEvent="input-change" blurEvent="input-blur">
                <ir-input
                  class="mpo-management__input "
                  label="Phone"
                  required
                  placeholder="Phone"
                  labelPosition="side"
                  value={this.store.form.phone}
                  onInput-change={event => this.handleInputChange('phone', event.detail)}
                ></ir-input>
              </ir-validator>
              <div class="checkbox-card">
                <ir-checkbox
                  style={{ gap: '0.5rem' }}
                  label="Receive notifications via email"
                  checked={this.store.form.receiveNotificationOnEmail}
                  onCheckChange={event => this.toggleReceiveNotification(event.detail)}
                ></ir-checkbox>
                <p class="field-hint">Get updates about your account and important changes</p>
              </div>
              <style>
                {`
                      .mpo-management__note-textfield .form-control{
                        border-radius:0.5rem
                      }
                      
                      `}
              </style>
              <ir-textarea
                class="mpo-management__note-textfield"
                label="Notes"
                placeholder=""
                rows={2}
                value={this.store.form.notes}
                onTextChange={event => this.updateTextField('notes', event.detail)}
              ></ir-textarea>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
