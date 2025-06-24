import { Component, Host, Prop, h, Element } from '@stencil/core';

@Component({
  tag: 'ir-interactive-title',
  styleUrl: 'ir-interactive-title.css',
  scoped: true,
})
export class IrInteractiveTitle {
  @Element() el: HTMLElement;

  /**
   * The full title string that may be cropped in the UI.
   */
  @Prop() popoverTitle: string = '';

  /**
   * CSS offset for the left position of the popover.
   * Used as a CSS variable `--ir-popover-left`.
   */
  @Prop() irPopoverLeft: string = '10px';

  /**
   * Whether to show the housekeeping (HK) status dot.
   */
  @Prop() hkStatus: boolean = false;

  /**
   * The number of characters to display before cropping the title with ellipsis.
   */
  @Prop() cropSize: number = 15;

  /**
   * Reference to track if we've initialized popover for current render
   */
  private lastRenderedTitle: string = '';
  private titleContainerRef: HTMLElement;
  private popoverInstance: any;

  /**
   * Initialize popover with overflow detection
   */
  private initializePopoverIfNeeded(titleContainer: HTMLElement, title: string) {
    // Only initialize if title changed or first time
    if (this.lastRenderedTitle === title && this.popoverInstance) {
      return;
    }
    this.disposePopover();

    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.textContent = title;
    document.body.appendChild(tempSpan);

    const textWidth = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);

    const containerWidth = titleContainer.clientWidth;
    const iconWidth = this.hkStatus ? 20 : 0;

    const willOverflow = textWidth + iconWidth > containerWidth;

    if (willOverflow && typeof $ !== 'undefined') {
      try {
        this.popoverInstance = $(titleContainer).popover({
          trigger: 'hover',
          content: title,
          placement: 'top',
          html: false,
          sanitize: true,
          delay: { show: 300, hide: 100 },
        });
      } catch (error) {
        console.error('Failed to initialize popover:', error);
      }
    }

    this.lastRenderedTitle = title;
  }

  private disposePopover() {
    if (this.popoverInstance && typeof $ !== 'undefined') {
      try {
        $(this.titleContainerRef).popover('dispose');
        this.popoverInstance = null;
      } catch (error) {
        console.error('Failed to dispose popover:', error);
      }
    }
  }

  disconnectedCallback() {
    this.disposePopover();
  }

  render() {
    const title = this.popoverTitle || '';

    const shouldCrop = title.length > this.cropSize;
    const displayTitle = shouldCrop ? title.slice(0, this.cropSize) + '...' : title;

    return (
      <Host style={{ '--ir-popover-left': this.irPopoverLeft }}>
        <p
          ref={el => {
            this.titleContainerRef = el;
            if (el && title) {
              setTimeout(() => this.initializePopoverIfNeeded(el, title), 0);
            }
          }}
          class="popover-title"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span
            class="cropped-title"
            style={{
              flexShrink: '1',
              minWidth: '0',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayTitle}
          </span>
          {this.hkStatus && (
            <div title="This unit is dirty" class="hk-dot" style={{ flexShrink: '0' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="12" width="13.5" viewBox="0 0 576 512" style={{ display: 'block' }}>
                <path
                  fill="currentColor"
                  d="M566.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192-34.7-34.7c-4.2-4.2-10-6.6-16-6.6c-12.5 0-22.6 10.1-22.6 22.6l0 29.1L364.3 320l29.1 0c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16l-34.7-34.7 192-192zM341.1 353.4L222.6 234.9c-42.7-3.7-85.2 11.7-115.8 42.3l-8 8C76.5 307.5 64 337.7 64 369.2c0 6.8 7.1 11.2 13.2 8.2l51.1-25.5c5-2.5 9.5 4.1 5.4 7.9L7.3 473.4C2.7 477.6 0 483.6 0 489.9C0 502.1 9.9 512 22.1 512l173.3 0c38.8 0 75.9-15.4 103.4-42.8c30.6-30.6 45.9-73.1 42.3-115.8z"
                />
              </svg>
            </div>
          )}
        </p>
      </Host>
    );
  }
}
