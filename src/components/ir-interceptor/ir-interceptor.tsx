import { Component, Fragment, Host, Prop, State, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-interceptor',
  styleUrl: 'ir-interceptor.css',
  scoped: true,
})
export class IrInterceptor {
  @State() isShown = false;
  @State() isLoading = false;
  @State() isSuccess = false;

  @Prop({ reflect: true, mutable: true }) defaultMessage = {
    loadingMessage: 'Fetching Data',
    successMessage: 'Success',
    errorMessage: 'Something Went Wrong',
  };

  @Prop({ reflect: true }) handledEndpoints = ['/Get_Exposed_Booking_Availability', '/Get_Aggregated_UnAssigned_Rooms', '/ReAllocate_Exposed_Room'];

  componentWillLoad() {
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    axios.interceptors.request.use(this.handleRequest.bind(this), this.handleError.bind(this));
    axios.interceptors.response.use(this.handleResponse.bind(this), this.handleError.bind(this));
  }

  extractEndpoint(url: string): string {
    return url.split('?')[0];
  }

  isHandledEndpoint(url: string): boolean {
    return this.handledEndpoints.includes(this.extractEndpoint(url));
  }

  handleRequest(config) {
    if (this.isHandledEndpoint(config.url)) {
      this.isLoading = true;
      if (this.extractEndpoint(config.url) === '/ReAllocate_Exposed_Room') {
        this.defaultMessage.loadingMessage = 'Updating Event';
      } else {
        this.defaultMessage.loadingMessage = 'Fetching Data';
      }
      this.showToast();
    }
    return config;
  }

  handleResponse(response) {
    this.isLoading = false;

    if (response.data.ExceptionMsg?.trim()) {
      this.handleError(response.data.ExceptionMsg);
      throw new Error(response.data.ExceptionMsg);
    }

    if (this.isHandledEndpoint(response.config.url)) {
      this.handleCompletion('Success', true);
    }

    return response;
  }

  handleError(error) {
    if (!this.isShown) {
      this.showToast();
    }
    this.handleCompletion(error, false);
    return Promise.reject(error);
  }

  showToast() {
    this.isShown = true;
  }

  hideToastAfterDelay(isSuccess: boolean) {
    const delay = isSuccess ? 2000 : 5000;
    setTimeout(() => {
      this.isShown = false;
    }, delay);
  }

  handleCompletion(message: string, success: boolean) {
    this.isSuccess = success;
    this.defaultMessage = {
      ...this.defaultMessage,
      [success ? 'successMessage' : 'errorMessage']: message,
    };
    this.hideToastAfterDelay(success);
  }

  renderMessage(): string {
    if (this.isLoading) return this.defaultMessage.loadingMessage;
    return this.isSuccess ? this.defaultMessage.successMessage : this.defaultMessage.errorMessage;
  }
  render() {
    return (
      <Host>
        <div class="toast-container" data-state={this.isShown ? 'open' : 'closed'}>
          {this.isShown && (
            <Fragment>
              {this.isLoading ? (
                <span class="loader"></span>
              ) : !this.isSuccess ? (
                <div class="x-mark-container">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                      fill="white"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              ) : (
                <div class="check-mark-container">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                      fill="white"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              )}

              <p>{this.renderMessage()}</p>
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}