import { OverflowAdd, OverflowRelease } from '@/decorators/OverflowLock';
import { createSlotManager } from '@/utils/slot';
import WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer';
import { Component, Element, Event, EventEmitter, h, Prop, State } from '@stencil/core';

export type NativeDrawer = WaDrawer;

@Component({
  tag: 'ir-drawer',
  styleUrl: 'ir-drawer.css',
  shadow: true,
})
export class IrDrawer {
  @Element() el: HTMLIrDrawerElement;

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

  @State() private slotStateVersion = 0; // Trigger re-renders when slots change

  /** Emitted when the drawer opens. */
  @Event() drawerShow: EventEmitter<void>;
  /**Emitted when the drawer is requesting to close. Calling event.preventDefault() will prevent the drawer from closing. You can inspect event.detail.source to see which element caused the drawer to close. If the source is the drawer element itself, the user has pressed Escape or the drawer has been closed programmatically. Avoid using this unless closing the drawer will result in destructive behavior such as data loss. */
  @Event() drawerHide: EventEmitter<{ source: Element }>;

  private readonly SLOT_NAMES = ['label', 'header-actions', 'footer'] as const;

  // Create slot manager with state change callback
  private slotManager = createSlotManager(
    null as any, // Will be set in componentWillLoad
    this.SLOT_NAMES,
    () => {
      // Trigger re-render when slot state changes
      this.slotStateVersion++;
    },
  );

  private readonly onDrawerShow = (event: CustomEvent<void>) => {
    this.emitDrawerShow(event);
  };

  private readonly onDrawerHide = (event: CustomEvent<{ source: Element }>) => {
    this.emitDrawerHide(event);
  };

  componentWillLoad() {
    // Initialize slot manager with host element
    this.slotManager = createSlotManager(this.el, this.SLOT_NAMES, () => {
      this.slotStateVersion++;
    });
    this.slotManager.initialize();
  }

  componentDidLoad() {
    this.slotManager.setupListeners();
  }

  disconnectedCallback() {
    this.slotManager.destroy();
  }

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
        exportparts="dialog, header, header-actions, title, close-button, close-button__base, body, footer"
      >
        {this.slotManager.hasSlot('header-actions') && <slot name="header-actions" slot="header-actions"></slot>}
        {this.slotManager.hasSlot('label') && <slot name="label" slot="label"></slot>}
        <slot></slot>
        {this.slotManager.hasSlot('footer') && <slot name="footer" slot="footer"></slot>}
      </wa-drawer>
    );
  }
}
