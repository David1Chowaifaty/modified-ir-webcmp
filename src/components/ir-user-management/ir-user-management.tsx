import Token from '@/models/Token';
import { User } from '@/models/Users';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import { UserService } from '@/services/user.service';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { AllowedUser } from './types';

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
  @Prop() userTypeCode: string | number;
  @Prop() userId: string | number;

  @State() isLoading = true;
  @State() users: User[] = [];
  @State() property_id: number;
  @State() allowedUsersTypes: AllowedUser[] = [];

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
    this.users = [...users].sort((u1: User, u2: User) => {
      const priority = (u: User) => {
        const t = u.type.toString();
        if (t === '1') return 0;
        if (t === '17') return 1;
        return 2;
      };
      //sort by priority
      const p1 = priority(u1),
        p2 = priority(u2);
      if (p1 !== p2) {
        return p1 - p2;
      }
      //sort by user id
      if (p1 === 1) {
        const id1 = u1.id.toString(),
          id2 = u2.id.toString(),
          me = this.userId.toString();
        if (id1 === me) return -1; // u1 is me → goes before u2
        if (id2 === me) return 1; // u2 is me → u1 goes after
      }

      // 3) sort by username
      return u1.username.localeCompare(u2.username);
    });
  }
  private async fetchUserTypes() {
    const res = await Promise.all([this.bookingService.getSetupEntriesByTableName('_USER_TYPE'), this.bookingService.getLov()]);
    const allowedUsers = res[1]?.My_Result?.allowed_user_types;
    for (const e of res[0]) {
      const value = e[`CODE_VALUE_${this.language?.toUpperCase() ?? 'EN'}`];
      if (allowedUsers.find(f => f.code === e.CODE_NAME)) {
        this.allowedUsersTypes.push({ code: e.CODE_NAME, value });
      }
      this.userTypes.set(e.CODE_NAME.toString(), value);
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
            <ir-user-management-table
              allowedUsersTypes={this.allowedUsersTypes}
              userTypeCode={this.userTypeCode}
              haveAdminPrivileges={['1', '17'].includes(this.userTypeCode?.toString())}
              userTypes={this.userTypes}
              class="card"
              isSuperAdmin={this.userTypeCode?.toString() === '1'}
              users={this.users}
            ></ir-user-management-table>
          </div>
        </section>
      </Host>
    );
  }
}
