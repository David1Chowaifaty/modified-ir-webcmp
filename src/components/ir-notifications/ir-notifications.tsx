import { Component, Host, h, Prop, Element, Watch } from '@stencil/core';

@Component({
  tag: 'ir-notifications',
  styleUrl: 'ir-notifications.css',
  scoped: true,
})
export class IrNotifications {
  @Element() el: HTMLElement;
  @Prop({ mutable: true }) notificationCount: number = 0;

  private buttonRef: HTMLIrButtonElement;

  @Watch('notificationCount')
  handleNotificationCountChange(newValue: number, oldValue: number) {
    if (oldValue !== undefined && newValue !== oldValue) {
      this.animateNotificationChange();
    }
  }

  componentDidLoad() {
    this.updateNotificationBadge();
  }

  componentDidUpdate() {
    this.updateNotificationBadge();
  }

  private updateNotificationBadge() {
    if (this.buttonRef) {
      this.buttonRef.setAttribute('data-notifications', this.notificationCount.toString());
    }
  }

  private animateNotificationChange() {
    if (this.buttonRef) {
      // Add bounce animation class
      this.buttonRef.classList.add('badge-animate');

      // Remove the animation class after animation completes
      setTimeout(() => {
        this.buttonRef.classList.remove('badge-animate');
      }, 600);
    }
  }

  render() {
    return (
      <Host>
        <div class="dropdown notifications-dropdown">
          <ir-button
            ref={el => (this.buttonRef = el)}
            variant="icon"
            icon_name="bell"
            data-notifications={this.notificationCount.toString()}
            class="notification-trigger"
            btn_type="button"
            data-reference="parent"
            data-toggle="dropdown"
            aria-expanded="false"
          ></ir-button>

          <div class="dropdown-menu dropdown-menu-right">
            <div class={'dropdown-header m-0'}>
              {/* <ir-icons name="danger"> </ir-icons> */}
              <p class={'p-0 m-0'}>All caught up.</p>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}
