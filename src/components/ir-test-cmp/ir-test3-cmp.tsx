import { Component, h, State } from '@stencil/core';
import moment from 'moment';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-test3-cmp',
  styleUrls: ['ir-test3-cmp.css'],
  scoped: true,
})
export class IrTest3Cmp {
  input: HTMLIrInputElement;
  menuDrawerRef: HTMLIrMenuDrawerElement;
  @State() notifications = [
    {
      id: '1',
      type: 'info',
      title: 'Welcome!',
      message: 'Your account has been created successfully.',
      date: moment().format('YYYY-MM-DD'),
      hour: 10,
      minute: 10,
      read: false,
      dismissible: true,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Storage Almost Full',
      message: 'You have used 90% of your storage. Please upgrade.',
      date: moment().add(-1, 'days').format('YYYY-MM-DD'),
      hour: 1,
      minute: 10,
      read: false,
      dismissible: true,
      link: { href: '#', text: 'Upgrade now' },
    },
    {
      id: '3',
      type: 'success',
      title: 'Payment Received',
      message: 'Your invoice has been paid. Thank you!',
      date: moment().add(-2, 'month').format('YYYY-MM-DD'),
      hour: 10,
      minute: 10,
      read: true,
      dismissible: true,
    },
  ];
  render() {
    return (
      <div>
        <header class="app-header">
          <div class="app-header__left">
            <ir-custom-button onClickHandler={() => this.menuDrawerRef.openDrawer()} size="small" appearance="plain" variant="neutral" class="header-action">
              <wa-icon name="bars" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
            <div class="d-flex" style={{ marginLeft: '1rem' }}>
              <a href="/">
                <img class="logo" src="https://gateway.igloorooms.com/irimages/aclogo/AcLogo_229.png?t=1597509988143" />
              </a>
              <ir-custom-button data-dialog="open dialog-opening" size="small" appearance="plain" class="header-property-switcher">
                <span class="header-property-name">Hotel California</span>
                <wa-icon name="chevron-down"></wa-icon>
              </ir-custom-button>
            </div>
          </div>

          <div class="app-header__center">
            <ir-input class="header-search" pill appearance="filled" placeholder="Search guest name, booking">
              <wa-icon name="magnifying-glass" slot="start"></wa-icon>
              <span slot="end">⌘K</span>
            </ir-input>
          </div>

          <div class="app-header__right">
            <ir-custom-button id="add-booking-btn" size="small" appearance="plain" variant="brand">
              <wa-icon name="circle-plus" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
            <wa-tooltip for="add-booking-btn">New booking</wa-tooltip>

            <ir-custom-button id="calendar-btn" href="/frontdesk.aspx" size="small" appearance="plain" class="header-desktop-only">
              <wa-icon name="calendar" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
            <wa-tooltip for="calendar-btn">Calendar</wa-tooltip>

            <ir-custom-button href="/acbookinglist.aspx" id="rooms-btn" size="small" appearance="plain" class="header-desktop-only">
              <wa-icon name="bed" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
            <wa-tooltip for="rooms-btn">Bookings</wa-tooltip>

            <ir-custom-button id="departures-btn" href="AcDepartures.aspx" size="small" appearance="plain" class="header-desktop-only">
              <wa-icon name="plane-departure" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
            <wa-tooltip for="departures-btn">Check-outs</wa-tooltip>

            <ir-custom-button href="/AcArrivals.aspx" id="arrivals-btn" size="small" appearance="plain" class="header-desktop-only">
              <wa-icon name="plane-arrival" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
            <wa-tooltip for="arrivals-btn">Check-ins</wa-tooltip>

            <ir-notifications></ir-notifications>

            <wa-dropdown>
              <wa-avatar slot="trigger" style={{ '--size': '2rem', 'marginLeft': '0.5rem' }}></wa-avatar>
              <wa-dropdown-item>
                <wa-icon slot="icon" name="globe"></wa-icon>
                View Your Website
              </wa-dropdown-item>
              <wa-dropdown-item>
                <wa-icon slot="icon" name="arrow-up-right-from-square"></wa-icon>
                bookingmystay.com/A35
              </wa-dropdown-item>
              <wa-dropdown-item disabled>
                <wa-icon slot="icon" name="hashtag"></wa-icon>
                Property ID: 42
              </wa-dropdown-item>
              <wa-divider></wa-divider>
              <wa-dropdown-item>
                <wa-icon slot="icon" name="users"></wa-icon>
                Extranet Users
              </wa-dropdown-item>
              <wa-dropdown-item>
                <wa-icon slot="icon" name="lock"></wa-icon>
                Change Password
              </wa-dropdown-item>

              <wa-divider></wa-divider>
              <wa-dropdown-item>
                <wa-icon slot="icon" name="wallet"></wa-icon>
                Billing
              </wa-dropdown-item>
              <wa-divider></wa-divider>
              <wa-dropdown-item variant="danger">
                <wa-icon slot="icon" name="power-off"></wa-icon>
                Logout
              </wa-dropdown-item>
            </wa-dropdown>
          </div>
        </header>
        <ir-menu-drawer ref={el => (this.menuDrawerRef = el)}>
          <div slot="label">
            <img style={{ height: '24px' }} src="	https://x.igloorooms.com/app-assets/images/logo/logo-dark.png" alt="" />
          </div>
          <ir-menu>
            <div>
              <ir-custom-button data-dialog="open dialog-opening" style={{ marginBottom: '1rem' }} size="small" appearance="plain" class="header-property-switcher">
                <img class="logo" src="https://gateway.igloorooms.com/irimages/aclogo/AcLogo_229.png?t=1597509988143" />
                <span class="header-property-name">Hotel California</span>
                <wa-icon name="chevron-down"></wa-icon>
              </ir-custom-button>
            </div>
            <p style={{ margin: '0', marginBottom: '0.5rem' }}>General</p>
            <ir-menu-item slot="summary">Property</ir-menu-item>
            <ir-menu-item href="acdashboard.aspx">Dashboard</ir-menu-item>
            <ir-menu-item href="frontdesk.aspx">Frontdesk</ir-menu-item>
            <ir-menu-item href="acratesallotment.aspx">Inventory</ir-menu-item>
            <ir-menu-item href="frontdesk.aspx">Frontdesk</ir-menu-item>
            <p style={{ margin: '0', marginTop: '1rem', marginBottom: '0.5rem' }}>Property</p>
            {/* <ir-menu-group open groupName="main"> */}
            <ir-menu-item slot="summary">Property</ir-menu-item>
            <ir-menu-item href="acdashboard.aspx">Dashboard</ir-menu-item>
            <ir-menu-item href="frontdesk.aspx">Frontdesk</ir-menu-item>
            <ir-menu-item href="acratesallotment.aspx">Inventory</ir-menu-item>
            <ir-menu-group groupName="sub-property">
              <ir-menu-item slot="summary">Marketing</ir-menu-item>
              <ir-menu-item href="acpromodiscounts.aspx">Discounts</ir-menu-item>
              <ir-menu-item href="acautomatedemails.aspx">Automated Emails</ir-menu-item>
            </ir-menu-group>
            <ir-menu-group groupName="sub-property">
              <ir-menu-item slot="summary">Bookings</ir-menu-item>
              <ir-menu-item href="/acbookinglist.aspx">Bookings List</ir-menu-item>
              <ir-menu-item href="/AcArrivals.aspx">Check-ins</ir-menu-item>
              <ir-menu-item href="/AcDepartures.aspx">Check-outs</ir-menu-item>
            </ir-menu-group>

            <ir-menu-group groupName="sub-property">
              <ir-menu-item slot="summary">Settings</ir-menu-item>
              <ir-menu-item href="acgeneral.aspx">General Info</ir-menu-item>
              <ir-menu-item href="acamenities.aspx">Facilities &amp; Services</ir-menu-item>
              <ir-menu-item href="acdescriptions.aspx">Descriptions</ir-menu-item>
              <ir-menu-item href="acconcan.aspx">Policies</ir-menu-item>
              <ir-menu-item href="accommtax.aspx">Money Matters</ir-menu-item>
              <ir-menu-item href="acroomcategories.aspx">Rooms &amp; Rate Plans</ir-menu-item>
              <ir-menu-item href="ACHousekeeping.aspx">Housekeeping &amp; Check-in Setup</ir-menu-item>
              <ir-menu-item href="actravelagents.aspx">Agents and Groups</ir-menu-item>
              <ir-menu-item href="acimagegallery.aspx">Image Gallery</ir-menu-item>
              <ir-menu-item href="acpickups.aspx">Pickup Services</ir-menu-item>
              <ir-menu-item href="acintegrations.aspx">Integrations</ir-menu-item>
              <ir-menu-item href="acthemingwebsite.aspx">iSPACE</ir-menu-item>
              <ir-menu-item href="acigloochannel.aspx">iCHANNEL</ir-menu-item>
              <ir-menu-item href="iSwitch.aspx">iSWITCH</ir-menu-item>
            </ir-menu-group>

            <ir-menu-group groupName="sub-property">
              <ir-menu-item slot="summary">Reports</ir-menu-item>

              <ir-menu-item href="ACHousekeepingTasks.aspx">Housekeeping Tasks</ir-menu-item>
              <ir-menu-item href="acmemberlist.aspx">Guests</ir-menu-item>
              <ir-menu-item href="acsalesstatistics.aspx">Sales Statistics</ir-menu-item>
              <ir-menu-item href="acsalesbychannel.aspx">Sales by Channel</ir-menu-item>
              <ir-menu-item href="acsalesbycountry.aspx">Sales by Country</ir-menu-item>
              <ir-menu-item href="ACDailyOccupancy.aspx">Daily Occupancy</ir-menu-item>
              <ir-menu-item href="acaccountingreport.aspx">Accounting Report</ir-menu-item>
            </ir-menu-group>
            {/* </ir-menu-group> */}
          </ir-menu>
          <div class="menu-footer" slot="footer" style={{ textAlign: 'start' }}>
            <h4>A35</h4>
            <span style={{ fontSize: '0.875rem' }}>lorem@noemail.com</span>
          </div>
          {/* <ir-dialog open={this.open}>{this.open && <ir-input ref={el => (this.input = el)}></ir-input>}</ir-dialog> */}
        </ir-menu-drawer>
        <div>
          <div style={{ height: '200vh' }}></div>
        </div>
      </div>
    );
  }
}
