import { Component, Host, h, Prop, Element, Watch, Event, EventEmitter } from '@stencil/core';
import { Notification } from './types';
import moment from 'moment';
import WaAnimation from '@awesome.me/webawesome/dist/components/animation/animation';
@Component({
  tag: 'ir-notifications',
  styleUrl: 'ir-notifications.css',
  scoped: true,
})
export class IrNotifications {
  @Element() el: HTMLElement;

  // Make notifications reactive;
  @Prop({ mutable: true }) notifications: Notification[] = [];

  @Event() notificationCleared: EventEmitter<Notification>;

  private buttonRef: HTMLIrCustomButtonElement;
  private animationRef: WaAnimation;
  private readonly bellKeyframes: Keyframe[] = [
    { offset: 0, transform: 'rotate(0deg)' },
    { offset: 0.15, transform: 'rotate(-15deg)' },
    { offset: 0.3, transform: 'rotate(13deg)' },
    { offset: 0.45, transform: 'rotate(-10deg)' },
    { offset: 0.6, transform: 'rotate(8deg)' },
    { offset: 0.75, transform: 'rotate(-5deg)' },
    { offset: 1, transform: 'rotate(0deg)' },
  ];

  componentDidLoad() {
    this.updateNotificationBadge();
  }

  componentDidUpdate() {
    this.updateNotificationBadge();
  }

  @Watch('notifications')
  handleNotificationCountChange(newValue: Notification[], oldValue: Notification[]) {
    if (oldValue && newValue.length !== oldValue.length) {
      this.animateNotificationChange();
    }
  }

  private updateNotificationBadge() {
    if (this.buttonRef) {
      this.buttonRef.setAttribute('data-notifications', this.notifications.length.toString());
    }
  }

  private animateNotificationChange() {
    if (this.notifications?.length <= 0) return;
    this.animationRef.cancel();
    this.animationRef.play = true;
  }

  private getRelativeTimeFromParts(date: string, hour: number, minute: number): string {
    const now = moment();
    const then = moment(date, 'YYYY-MM-DD').hour(hour).minute(minute).second(0);
    if (!then.isValid()) return '';
    const diffSeconds = now.diff(then, 'seconds');
    if (diffSeconds < 60) return 'just now';
    const diffMinutes = now.diff(then, 'minutes');
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    }
    const diffHours = now.diff(then, 'hours');
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    }
    const diffDays = now.diff(then, 'days');
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
    const diffWeeks = now.diff(then, 'weeks');
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  }

  // private dismissNotification(notification: Notification) {
  //   this.notificationCleared.emit(notification);
  //   this.notifications = this.notifications.filter(n => n.id !== notification.id);
  // }

  render() {
    return (
      <Host>
        <div style={{ position: 'relative' }}>
          <wa-tooltip for="notifications-button">Notifications</wa-tooltip>
          {this.notifications?.length > 0 && (
            <wa-badge pill class="header-notification-badge">
              {this.notifications.length}
            </wa-badge>
          )}
          <wa-animation duration={1200} iterations={1} keyframes={this.bellKeyframes} ref={el => (this.animationRef = el as WaAnimation)}>
            <ir-custom-button id="notifications-button" size="small" appearance="plain" ref={el => (this.buttonRef = el)}>
              <wa-icon class="notification__bell-icon" name="bell" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
          </wa-animation>
        </div>
        <wa-popover class="notification__popover" for="notifications-button">
          <p class="notification__popover-title">Notifications</p>
          {this.notifications?.map(notification => (
            <div class="notification-item">
              <div class="notification-item__content">
                <p class="notification-item__title">{notification.title}</p>
                <p class="notification-item__time">{this.getRelativeTimeFromParts(notification.date, notification.hour, notification.minute)}</p>
              </div>

              <span class="notification-item__unread-indicator"></span>
            </div>
          ))}
          {this.notifications?.length === 0 && (
            <ir-empty-state style={{ width: '250px', height: '150px' }}>
              <wa-icon slot="icon" name="inbox"></wa-icon>
            </ir-empty-state>
          )}
        </wa-popover>
      </Host>
    );
  }
}
