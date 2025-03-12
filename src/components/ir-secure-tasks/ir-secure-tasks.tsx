import Token from '@/models/Token';
import { checkUserAuthState, manageAnchorSession } from '@/utils/utils';
import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-secure-tasks',
  styleUrl: 'ir-secure-tasks.css',
  scoped: true,
})
export class IrSecureTasks {
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() bookingNumber: string;
  @State() isAuthenticated: boolean = false;
  private token = new Token();
  @State() currentPage: string;

  componentWillLoad() {
    const isAuthenticated = checkUserAuthState();
    if (isAuthenticated) {
      this.isAuthenticated = true;
      this.token.setToken(isAuthenticated.token);
    }
  }

  private handleAuthFinish(e: CustomEvent) {
    const token = e.detail.token;
    this.token.setToken(token);
    this.isAuthenticated = true;
    manageAnchorSession({ login: { method: 'direct', isLoggedIn: true, token } });
  }
  render() {
    if (!this.isAuthenticated)
      return (
        <Host>
          <ir-login onAuthFinish={this.handleAuthFinish.bind(this)}></ir-login>
        </Host>
      );
    return (
      <Host>
        <div class="px-1 nav  d-flex align-items-center justify-content-between">
          <ul class="nav nav-tabs">
            <li class=" nav-item">
              <a
                class={{ 'nav-link': true, 'active': this.currentPage === 'hk' }}
                href="#"
                onClick={() => {
                  this.currentPage = 'hk';
                }}
              >
                Housekeepers
              </a>
            </li>
            <li class="nav-item">
              <a
                class={{ 'nav-link': true, 'active': this.currentPage === 'tasks' }}
                href="#"
                onClick={() => {
                  this.currentPage = 'tasks';
                }}
              >
                Tasks
              </a>
            </li>
          </ul>
          <button
            class="btn btn-sm btn-primary"
            onClick={() => {
              sessionStorage.removeItem('backend_anchor');
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>
        {this.currentPage === 'tasks' ? (
          <ir-hk-tasks p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-hk-tasks>
        ) : (
          <ir-housekeeping p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-housekeeping>
        )}
      </Host>
    );
  }
}
