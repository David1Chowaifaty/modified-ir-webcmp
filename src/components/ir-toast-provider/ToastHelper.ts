export class ToastHelper {
  private static instance: HTMLIrToastProviderElement | null = null;

  private static getInstance(): HTMLIrToastProviderElement {
    if (!this.instance) {
      this.instance = document.createElement('ir-toast-provider') as HTMLIrToastProviderElement;
      document.body.appendChild(this.instance);
    }
    return this.instance;
  }

  private static async getReadyInstance(): Promise<HTMLIrToastProviderElement> {
    const instance = this.getInstance();
    if (typeof instance.componentOnReady === 'function') {
      await instance.componentOnReady();
    }
    return instance;
  }

  static async notify(
    message: string,
    variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' = 'primary',
    options: {
      duration?: number;
      closable?: boolean;
      icon?: string;
    } = {},
  ) {
    const toast = await this.getReadyInstance();
    console.log(toast);
    return await toast.show(message, { variant, ...options });
  }

  static async success(message: string, duration = 3000) {
    console.log('clicked success', this);
    return this.notify(message, 'success', {
      duration,
      icon: 'check-circle',
    });
  }

  static async error(message: string, duration = 4000) {
    return this.notify(message, 'danger', {
      duration,
      icon: 'x-circle',
    });
  }

  static async warning(message: string, duration = 3500) {
    return this.notify(message, 'warning', {
      duration,
      icon: 'exclamation-triangle',
    });
  }

  static async info(message: string, duration = 3000) {
    return this.notify(message, 'primary', {
      duration,
      icon: 'info-circle',
    });
  }
}
