import Token from '@/models/Token';
import { mpoManagementStore, updateAffiliateFormField } from '@/stores/mpo-management.store';
import { Component, Event, EventEmitter, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-affiliate',
  styleUrls: ['ir-affiliate.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IrAffiliate {
  @Event() closeModal: EventEmitter<void>;
  private tokenService = new Token();
  private store = mpoManagementStore;

  private handleInputChange(field: Parameters<typeof updateAffiliateFormField>[0], value?: string | boolean | null) {
    updateAffiliateFormField(field, value ?? '');
  }
  private updateCompanyLogo(files: File[]): void {
    updateAffiliateFormField('logo', files.length ? [...files] : '');
  }
  private updateCompanyFavIcon(files: File[]) {
    updateAffiliateFormField('favicon', files.length ? [...files] : '');
  }
  private getSource(src: string | File[]) {
    return typeof src === 'string' ? src : Array.isArray(src) && src.length > 0 ? URL.createObjectURL(src[0]) : undefined;
  }
  render() {
    const { affiliateNewForm: form } = this.store;
    const previewSrc = this.getSource(form.logo);
    const previewFavIconSrc = this.getSource(form.favicon);
    return (
      <Host>
        <form class="sheet-container">
          <ir-title class="px-1 sheet-header mb-0" onCloseSideBar={() => this.closeModal.emit(null)} label={'Create Website'} displayContext="sidebar"></ir-title>
          <section class={' pb-1 sheet-body d-flex flex-column'} style={{ gap: '1rem' }}>
            <style>
              {`
                      .mpo-management__note-textfield .form-control{
                        border-radius:0.5rem
                      }
                      
                      `}
            </style>
            <div class={'px-1 pb-1 d-flex flex-column'} style={{ gap: '1rem' }}>
              <ir-affiliate-form></ir-affiliate-form>
              <div class="d-flex align-items-center">
                <ir-brand-uploader
                  dimensions="300x60"
                  hint="Maximum image size 300px × 60px"
                  maxFileSize={500000}
                  src={previewSrc}
                  label="Website logo"
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
                <div class="logo-upload">
                  <ir-brand-uploader
                    src={previewFavIconSrc}
                    accept="image/png,image/x-icon,image/svg+xml"
                    label="Website favicon"
                    maxFileSize={150000}
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

              <ir-textarea
                value={form.customCss}
                onTextChange={e => this.handleInputChange('customCss', e.detail)}
                class="mpo-management__note-textfield"
                placeholder=""
                label="Custom css"
              ></ir-textarea>
              <ir-textarea
                value={form.customCss}
                onTextChange={e => this.handleInputChange('conversionTag', e.detail)}
                class="mpo-management__note-textfield"
                placeholder=""
                label="Conversion tag"
              ></ir-textarea>
              <ir-textarea
                value={form.headerTag}
                onTextChange={e => this.handleInputChange('headerTag', e.detail)}
                class="mpo-management__note-textfield"
                placeholder=""
                label="Header tag"
              ></ir-textarea>
              <ir-textarea
                value={form.bodyTag}
                onTextChange={e => this.handleInputChange('bodyTag', e.detail)}
                class="mpo-management__note-textfield"
                placeholder=""
                label="Body Tag"
              ></ir-textarea>
              <ir-textarea
                value={form.footerTag}
                onTextChange={e => this.handleInputChange('footerTag', e.detail)}
                class="mpo-management__note-textfield"
                placeholder=""
                label="Footer Tag"
              ></ir-textarea>
            </div>

            <ir-payment-option defaultStyles={false} propertyid="42" language="en" ticket={this.tokenService.getToken()}></ir-payment-option>
          </section>
          <div class={'sheet-footer'}>
            <ir-button onClick={() => this.closeModal.emit(null)} btn_styles="justify-content-center" class={`flex-fill`} text={'Cancel'} btn_color="secondary"></ir-button>
            {
              <ir-button
                btn_styles="justify-content-center align-items-center"
                class={'flex-fill'}
                // isLoading={this.isLoading}
                text={'Save'}
                btn_color="primary"
                btn_type="submit"
              ></ir-button>
            }
          </div>
        </form>
      </Host>
    );
  }
}
