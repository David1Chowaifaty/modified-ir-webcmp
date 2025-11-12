import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { mpoManagementStore, updateMpoManagementField, updateMpoManagementFields, updateMpoSelectField } from '@/stores/mpo-management.store';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking.service';
import { PropertyService } from '@/services/property.service';
import { MPOService } from '@/services/mpo-service';

// const MAX_LOGO_FILE_SIZE = 10 * 1024 * 1024;

@Component({
  tag: 'ir-mpo-management',
  styleUrls: ['ir-mpo-management.css', './ir-mpo-management-common.css', '../../common/table.css'],
  scoped: true,
})
export class IrMpoManagement {
  @Prop() ticket: string;
  @Prop() propertyid: string;
  @Prop({ attribute: 'mpo-id' }) mpoID: number;
  @Prop() language: string = 'en';

  @State() isLoading: boolean;
  @State() submitted = false;

  private tokenService = new Token();

  private bookingService = new BookingService();
  private propertyService = new PropertyService();
  private mpoService = new MPOService();

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
    const [countries, currencies] = await Promise.all([this.bookingService.getCountries(this.language), this.propertyService.getExposedCurrencies(), this.getExposedMpo()]);

    updateMpoSelectField({
      marketPlaces: countries.filter(c => c.market_places !== null),
      countries,
      currencies,
    });
  }

  private async getExposedMpo() {
    const mpo = await this.mpoService.getExposedMpo({ id: this.mpoID });
    updateMpoManagementFields({
      address: mpo.address,
      city: mpo.city,
      companyName: mpo.company_name ?? mpo.name,
      companyLogo: mpo.logo_url,
      email: mpo.user.email,
      phone: mpo.phone,
      username: mpo.user.username,
      password: mpo.user.password,
      country: mpo.country.id.toString(),
      billingCurrency: mpo.biling_currency.id.toString(),
      companyFavicon: mpo.fav_icon,
      notes: mpo.notes,
      receiveNotificationOnEmail: mpo.is_email_notification,
    });
  }

  // private updateTextField<Field extends Exclude<RootMpoFields, 'companyLogo' | 'receiveNotificationOnEmail'>>(field: Field, value: string | null) {
  //   updateMpoManagementField(field, (value ?? '') as MpoManagementForm[Field]);
  // }

  private updateCompanyLogo(files: File[]) {
    updateMpoManagementField('companyLogo', files.length ? [...files] : '');
  }
  private updateCompanyFavIcon(files: File[]) {
    updateMpoManagementField('companyFavicon', files.length ? [...files] : '');
  }

  // private toggleReceiveNotification(checked: boolean) {
  //   updateMpoManagementField('receiveNotificationOnEmail', checked);
  // }

  // private handleSubmit(event: Event) {
  //   event.preventDefault();
  //   this.submitted = true;
  //   try {
  //     const cleaned = mpoManagementSchema.parse(this.store.form);
  //     console.log('MPO management payload', cleaned);
  //   } catch (error) {
  //     console.warn('Validation errors', error);
  //   }
  // }
  private getSource(src: string | File[]) {
    return typeof src === 'string' ? src : Array.isArray(src) && src.length > 0 ? URL.createObjectURL(src[0]) : undefined;
  }
  render() {
    const { form } = this.store;
    const previewSrc = this.getSource(form.companyLogo);
    const previewFavIconSrc = this.getSource(form.companyFavicon);
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
              <section class="mpo-management__panel">
                <div class="mpo-management__panel-body">
                  <div class="mpo-management__uploader-container">
                    <div class="logo-upload">
                      <ir-brand-uploader
                        src={previewSrc}
                        label="Company Logo"
                        onFilesSelected={event => this.updateCompanyLogo(event.detail)}
                        onFileRejected={event => {
                          const { fileName, reason } = event.detail;
                          let message = '';

                          switch (reason) {
                            case 'file-type':
                              message = `The file "${fileName}" is not a supported image type. Please upload PNG, JPG, WEBP, GIF, or SVG formats.`;
                              break;
                            case 'file-size':
                              message = `The file "${fileName}" is too large. Please upload an image under 10 MB.`;
                              break;
                            case 'max-files':
                              message = `You can only upload one image at a time.`;
                              break;
                            default:
                              message = `The file "${fileName}" could not be uploaded. Please try again.`;
                          }

                          alert(message);
                        }}
                      ></ir-brand-uploader>
                    </div>
                    <div class="logo-upload">
                      <ir-brand-uploader
                        src={previewFavIconSrc}
                        accept="image/png,image/x-icon,image/svg+xml"
                        label="Company Favicon"
                        helperText="Upload a square PNG or ICO image up to 150 × 150 px (max 150 KB)."
                        onFilesSelected={async event => {
                          this.updateCompanyFavIcon(event.detail);
                        }}
                        onFileRejected={event => {
                          const { fileName, reason } = event.detail;
                          let message = '';

                          switch (reason) {
                            case 'file-type':
                              message = `The file "${fileName}" is not a supported favicon type. Please upload PNG, ICO, or SVG.`;
                              break;
                            case 'file-size':
                              message = `The file "${fileName}" is too large. Please upload an image under 150 KB.`;
                              break;
                            case 'max-files':
                              message = `You can only upload one image at a time.`;
                              break;
                            default:
                              message = `The file "${fileName}" could not be uploaded. Please try again.`;
                          }

                          alert(message);
                        }}
                      ></ir-brand-uploader>
                    </div>
                  </div>
                </div>
              </section>
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
