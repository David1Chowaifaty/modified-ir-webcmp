import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'ir-test3-cmp',
  styleUrls: ['ir-test-cmp.css', '../../common/table.css'],
  scoped: true,
})
export class IrTest3Cmp {
  @State() open: boolean;
  input: HTMLIrInputElement;
  render() {
    return (
      <ir-menu-drawer>
        <div slot="label">
          <img style={{ height: '24px' }} src="	https://x.igloorooms.com/app-assets/images/logo/logo-dark.png" alt="" />
        </div>
        <ir-menu>
          <div>
            <ir-custom-button data-dialog="open dialog-opening" style={{ marginBottom: '1rem' }} size="small" appearance="plain" class="header-property-switcher">
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
          <ir-menu-item href="acbookinglist.aspx">Bookings</ir-menu-item>

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
    );
  }
}
