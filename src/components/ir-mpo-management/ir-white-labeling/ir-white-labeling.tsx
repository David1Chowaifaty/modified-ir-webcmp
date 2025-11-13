import { Component, Host, h } from '@stencil/core';
import { z } from 'zod';
import { mpoManagementStore, mpoWhiteLabelFieldSchemas, MpoWhiteLabelSettings, smtpDependentFields, updateWhiteLabelField } from '@/stores/mpo-management.store';

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
    mask?: string;
  }> = [
    // {
    //   key: 'companyWebsite',
    //   label: 'Company website',
    //   placeholder: 'yourgroupwebsite.com',
    //   hint: 'Name shown to your customers',
    //   mask: 'url',
    // },
    {
      key: 'smtpServer',
      label: 'SMTP Server',
      placeholder: 'smtp.com',
      hint: 'Server address for transactional email',
      mask: 'url',
    },
    {
      key: 'smtpPort',
      label: 'Port (TLS)',
      placeholder: '2525',
      hint: 'Common ports: 2525 / 465 (SSL) / 587 (TLS)',
    },
    {
      key: 'smtpLogin',
      label: 'Login',
      placeholder: 'admin@youradmindomain.com',
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
      label: 'Sender email',
      type: 'email',
      placeholder: 'no-reply@youradmindomain.com',
      hint: 'Sender address displayed to your customers',
    },
  ];

  private handleFieldChange(field: keyof MpoWhiteLabelSettings, value?: string | boolean | null) {
    updateWhiteLabelField(field, (value ?? '') as MpoWhiteLabelSettings[typeof field]);
  }

  private getSchema(isSmtpServerProvided: boolean, key: string, label: string) {
    const shouldRequireField = isSmtpServerProvided && smtpDependentFields.includes(key as (typeof smtpDependentFields)[number]);
    const schema = shouldRequireField ? z.string().min(1, `${label} is required when SMTP server is provided`) : mpoWhiteLabelFieldSchemas[key];
    return schema;
  }
  render() {
    const whiteLabel = this.store.form.whiteLabel;
    const smtpFieldIndex = this.whiteLabelFieldMeta.findIndex(meta => meta.key === 'smtpServer');
    const disableFieldsAfterSmtp = !whiteLabel.smtpServer?.trim();
    const isSmtpServerProvided = !disableFieldsAfterSmtp;
    return (
      <Host>
        <section class="mpo-management__panel">
          <div class={{ 'mpo-management__panel-body': true }}>
            <div class="form-grid">
              <div class="input-with-hint">
                <ir-validator schema={this.getSchema(isSmtpServerProvided, 'extranetUrl', 'Extranet Url')} valueEvent="input-change" blurEvent="input-blur">
                  <ir-input
                    mask={'url'}
                    class="white-labeling__input-forms"
                    label={'Extranet Url'}
                    labelPosition="side"
                    placeholder={'youradmindomain.com'}
                    value={whiteLabel['extranetUrl'] as string}
                    onInput-change={event => this.handleFieldChange('extranetUrl', event.detail)}
                  ></ir-input>
                </ir-validator>
              </div>
              <div class="checkbox-card" style={{ gap: '1rem' }}>
                <div class="form-switch-row">
                  <span>Use your own SMTP</span>
                  <ir-switch checked={whiteLabel['enableCustomSmtp']} onCheckChange={event => this.handleFieldChange('enableCustomSmtp', event.detail)}></ir-switch>
                </div>

                {this.whiteLabelFieldMeta.map((field, index) => {
                  const disableField = disableFieldsAfterSmtp && smtpFieldIndex !== -1 && index > smtpFieldIndex;
                  const schema = this.getSchema(isSmtpServerProvided, field.key, field.label);
                  return (
                    <div class="input-with-hint" key={field.key}>
                      <ir-validator schema={schema} valueEvent="input-change" blurEvent="input-blur">
                        <ir-input
                          mask={field.mask}
                          class="white-labeling__input-forms"
                          label={field.label}
                          labelPosition="side"
                          type={field.type || 'text'}
                          placeholder={field.placeholder}
                          value={whiteLabel[field.key] as string}
                          disabled={disableField}
                          onInput-change={event => this.handleFieldChange(field.key, event.detail)}
                        ></ir-input>
                      </ir-validator>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
