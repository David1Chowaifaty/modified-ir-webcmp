import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';

import moment from 'moment';
import { IToast } from '@components/ui/ir-toast/toast';
import { User } from '@/models/Users';
import { UserService } from '@/services/user.service';
import { _formatTime } from '@/components/ir-booking-details/functions';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { AllowedUser } from '../types';

@Component({
  tag: 'ir-user-management-table',
  styleUrls: ['ir-user-management-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrUserManagementTable {
  @Prop() users: User[] = [];
  @Prop() isSuperAdmin: boolean;
  @Prop() userTypes: Map<string | number, string> = new Map();
  @Prop() userTypeCode: string | number;
  @Prop() haveAdminPrivileges: boolean;
  @Prop() allowedUsersTypes: AllowedUser[] = [];

  @State() currentTrigger: any = null;
  @State() user: User = null;

  //Permissions
  @State() canDelete: boolean;
  @State() canEdit: boolean;
  @State() canCreate: boolean;

  @Event() toast: EventEmitter<IToast>;
  @Event() resetData: EventEmitter<null>;

  private modalRef: HTMLIrModalElement;
  private userService = new UserService();

  componentWillLoad() {
    this.assignPermissions();
  }

  @Watch('haveAdminPrivileges')
  handleChange(n: boolean, o: boolean) {
    if (n !== o) {
      this.assignPermissions();
    }
  }

  private assignPermissions() {
    this.canCreate = this.haveAdminPrivileges;
    this.canDelete = this.haveAdminPrivileges;
    this.canEdit = true;
  }

  private async handleUserActiveChange(e: CustomEvent, user: User) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.userService.handleExposedUser({
      email: user.email,
      id: user.id,
      is_active: user.is_active,
      mobile: user.mobile,
      password: user.password,
      type: user.type,
      username: user.username,
    });
    this.toast.emit({
      position: 'top-right',
      title: 'Saved Successfully',
      description: '',
      type: 'success',
    });
  }
  private async removeUser(e: CustomEvent) {
    try {
      e.stopImmediatePropagation();
      e.stopPropagation();
      await this.userService.handleExposedUser({
        email: this.user.email,
        id: this.user.id,
        is_active: this.user.is_active,
        mobile: this.user.mobile,
        password: this.user.password,
        type: this.user.type,
        username: this.user.username,
        is_to_remove: true,
      });
      this.resetData.emit(null);
    } finally {
      this.user = null;
      this.modalRef.closeModal();
    }
  }
  private renderCurrentTrigger() {
    if (!this.currentTrigger) {
      return null;
    }
    return (
      <ir-user-form-panel
        allowedUsersTypes={this.allowedUsersTypes}
        userTypeCode={this.userTypeCode}
        haveAdminPrivileges={this.haveAdminPrivileges}
        onCloseSideBar={() => (this.currentTrigger = null)}
        slot="sidebar-body"
        user={this.currentTrigger?.user}
        isEdit={this.currentTrigger?.isEdit}
      ></ir-user-form-panel>
    );
  }
  render() {
    return (
      <Host>
        <section class="table-container h-100 p-1 w-100 m-0 table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th class="text-left">{locales.entries.Lcz_Username ?? 'Username'}</th>
                <th class="text-left">{locales.entries.Lcz_Email}</th>
                <th class="text-left">{locales.entries.Lcz_Mobile ?? 'Mobile'}</th>
                <th class="text-left">Role</th>
                <th class="text-left">Last signed in</th>
                <th class="text-left">Created at</th>
                {this.haveAdminPrivileges && <th>Active</th>}
                {this.haveAdminPrivileges && <th>Email verified</th>}

                <th class={'action-row'}>
                  {this.canCreate && (
                    <ir-icon
                      style={{ paddingLeft: '0.875rem' }}
                      data-testid="new_user"
                      title={locales.entries.Lcz_CreateHousekeeper}
                      onIconClickHandler={() => {
                        this.currentTrigger = {
                          type: 'user',
                          isEdit: false,
                          user: null,
                        };
                      }}
                    >
                      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="17.5" viewBox="0 0 448 512">
                        <path
                          fill="currentColor"
                          d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                        />
                      </svg>
                    </ir-icon>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {this.users.map(user => {
                const isUserSuperAdmin = user.type.toString() === '1';
                const latestSignIn = user.sign_ins ? user.sign_ins[0] : null;
                return (
                  <tr key={user.id} class="ir-table-row">
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.mobile ?? 'N/A'}</td>
                    <td>{this.userTypes.get(user.type.toString())}</td>
                    <td>
                      {latestSignIn && new Date(latestSignIn.date).getFullYear() > 1900
                        ? moment(latestSignIn.date, 'YYYY-MM-DD').format('DD-MMM-YYYY') + ' ' + _formatTime(latestSignIn.hour.toString(), latestSignIn.minute.toString())
                        : 'N/A'}
                    </td>
                    <td>{new Date(user.created_on).getFullYear() === 1900 || !user.created_on ? 'N/A' : moment(user.created_on, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</td>
                    {this.haveAdminPrivileges && (
                      <td>
                        {this.haveAdminPrivileges && !this.isSuperAdmin && user.type.toString() === '17'
                          ? null
                          : !isUserSuperAdmin && <ir-switch onCheckChange={e => this.handleUserActiveChange(e, user)} checked={user.is_active}></ir-switch>}
                      </td>
                    )}
                    {this.haveAdminPrivileges && (
                      <td>
                        <button class={`m-0 badge ${user.is_email_verified ? 'badge-success' : 'badge-danger'}`}>{user.is_email_verified ? 'verified' : 'not verified'}</button>
                      </td>
                    )}

                    <td class={'action-row'}>
                      {(this.canEdit || this.canDelete) && ((!this.isSuperAdmin && !isUserSuperAdmin) || this.isSuperAdmin) && (
                        <div class="icons-container  d-flex align-items-center" style={{ gap: '0.5rem' }}>
                          {this.canEdit && (
                            <ir-icon
                              data-testid="edit"
                              title={locales.entries.Lcz_EditHousekeeper}
                              onIconClickHandler={() => {
                                this.currentTrigger = {
                                  type: 'user',
                                  isEdit: true,
                                  user,
                                };
                              }}
                              icon="ft-save color-ir-light-blue-hover h5 pointer sm-margin-right"
                            >
                              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
                                <path
                                  fill="#6b6f82"
                                  d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
                                />
                              </svg>
                            </ir-icon>
                          )}
                          {this.canDelete && !isUserSuperAdmin && (this.isSuperAdmin || user.type.toString() !== '17') && (
                            <ir-icon
                              data-testid="delete"
                              title={locales.entries.Lcz_DeleteHousekeeper}
                              icon="ft-trash-2 danger h5 pointer"
                              onIconClickHandler={() => {
                                this.user = user;
                                this.modalRef.openModal();
                              }}
                            >
                              <svg slot="icon" fill="#ff2441" xmlns="http://www.w3.org/2000/svg" height="16" width="14.25" viewBox="0 0 448 512">
                                <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                              </svg>
                            </ir-icon>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
        <ir-sidebar
          open={this.currentTrigger !== null && this.currentTrigger?.type !== 'delete'}
          onIrSidebarToggle={() => (this.currentTrigger = null)}
          showCloseButton={false}
          style={{
            '--sidebar-block-padding': '0',
            '--sidebar-width': this.currentTrigger ? (this.currentTrigger?.type === 'unassigned_units' ? 'max-content' : '40rem') : 'max-content',
          }}
        >
          {this.renderCurrentTrigger()}
        </ir-sidebar>
        <ir-modal
          autoClose={false}
          modalBody={`Are you sure you want to delete ${this.user?.username}?`}
          rightBtnColor="danger"
          isLoading={isRequestPending('/Handle_Exposed_User')}
          rightBtnText={locales.entries.Lcz_Delete}
          onConfirmModal={this.removeUser.bind(this)}
          ref={el => (this.modalRef = el)}
        ></ir-modal>
      </Host>
    );
  }
}
