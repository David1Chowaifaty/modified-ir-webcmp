import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
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
  @State() endpointsCount = 0;

  @Prop({ reflect: true }) handledEndpoints = ['/Get_Exposed_Calendar', '/ReAllocate_Exposed_Room', '/Get_Exposed_Bookings'];
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
    return this.handledEndpoints.includes(url);
  }

  handleRequest(config: AxiosRequestConfig) {
    const extractedUrl = this.extractEndpoint(config.url);
    interceptor_requests[extractedUrl] = 'pending';
    if (this.isHandledEndpoint(extractedUrl)) {
      if (extractedUrl === '/Do_Payment') {
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

  handleResponse(response: AxiosResponse) {
    const extractedUrl = this.extractEndpoint(response.config.url);
    if (this.isHandledEndpoint(extractedUrl)) {
      this.isLoading = false;
    }
    interceptor_requests[extractedUrl] = 'done';
    if (response.data.ExceptionMsg?.trim()) {
      this.handleError(response.data.ExceptionMsg);
      throw new Error(response.data.ExceptionMsg);
    }
    return response;
  }

  handleError(error: string) {
    this.toast.emit({
      type: 'error',
      title: error,
      description: '',
      position: 'top-right',
    });
    return Promise.reject(error);
  }
  render() {
    return (
      <Host>
        {this.isLoading && (
          <div class="loadingScreenContainer">
            <div class="loaderContainer">
              <span class="loader"></span>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
