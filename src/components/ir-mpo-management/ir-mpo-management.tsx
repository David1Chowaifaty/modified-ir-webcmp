import { Component, Host, State, h } from '@stencil/core';
import { mpoManagementSchema, MpoManagementForm, mpoManagementStore, RootMpoFields, updateMpoManagementField } from '@/stores/mpo-management.store';

const MAX_LOGO_FILE_SIZE = 10 * 1024 * 1024;

@Component({
  tag: 'ir-mpo-management',
  styleUrls: ['ir-mpo-management.css', './ir-mpo-management-common.css', '../../common/table.css'],
  scoped: true,
})
export class IrMpoManagement {
  @State() submitted = false;
  private store = mpoManagementStore;

  private updateTextField<Field extends Exclude<RootMpoFields, 'companyLogo' | 'receiveNotificationOnEmail'>>(field: Field, value: string | null) {
    updateMpoManagementField(field, (value ?? '') as MpoManagementForm[Field]);
  }

  private updateCompanyLogo(files: File[]) {
    updateMpoManagementField('companyLogo', files.length ? [...files] : '');
  }

  private toggleReceiveNotification(checked: boolean) {
    updateMpoManagementField('receiveNotificationOnEmail', checked);
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    this.submitted = true;
    try {
      const cleaned = mpoManagementSchema.parse(this.store.form);
      console.log('MPO management payload', cleaned);
    } catch (error) {
      console.warn('Validation errors', error);
    }
  }

  render() {
    const { form } = this.store;
    const logoValue = Array.isArray(form.companyLogo) ? form.companyLogo : [];
    const existingLogoLabel = typeof form.companyLogo === 'string' ? form.companyLogo : undefined;

    return (
      <Host class={'py-1'}>
        <ir-title class="px-1" label="MPO Details"></ir-title>
        <section class="mpo-management__page-content">
          <form class="mpo-management-form" onSubmit={event => this.handleSubmit(event)}>
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
                      checked={form.receiveNotificationOnEmail}
                      onCheckChange={event => this.toggleReceiveNotification(event.detail)}
                    ></ir-checkbox>
                    <p class="field-hint">Get updates about your account and important changes</p>
                  </div>
                  <ir-textarea label="Notes" rows={4} value={form.notes} onTextChange={event => this.updateTextField('notes', event.detail)}></ir-textarea>
                </div>
              </div>
            </section>
            <ir-white-labeling></ir-white-labeling>
            <ir-button btn_type="submit" text="Save" class="mt-2" size="md"></ir-button>
          </form>
          <section class="mpo-management-table">
            <div>
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
              <ir-affiliate-table></ir-affiliate-table>
            </div>
          </section>
        </section>
      </Host>
    );
  }
}
