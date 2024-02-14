import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import axios from 'axios';
import { IToast } from '../ir-toast/toast';
import interceptor_requests from '@/stores/ir-interceptor.store';

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

  @Prop({ reflect: true }) handledEndpoints = ['/ReAllocate_Exposed_Room'];
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;
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
    interceptor_requests.status = 'pending';
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
    interceptor_requests.status = 'done';
    if (response.data.ExceptionMsg?.trim()) {
      this.handleError(response.data.ExceptionMsg);
      throw new Error(response.data.ExceptionMsg);
    } else {
      this.hideToastAfterDelay(true);
    }
    return response;
  }

  handleError(error) {
    if (this.isUnassignedUnit) {
      this.isUnassignedUnit = false;
    }

    this.hideToastAfterDelay(true);
    this.toast.emit({
      type: 'error',
      title: error,
      description: '',
      position: 'top-right',
    });
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

  renderMessage(): string {
    return this.defaultMessage.errorMessage;
  }
  render() {
    return (
      <Host>
        {this.isLoading && this.isShown && (
          <div class="loadingScreenContainer">
            <div class="loadingContainer">
              <ir-loading-screen></ir-loading-screen>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
