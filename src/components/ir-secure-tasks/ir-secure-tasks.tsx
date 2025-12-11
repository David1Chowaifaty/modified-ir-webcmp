import Token from '@/models/Token';
import { checkUserAuthState, manageAnchorSession } from '@/utils/utils';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
export type SecureScreens =
  | 'hk'
  | 'tasks'
  | 'daily-revenue'
  | 'arrivals'
  | 'departures'
  | 'front'
  | 'users'
  | 'email-logs'
  | 'country-sales'
  | 'daily-occupancy'
  | 'booking-listing'
  | 'channel-sales';
@Component({
  tag: 'ir-secure-tasks',
  styleUrl: 'ir-secure-tasks.css',
  shadow: false,
})
export class IrSecureTasks {
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() bookingNumber: string;
  @Prop() ticket: string;

  @State() isAuthenticated: boolean = false;
  @State() currentPage: SecureScreens;
  @State() inputValue: string;

  private token = new Token();
  private dates: any = {};

  componentWillLoad() {
    const isAuthenticated = checkUserAuthState();

    this.generateDates();
    if (this.ticket) {
      this.isAuthenticated = true;
      this.token.setToken(this.ticket);
      this.propertyid = this.propertyid;
    }
    if (isAuthenticated) {
      this.isAuthenticated = true;
      this.token.setToken(isAuthenticated.token);
    }
    this.inputValue = this.p;
  }
  @Watch('p')
  handlePChange() {
    this.inputValue = this.p;
  }
  @Watch('ticket')
  handleTicketChange(newValue, oldValue) {
    if (newValue !== oldValue) {
      this.isAuthenticated = true;
      this.token.setToken(this.ticket);
      this.propertyid = this.propertyid;
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
  private routes: { name: string; value: SecureScreens }[] = [
    { name: 'Housekeepers', value: 'hk' },
    { name: 'Tasks', value: 'tasks' },
    { name: 'Front', value: 'front' },
    { name: 'Users', value: 'users' },
    { name: 'Sales By Country', value: 'country-sales' },
    { name: 'Daily Occupancy', value: 'daily-occupancy' },
    { name: 'Daily Revenue', value: 'daily-revenue' },
    { name: 'Email logs', value: 'email-logs' },
    { name: 'Booking Listing', value: 'booking-listing' },
    { name: 'Sales by Channel', value: 'channel-sales' },
    { name: 'Arrivals', value: 'arrivals' },
    { name: 'Departures', value: 'departures' },
  ];
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
      <div class={'ir-page__container'}>
        <section class="secure-header">
          <div class="secure-header__top">
            <form
              class="secure-header__aname"
              onSubmit={e => {
                e.preventDefault();
                if (this.inputValue) {
                  const url = new URL(window.location.href);
                  url.searchParams.set('aname', this.inputValue);
                  window.history.pushState({}, '', url);
                }
                this.logout();
              }}
            >
              <label class="secure-header__label" htmlFor="aname-input">
                AName
              </label>
              <div class="secure-header__aname-input">
                <ir-custom-input
                  id="aname-input"
                  type="text"
                  value={this.inputValue}
                  onText-change={e => (this.inputValue = e.detail)}
                  placeholder="AName"
                  aria-label="AName"
                ></ir-custom-input>
                <ir-custom-button variant="brand" type="submit" id="button-save">
                  Save
                </ir-custom-button>
              </div>
            </form>
            <ir-custom-button
              variant="danger"
              onClick={() => {
                this.logout();
              }}
            >
              Logout
            </ir-custom-button>
          </div>
          <nav class="secure-header__tabs" aria-label="Secure screens navigation">
            <ul class="secure-tabs">
              {this.routes.map(route => (
                <li key={route.name} class="secure-tabs__item">
                  <button
                    type="button"
                    class={{ 'secure-tabs__btn': true, 'active': this.currentPage === route.value }}
                    aria-current={this.currentPage === route.value ? 'page' : undefined}
                    onClick={() => {
                      this.currentPage = route.value;
                    }}
                  >
                    {route.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </section>
        {this.renderPage()}
      </div>
    );
  }
  private logout() {
    sessionStorage.removeItem('backend_anchor');
    window.location.reload();
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
      case 'users':
        return <ir-user-management userTypeCode={5} p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-user-management>;
      case 'country-sales':
        return <ir-sales-by-country p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-sales-by-country>;
      case 'daily-occupancy':
        return <ir-monthly-bookings-report p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-monthly-bookings-report>;
      case 'daily-revenue':
        return <ir-daily-revenue p={this.p} propertyid={this.propertyid} language="en" ticket={this.token.getToken()}></ir-daily-revenue>;
      case 'email-logs':
        return <ir-booking-email-logs ticket={this.token.getToken()}></ir-booking-email-logs>;
      case 'booking-listing':
        return <ir-booking-listing p={this.p} language="en" propertyid={this.propertyid} ticket={this.token.getToken()}></ir-booking-listing>;
      case 'channel-sales':
        return <ir-sales-by-channel language="en" propertyid={this.propertyid.toString()} ticket={this.token.getToken()}></ir-sales-by-channel>;
      case 'arrivals':
        return <ir-arrivals language="en" propertyid={this.propertyid} ticket={this.token.getToken()}></ir-arrivals>;
      case 'departures':
        return <ir-departures language="en" propertyid={this.propertyid} ticket={this.token.getToken()}></ir-departures>;
      default:
        return null;
    }
  }
}
