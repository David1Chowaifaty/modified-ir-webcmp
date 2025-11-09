import { Component, Host, h } from '@stencil/core';
import { MpoWhiteLabelSettings } from '../types';
import { mpoManagementStore, updateWhiteLabelField } from '@/stores/mpo-management.store';

@Component({
  tag: 'ir-white-labeling',
  styleUrls: ['ir-white-labeling.css', '../ir-mpo-management-common.css'],
  scoped: true,
})
export class IrWhiteLabeling {
  private store = mpoManagementStore;
  private whiteLabelFieldMeta: Array<{
    key: keyof MpoWhiteLabelSettings;
    label: string;
    type?: 'text' | 'email' | 'password';
    placeholder?: string;
    hint?: string;
  }> = [
    {
      key: 'extranetUrl',
      label: 'Custom Domain',
      placeholder: 'app.yourcompany.com',
      hint: 'Your custom domain or subdomain',
    },
    {
      key: 'companyWebsite',
      label: 'Brand Name',
      placeholder: 'Lancaster Group',
      hint: 'Name shown to your customers',
    },
    {
      key: 'smtpServer',
      label: 'SMTP Server',
      placeholder: 'smtp.provider.com',
      hint: 'Server address for transactional email',
    },
    {
      key: 'smtpPort',
      label: 'Port',
      placeholder: '2525',
      hint: 'Common ports: 2525 / 465 (SSL) / 587 (TLS)',
    },
    {
      key: 'smtpLogin',
      label: 'Login',
      placeholder: 'admin@company.com',
      hint: 'Credentials used to authenticate with your provider',
    },
    {
      key: 'smtpPassword',
      label: 'Password',
      type: 'password',
      placeholder: 'Enter password',
      hint: 'Stored securely; required for sending branded emails',
    },
    {
      key: 'noReplyEmail',
      label: 'No reply email',
      type: 'email',
      placeholder: 'no-reply@company.com',
      hint: 'Sender address displayed to your customers',
    },
  ];

  private handleFieldChange(field: keyof MpoWhiteLabelSettings, value?: string | null) {
    updateWhiteLabelField(field, (value ?? '') as MpoWhiteLabelSettings[typeof field]);
  }
  render() {
    const whiteLabel = this.store.form.whiteLabel;
    const smtpFieldIndex = this.whiteLabelFieldMeta.findIndex(meta => meta.key === 'smtpServer');
    const disableFieldsAfterSmtp = !whiteLabel.smtpServer?.trim();
    return (
      <Host>
        <section class="mpo-management__panel">
          <div class="mpo-management__panel-header">
            <div class="header-with-switch">
              <div>
                <h2 class="mpo-management__panel-title">White Labeling</h2>
                <p class="mpo-management__panel-subtitle">Customize your brand appearance and identity</p>
              </div>
            </div>
          </div>
          <div class={{ 'mpo-management__panel-body': true }}>
            <div class="form-grid">
              {this.whiteLabelFieldMeta.map((field, index) => {
                const disableField = disableFieldsAfterSmtp && smtpFieldIndex !== -1 && index > smtpFieldIndex;
                return (
                  <div class="input-with-hint" key={field.key}>
                    <ir-input
                      class="white-labeling__input-forms"
                      label={field.label}
                      labelPosition="side"
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      value={whiteLabel[field.key] as string}
                      disabled={disableField}
                      onInput-change={event => this.handleFieldChange(field.key, event.detail)}
                    ></ir-input>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
