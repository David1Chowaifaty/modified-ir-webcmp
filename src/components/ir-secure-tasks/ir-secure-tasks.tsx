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
  @State() currentPage: string;

  private token = new Token();
  private dates: any = {};

  componentWillLoad() {
    const isAuthenticated = checkUserAuthState();
    this.generateDates();
    if (isAuthenticated) {
      this.isAuthenticated = true;
      this.token.setToken(isAuthenticated.token);
    }
  }
  private generateDates() {
    var today = new Date();
    today.setDate(today.getDate() - 1);
    var _FROM_DATE = today.toISOString().substring(0, 10);
    today.setDate(today.getDate() + 60);
    var _TO_DATE = today.toISOString().substring(0, 10);

    this.dates = {
      from_date: _FROM_DATE,
      to_date: _TO_DATE,
    };
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
            <li class="nav-item">
              <a
                class={{ 'nav-link': true, 'active': this.currentPage === 'front' }}
                href="#"
                onClick={() => {
                  this.currentPage = 'front';
                }}
              >
                Front
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
        {this.renderPage()}
      </Host>
    );
  }
  renderPage() {
    switch (this.currentPage) {
      case 'tasks':
        return <ir-hk-tasks p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-hk-tasks>;

      case 'front':
        return (
          <igloo-calendar
            currencyName="USD"
            propertyid={this.propertyid}
            p={this.p}
            ticket={this.token.getToken()}
            from_date={this.dates.from_date}
            to_date={this.dates.to_date}
            language="en"
          ></igloo-calendar>
        );

      case 'hk':
        return <ir-housekeeping p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-housekeeping>;

      default:
        return null;
    }
  }
}
