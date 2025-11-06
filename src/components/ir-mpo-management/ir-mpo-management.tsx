import { Component, Host, State, h } from '@stencil/core';
import { MpoManagementForm, MpoWhiteLabelSettings, mpoManagementSchema } from './types';

const MAX_LOGO_FILE_SIZE = 10 * 1024 * 1024;

const initialForm: MpoManagementForm = {
  companyName: '',
  companyLogo: '',
  username: '',
  password: '',
  country: '',
  city: '',
  address: '',
  billingCurrency: '',
  mainContact: '',
  email: '',
  phone: '',
  notificationEmail: '',
  receiveNotificationOnEmail: true,
  notes: '',
  whiteLabel: {
    enabled: false,
    extranetUrl: '',
    companyWebsite: '',
    smtpServer: '',
    smtpPort: '',
    smtpLogin: '',
    smtpPassword: '',
    noReplyEmail: '',
  },
};

const countryOptions = [
  { text: 'Lebanon', value: 'Lebanon' },
  { text: 'United Arab Emirates', value: 'United Arab Emirates' },
  { text: 'Qatar', value: 'Qatar' },
  { text: 'Saudi Arabia', value: 'Saudi Arabia' },
];

const currencyOptions = [
  { text: 'USD - US Dollar', value: 'USD' },
  { text: 'EUR - Euro', value: 'EUR' },
  { text: 'LBP - Lebanese Pound', value: 'LBP' },
  { text: 'AED - UAE Dirham', value: 'AED' },
];

