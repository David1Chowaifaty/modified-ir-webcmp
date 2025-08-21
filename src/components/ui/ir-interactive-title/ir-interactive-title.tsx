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
  @Prop() cropSize: number = 20;
  /**
   * The message shown when hovering over the broom svg if provided.
   * @requires hkStatus to be true
   */
  @Prop() broomTooltip: string;

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
            <div title={this.broomTooltip} class="hk-dot" style={{ flexShrink: '0' }}>
              <slot name="end"></slot>
            </div>
          )}
        </p>
      </Host>
    );
  }
}
