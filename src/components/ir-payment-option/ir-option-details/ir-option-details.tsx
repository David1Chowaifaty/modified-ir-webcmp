import { ILanguages, PaymentOption } from '@/models/payment-options';
import { PaymentOptionService } from '@/services/payment_option.service';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import payment_option_store from '@/stores/payment-option.store';
import { Component, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';
import { IToast } from '@components/ui/ir-toast/toast';
import locales from '@/stores/locales.store';
@Component({
  tag: 'ir-option-details',
  styleUrl: 'ir-option-details.css',
  scoped: true,
})
export class IrOptionDetails {
  @Prop() propertyId: string;

  @State() localizationIdx: number;
  @State() selectedLanguage: string = null;
  @State() invalid: boolean = false;

  @Event() closeModal: EventEmitter<PaymentOption | null>;
  @Event() toast: EventEmitter<IToast>;

  private paymentOptionService = new PaymentOptionService();

  async componentWillLoad() {
    if (payment_option_store.selectedOption.code !== '005') {
      return;
    }
    if (!payment_option_store.languages) {
      const result = await this.paymentOptionService.GetExposedLanguages();
      payment_option_store.languages = result;
    }
    const localizables = payment_option_store.selectedOption.localizables ?? [];
    this.selectedLanguage = payment_option_store.languages[0].id.toString();
    if (localizables.length === 0) {
      localizables.push(this.createBankTransferInfoObject(payment_option_store.languages[0]));
    }
    this.localizationIdx = payment_option_store.selectedOption.code === '005' ? localizables?.findIndex(l => l.language.id.toString() === this.selectedLanguage) : null;
    payment_option_store.selectedOption = {
      ...payment_option_store.selectedOption,
      localizables: localizables,
    };
  }
  private createBankTransferInfoObject(l: ILanguages): any {
    return {
      code: 'BANK_TRANSFER_INFO',
      description: '',
      id: null,
      language: l,
    };
  }

  async saveOption(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    let selectedOption: PaymentOption = {
      ...payment_option_store.selectedOption,
      property_id: this.propertyId,
      is_active: payment_option_store.mode === 'create' ? true : payment_option_store.selectedOption.is_active ?? false,
    };

    if (selectedOption?.code === '005') {
      const englishDescription = selectedOption.localizables.find(l => l.language.code.toLowerCase() === 'en')?.description;
      if (!englishDescription || englishDescription.trim() === '' || this.isEditorEmpty(englishDescription.trim())) {
        this.selectedLanguage = payment_option_store.languages.find(l => l.code.toLowerCase() === 'en').id.toString();
        this.localizationIdx = payment_option_store.selectedOption.localizables.findIndex(l => l.language.id.toString() === this.selectedLanguage);
        this.invalid = true;
        return;
      }
    }
    if (selectedOption.is_payment_gateway) {
      selectedOption.display_order = 0;
      const hasInvalidData = selectedOption.data.some(d => !d.value || d.value === '');
      if (hasInvalidData) {
        this.invalid = true;
        return;
      }
    }
    await this.paymentOptionService.HandlePaymentMethod(selectedOption);
    this.toast.emit({
      type: 'success',
      description: '',
      title: locales.entries.Lcz_Saved,
      position: 'top-right',
    });
    this.closeModal.emit(selectedOption);
  }
  private isEditorEmpty(htmlString: string): boolean {
    const text = htmlString
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/&nbsp;/g, '')
      .trim();
    return text.length === 0;
  }

  @Listen('selectChange')
  handleSelectChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (payment_option_store.selectedOption.code !== '005') {
      return;
    }
    this.selectedLanguage = e.detail;
    let idx = payment_option_store.selectedOption.localizables.findIndex(l => l.language.id.toString() === this.selectedLanguage);
    const localizables = payment_option_store.selectedOption.localizables ?? [];
    if (idx === -1) {
      localizables.push(this.createBankTransferInfoObject(payment_option_store.languages.find(l => l.id.toString() === this.selectedLanguage)));
      payment_option_store.selectedOption = {
        ...payment_option_store.selectedOption,
        localizables: localizables,
      };
      idx = localizables.length - 1;
    }
    this.localizationIdx = idx;
  }

  private handleTextAreaChange(e: CustomEvent) {
    const value = e.detail;
    if (value.trim() !== '' && this.invalid) {
      this.invalid = false;
    }
    const oldLocalizables = [...payment_option_store.selectedOption.localizables];
    oldLocalizables[this.localizationIdx] = {
      ...oldLocalizables[this.localizationIdx],
      description: value,
    };
    payment_option_store.selectedOption = {
      ...payment_option_store.selectedOption,
      localizables: oldLocalizables,
    };
  }
  private handlePaymentGatewayInfoChange(e: CustomEvent, idx: number): void {
    const value = e.detail;
    const prevData = [...payment_option_store.selectedOption.data];
    prevData[idx] = { ...prevData[idx], value };
    payment_option_store.selectedOption = {
      ...payment_option_store.selectedOption,
      data: prevData,
    };
  }
  render() {
    if (!payment_option_store.selectedOption) {
      return null;
    }
    return (
      <Host>
        <form class={'p-1 mt-2'} onSubmit={this.saveOption.bind(this)}>
          {payment_option_store.selectedOption.code === '005' ? (
            <div>
              <div class="mb-1">
                <ir-select
                  selectedValue={this.selectedLanguage}
                  LabelAvailable={false}
                  showFirstOption={false}
                  data={payment_option_store.languages.map(l => ({
                    text: l.description,
                    value: l.id.toString(),
                  }))}
                ></ir-select>
              </div>
              <div>
                {this.invalid && <p class="text-danger p-0 m-0">{locales.entries.Lcz_YouMustFillEnglishField}</p>}
                <ir-textarea
                  placeholder=""
                  aria-invalid={this.invalid ? 'true' : 'false'}
                  textareaClassname="money-transfer-form"
                  label=""
                  styles={{ height: '200px', maxHeight: '250px' }}
                  onTextChange={this.handleTextAreaChange.bind(this)}
                  value={this.localizationIdx !== null ? payment_option_store.selectedOption?.localizables[this.localizationIdx]?.description ?? '' : ''}
                ></ir-textarea>
                {/* <ir-text-editor
                  plugins={[Link]}
                  pluginsMode="add"
                  toolbarItemsMode="add"
                  toolbarItems={['|', 'link']}
                  style={{ '--ir-editor-height': '250px' }}
                  error={this.invalid}
                  value={this.localizationIdx !== null ? payment_option_store.selectedOption?.localizables[this.localizationIdx]?.description ?? '' : ''}
                  onTextChange={this.handleTextAreaChange.bind(this)}
                ></ir-text-editor> */}
              </div>
            </div>
          ) : (
            <div>
              {payment_option_store.selectedOption.data?.map((d, idx) => {
                return (
                  <fieldset key={d.key}>
                    <ir-input-text
                      value={d.value}
                      onTextChange={e => this.handlePaymentGatewayInfoChange(e, idx)}
                      id={`input_${d.key}`}
                      label={d.key.replace(/_/g, ' ')}
                      placeholder=""
                      labelWidth={4}
                      aria-invalid={this.invalid && (d.value === null || (d.value ?? '')?.trim() === '') ? 'true' : 'false'}
                    ></ir-input-text>
                  </fieldset>
                );
              })}
            </div>
          )}
          <div class={'d-flex flex-column flex-sm-row mt-3'}>
            <ir-button
              onClick={() => this.closeModal.emit(null)}
              btn_styles="justify-content-center"
              class={`mb-1 mb-sm-0 flex-fill mr-sm-1`}
              icon=""
              text={locales.entries.Lcz_Cancel}
              btn_color="secondary"
              btn_type="button"
            ></ir-button>

            <ir-button
              btn_type="submit"
              btn_styles="justify-content-center align-items-center"
              class={'m-0 flex-fill text-center'}
              icon=""
              isLoading={isRequestPending('/Handle_Payment_Method')}
              text={locales.entries.Lcz_Save}
              btn_color="primary"
            ></ir-button>
          </div>
        </form>
      </Host>
    );
  }
}
