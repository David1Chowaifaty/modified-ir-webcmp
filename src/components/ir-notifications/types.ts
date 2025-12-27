// Common icon names in your design system (adjust as needed)
type IconName = 'info' | 'warning' | 'alert' | 'success' | 'bell' | string;

export type NotificationType = 'info' | 'warning' | 'alert' | 'success' | 'error';

type NotificationLink = {
  href: string;
  text?: string;
  target?: '_self' | '_blank' | '_parent' | '_top';
  rel?: string;
};

type NotificationAction = {
  id: string;
  label: string;
  onClick?: (ev: MouseEvent) => void;
  dismissOnClick?: boolean;
};

type BaseNotification = Readonly<{
  id: string;
  title: string;
  message: string;
  date: string;
  hour: number;
  minute: number;
  read?: boolean;
  dismissible?: boolean;
  autoDismissMs?: number;
  icon?: IconName;
  link?: NotificationLink;
  actions?: readonly NotificationAction[];
  meta?: Record<string, unknown>;
}>;

export type Notification =
  | (BaseNotification & {
      type: 'info' | 'success';
      ariaRole?: 'status';
    })
  | (BaseNotification & {
      type: 'warning' | 'alert' | 'error';
      ariaRole?: 'alert';
    });
