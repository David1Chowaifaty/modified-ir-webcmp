import { Component, Element, Event, EventEmitter, Method, Prop, h } from '@stencil/core';

type PreviewAction = 'print' | 'download';

@Component({
  tag: 'ir-preview-screen-dialog',
  styleUrl: 'ir-preview-screen-dialog.css',
  shadow: true,
})
export class IrPreviewScreenDialog {
  @Element() el: HTMLIrPreviewScreenDialogElement;
  private readonly actionIconByType: Record<PreviewAction, string> = {
    print: 'file-pdf',
    download: 'download',
  };
  private printContainer?: HTMLDivElement;
  private printPlaceholder?: Comment;
  private isPrintLayoutActive = false;
  private readonly handleBeforePrint = () => {
    if (!this.open) {
      return;
    }
    this.preparePrintLayout();
  };
  private readonly handleAfterPrint = () => {
    this.restorePrintLayout();
  };

  /**
   * The dialog's label as displayed in the header.
   * Required for accessibility and announced by assistive technologies.
   */
  @Prop({ reflect: true }) label: string = 'Preview';

  /**
   * Indicates whether or not the preview dialog is open.
   * Toggle this attribute or use {@link openDialog} / {@link closeDialog} to control visibility.
   */
  @Prop({ reflect: true, mutable: true }) open: boolean = false;

  /**
   * Determines which built-in action is rendered in the header.
   * `print` triggers `window.print()` while `download` downloads the configured URL.
   */
  @Prop() action: PreviewAction = 'print';

  /**
   * URL used when the action is set to `download`.
   * Can be overridden per invocation via {@link triggerAction}.
   */
  @Prop() downloadUrl?: string;

  /**
   * Suggested file name for downloaded previews.
   */
  @Prop() downloadFileName?: string;

  /**
   * When `true`, hides the default header action button so a custom implementation can be slotted.
   */
  @Prop() hideDefaultAction: boolean = false;

  /**
   * Accessible label used for the default header action button.
   * Falls back to context-sensitive defaults when omitted.
   */
  @Prop() actionButtonLabel?: string;

  /**
   * Fired whenever the preview action is executed, either via the header button or programmatically.
   */
  @Event() previewAction: EventEmitter<{ action: PreviewAction; url?: string }>;
  @Event() openChanged: EventEmitter<boolean>;
  /**
   * Opens the preview dialog.
   */
  @Method()
  async openDialog(): Promise<void> {
    this.open = true;
  }

  /**
   * Closes the preview dialog.
   */
  @Method()
  async closeDialog(): Promise<void> {
    this.open = false;
  }

  /**
   * Executes the configured preview action.
   *
   * @param action Optional override of the default action type.
   * @param url Optional URL used for downloads. Falls back to the `downloadUrl` prop.
   * @param fileName Optional file name suggestion for downloads.
   * @returns Resolves with `true` when the action was attempted, `false` when prerequisites are missing.
   */
  @Method()
  async triggerAction(action: PreviewAction = this.action, url?: string, fileName?: string): Promise<boolean> {
    const resolvedUrl = url ?? this.downloadUrl;
    const resolvedFileName = fileName ?? this.downloadFileName;

    let result = false;

    if (action === 'print') {
      result = this.runPrintAction();
    } else {
      result = this.runDownloadAction(resolvedUrl, resolvedFileName);
    }

    this.previewAction.emit({ action, url: resolvedUrl });
    return result;
  }

  private runPrintAction(): boolean {
    if (typeof window === 'undefined' || typeof window.print !== 'function') {
      console.warn('[ir-preview-screen-dialog] window.print is not available in this environment.');
      return false;
    }

    this.preparePrintLayout();
    try {
      window.print();
    } finally {
      this.restorePrintLayout();
    }
    return true;
  }

  private runDownloadAction(url?: string, fileName?: string): boolean {
    if (!url) {
      console.warn('[ir-preview-screen-dialog] No download URL was provided.');
      return false;
    }

    if (typeof document === 'undefined') {
      console.warn('[ir-preview-screen-dialog] document is not available in this environment.');
      return false;
    }

    const anchor = document.createElement('a');
    anchor.href = url;

    if (fileName) {
      anchor.download = fileName;
    }

    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.style.display = 'none';

    const parent = document.body || document.documentElement;
    parent?.appendChild(anchor);
    anchor.click();
    anchor.remove();

    return true;
  }

  private getActionLabel(): string {
    if (this.actionButtonLabel) {
      return this.actionButtonLabel;
    }

    return this.action === 'print' ? 'Print preview' : 'Download preview';
  }

  private shouldDisableActionButton(): boolean {
    return this.action === 'download' && !this.downloadUrl;
  }

  private handleActionButtonClick() {
    this.triggerAction();
  }
  private preparePrintLayout() {
    if (typeof document === 'undefined' || this.printContainer || this.isPrintLayoutActive) {
      return;
    }
    const contentNodes = Array.from(this.el.children).filter((child: Element) => !child.hasAttribute('slot'));
    if (!contentNodes.length) {
      return;
    }
    const placeholder = document.createComment('ir-preview-print-placeholder');
    this.el.insertBefore(placeholder, contentNodes[0]);
    const container = document.createElement('div');
    container.className = 'ir-preview-print-container';
    contentNodes.forEach(node => {
      container.appendChild(node);
    });
    document.body.appendChild(container);
    document.body.classList.add('ir-preview-dialog-print-mode');
    this.printPlaceholder = placeholder;
    this.printContainer = container;
    this.isPrintLayoutActive = true;
  }

  private restorePrintLayout() {
    if (!this.printContainer || !this.printPlaceholder || typeof document === 'undefined') {
      return;
    }
    const targetParent = this.printPlaceholder.parentNode;
    if (targetParent) {
      while (this.printContainer.firstChild) {
        targetParent.insertBefore(this.printContainer.firstChild, this.printPlaceholder);
      }
    }
    this.printPlaceholder.remove();
    this.printContainer.remove();
    document.body.classList.remove('ir-preview-dialog-print-mode');
    this.printPlaceholder = undefined;
    this.printContainer = undefined;
    this.isPrintLayoutActive = false;
  }

  componentDidLoad() {
    if (typeof window === 'undefined') {
      return;
    }
    window.addEventListener('beforeprint', this.handleBeforePrint);
    window.addEventListener('afterprint', this.handleAfterPrint);
  }

  disconnectedCallback() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeprint', this.handleBeforePrint);
      window.removeEventListener('afterprint', this.handleAfterPrint);
    }
    this.restorePrintLayout();
  }

  render() {
    return (
      <ir-dialog
        onIrDialogHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.openChanged.emit(false);
        }}
        label={this.label}
        open={this.open}
        class="ir-fullscreen-dialog"
      >
        {!this.hideDefaultAction && (
          <ir-custom-button
            size="medium"
            slot="header-actions"
            variant="neutral"
            appearance="plain"
            onClickHandler={this.handleActionButtonClick.bind(this)}
            disabled={this.shouldDisableActionButton()}
          >
            <wa-icon name={this.actionIconByType[this.action]} label={this.getActionLabel()} aria-label={this.getActionLabel()}></wa-icon>
          </ir-custom-button>
        )}
        <slot></slot>
      </ir-dialog>
    );
  }
}
