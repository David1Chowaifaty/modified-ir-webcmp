import { Component, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IToast } from '@components/ui/ir-toast/toast';
import interceptor_requests from '@/stores/ir-interceptor.store';
import { InterceptorError } from './InterceptorError';

@Component({
  tag: 'ir-interceptor',
  styleUrl: 'ir-interceptor.css',
  scoped: true,
})
export class IrInterceptor {
  @Prop({ reflect: true }) handledEndpoints = ['/Get_Exposed_Calendar', '/ReAllocate_Exposed_Room', '/Get_Exposed_Bookings', '/UnBlock_Exposed_Unit'];
  @Prop() suppressToastEndpoints: string[] = [];

  @State() isShown = false;
  @State() isLoading = false;
  @State() isUnassignedUnit = false;
  @State() endpointsCount = 0;
  @State() isPageLoadingStopped: string | null = null;
  @State() showModal: boolean;
  @State() requestUrl: string;
  @State() email: string;

  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;

  private otpModal: HTMLIrOtpModalElement;

  private pendingConfig?: AxiosRequestConfig;
  private pendingResolve?: (resp: AxiosResponse) => void;
  private pendingReject?: (err: any) => void;

  @Listen('preventPageLoad', { target: 'body' })
  handleStopPageLoading(e: CustomEvent) {
    this.isLoading = false;
    this.isPageLoadingStopped = e.detail;
  }
  componentWillLoad() {
    this.setupAxiosInterceptors();
  }

  private setupAxiosInterceptors() {
    axios.interceptors.request.use(this.handleRequest.bind(this), this.handleError.bind(this));
    axios.interceptors.response.use(this.handleResponse.bind(this), this.handleError.bind(this));
  }

  private extractEndpoint(url: string): string {
    return url.split('?')[0];
  }

  private isHandledEndpoint(url: string): boolean {
    return this.handledEndpoints.includes(url);
  }
  private handleRequest(config: AxiosRequestConfig) {
    const extractedUrl = this.extractEndpoint(config.url);
    interceptor_requests[extractedUrl] = 'pending';
    config.params = config.params || {};
    // if (this.ticket) {
    //   config.params.Ticket = this.ticket;
    // }
    if (this.isHandledEndpoint(extractedUrl) && this.isPageLoadingStopped !== extractedUrl) {
      if (extractedUrl !== '/Get_Exposed_Calendar') {
        this.isLoading = true;
      } else {
        if (this.endpointsCount > 0) {
          this.isLoading = true;
        }
      }
    }
    if (extractedUrl === '/Get_Exposed_Calendar') {
      this.endpointsCount = this.endpointsCount + 1;
    }
    return config;
  }

  private async handleResponse(response: AxiosResponse) {
    const extractedUrl = this.extractEndpoint(response.config.url);
    if (this.isHandledEndpoint(extractedUrl)) {
      this.isLoading = false;
      this.isPageLoadingStopped = null;
    }
    interceptor_requests[extractedUrl] = 'done';
    if (extractedUrl === '/Validate_Exposed_OTP') {
      return response;
    }
    if (response.data.ExceptionCode === 'OTP') {
      this.showModal = true;
      this.email = response.data.ExceptionMsg;
      this.requestUrl = extractedUrl.slice(1, extractedUrl.length);
      this.pendingConfig = response.config;
      return new Promise<AxiosResponse>((resolve, reject) => {
        this.pendingResolve = resolve;
        this.pendingReject = reject;
        setTimeout(() => {
          this.otpModal?.openModal();
        }, 10);
      });
    }
    if (response.data.ExceptionMsg?.trim()) {
      this.handleError(response.data.ExceptionMsg, extractedUrl, response.data.ExceptionCode);
      throw new InterceptorError(response.data.ExceptionMsg, response.data.ExceptionCode);
    }
    return response;
  }

  private handleError(error: string, url: string, code: string) {
    const shouldSuppressToast = this.suppressToastEndpoints.includes(url);
    if (!shouldSuppressToast || (shouldSuppressToast && !code)) {
      this.toast.emit({
        type: 'error',
        title: error,
        description: '',
        position: 'top-right',
      });
    }
    return Promise.reject(error);
  }
  private async handleOtpFinished(ev: CustomEvent) {
    if (!this.pendingConfig || !this.pendingResolve || !this.pendingReject) {
      return;
    }

    const otp = ev.detail;
    if (!otp) {
      this.pendingReject(new Error('OTP cancelled by user'));
    } else {
      try {
        const retryConfig: AxiosRequestConfig = {
          ...this.pendingConfig,
          data: {
            ...(typeof this.pendingConfig.data === 'string' ? JSON.parse(this.pendingConfig.data) : this.pendingConfig.data || {}),
          },
        };
        const resp = await axios.request(retryConfig);
        this.pendingResolve(resp);
      } catch (err) {
        this.pendingReject(err);
      }
    }
    this.pendingConfig = undefined;
    this.pendingResolve = undefined;
    this.pendingReject = undefined;
    this.showModal = false;
  }
  render() {
    return (
      <Host>
        {/* {this.isLoading && !this.isPageLoadingStopped && (
          <div class="loadingScreenContainer">
            <div class="loaderContainer">
              <span class="loader"></span>
              <p>Fetching bookings.</p>
            </div>
          </div>
        )} */}
        {this.isLoading && !this.isPageLoadingStopped && (
          <div class="loadingScreenContainer">
            <div class="loaderContainer">
              <span class="page-loader"></span>
            </div>
          </div>
        )}
        {this.showModal && (
          <ir-otp-modal email={this.email} requestUrl={this.requestUrl} ref={el => (this.otpModal = el)} onOtpFinished={this.handleOtpFinished.bind(this)}></ir-otp-modal>
        )}
      </Host>
    );
  }
}
