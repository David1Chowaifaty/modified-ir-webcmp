import { updateSearchField, hkTasksStore } from '@/stores/hk-tasks.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, h, Host, Listen } from '@stencil/core';

@Component({
  tag: 'ir-tasks-header',
  styleUrl: 'ir-tasks-header.css',
  scoped: true,
})
export class IrTasksHeader {
  private btnRef: HTMLIrButtonElement;

  @Event() headerButtonPress: EventEmitter<{ name: 'cleaned' | 'export' | 'archive' }>;

  @Listen('animateCleanedButton', { target: 'body' })
  handleCleanedButtonAnimation(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.btnRef.bounce();
  }

  render() {
    return (
      <Host>
        {/* <h3 class="mb-1 mb-md-0">Housekeeping Tasks</h3> */}
        <div class="search-filter-container" style={{ gap: '1rem' }}>
          <ir-input-text class="search-filter-input" placeholder="Search unit" variant="icon" value={hkTasksStore.searchField} onTextChange={e => updateSearchField(e.detail)}>
            <ir-icons name="search" slot="icon"></ir-icons>
          </ir-input-text>
        </div>
        <div class="action-buttons" style={{ gap: '1rem' }}>
          <ir-button
            size="sm"
            btn_color="outline"
            text={locales.entries.Lcz_Export}
            onClickHandler={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.headerButtonPress.emit({ name: 'export' });
            }}
            btnStyle={{ height: '100%' }}
            iconPosition="right"
            icon_name="file"
            icon_style={{ '--icon-size': '14px' }}
          ></ir-button>
          <ir-button
            size="sm"
            btn_color="outline"
            text={locales.entries.Lcz_Archives}
            btnStyle={{ height: '100%' }}
            onClickHandler={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.headerButtonPress.emit({ name: 'archive' });
            }}
          ></ir-button>
          <ir-button
            class="d-none d-md-flex"
            onClickHandler={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.headerButtonPress.emit({ name: 'cleaned' });
            }}
            btnStyle={{ height: '100%' }}
            size="sm"
            btn_disabled={!(hkTasksStore.selectedTasks.length > 0)}
            text={'Cleaned'}
            ref={el => (this.btnRef = el)}
          ></ir-button>
        </div>
      </Host>
    );
  }
}
