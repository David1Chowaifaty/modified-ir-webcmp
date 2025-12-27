import { Component, Fragment, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-menu-item',
  styleUrl: 'ir-menu-item.css',
  shadow: true,
})
export class IrMenuItem {
  @Prop({ reflect: true }) href: string;
  @Prop({ reflect: true }) selected: boolean;
  @Prop({ reflect: true }) badge?: string;

  render() {
    const contentClass = {
      'menu-item__link': true,
      'menu-item__link--selected': !!this.selected,
      'menu-item__link--clickable': !!this.href,
    };

    const content = (
      <Fragment>
        <span class="menu-item__icon">
          <slot name="icon" />
        </span>
        <span class="menu-item__label">
          <slot></slot>
        </span>
        {this.badge ? (
          <wa-badge variant="danger" class="menu-item__badge" appearance="accent">
            {this.badge}
          </wa-badge>
        ) : null}
      </Fragment>
    );

    return (
      <Host>
        {this.href ? (
          <a class={contentClass} href={this.href} aria-current={this.selected ? 'page' : undefined}>
            {content}
          </a>
        ) : (
          <div class={contentClass}>{content}</div>
        )}
      </Host>
    );
  }
}
