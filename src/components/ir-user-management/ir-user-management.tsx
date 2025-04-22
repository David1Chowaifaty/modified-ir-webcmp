import Token from '@/models/Token';
import { User } from '@/models/Users';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import { UserService } from '@/services/user.service';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-user-management',
  styleUrl: 'ir-user-management.css',
  scoped: true,
})
export class IrUserManagement {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() isSuperAdmin: boolean = true;

  @State() isLoading = true;
  @State() users: User[] = [];
  @State() property_id: number;

  private token = new Token();
  private roomService = new RoomService();
  private userService = new UserService();
  private bookingService = new BookingService();

  private userTypes: Map<number | string, string> = new Map();

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }
  private async initializeApp() {
    try {
      this.isLoading = true;
      let propertyId = this.propertyid;
      if (!this.propertyid && !this.p) {
        throw new Error('Property ID or username is required');
      }
      // let roomResp = null;
      if (!propertyId) {
        console.log(propertyId);
        const propertyData = await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
          include_units_hk_status: true,
        });
        // roomResp = propertyData;
        propertyId = propertyData.My_Result.id;
      }
      this.property_id = propertyId;
      const requests = [this.fetchUserTypes(), this.fetchUsers(), this.roomService.fetchLanguage(this.language)];
      if (this.propertyid) {
        requests.push(
          this.roomService.getExposedProperty({
            id: this.propertyid,
            language: this.language,
            is_backend: true,
            include_units_hk_status: true,
          }),
        );
      }

      await Promise.all(requests);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  @Listen('resetData')
  async handleResetData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.fetchUsers();
  }
  private async fetchUsers() {
    const users = await this.userService.getExposedPropertyUsers();
    this.users = [...users];
  }
  private async fetchUserTypes() {
    const entries = await this.bookingService.getSetupEntriesByTableName('_USER_TYPE');
    for (const e of entries) {
      this.userTypes.set(e.CODE_NAME.toString(), e[`CODE_VALUE_${this.language?.toUpperCase() ?? 'EN'}`]);
    }
  }
  render() {
    if (this.isLoading) {
      return (
        <Host>
          <ir-toast></ir-toast>
          <ir-interceptor></ir-interceptor>
          <ir-loading-screen></ir-loading-screen>
        </Host>
      );
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <section class="p-2 d-flex flex-column" style={{ gap: '1rem' }}>
          <div class="d-flex  pb-2 align-items-center justify-content-between">
            <h3 class="mb-1 mb-md-0">Extranet Users</h3>
          </div>
          <div class="" style={{ gap: '1rem' }}>
            <ir-user-management-table userTypes={this.userTypes} class="card" isSuperAdmin={this.isSuperAdmin} users={this.users}></ir-user-management-table>
          </div>
        </section>
      </Host>
    );
  }
}
