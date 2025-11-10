import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { mpoManagementSchema, MpoManagementForm, mpoManagementStore, RootMpoFields, updateMpoManagementField, updateMpoSelectField } from '@/stores/mpo-management.store';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking.service';
import { PropertyService } from '@/services/property.service';

const MAX_LOGO_FILE_SIZE = 10 * 1024 * 1024;

@Component({
  tag: 'ir-mpo-management',
  styleUrls: ['ir-mpo-management.css', './ir-mpo-management-common.css', '../../common/table.css'],
  scoped: true,
})
export class IrMpoManagement {
  @Prop() ticket: string;
  @Prop() propertyid: string;
  @Prop() language: string = 'en';

  @State() isLoading: boolean;
  @State() submitted = false;

  private tokenService = new Token();
  private bookingService = new BookingService();
  private propertyService = new PropertyService();
  private store = mpoManagementStore;

  private panels = [
    {
      label: 'Company Information',
      value: 'companyInformation',
    },
    {
      label: 'White labeling',
      value: 'whiteLabeling',
    },
    {
      label: 'Marketplaces',
      value: 'marketplaces',
    },
    {
      label: 'Websites',
      value: 'websites',
    },
  ];

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }

  @Watch('ticket')
  handleTicketChange() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }

  private async init() {
    const [countries, currencies] = await Promise.all([this.bookingService.getCountries(this.language), this.propertyService.getExposedCurrencies()]);

    updateMpoSelectField({
      marketPlaces: countries.filter(c => c.market_places !== null),
      countries,
      currencies,
    });
  }

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
    const previewSrc =
      typeof form.companyLogo === 'string'
        ? form.companyLogo
        : Array.isArray(form.companyLogo) && form.companyLogo.length > 0
        ? URL.createObjectURL(form.companyLogo[0])
        : undefined;
    return (
      <Host class={'py-1'}>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <ir-title class="px-1" label="MPO Details"></ir-title>
        <div>
          <ir-tab-group orientation="horizontal">
            {this.panels.map(p => (
              <ir-tab slot="nav" key={p.value} panel={p.value}>
                {p.label}
              </ir-tab>
            ))}
            <ir-tab-panel id="companyInformation">
              <ir-mpo-core-details></ir-mpo-core-details>
            </ir-tab-panel>
            <ir-tab-panel id="whiteLabeling">
              <ir-white-labeling></ir-white-labeling>
            </ir-tab-panel>
            <ir-tab-panel id="marketplaces">
              <ir-marketplace></ir-marketplace>
            </ir-tab-panel>
            <ir-tab-panel id="websites">
              <ir-affiliate-table></ir-affiliate-table>
            </ir-tab-panel>
          </ir-tab-group>
        </div>
        {/* <section class="mpo-management__page-content">
          <form class="mpo-management-form" onSubmit={event => this.handleSubmit(event)}>
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
                    {previewSrc && (
                      <div class="mt-1" style={{ width: '150px', height: '150px' }}>
                        <ir-image-preview src={previewSrc} alt="logo"></ir-image-preview>
                      </div>
                    )}
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
                    value={form.notes}
                    onTextChange={event => this.updateTextField('notes', event.detail)}
                  ></ir-textarea>
                </div>
              </div>
            </section>
            <ir-white-labeling></ir-white-labeling>
            <ir-button btn_type="submit" text="Save" class="mt-2" size="md"></ir-button>
          </form>
          <section class="mpo-management-table">
            <div>
              <ir-affiliate-table></ir-affiliate-table>
            </div>
          </section>
        </section> */}
      </Host>
    );
  }
}
