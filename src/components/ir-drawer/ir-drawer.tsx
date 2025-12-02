import { OverflowAdd, OverflowRelease } from '@/decorators/OverflowLock';
import WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer';
import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

export type NativeDrawer = WaDrawer;
@Component({
  tag: 'ir-drawer',
  styleUrls: ['ir-drawer.css'],
  shadow: false,
})
export class IrDrawer {
  /** Indicates whether or not the drawer is open. Toggle this attribute to show and hide the drawer. */
  @Prop({ reflect: true }) open: NativeDrawer['open'];
  /**
   * The drawer's label as displayed in the header. You should always include a relevant label, as it is required for
   * proper accessibility. If you need to display HTML, use the `label` slot instead.
   */
  @Prop({ reflect: true }) label: NativeDrawer['label'];
  /** The direction from which the drawer will open. */
  @Prop({ reflect: true }) placement: NativeDrawer['placement'];
  /** Disables the header. This will also remove the default close button. */
  @Prop({ reflect: true }) withoutHeader: NativeDrawer['withoutHeader'];
  /** When enabled, the drawer will be closed when the user clicks outside of it. */
  @Prop({ reflect: true }) lightDismiss: NativeDrawer['lightDismiss'] = true;

  /** Emitted when the drawer opens. */
  @Event() drawerShow: EventEmitter<void>;
  /**Emitted when the drawer is requesting to close. Calling event.preventDefault() will prevent the drawer from closing. You can inspect event.detail.source to see which element caused the drawer to close. If the source is the drawer element itself, the user has pressed Escape or the drawer has been closed programmatically. Avoid using this unless closing the drawer will result in destructive behavior such as data loss. */
  @Event() drawerHide: EventEmitter<{ source: Element }>;

  private readonly onDrawerShow = (event: CustomEvent<void>) => {
    this.emitDrawerShow(event);
  };

  private readonly onDrawerHide = (event: CustomEvent<{ source: Element }>) => {
    this.emitDrawerHide(event);
  };

  @OverflowAdd()
  private emitDrawerShow(e: CustomEvent<void>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.drawerShow.emit();
  }

  @OverflowRelease()
  private emitDrawerHide(e: CustomEvent<{ source: Element }>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    if (!e.detail) {
      return;
    }
    this.drawerHide.emit(e.detail);
  }
  render() {
    return (
      <wa-drawer
        onwa-show={this.onDrawerShow}
        onwa-hide={this.onDrawerHide}
        class="ir__drawer"
        style={{ '--size': 'var(--ir-drawer-width,40rem)' }}
        open={this.open}
        label={this.label}
        placement={this.placement}
        withoutHeader={this.withoutHeader}
        lightDismiss={this.lightDismiss}
      >
        <slot slot="label" name="label"></slot>
        <slot slot="header-actions" name="header-actions"></slot>
        <slot></slot>
        <slot slot="footer" name="footer"></slot>
      </wa-drawer>
    );
  }
}
