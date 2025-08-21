import { Component, Host, h, Prop, Element, Watch, State, Event, EventEmitter } from '@stencil/core';
import { Notification } from './types';

@Component({
  tag: 'ir-notifications',
  styleUrl: 'ir-notifications.css',
  scoped: true,
})
export class IrNotifications {
  @Element() el: HTMLElement;

  // Make notifications reactive;
  @Prop({ mutable: true }) notifications: Notification[] = [];

  @State() isOpen: boolean = false;

  @Event() notificationCleared: EventEmitter<Notification>;

  private buttonRef: HTMLIrButtonElement;

  componentDidLoad() {
    this.updateNotificationBadge();
    document.addEventListener('click', this.onDocumentClick, true);
    document.addEventListener('keydown', this.onDocumentKeydown, true);
  }

  componentDidUpdate() {
    this.updateNotificationBadge();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.onDocumentClick, true);
    document.removeEventListener('keydown', this.onDocumentKeydown, true);
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
    if (this.buttonRef) {
      this.buttonRef.classList.add('badge-animate');
      setTimeout(() => {
        this.buttonRef.classList.remove('badge-animate');
      }, 600);
    }
  }

  private dismissNotification(notification: Notification) {
    this.notificationCleared.emit(notification);
    this.notifications = this.notifications.filter(n => n.id !== notification.id);
  }

  private onDocumentClick = (ev: MouseEvent) => {
    if (!this.isOpen) return;
    const target = ev.target as Node | null;
    if (target && !this.el.contains(target)) {
      this.isOpen = false;
    }
  };

  private onDocumentKeydown = (ev: KeyboardEvent) => {
    if (!this.isOpen) return;
    if (ev.key === 'Escape' || ev.key === 'Esc') {
      this.isOpen = false;
      (this.buttonRef as any)?.focus?.();
    }
  };

  render() {
    return (
      <Host>
        <div class={`dropdown notifications-dropdown ${this.isOpen ? 'show' : ''}`}>
          <ir-button
            ref={el => (this.buttonRef = el)}
            variant="icon"
            icon_name="bell"
            data-notifications={this.notifications.length.toString()}
            class="notification-trigger"
            btn_type="button"
            data-reference="parent"
            aria-expanded={String(this.isOpen)}
            onClickHandler={() => (this.isOpen = !this.isOpen)}
          ></ir-button>

          <div class={`dropdown-menu dropdown-menu-right `}>
            {this.notifications.length === 0 ? (
              <p class="m-0 dropdown-header">All caught up.</p>
            ) : (
              this.notifications.map(notification => (
                <div class={`notification-item dropdown-item ${notification.type}`} key={notification.id}>
                  <div class="notification-content">
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    {notification.link && (
                      <a href={notification.link.href} target={notification.link.target || '_self'}>
                        {notification.link.text || 'View more'}
                      </a>
                    )}
                  </div>
                  {notification.dismissible && (
                    <ir-button onClickHandler={() => this.dismissNotification(notification)} variant="icon" btn_color="light" icon_name="xmark"></ir-button>
                  )}
                </div>
              ))
            )}
          </div>
          {/* </div> */}
        </div>
      </Host>
    );
  }
}
