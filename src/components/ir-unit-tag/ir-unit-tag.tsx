import { Component, Fragment, Prop, State, Watch, h } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-unit-tag',
  styleUrls: ['ir-unit-tag.css'],
  scoped: true,
})
export class IrUnitTag {
  @Prop() unit: string;

  @State() showTooltip = false;

  private _id = v4();
  private resizeObserver?: ResizeObserver;
  private contentElement?: HTMLSpanElement;
  private measurementFrame?: number;
  private setContentRef = (el?: Element | null) => {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.contentElement = (el as HTMLSpanElement) || undefined;

    if (!this.contentElement) {
      return;
    }

    this.attachResizeObserver();
    this.scheduleTooltipUpdate();
  };

  componentDidLoad() {
    this.attachResizeObserver();
    this.scheduleTooltipUpdate();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
    if (this.measurementFrame) {
      cancelAnimationFrame(this.measurementFrame);
      this.measurementFrame = undefined;
    }
  }

  @Watch('unit')
  onUnitChange() {
    this.scheduleTooltipUpdate();
  }

  private attachResizeObserver() {
    if (typeof window === 'undefined' || !this.contentElement || typeof ResizeObserver === 'undefined') {
      return;
    }

    if (!this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.scheduleTooltipUpdate());
    }

    this.resizeObserver.observe(this.contentElement);
  }

  private scheduleTooltipUpdate() {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.measurementFrame) {
      cancelAnimationFrame(this.measurementFrame);
    }

    this.measurementFrame = requestAnimationFrame(() => {
      this.measurementFrame = undefined;
      this.updateTooltipState();
    });
  }

  private updateTooltipState() {
    if (typeof window === 'undefined') {
      return;
    }

    const content = this.contentElement;

    if (!content || !this.unit) {
      if (this.showTooltip) {
        this.showTooltip = false;
      }
      return;
    }

    const shouldShow = content.scrollWidth > content.clientWidth;
    if (shouldShow !== this.showTooltip) {
      this.showTooltip = shouldShow;
    }
  }

  render() {
    return (
      <Fragment>
        {this.showTooltip && <wa-tooltip for={this._id}>{this.unit}</wa-tooltip>}
        <wa-tag id={this._id} class="unit-tag__el" size="small" appearance="filled" variant="brand">
          <span class="unit-tag__content" ref={this.setContentRef}>
            {this.unit}
          </span>
        </wa-tag>
      </Fragment>
    );
  }
}
