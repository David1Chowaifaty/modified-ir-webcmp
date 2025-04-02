import { Component, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { IToast } from '@components/ui/ir-toast/toast';
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
  @State() isPageLoadingStoped: string | null = null;

  @Prop({ reflect: true }) handledEndpoints = ['/Get_Exposed_Calendar', '/ReAllocate_Exposed_Room', '/Get_Exposed_Bookings', '/UnBlock_Exposed_Unit'];
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;

  @Listen('preventPageLoad', { target: 'body' })
  handleStopPageLoading(e: CustomEvent) {
    this.isLoading = false;
    this.isPageLoadingStoped = e.detail;
  }
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
    config.params = config.params || {};
    // if (this.ticket) {
    //   config.params.Ticket = this.ticket;
    // }
    if (this.isHandledEndpoint(extractedUrl) && this.isPageLoadingStoped !== extractedUrl) {
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

  handleResponse(response: AxiosResponse) {
    const extractedUrl = this.extractEndpoint(response.config.url);
    if (this.isHandledEndpoint(extractedUrl)) {
      this.isLoading = false;
      this.isPageLoadingStoped = null;
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
        {/* {this.isLoading && !this.isPageLoadingStoped && (
          <div class="loadingScreenContainer">
            <div class="loaderContainer">
              <span class="loader"></span>
              <p>Fetching bookings.</p>
            </div>
          </div>
        )} */}
        {this.isLoading && !this.isPageLoadingStoped && (
          <div class="loadingScreenContainer">
            <div class="loaderContainer">
              <span class="page-loader"></span>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
