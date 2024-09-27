import { PaymentOption } from '@/models/payment-options';
import { PaymentOptionService } from '@/services/payment_option.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import payment_option_store from '@/stores/payment-option.store';
import { Component, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';
import { IToast } from '../ir-toast/toast';

@Component({
  tag: 'ir-payment-option',
  styleUrl: 'ir-payment-option.css',
  scoped: true,
})
export class IrPaymentOption {
  @Prop() baseurl: string;
  @Prop() propertyid: string;
  @Prop() ticket: string;
  @Prop() language: string = 'en';
  @Prop() defaultStyles: boolean = true;
  @Prop() hideLogs: boolean = false;

  @State() paymentOptions: PaymentOption[] = [];
  @State() isLoading: boolean = false;
  @State() selectedOption: PaymentOption | null = null;

  @Event() toast: EventEmitter<IToast>;

  private paymentOptionService = new PaymentOptionService();
  private roomService = new RoomService();

  private propertyOptionsById: Map<string | number, PaymentOption>;
  private propertyOptionsByCode: Map<string | number, PaymentOption>;

  componentWillLoad() {
    axios.defaults.baseURL = this.baseurl;
    if (this.ticket) {
      this.init();
    }
  }
  @Watch('ticket')
  handleTokenChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.init();
    }
  }
  init() {
    this.initServices();
    this.fetchData();
  }
  @Listen('closeModal')
  handleCloseModal(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    console.log(e.detail);
    this.closeModal(e.detail);
  }

  private log(message?: any, ...optionalParams: any[]): void {
    if (this.hideLogs) {
      return;
    }
    console.log(message, ...optionalParams);
  }

  private closeModal(newOption: PaymentOption | null) {
    if (newOption) {
      this.modifyPaymentList(newOption);
      if (newOption.is_payment_gateway) {
        this.propertyOptionsById.set(newOption.id, newOption);
      } else {
        this.propertyOptionsByCode.set(newOption.code, newOption);
      }
    } else {
      if (!this.propertyOptionsByCode.has(payment_option_store.selectedOption?.code) && !this.propertyOptionsById.has(payment_option_store.selectedOption?.id)) {
        this.modifyPaymentList({ ...payment_option_store.selectedOption, is_active: false });
      }
    }
    payment_option_store.selectedOption = null;
    payment_option_store.mode = null;
  }
  private async fetchData() {
    try {
      this.log('start fetching data');
      this.isLoading = true;
      const [paymentOptions, propertyOptions, languageTexts] = await Promise.all([
        this.paymentOptionService.GetExposedPaymentMethods(),
        this.paymentOptionService.GetPropertyPaymentMethods(this.propertyid),
        this.roomService.fetchLanguage(this.language, ['_PAYMENT_BACK']),
      ]);

      this.log('---feteched data---');
      this.log('paymentOptions', paymentOptions);
      this.log('propertyOptions', propertyOptions);
      this.log('languageTexts', languageTexts);
      this.log('---feteched data---');
      locales.entries = languageTexts.entries;
      locales.direction = languageTexts.direction;
      this.propertyOptionsById = new Map(propertyOptions?.map(o => [o.id, o]));
      this.propertyOptionsByCode = new Map(propertyOptions?.map(o => [o.code, o]));
      this.paymentOptions = paymentOptions?.map(option => {
        if (option.is_payment_gateway) {
          return this.propertyOptionsById.get(option.id) || option;
        }
        return this.propertyOptionsByCode.get(option.code) || option;
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
      this.log('end fetching data');
    }
  }

  private initServices() {
    payment_option_store.token = this.ticket;
    this.paymentOptionService.setToken(this.ticket);
    this.roomService.setToken(this.ticket);
  }
  private modifyPaymentList(paymentOption: PaymentOption) {
    this.paymentOptions = [
      ...this.paymentOptions.map(p => {
        if ((paymentOption.is_payment_gateway && p.id === paymentOption.id) || (paymentOption.code === '005' && p.code === '005')) {
          return paymentOption;
        }
        return p;
      }),
    ];
  }
  private async handleCheckChange(e: CustomEvent, po: PaymentOption) {
    e.stopPropagation();
    e.stopImmediatePropagation();

    const is_active = e.detail;
    const newOption = { ...po, is_active, property_id: this.propertyid };
    if (po.code === '000' && is_active && this.paymentOptions.every(p => !p.is_active)) {
      this.toast.emit({
        type: 'success',
        description: '',
        title: 'You need to select "No deposit required" from your Pre-payment options since you have no means of charging guests before arrival.',
        position: 'top-right',
      });
    }
    if (po.code !== '005' && !po.is_payment_gateway) {
      await this.paymentOptionService.HandlePaymentMethod(newOption);
      this.modifyPaymentList(newOption);
      return;
    }

    if (!this.showEditButton(po)) {
      this.modifyPaymentList(newOption);
      return;
    }
    if (is_active && po.data?.some(d => d.value === null)) {
      payment_option_store.mode = 'create';
      payment_option_store.selectedOption = newOption;
    } else {
      await this.paymentOptionService.HandlePaymentMethod(newOption);
    }
    this.modifyPaymentList(newOption);
  }
  private showEditButton(po: PaymentOption) {
    if (!po.is_payment_gateway && po.code !== '005') {
      return false;
    }

    return po.code === '005' || (po.is_payment_gateway && po.data?.length > 0);
  }
  render() {
    this.log('----loading conditions----');
    this.log('isLoading', this.isLoading);
    this.log('paymentOptions', this.paymentOptions);
    this.log('----loading conditions----');

    if (this.isLoading || this.paymentOptions.length == 0) {
      this.log('rendering the loading view');
      return (
        <Host class={this.defaultStyles ? 'p-2' : ''}>
          <div class={`loading-container ${this.defaultStyles ? 'default' : ''}`}>
            <span class="payment-option-loader"></span>
          </div>
        </Host>
      );
    }
    this.log('rendering the payment option');
    // debugger;
    if (this.propertyid.toString() === '42') {
      return (
        <div>
          <p>Testing</p>
          <p>locale.entries: {JSON.stringify(locales?.entries)}</p>
          <p>payment options: {JSON.stringify(this.paymentOptions)}</p>
          <p>Loading:{JSON.stringify(this.isLoading)}</p>
        </div>
      );
    }
    return (
      <Host class={this.defaultStyles ? 'p-2' : ''}>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <div class={`${this.defaultStyles ? 'card ' : ''} p-1 flex-fill m-0`}>
          <div class="d-flex align-items-center mb-2">
            <div class="p-0 m-0 mr-1">
              <ir-icons name="credit_card"></ir-icons>
            </div>
            <h3 class={'m-0 p-0'}>{locales?.entries?.Lcz_PaymentOptions}</h3>
          </div>
          <div class="payment-table-container">
            <table class="table table-striped table-bordered no-footer dataTable">
              <thead>
                <tr>
                  <th scope="col" class="text-left">
                    {locales?.entries?.Lcz_PaymentMethod}
                  </th>
                  <th scope="col">{locales?.entries?.Lcz_Status}</th>
                  <th scope="col" class="actions-header">
                    {locales?.entries?.Lcz_Action}
                  </th>
                </tr>
              </thead>
              <tbody class="">
                {this.paymentOptions?.map(po => {
                  if (po.code === '004') {
                    return null;
                  }
                  return (
                    <tr key={po.id}>
                      <td class={'text-left po-description'}>
                        <div class="po-view">
                          <span class={'p-0 m-0'}>{po?.description}</span>
                          {/* <img src="https://www.jccsmart.com/assets/images/app-logo.svg" alt="" class="payment-img" /> */}
                        </div>
                      </td>

                      <td>
                        <ir-switch checked={po.is_active} onCheckChange={e => this.handleCheckChange(e, po)}></ir-switch>
                      </td>
                      <td class="payment-action">
                        {this.showEditButton(po) && (
                          <ir-button
                            title={locales?.entries?.Lcz_Edit}
                            variant="icon"
                            icon_name="edit"
                            onClickHanlder={() => {
                              payment_option_store.selectedOption = po;
                              payment_option_store.mode = 'edit';
                            }}
                          ></ir-button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <ir-sidebar
          onIrSidebarToggle={() => {
            this.closeModal(null);
          }}
          label={locales?.entries.Lcz_Information?.replace('%1', payment_option_store.selectedOption?.description)}
          open={payment_option_store?.selectedOption !== null}
        >
          {payment_option_store?.selectedOption && <ir-option-details propertyId={this.propertyid} slot="sidebar-body"></ir-option-details>}
        </ir-sidebar>
      </Host>
    );
  }
}
