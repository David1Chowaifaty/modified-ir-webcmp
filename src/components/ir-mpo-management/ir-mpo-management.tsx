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

@Component({
  tag: 'ir-mpo-management',
  styleUrls: ['ir-mpo-management.css', './ir-mpo-management-common.css', '../../common/table.css'],
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
          <header class="page-header">
            <div class={'d-flex align-items-center justify-content-between'}>
              <h1>MPO Details</h1>
            </div>
          </header>
          <ir-mpo-core-details></ir-mpo-core-details>
          <section class="mpo-management__panel">
            <div class="mpo-management__panel-body">
              <div class="form-grid">
                <div class="logo-upload">
                  <ir-image-upload
                    label="Company Logo"
                    helperText={`PNG, JPG, GIF, SVG, WEBP up to ${Math.round(MAX_LOGO_FILE_SIZE / (1024 * 1024))}MB`}
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    maxFileSize={MAX_LOGO_FILE_SIZE}
                    value={logoValue}
                    existingValueLabel={existingLogoLabel}
                    onFilesSelected={event => this.updateCompanyLogo(event.detail)}
                    onFileRejected={event => console.warn('Logo upload rejected', event.detail)}
                  ></ir-image-upload>
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
            </div>
          </section>
          <ir-white-labeling></ir-white-labeling>
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
