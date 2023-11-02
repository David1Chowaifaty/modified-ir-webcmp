import { Component, Host, Prop, State, h } from "@stencil/core";

@Component({
  tag: "ir-tooltip",
  styleUrl: "ir-tooltip.css",
  scoped: true,
})
export class IrTooltip {
  @Prop({ reflect: true }) message: string;
  @State() open: boolean;
  tooltipTimeout: any;
  toggleOpen(shouldOpen: boolean) {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    if (shouldOpen) {
      this.tooltipTimeout = setTimeout(() => {
        this.open = true;
      }, 300);
    } else {
      this.open = false;
    }
  }
  render() {
    return (
      <Host>
        <span
          onMouseEnter={() => this.toggleOpen(true)}
          onMouseLeave={() => this.toggleOpen(false)}
        >
          <i
            class="ml-1 ft-info"
            data-toggle="tooltip"
            data-placement="top"
            data-original-title="Info popup"
          ></i>
        </span>
        {this.open && (
          <div class="tooltip bottom show position-absolute" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner fit">
              <i class="tooltip-top-demo"></i>
              <span innerHTML={this.message}></span>
            </div>
          </div>
        )}
      </Host>
    );
  }
}
