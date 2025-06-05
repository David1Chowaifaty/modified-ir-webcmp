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
  /**
   * List of endpoint paths that should trigger loader logic and OTP handling.
   */
  @Prop({ reflect: true }) handledEndpoints = ['/Get_Exposed_Calendar', '/ReAllocate_Exposed_Room', '/Get_Exposed_Bookings', '/UnBlock_Exposed_Unit'];

  /**
   * List of endpoints for which to suppress toast messages.
   */
  @Prop() suppressToastEndpoints: string[] = [];

  /**
   * Indicates whether the loader is visible.
   */
  @State() isShown = false;

  /**
   * Global loading indicator toggle.
   */
  @State() isLoading = false;

  /**
   * Indicates if the intercepted request involves unassigned units.
   */
  @State() isUnassignedUnit = false;

  /**
   * Count of `/Get_Exposed_Calendar` calls in progress.
   */
  @State() endpointsCount = 0;

  /**
   * Identifier of the endpoint that manually disabled page loader.
   */
  @State() isPageLoadingStopped: string | null = null;

  /**
   * Controls visibility of the OTP modal.
   */
  @State() showModal: boolean;

  /**
   * Request path (used in OTP handling).
   */
  @State() requestUrl: string;

  /**
   * The OTP endpoint path.
   */
  @State() baseOTPUrl: string;

  /**
   * Email for OTP prompt.
   */
  @State() email: string;

  /**
   * Emits a toast notification (`type`, `title`, `description`, `position`).
   */
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;

  private otpModal: HTMLIrOtpModalElement;

  private pendingConfig?: AxiosRequestConfig;
  private pendingResolve?: (resp: AxiosResponse) => void;
  private pendingReject?: (err: any) => void;
  private response?: AxiosResponse;

  @Listen('preventPageLoad', { target: 'body' })
  handleStopPageLoading(e: CustomEvent) {
    this.isLoading = false;
    this.isPageLoadingStopped = e.detail;
  }
  componentWillLoad() {
    this.setupAxiosInterceptors();
  }
  /**
   * Sets up Axios request and response interceptors.
   */
  private setupAxiosInterceptors() {
    axios.interceptors.request.use(this.handleRequest.bind(this), this.handleError.bind(this));
    axios.interceptors.response.use(this.handleResponse.bind(this), this.handleError.bind(this));
  }
  /**
   * Removes query params from URL for consistent endpoint matching.
   */
  private extractEndpoint(url: string): string {
    return url.split('?')[0];
  }

  /**
   * Returns true if the given endpoint is listed as "handled".
   */
  private isHandledEndpoint(url: string): boolean {
    return this.handledEndpoints.includes(url);
  }
  /**
   * Handles outbound Axios requests.
   * - Triggers global loader for certain endpoints
   * - Tracks `/Get_Exposed_Calendar` calls separately
   */
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
  /**
   * Handles inbound Axios responses:
   * - Resets loader
   * - Handles OTP flows and exception messages
   */
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
      return this.handleOtpResponse({ response, extractedUrl });
    }
    if (response.data.ExceptionMsg?.trim()) {
      this.handleResponseExceptions({ response, extractedUrl });
    }
    return response;
  }
  /**
   * Handles and throws known API exception messages.
   */
  private handleResponseExceptions({ response, extractedUrl }: { response: AxiosResponse; extractedUrl: string }) {
    this.handleError(response.data.ExceptionMsg, extractedUrl, response.data.ExceptionCode);
    throw new InterceptorError(response.data.ExceptionMsg, response.data.ExceptionCode);
  }
  /**
   * Handles OTP-required API responses:
   * - Shows OTP modal
   * - Stores request context
   * - Defers resolution to OTP modal
   */
  private handleOtpResponse({ extractedUrl, response }: { response: AxiosResponse; extractedUrl: string }) {
    this.showModal = true;
    this.email = response.data.ExceptionMsg;
    const name = extractedUrl.slice(1);
    this.baseOTPUrl = name;
    if (name === 'Check_OTP_Necessity') {
      let methodName: string;
      try {
        const body = typeof response.config.data === 'string' ? JSON.parse(response.config.data) : response.config.data;
        methodName = body.METHOD_NAME;
      } catch (e) {
        console.error('Failed to parse request body for METHOD_NAME', e);
        methodName = name; // fallback
      }
      this.requestUrl = methodName;
    } else {
      this.requestUrl = name;
    }

    this.pendingConfig = response.config;
    this.response = response;
    return new Promise<AxiosResponse>((resolve, reject) => {
      this.pendingResolve = resolve;
      this.pendingReject = reject;
      setTimeout(() => {
        this.otpModal?.openModal();
      }, 10);
    });
  }
  /**
   * Displays error toasts unless the endpoint is configured to suppress them.
   */
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
  /**
   * Handles the OTP modal completion.
   * Retries the request or cancels based on user action.
   */
  private async handleOtpFinished(ev: CustomEvent) {
    if (!this.pendingConfig || !this.pendingResolve || !this.pendingReject) {
      return;
    }

    const { otp, type } = ev.detail;
    if (type === 'cancel') {
      const cancelResp = {
        config: this.pendingConfig,
        data: { cancelled: true, baseOTPUrl: this.baseOTPUrl },
        status: 0,
        statusText: 'OTP Cancelled',
        headers: {},
        request: {},
      } as AxiosResponse;
      this.pendingResolve(cancelResp);
    } else if (type === 'success') {
      if (!otp) {
        this.pendingReject(new Error('OTP cancelled by user'));
      } else if (this.baseOTPUrl === 'Check_OTP_Necessity') {
        // don't resend, just resolve with the original response
        this.pendingResolve(this.response!);
      } else {
        try {
          const retryConfig: AxiosRequestConfig = {
            ...this.pendingConfig,
            data: typeof this.pendingConfig.data === 'string' ? JSON.parse(this.pendingConfig.data) : this.pendingConfig.data || {},
          };
          const resp = await axios.request(retryConfig);
          this.pendingResolve(resp);
        } catch (err) {
          this.pendingReject(err);
        }
      }
    }

    // common clean-up
    this.pendingConfig = undefined;
    this.pendingResolve = undefined;
    this.pendingReject = undefined;
    this.showModal = false;
    this.baseOTPUrl = null;
  }

  render() {
    return (
      <Host>
        {this.isLoading && !this.isPageLoadingStopped && (
          <div class="loadingScreenContainer">
            <div class="loaderContainer">
              <span class="page-loader"></span>
            </div>
          </div>
        )}
        {this.showModal && (
          <ir-otp-modal
            email={this.email}
            baseOTPUrl={this.baseOTPUrl}
            requestUrl={this.requestUrl}
            ref={el => (this.otpModal = el)}
            onOtpFinished={this.handleOtpFinished.bind(this)}
          ></ir-otp-modal>
        )}
      </Host>
    );
  }
}
