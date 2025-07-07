import { Tab } from '@/components/ui/ir-tabs/ir-tabs';
import { IrToast } from '@/components/ui/ir-toast/ir-toast';
import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'igl-bulk-operations',
  styleUrls: ['igl-bulk-operations.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IglBulkOperations {
  @Prop() maxDatesLength = 8;
  @Prop() property_id: number;

  @Event() closeModal: EventEmitter<null>;
  @Event() toast: EventEmitter<IrToast>;

  @State() selectedTab: Tab;

  private tabs = [
    {
      id: 'stop-sale',
      label: 'Stop/Open Sale',
    },
    {
      id: 'block',
      label: 'Block Units',
    },
  ];

  private tabsEl: HTMLIrTabsElement;
  private titleEl: HTMLIrTitleElement;

  componentDidLoad() {
    this.tabsEl.style.setProperty('--ir-tabs-top', this.titleEl?.getBoundingClientRect()?.height?.toString() + 'px');
  }

  render() {
    return (
      <div class={'bulk-operations-sheet-container'}>
        <div class="sheet-header d-flex align-items-center">
          <ir-title
            ref={el => (this.titleEl = el)}
            onCloseSideBar={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              // if (this.isLoading) {
              //   return;
              // }
              this.closeModal.emit(null);
            }}
            class="px-1 mb-0"
            // label={locales.entries.Lcz_BulkStopOpenSale}
            label={'Bulk Operations'}
            displayContext="sidebar"
          ></ir-title>
        </div>
        <ir-tabs ref={el => (this.tabsEl = el)} class="tabs" tabs={this.tabs} onTabChanged={e => (this.selectedTab = e.detail)}></ir-tabs>
        {this.selectedTab?.id === 'stop-sale' ? (
          <igl-bulk-stop-sale maxDatesLength={this.maxDatesLength} property_id={this.property_id}></igl-bulk-stop-sale>
        ) : (
          <igl-bulk-block maxDatesLength={this.maxDatesLength} property_id={this.property_id}></igl-bulk-block>
        )}
      </div>
    );
  }
}
