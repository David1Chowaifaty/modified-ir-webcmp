import Token from '@/models/Token';
import { Component, Event, EventEmitter, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-affiliate',
  styleUrls: ['ir-affiliate.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IrAffiliate {
  @Event() closeModal: EventEmitter<void>;
  private tokenService = new Token();
  render() {
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
                <ir-brand-uploader label="Website logo"></ir-brand-uploader>
                <ir-brand-uploader label="Website favicon"></ir-brand-uploader>
              </div>

              <ir-textarea class="mpo-management__note-textfield" placeholder="" label="Custom css"></ir-textarea>
              <ir-textarea class="mpo-management__note-textfield" placeholder="" label="Conversion tag"></ir-textarea>
              <ir-textarea class="mpo-management__note-textfield" placeholder="" label="Header tag"></ir-textarea>
              <ir-textarea class="mpo-management__note-textfield" placeholder="" label="Body Tag"></ir-textarea>
              <ir-textarea class="mpo-management__note-textfield" placeholder="" label="Footer Tag"></ir-textarea>
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
