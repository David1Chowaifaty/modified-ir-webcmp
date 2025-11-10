import { Component, Element, h, Host, Listen, Prop, State, Watch } from '@stencil/core';
@Component({
  tag: 'ir-tab-group',
  styleUrls: ['ir-tab-group.css', '../../../common/global.css'],
  shadow: true,
})
export class IrTabGroup {
  @Element() el: HTMLIrTabGroupElement;

  @Prop({ attribute: 'initial-panel' }) initialPanel: string;
  @Prop({ reflect: true }) orientation: 'horizontal' | 'vertical' = 'horizontal';

  @State() haveOverflow = false;
  @State() selectedIndex: number = 0;
  @State() panels: HTMLIrTabPanelElement[] = [];
  @State() indicatorStyle: { [key: string]: string } = {};

  private tabGroup!: HTMLDivElement;
  private refs: HTMLIrTabElement[] = [];
  private resizeObs?: ResizeObserver;

  // --- lifecycle -------------------------------------------------------------

  componentWillLoad() {
    this.updateOverflow();
  }

  componentDidLoad() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObs = new ResizeObserver(() => {
        this.updateOverflow();
        this.updateIndicator();
      });
      this.resizeObs.observe(this.tabGroup);
    }
  }

  disconnectedCallback() {
    this.resizeObs?.disconnect();
  }

  // --- helpers ---------------------------------------------------------------

  private updateOverflow() {
    if (!this.tabGroup) return;
    if (this.orientation === 'horizontal') {
      const visibleWidth = this.tabGroup.getBoundingClientRect().width;
      this.haveOverflow = this.tabGroup.scrollWidth > visibleWidth + 1;
    } else {
      const visibleHeight = this.tabGroup.getBoundingClientRect().height;
      console.log(visibleHeight, this.tabGroup.scrollTop);

      this.haveOverflow = this.tabGroup.scrollHeight > visibleHeight + 1;
    }
  }

  private updateIndicator() {
    const selectedTab = this.refs[this.selectedIndex];
    if (!selectedTab || !this.tabGroup) return;

    const tabGroupRect = this.tabGroup.getBoundingClientRect();
    const selectedTabRect = selectedTab.getBoundingClientRect();

    // Calculate position relative to the tab group
    if (this.orientation === 'horizontal') {
      let translateXValue = selectedTabRect.left - tabGroupRect.left + this.tabGroup.scrollLeft;
      if (window.getComputedStyle(this.el).direction === 'rtl') {
        translateXValue = selectedTabRect.right - tabGroupRect.right + this.tabGroup.scrollLeft;
      }
      const width = selectedTabRect.width;

      this.indicatorStyle = {
        transform: `translateX(${translateXValue}px)`,
        width: `${width}px`,
      };
    } else {
      let translateYValue = selectedTabRect.top - tabGroupRect.top + this.tabGroup.scrollTop;
      const height = selectedTabRect.height;

      this.indicatorStyle = {
        transform: `translateY(${translateYValue}px)`,
        height: `${height}px`,
      };
    }
  }

  private initializeSelection() {
    // Find the first selected tab or select the first one
    const selectedTab = this.refs.find(tab => tab.selected);
    let idx = 0;
    if (selectedTab) {
      idx = this.refs.indexOf(selectedTab);
    } else if (this.initialPanel) {
      idx = this.refs.findIndex(ref => ref.panel.trim().toLowerCase() === this.initialPanel.trim().toLowerCase());
      if (this.refs[idx]?.disabled) {
        idx = 0;
      }
    } else if (this.refs.length > 0) {
      idx = 0;
    }

    // Update indicator after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.select(idx);
      this.updateIndicator();
    }, 10);
  }

  @Watch('selectedIndex')
  onSelectedIndexChange() {
    // Only scroll the selected tab into view when selection is changed by allowed inputs
    const el = this.refs[this.selectedIndex];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      // Focus the tab button inside the ir-tab component
      const tabButton = el.shadowRoot?.querySelector('button[role="tab"]') as HTMLButtonElement;
      tabButton?.focus({ preventScroll: true });

      // Update indicator position and width
      this.updateIndicator();
    }
  }

  private clamp(i: number) {
    return Math.max(0, Math.min(this.refs.length - 1, i));
  }

  private select(i: number) {
    const clampedIndex = this.clamp(i);
    const selectedTab = this.refs[clampedIndex];

    // Update tabs' selected state
    this.refs.forEach((tab, index) => {
      tab.selected = index === clampedIndex;
    });

    // Update panels' visibility (aria-hidden)
    this.panels.forEach(panel => {
      const isSelectedPanel = !!selectedTab && panel.id === selectedTab.panel;
      panel.setAttribute('aria-hidden', isSelectedPanel ? 'false' : 'true');
    });

    this.selectedIndex = clampedIndex;
  }

  // --- keyboard: selection allowed here -------------------------------------

  private onKeydownHandler = (e: KeyboardEvent) => {
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && this.orientation === 'horizontal') {
      const tabs = this.refs;
      let tabFocus = this.selectedIndex;
      tabs[tabFocus].setAttribute('tabindex', '-1');

      if (e.key === 'ArrowRight') {
        tabFocus++;
        if (tabs[tabFocus]?.disabled) {
          tabFocus++;
        }
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.key === 'ArrowLeft') {
        tabFocus--;
        if (tabs[tabFocus]?.disabled) {
          tabFocus--;
        }
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute('tabindex', '0');
      tabs[tabFocus].focus();
      this.select(tabFocus);
    } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && this.orientation === 'vertical') {
      const tabs = this.refs;
      let tabFocus = this.selectedIndex;
      tabs[tabFocus].setAttribute('tabindex', '-1');
      if (e.key === 'ArrowDown') {
        tabFocus++;
        if (tabs[tabFocus]?.disabled) {
          tabFocus++;
        }
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.key === 'ArrowUp') {
        tabFocus--;
        if (tabs[tabFocus]?.disabled) {
          tabFocus--;
        }
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute('tabindex', '0');
      tabs[tabFocus].focus();
      this.select(tabFocus);
    }
  };

  // --- slot: build refs --------------------------------------

  private onSlotNavChange = (ev: Event) => {
    const slot = ev.target as HTMLSlotElement;
    const els = slot.assignedElements({ flatten: true });
    const tabs = els.filter(el => el.tagName.toLowerCase() === 'ir-tab') as HTMLIrTabElement[];
    // Update refs
    this.refs = tabs;
    this.refs.forEach((ref, i) => {
      // Ensure tab has an ID for accessibility
      if (!ref.id) {
        ref.id = `ir-tab-${Date.now()}-${i}`;
      }
    });

    this.updateOverflow();
    this.initializeSelection();
    this.updatePanelAriaAttributes();
  };

  private onSlotChange = (ev: Event) => {
    const slot = ev.target as HTMLSlotElement;
    const els = slot.assignedElements({ flatten: true });
    const panels = els.filter(el => el.tagName.toLowerCase() === 'ir-tab-panel') as HTMLIrTabPanelElement[];

    // Update panels
    this.panels = panels;
    this.updatePanelAriaAttributes();
  };

  private updatePanelAriaAttributes() {
    this.panels.forEach(panel => {
      // Find the corresponding tab for this panel
      const correspondingTab = this.refs.find(tab => tab.panel === panel.id);

      if (correspondingTab) {
        // Set aria-labelledby to link panel to its tab
        panel.setAttribute('aria-labelledby', correspondingTab.id);

        // Set initial aria-hidden state
        const isSelectedPanel = correspondingTab.selected;
        panel.setAttribute('aria-hidden', isSelectedPanel ? 'false' : 'true');
        panel.setAttribute('role', 'tabpanel');
      }
    });
  }

  // --- click from child tabs: allowed unless right after a drag --------------

  @Listen('ir-tab-click')
  handleTabClick(e: CustomEvent<string>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const idx = this.refs.findIndex(ref => ref.panel === e.detail);
    if (idx >= 0) this.select(idx);
  }

  // --- chevrons: scroll only (no selection) ---------------------------------

  private scrollPrev = () => {
    if (this.orientation === 'vertical') {
      this.tabGroup.scrollBy({ top: -Math.max(80, this.tabGroup.clientHeight * 0.8), behavior: 'smooth' });
    } else {
      this.tabGroup.scrollBy({ left: -Math.max(80, this.tabGroup.clientWidth * 0.8), behavior: 'smooth' });
    }
    // Update indicator after scroll animation completes
    setTimeout(() => this.updateIndicator(), 300);
  };

  private scrollNext = () => {
    if (this.orientation === 'horizontal') {
      this.tabGroup.scrollBy({ left: Math.max(80, this.tabGroup.clientWidth * 0.8), behavior: 'smooth' });
    } else {
      this.tabGroup.scrollBy({ top: Math.max(80, this.tabGroup.clientHeight * 0.8), behavior: 'smooth' });
    }
    // Update indicator after scroll animation completes
    setTimeout(() => this.updateIndicator(), 300);
  };

  // --- render ----------------------------------------------------------------

  render() {
    return (
      <Host>
        <div class="tabs-root" part="base" data-orientation={this.orientation}>
          {this.haveOverflow && (
            <button dir="ltr" class="navigation-button previous" aria-label="Scroll left" onClick={this.scrollPrev}>
              {this.orientation === 'horizontal' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-chevron-up-icon lucide-chevron-up"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              )}
            </button>
          )}
          <div class="tab-group" role="tablist" onKeyDown={this.onKeydownHandler} aria-orientation={this.orientation} ref={el => (this.tabGroup = el as HTMLDivElement)}>
            <slot name="nav" onSlotchange={this.onSlotNavChange}></slot>
            <div class="tab-indicator" style={this.indicatorStyle}></div>
          </div>
          {this.haveOverflow && (
            <button dir="ltr" class="navigation-button next" aria-label="Scroll right" onClick={this.scrollNext}>
              {this.orientation === 'horizontal' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="lucide lucide-chevron-down-icon lucide-chevron-down"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </button>
          )}
        </div>

        <slot onSlotchange={this.onSlotChange}></slot>
      </Host>
    );
  }
}
