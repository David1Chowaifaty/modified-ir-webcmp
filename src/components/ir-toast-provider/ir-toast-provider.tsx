import { Component, Method, State, Element } from '@stencil/core';
export interface Toast {
  id: string;
  message: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  duration?: number;
  closable?: boolean;
  icon?: string;
}

@Component({
  tag: 'ir-toast-provider',
  styleUrl: 'ir-toast-provider.css',
  shadow: false,
  scoped: false,
})
export class IrToastProvider {
  private static toastStack: HTMLDivElement;
  private static stylesInjected = false;
  private static readonly supportsPopover =
    typeof document !== 'undefined' && typeof (document.createElement('div') as any).showPopover === 'function';
  private toastTimers: Map<string, number> = new Map();

  @Element() el: HTMLElement;
  @State() toasts: Toast[] = [];

  private static getToastStack() {
    this.ensureGlobalStyles();

    if (!this.toastStack) {
      this.toastStack = document.createElement('div');
      this.toastStack.className = 'toast-stack';
      if (this.supportsPopover) {
        this.toastStack.setAttribute('popover', 'manual');
      }
      this.toastStack.setAttribute('role', 'status');
      this.toastStack.setAttribute('aria-live', 'polite');
      this.toastStack.style.cssText = `
        position: fixed;
        top: calc(env(safe-area-inset-top, 0px) + 20px);
        right: 20px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
    }

    if (!document.body.contains(this.toastStack)) {
      document.body.appendChild(this.toastStack);
    }

    return this.toastStack;
  }

  componentDidLoad() {
    // Ensure toast stack is ready when the component mounts
    IrToastProvider.getToastStack();
  }

  private static openStackPopover() {
    if (!this.supportsPopover || !this.toastStack) {
      return;
    }

    const stack = this.toastStack as any;
    if (typeof stack.showPopover === 'function') {
      try {
        stack.showPopover();
      } catch {
        /* Popover is already open */
      }
    }
  }

  private static closeStackPopover() {
    if (!this.supportsPopover || !this.toastStack) {
      return;
    }

    const stack = this.toastStack as any;
    if (typeof stack.hidePopover === 'function') {
      try {
        stack.hidePopover();
      } catch {
        /* Ignore errors when popover already closed */
      }
    }
  }

  private static ensureGlobalStyles() {
    if (this.stylesInjected) {
      return;
    }

    const styleId = 'ir-toast-provider-styles';
    if (document.getElementById(styleId)) {
      this.stylesInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .toast-stack {
        position: fixed;
        top: calc(env(safe-area-inset-top, 0px) + 20px);
        right: 20px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.25s ease;
        pointer-events: auto;
        background: var(--ir-toast-bg, #0ea5e9);
        color: var(--ir-toast-color, #fff);
      }

      .toast--show {
        opacity: 1;
        transform: translateX(0);
      }

      .toast--hiding {
        opacity: 0;
        transform: translateX(400px) scale(0.9);
      }

      .toast--primary {
        --ir-toast-bg: #0ea5e9;
        --ir-toast-color: #fff;
      }

      .toast--success {
        --ir-toast-bg: #22c55e;
        --ir-toast-color: #fff;
      }

      .toast--warning {
        --ir-toast-bg: #f59e0b;
        --ir-toast-color: #fff;
      }

      .toast--danger {
        --ir-toast-bg: #ef4444;
        --ir-toast-color: #fff;
      }

      .toast--neutral {
        --ir-toast-bg: #f3f4f6;
        --ir-toast-color: #1f2937;
        border: 1px solid #e5e7eb;
      }

      .toast__icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
      }

      .toast__icon-svg {
        width: 100%;
        height: 100%;
      }

      .toast__message {
        flex: 1;
        padding-top: 2px;
      }

      .toast__close {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        background: transparent;
        color: inherit;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.15s ease;
        opacity: 0.8;
      }

      .toast__close:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }

      .toast--neutral .toast__close:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .toast__close svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }
    `;

    document.head.appendChild(style);
    this.stylesInjected = true;
  }

  @Method()
  async show(
    message: string,
    options: {
      variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
      duration?: number;
      closable?: boolean;
      icon?: string;
    } = {},
  ) {
    console.log('show clicked');
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = {
      id,
      message,
      variant: options.variant || 'primary',
      duration: options.duration !== undefined ? options.duration : 3000,
      closable: options.closable !== undefined ? options.closable : true,
      icon: options.icon,
    };

    this.toasts = [...this.toasts, toast];

    // Create toast element and append to stack
    this.renderToastToStack(toast);

    // Auto-hide after duration
    if (toast.duration > 0) {
      const timer = window.setTimeout(() => {
        this.hide(id);
      }, toast.duration);
      this.toastTimers.set(id, timer);
    }

    return id;
  }

  @Method()
  async hide(id: string) {
    // Clear timer
    const timer = this.toastTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.toastTimers.delete(id);
    }

    // Remove from DOM
    const stack = IrToastProvider.toastStack;
    if (!stack) {
      return;
    }

    const toastEl = stack.querySelector(`[data-toast-id="${id}"]`);
    if (toastEl) {
      toastEl.classList.add('toast--hiding');
      setTimeout(() => {
        toastEl.remove();

        // Remove stack if empty
        if (stack.children.length === 0) {
          IrToastProvider.closeStackPopover();
          if (!IrToastProvider.supportsPopover && stack.parentElement) {
            stack.remove();
          }
        }
      }, 250);
    }

    // Remove from state
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  private renderToastToStack(toast: Toast) {
    const stack = IrToastProvider.getToastStack();
    const toastEl = document.createElement('wa-callout');
    toastEl.setAttribute('data-toast-id', toast.id);
    toastEl.className = `toast toast--${toast.variant}`;
    toastEl.style.cssText = 'pointer-events: auto;';

    const iconHtml = toast.icon
      ? `<div class="toast__icon">
          <svg class="toast__icon-svg" width="20" height="20" viewBox="0 0 20 20">
            ${this.getIconPath(toast.icon)}
          </svg>
        </div>`
      : '';

    const closeButton = toast.closable
      ? `<button class="toast__close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
          </svg>
        </button>`
      : '';

    toastEl.innerHTML = `
      ${iconHtml}
      <div class="toast__message">${this.escapeHtml(toast.message)}</div>
      ${closeButton}
    `;

    // Add close handler
    if (toast.closable) {
      const closeBtn = toastEl.querySelector('.toast__close');
      closeBtn?.addEventListener('click', () => this.hide(toast.id));
    }

    // Add pause/resume on hover
    if (toast.duration > 0) {
      let remainingTime = toast.duration;
      let pauseStart = 0;

      toastEl.addEventListener('mouseenter', () => {
        pauseStart = Date.now();
        const timer = this.toastTimers.get(toast.id);
        if (timer) {
          clearTimeout(timer);
        }
      });

      toastEl.addEventListener('mouseleave', () => {
        if (pauseStart > 0) {
          remainingTime -= Date.now() - pauseStart;
          const timer = window.setTimeout(() => {
            this.hide(toast.id);
          }, remainingTime);
          this.toastTimers.set(toast.id, timer);
          pauseStart = 0;
        }
      });
    }

    IrToastProvider.openStackPopover();
    stack.appendChild(toastEl);

    // Trigger animation
    requestAnimationFrame(() => {
      toastEl.classList.add('toast--show');
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private getIconPath(icon: string): string {
    const icons: Record<string, string> = {
      'check-circle':
        '<path fill="currentColor" d="M10 0a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm4.854 7.854l-5 5a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 .708-.708L9 11.293l4.646-4.647a.5.5 0 0 1 .708.708z"/>',
      'info-circle': '<path fill="currentColor" d="M10 0a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0v4zm-1-6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>',
      'exclamation-triangle':
        '<path fill="currentColor" d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>',
      'x-circle':
        '<path fill="currentColor" d="M10 0a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm3.854 12.146a.5.5 0 0 1-.708.708L10 9.707l-3.146 3.147a.5.5 0 0 1-.708-.708L9.293 9 6.146 5.854a.5.5 0 1 1 .708-.708L10 8.293l3.146-3.147a.5.5 0 0 1 .708.708L10.707 9l3.147 3.146z"/>',
    };
    return icons[icon] || icons['info-circle'];
  }

  render() {
    // This component doesn't render anything in its own shadow DOM
    // All toasts are rendered directly to document.body
    return null;
  }
}
