import { Component, Event, EventEmitter, Watch, h, Prop, State } from '@stencil/core';

import locales from '@/stores/locales.store';
import { TIcons } from '../ir-icons/icons';

let panelId = 0;

@Component({
  tag: 'ir-filters-panel',
  styleUrl: 'ir-filters-panel.css',
  scoped: true,
})
export class IrFiltersPanel {
  /** Panel headline text */
  @Prop() filterTitle: string = locales.entries.Lcz_Filters;

  /** Optional custom collapse target id (useful for legacy CSS hooks) */
  @Prop() collapseId?: string;

  /** Show collapse toggle button */
  @Prop() showCollapseButton: boolean = true;

  /** Collapse by default */
  @Prop() defaultCollapsed: boolean = false;

  /** Controlled collapse state */
  @Prop({ mutable: true, reflect: true }) collapsed?: boolean;

  /** Keep content expanded on desktop and hide the collapse toggle */
  @Prop() persistentOnDesktop: boolean = true;

  /** Optional extra class for the outer wrapper */
  @Prop() panelClass?: string;

  /** Optional extra class for the card wrapper */
  @Prop() cardClass: string = 'sales-filters-card';

  /** Optional extra class for the header row */
  @Prop() headerClass?: string;

  /** Optional extra class for the filters content wrapper */
  @Prop() contentClass?: string;

  /** Space between content items */
  @Prop() contentGap: string = '0.5rem';

  /** Align footer actions */
  @Prop() actionsAlign: 'start' | 'center' | 'end' | 'space-between' | 'space-around' = 'end';

  /** Hide the default footer actions */
  @Prop() hideDefaultActions: boolean = false;

  /** Collapse icon when expanded */
  @Prop() collapseIconOpen: TIcons = 'open_eye';

  /** Collapse icon when collapsed */
  @Prop() collapseIconClosed: TIcons = 'closed_eye';

  /** Apply button copy */
  @Prop() applyLabel: string = locales.entries.Lcz_Apply;

  /** Reset button copy */
  @Prop() resetLabel: string = locales.entries.Lcz_Reset;

  /** Disable apply action */
  @Prop() disableApply: boolean = false;

  /** Disable reset action */
  @Prop() disableReset: boolean = false;

  /** Show loader inside apply button */
  @Prop() isApplyLoading: boolean = false;

  /** Optional data test id suffix for default buttons */
  @Prop() actionTestId: string = 'filter';

  @Event({ eventName: 'irFilterToggle' }) filterToggle: EventEmitter<{ collapsed: boolean }>;
  @Event({ eventName: 'irFilterApply' }) filterApply: EventEmitter<void>;
  @Event({ eventName: 'irFilterReset' }) filterReset: EventEmitter<void>;

  @State() internalCollapsed: boolean = false;

  private generatedCollapseId = `ir-filters-panel-${++panelId}`;

  componentWillLoad() {
    this.internalCollapsed = this.collapsed ?? this.defaultCollapsed;
  }

  @Watch('collapsed')
  handleCollapsedChange(newValue: boolean | undefined) {
    if (typeof newValue === 'boolean' && newValue !== this.internalCollapsed) {
      this.internalCollapsed = newValue;
    }
  }

  private get targetId() {
    return this.collapseId || this.generatedCollapseId;
  }

  private toggleCollapse(event?: UIEvent) {
    event?.stopPropagation();
    const next = !this.internalCollapsed;
    this.internalCollapsed = next;
    this.collapsed = next;
    this.filterToggle.emit({ collapsed: next });
  }

  private handleReset(event: UIEvent) {
    event.stopPropagation();
    this.filterReset.emit();
  }

  private handleApply(event: UIEvent) {
    event.stopPropagation();
    this.filterApply.emit();
  }

  private renderDefaultIcon() {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height={18} width={18}>
        <path
          fill="currentColor"
          d="M3.9 54.9C10.5 40.9 24.5 32 40 32l432 0c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9 320 448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6l0-79.1L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z"
        />
      </svg>
    );
  }

  private renderCollapseButton(collapsed: boolean) {
    if (!this.showCollapseButton) {
      return null;
    }

    return (
      <ir-button
        variant="icon"
        aria-expanded={!collapsed ? 'true' : 'false'}
        aria-controls={this.targetId}
        class="collapse-btn toggle-collapse-btn"
        icon_name={collapsed ? this.collapseIconClosed : this.collapseIconOpen}
        visibleBackgroundOnHover={true}
        onClickHandler={this.toggleCollapse.bind(this)}
        btn_type="button"
        style={{ '--icon-size': '1.6rem' }}
      ></ir-button>
    );
  }

  render() {
    const collapsed = this.internalCollapsed;
    const panelClasses = {
      'filters-panel': true,
      'filters-panel--persistent': this.persistentOnDesktop,
    };
    if (this.panelClass) {
      panelClasses[this.panelClass] = true;
    }

    const headerClasses = {
      'filters-panel__header': true,
    };
    if (this.headerClass) {
      headerClasses[this.headerClass] = true;
    }

    const contentWrapperClasses = {
      'filters-panel__content-inner': true,
    };
    if (this.contentClass) {
      contentWrapperClasses[this.contentClass] = true;
    }

    const footerClasses = {
      'filters-panel__footer': true,
      'filter-actions': true,
      'd-flex': true,
      'align-items-center': true,
      [`filters-panel__footer--${this.actionsAlign}`]: true,
    };

    const cardClass = `card mb-0 p-1 d-flex flex-column ${this.cardClass || ''}`.trim();

    return (
      <div class={panelClasses}>
        <div class={cardClass}>
          <div class={headerClasses}>
            <div class="filters-panel__title-group">
              <slot name="header-icon">{this.renderDefaultIcon()}</slot>
              {this.filterTitle && <h4 class="filters-panel__title m-0 p-0 flex-grow-1">{this.filterTitle}</h4>}
              <slot name="header-title-extra"></slot>
            </div>
            <div class="filters-panel__header-actions">
              <slot name="header-actions"></slot>
              {this.renderCollapseButton(collapsed)}
            </div>
          </div>
          <div
            id={this.targetId}
            class={{
              'filters-panel__content': true,
              'collapse': true,
              'show': !collapsed,
            }}
            aria-hidden={collapsed ? 'true' : 'false'}
          >
            <div class={contentWrapperClasses} style={{ gap: this.contentGap }}>
              <slot></slot>
              {!this.hideDefaultActions && (
                <div class={footerClasses}>
                  <slot name="actions">
                    <ir-button
                      btn_type="button"
                      data-testid={`${this.actionTestId}-reset`}
                      text={this.resetLabel}
                      size="sm"
                      btn_color="secondary"
                      btn_disabled={this.disableReset}
                      onClickHandler={this.handleReset.bind(this)}
                    ></ir-button>
                    <ir-button
                      btn_type="button"
                      data-testid={`${this.actionTestId}-apply`}
                      isLoading={this.isApplyLoading}
                      text={this.applyLabel}
                      size="sm"
                      btn_disabled={this.disableApply}
                      onClickHandler={this.handleApply.bind(this)}
                    ></ir-button>
                  </slot>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
