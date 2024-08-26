import { PaymentOption } from '@/models/payment-options';
import { PaymentOptionService } from '@/services/payment_option.service';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-payment-option',
  styleUrl: 'ir-payment-option.css',
  scoped: true,
})
export class IrPaymentOption {
  @Prop() baseurl: string;
  @Prop() propertyid: string;
  @Prop() ticket: string;

  @State() paymentOptions: PaymentOption[] = [];
  @State() isLoading: boolean = false;

  private paymentOptionService = new PaymentOptionService();
  @State() selectedOption: PaymentOption | null = null;

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
  async fetchData() {
    try {
      this.isLoading = true;
      const [paymentOptions] = await Promise.all([this.paymentOptionService.GetExposedPaymentMethods()]);
      this.paymentOptions = paymentOptions;
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  initServices() {
    this.paymentOptionService.setToken(this.ticket);
  }
  render() {
    if (this.isLoading) {
      return <p>loading</p>;
    }
    const showEditButton = (po: PaymentOption, ignoreActive = false) => {
      if (!po.is_active && !ignoreActive) {
        return false;
      }

      return po.code === '005' || (po.is_payment_gateway && po.data?.length > 0);
    };
    return (
      <Host>
        <div class="card p-1 flex-fill m-0">
          <table class="table table-striped table-bordered no-footer dataTable">
            <thead>
              <tr>
                <th scope="col" class="text-left">
                  Payment method
                  {/* {locales.entries?.Lcz_Channel} */}
                </th>
                <th scope="col">Status{/* {locales.entries?.Lcz_Status} */}</th>
                <th scope="col" class="actions-theader">
                  Action
                  {/* {locales.entries?.Lcz_Actions} */}
                </th>
              </tr>
            </thead>
            <tbody class="">
              {this.paymentOptions?.map(po => (
                <tr key={po.id}>
                  <td>{po.description}</td>
                  <td>
                    <ir-switch
                      checked={po.is_active}
                      onCheckChange={() => {
                        if (showEditButton(po, true)) {
                          this.selectedOption = po;
                        }
                      }}
                    ></ir-switch>
                  </td>
                  <td>{showEditButton(po) && <ir-button variant="icon" icon_name="edit"></ir-button>}</td>
                </tr>
              ))}
              {/* {channels_data.connected_channels?.map(channel => (
                  <tr key={channel.channel.id}>
                    <td class="text-left">
                      {channel.channel.name} {channel.title ? `(${channel.title})` : ''}
                    </td>
                    <td>
                      <ir-switch checked={channel.is_active} onCheckChange={e => this.handleCheckChange(e.detail, channel)}></ir-switch>
                    </td>
                    <th>
                      <div class="d-flex justify-content-end">
                        <div class="btn-group">
                          <button type="button" class="btn  dropdown-toggle px-0" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class="mr-1"> {locales.entries?.Lcz_Actions}</span>
                            <svg class={'caret-icon'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={14} width={14}>
                              <path
                                fill="var(--blue)"
                                d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                              />
                            </svg>
                          </button>
                          <div class="dropdown-menu dropdown-menu-right">
                            {actions(locales.entries).map((a, index) => (
                              <Fragment>
                                <button
                                  onClick={() => {
                                    if (a.id === 'pull_future_reservation' || a.id === 'view_logs') {
                                      return;
                                    }
                                    a.action(channel);
                                    if (a.id === 'edit') {
                                      setTimeout(() => {
                                        this.channel_status = 'edit';
                                      }, 300);
                                    } else {
                                      this.modal_cause = a.action(channel) as any;
                                      this.openModal();
                                    }
                                  }}
                                  key={a.id + '_item'}
                                  class={`dropdown-item my-0 ${a.id === 'remove' ? 'danger' : ''}`}
                                  type="button"
                                >
                                  {a.icon()}
                                  {a.name}
                                </button>
                                {index < actions(locales.entries).length - 1 && <div key={a.id + '_divider'} class="dropdown-divider my-0"></div>}
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    </th>
                  </tr>
                ))} */}
            </tbody>
          </table>
        </div>
        <ir-sidebar
          onIrSidebarToggle={() => {
            this.selectedOption = null;
          }}
          open={this.selectedOption !== null}
        >
          <ir-option-details slot="sidebar-body" selectedOption={this.selectedOption}></ir-option-details>
        </ir-sidebar>
      </Host>
    );
  }
}
