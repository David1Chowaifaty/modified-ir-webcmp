import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { mpoManagementStore, updateMpoManagementField, updateMpoManagementFields, updateMpoSelectField, upsertAffiliates, upsertMarketPlace } from '@/stores/mpo-management.store';
import Token from '@/models/Token';
import { BookingService } from '@/services/booking.service';
import { PropertyService } from '@/services/property.service';
import { MPOService } from '@/services/mpo-service';

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
  @Prop() userTypeCode: string = '1';

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
    upsertMarketPlace(mpo.market_places);
    upsertAffiliates(
      mpo.affiliates.map(aff => ({
        active: false,
        favicon: '',
        companyName: '',
        ///////////////////
        id: aff.id,
        address: aff.address,
        city: aff.city,
        code: aff.afname,
        country: aff.country,
        ctaColor: aff.call_to_action_btn_color,
        email: aff.email,
        logo: aff.logo,
        phone: aff.phone,
        website: aff.url,
        bodyTag: aff.body_tag,
        conversionTag: aff.conversion_tag,
        customCss: aff.custom_css,
        footerTag: aff.footer_tag,
        headerTag: aff.header_tag,
      })),
    );
  }

  private updateCompanyLogo(files: File[]) {
    updateMpoManagementField('companyLogo', files.length ? [...files] : '');
  }

  private updateCompanyFavIcon(files: File[]) {
    updateMpoManagementField('companyFavicon', files.length ? [...files] : '');
  }

  private getSource(src: string | File[]) {
    return typeof src === 'string' ? src : Array.isArray(src) && src.length > 0 ? URL.createObjectURL(src[0]) : undefined;
  }

  render() {
    const { companyInfo: form } = this.store;
    const previewSrc = this.getSource(form.companyLogo);
    const previewFavIconSrc = this.getSource(form.companyFavicon);
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <ir-title class="px-1" label="MPO Details"></ir-title>
        <div class="card mpo-management__card">
          <ir-tab-group orientation="horizontal">
            {this.panels.map(p => (
              <ir-tab slot="nav" key={p.value} panel={p.value} disabled={p.value === 'marketplaces' && this.userTypeCode === '4'}>
                {p.label}
              </ir-tab>
            ))}
            <ir-tab-panel id="companyInformation">
              <ir-mpo-core-details></ir-mpo-core-details>
            </ir-tab-panel>
            <ir-tab-panel id="whiteLabeling">
              <section class="mpo-management__panel">
                <div class="mpo-management__panel-body">
                  <div class="mpo-management__uploader-container">
                    <div class="logo-upload">
                      <ir-brand-uploader
                        dimensions="300x60"
                        src={previewSrc}
                        label="Company Logo"
                        maxFileSize={5}
                        onFilesSelected={event => this.updateCompanyLogo(event.detail)}
                        onFileRejected={event => {
                          const { fileName, reason } = event.detail;
                          let message = '';

                          switch (reason) {
                            case 'file-type':
                              message = `The file "${fileName}" is not a supported image type. Please upload PNG, JPG, WEBP, GIF, or SVG formats.`;
                              break;
                            case 'file-size':
                              message = `The file "${fileName}" size is too large. Please do not exceed 500 Kb.`;
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
                        hint="Recommended image size 150px × 150px"
                        helperText=""
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
                              message = `The file "${fileName}" is too large. Please upload an image under 150 Kb.`;
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
      </Host>
    );
  }
}