const whiteLabelFieldMeta: Array<{
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

@Component({
  tag: 'ir-mpo-management',
  styleUrls: ['ir-mpo-management.css', '../../common/table.css'],
  scoped: true,
})
export class IrMpoManagement {
  @State() form: MpoManagementForm = initialForm;
  @State() submitted = false;
  @State() logoFiles: File[] = [];

  private updateTextField(field: keyof Omit<MpoManagementForm, 'whiteLabel' | 'receiveNotificationOnEmail' | 'companyLogo'>, value: string | null) {
    this.form = {
      ...this.form,
      [field]: value ?? '',
    } as MpoManagementForm;
  }

  private updateCompanyLogo(files: File[]) {
    this.logoFiles = [...files];
    this.form = {
      ...this.form,
      companyLogo: files.length ? [...files] : '',
    };
  }

  private updateWhiteLabelField(field: keyof MpoWhiteLabelSettings, value: string | null) {
    this.form = {
      ...this.form,
      whiteLabel: {
        ...this.form.whiteLabel,
        [field]: value ?? '',
      },
    };
  }

  private toggleReceiveNotification(checked: boolean) {
    this.form = {
      ...this.form,
      receiveNotificationOnEmail: checked,
    };
  }

  private toggleWhiteLabel(checked: boolean) {
    this.form = {
      ...this.form,
      whiteLabel: {
        ...this.form.whiteLabel,
        enabled: checked,
      },
    };
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    this.submitted = true;
    try {
      const cleaned = mpoManagementSchema.parse(this.form);
      console.log('MPO management payload', cleaned);
    } catch (error) {
      console.warn('Validation errors', error);
    }
  }

  render() {
    const disableWhiteLabelFields = !this.form.whiteLabel.enabled;
    const logoValue = Array.isArray(this.form.companyLogo) ? this.form.companyLogo : this.logoFiles;
    const existingLogoLabel = typeof this.form.companyLogo === 'string' ? this.form.companyLogo : undefined;

    return (
      <Host>
        <form class="mpo-management-form" onSubmit={event => this.handleSubmit(event)}>
          <style>
            {`
            ir-input-text .form-group{
            margin-bottom:0 !important;}
            ir-checkbox label{
            margin-bottom:0 !important;}
            `}
          </style>
          <header class="page-header">
            <div class={'d-flex align-items-center justify-content-between'}>
              <h1>MPO Details</h1>
              <ir-button btn_color="outline" text="Add affiliate" size="sm"></ir-button>
            </div>
          </header>

          <section class="mpo-management__panel">
            <div class="mpo-management__panel-header">
              <div>
                <h2 class="mpo-management__panel-title">Company Information</h2>
                <p class="mpo-management__panel-subtitle">Basic information about your company</p>
              </div>
            </div>
            <div class="mpo-management__panel-body">
              <div class="form-grid two">
                <div class="input-with-hint">
                  <ir-input-text
                    label="Company Name"
                    required
                    variant="floating-label"
                    value={this.form.companyName}
                    submitted={this.submitted}
                    zod={mpoManagementSchema.shape.companyName}
                    onTextChange={event => this.updateTextField('companyName', event.detail)}
                  ></ir-input-text>
                </div>
                <div class="input-with-hint">
                  <ir-input-text
                    label="Username"
                    required
                    readonly
                    variant="floating-label"
                    value={this.form.username}
                    onTextChange={event => this.updateTextField('username', event.detail)}
                  ></ir-input-text>
                </div>
                <div class="input-with-hint">
                  <ir-input-text
                    label="Password"
                    required
                    type="password"
                    variant="floating-label"
                    value={this.form.password}
                    submitted={this.submitted}
                    zod={mpoManagementSchema.shape.password}
                    onTextChange={event => this.updateTextField('password', event.detail)}
                  ></ir-input-text>
                </div>
              </div>
              <div class="logo-upload">
                <ir-image-upload
                  label="Company Logo (170x30 png/jpg/svg recommended)"
                  helperText={`PNG, JPG, GIF, SVG, WEBP up to ${Math.round(MAX_LOGO_FILE_SIZE / (1024 * 1024))}MB`}
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  maxFileSize={MAX_LOGO_FILE_SIZE}
                  value={logoValue}
                  existingValueLabel={existingLogoLabel}
                  onFilesSelected={event => this.updateCompanyLogo(event.detail)}
                  onFileRejected={event => console.warn('Logo upload rejected', event.detail)}
                ></ir-image-upload>
              </div>
            </div>
          </section>

          <section class="mpo-management__panel">
            <div class="mpo-management__panel-header">
              <div>
                <h2 class="mpo-management__panel-title">Location Details</h2>
                <p class="mpo-management__panel-subtitle">Where your company is located</p>
              </div>
            </div>
            <div class="mpo-management__panel-body">
              <div class="form-grid three">
                <div class="input-with-hint">
                  <ir-select
                    label="Country"
                    required
                    floating-label
                    data={countryOptions}
                    selectedValue={this.form.country}
                    onSelectChange={event => this.updateTextField('country', event.detail)}
                  ></ir-select>
                </div>
                <div class="input-with-hint">
                  <ir-input-text
                    label="City"
                    required
                    variant="floating-label"
                    value={this.form.city}
                    submitted={this.submitted}
                    zod={mpoManagementSchema.shape.city}
                    onTextChange={event => this.updateTextField('city', event.detail)}
                  ></ir-input-text>
                </div>
                <div class="input-with-hint">
                  <ir-select
                    label="Billing Currency"
                    required
                    floating-label
                    data={currencyOptions}
                    selectedValue={this.form.billingCurrency}
                    onSelectChange={event => this.updateTextField('billingCurrency', event.detail)}
                  ></ir-select>
                </div>
                <div class="input-with-hint">
                  <ir-input-text
                    label="Address"
                    required
                    variant="floating-label"
                    value={this.form.address}
                    submitted={this.submitted}
                    zod={mpoManagementSchema.shape.address}
                    onTextChange={event => this.updateTextField('address', event.detail)}
                  ></ir-input-text>
                </div>
              </div>
            </div>
          </section>

          <section class="mpo-management__panel">
            <div class="mpo-management__panel-header">
              <div>
                <h2 class="mpo-management__panel-title">Contact Information</h2>
                <p class="mpo-management__panel-subtitle">Primary contact details for your company</p>
              </div>
            </div>
            <div class="mpo-management__panel-body">
              <div class="form-grid two">
                <div class="input-with-hint">
                  <ir-input-text
                    label="Main Contact"
                    required
                    variant="floating-label"
                    value={this.form.mainContact}
                    onTextChange={event => this.updateTextField('mainContact', event.detail)}
                  ></ir-input-text>
                </div>
                <div class="input-with-hint">
                  <ir-input-text
                    label="Phone"
                    required
                    variant="floating-label"
                    value={this.form.phone}
                    submitted={this.submitted}
                    zod={mpoManagementSchema.shape.phone}
                    onTextChange={event => this.updateTextField('phone', event.detail)}
                  ></ir-input-text>
                </div>
                <div class="input-with-hint">
                  <ir-input-text
                    label="Email"
                    required
                    type="email"
                    variant="floating-label"
                    value={this.form.email}
                    submitted={this.submitted}
                    zod={mpoManagementSchema.shape.email}
                    onTextChange={event => this.updateTextField('email', event.detail)}
                  ></ir-input-text>
                </div>
                <div class="input-with-hint">
                  <ir-input-text
                    label="Notification Email"
                    type="email"
                    variant="floating-label"
                    value={this.form.notificationEmail}
                    onTextChange={event => this.updateTextField('notificationEmail', event.detail)}
                  ></ir-input-text>
                </div>
              </div>
              <div class="checkbox-card">
                <ir-checkbox
                  style={{ gap: '0.5rem' }}
                  label="Receive notifications via email"
                  checked={this.form.receiveNotificationOnEmail}
                  onCheckChange={event => this.toggleReceiveNotification(event.detail)}
                ></ir-checkbox>
                <p class="field-hint">Get updates about your account and important changes</p>
              </div>
              <ir-textarea label="Notes" rows={4} value={this.form.notes} onTextChange={event => this.updateTextField('notes', event.detail)}></ir-textarea>
            </div>
          </section>

          <section class="mpo-management__panel">
            <div class="mpo-management__panel-header">
              <div class="header-with-switch">
                <div>
                  <h2 class="mpo-management__panel-title">White Labeling</h2>
                  <p class="mpo-management__panel-subtitle">Customize your brand appearance and identity</p>
                </div>
                <div class="toggle-wrapper">
                  <ir-checkbox
                    style={{ gap: '0.5rem' }}
                    label="Enable white labeling"
                    checked={this.form.whiteLabel.enabled}
                    onCheckChange={event => this.toggleWhiteLabel(event.detail)}
                  ></ir-checkbox>
                </div>
              </div>
            </div>
            <div class={{ 'mpo-management__panel-body': true, 'disabled': disableWhiteLabelFields }}>
              <div class="form-grid two">
                {whiteLabelFieldMeta.map(field => (
                  <div class="input-with-hint" key={field.key}>
                    <ir-input-text
                      label={field.label}
                      type={field.type || 'text'}
                      variant="floating-label"
                      value={this.form.whiteLabel[field.key] as string}
                      placeholder={field.placeholder}
                      disabled={disableWhiteLabelFields}
                      onTextChange={event => this.updateWhiteLabelField(field.key, event.detail)}
                    ></ir-input-text>
                  </div>
                ))}
              </div>
            </div>
            <div class="mpo-management__form-actions">
              <ir-button text="Save" size="md"></ir-button>
            </div>
          </section>
        </form>
        <div class="mpo-management-table">
          <table class="table">
            <thead>
              <tr>
                <th>Country</th>
                <th>Marketplace</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr class={'ir-table-row'}>
                <td colSpan={3} class="text-center">
                  No data
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Host>
    );
  }
}
