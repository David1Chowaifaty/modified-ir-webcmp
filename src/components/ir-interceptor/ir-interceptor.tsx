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
  @State() isUnassignedUnit = false;

  @Prop({ reflect: true, mutable: true }) defaultMessage = {
    loadingMessage: 'Fetching Data',
    errorMessage: 'Something Went Wrong',
  };

  @Prop({ reflect: true }) handledEndpoints = ['/Get_Exposed_Booking_Availability', '/ReAllocate_Exposed_Room'];

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
      } else if (this.extractEndpoint(config.url) === '/Get_Aggregated_UnAssigned_Rooms') {
        this.isUnassignedUnit = true;
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
    } else {
      this.handleCompletion('', true);
    }
    return response;
  }

  handleError(error) {
    if (this.isUnassignedUnit) {
      this.isUnassignedUnit = false;
    }
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
    if (this.isUnassignedUnit) {
      this.isShown = false;
      this.isUnassignedUnit = false;
    } else {
      const delay = isSuccess ? 0 : 5000;
      setTimeout(() => {
        this.isShown = false;
      }, delay);
    }
  }

  handleCompletion(message: string, success: boolean) {
    if (!success) {
      this.defaultMessage = {
        ...this.defaultMessage,
        errorMessage: message,
      };
    }
    this.hideToastAfterDelay(success);
  }

  renderMessage(): string {
    return this.defaultMessage.errorMessage;
  }
  render() {
    const show = !this.isLoading && this.isShown;
    return (
      <Host>
        {this.isLoading && this.isShown && (
          <div class="loadingScreenContainer">
            <div class="loadingContainer">
              <ir-loading-screen></ir-loading-screen>
            </div>
          </div>
        )}
        <div class="toast-container" data-state={show ? 'open' : 'closed'}>
          {show && (
            <Fragment>
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
              <p>{this.renderMessage()}</p>
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}
