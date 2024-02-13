import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import axios from 'axios';
import { IToast } from '../ir-toast/toast';

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
  @Event({ bubbles: true, composed: true }) fetchingIrInterceptorDataStatus: EventEmitter<'pending' | 'done'>;
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

  /* HTML: <div class="loader"></div> */
  // .loader {
  //   width: 60px;
  //   aspect-ratio: 2;
  //   --_g: no-repeat radial-gradient(circle closest-side,#000 90%,#0000);
  //   background:
  //     var(--_g) 0%   50%,
  //     var(--_g) 50%  50%,
  //     var(--_g) 100% 50%;
  //   background-size: calc(100%/3) 50%;
  //   animation: l3 1s infinite linear;
  // }
  // @keyframes l3 {
  //     20%{background-position:0%   0%, 50%  50%,100%  50%}
  //     40%{background-position:0% 100%, 50%   0%,100%  50%}
  //     60%{background-position:0%  50%, 50% 100%,100%   0%}
  //     80%{background-position:0%  50%, 50%  50%,100% 100%}
  // }

  handleRequest(config) {
    this.fetchingIrInterceptorDataStatus.emit('pending');
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
    this.fetchingIrInterceptorDataStatus.emit('done');
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
