import { Component, Element, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';

export type Tab = { id: string; label: string };

@Component({
  tag: 'ir-tabs',
  styleUrl: 'ir-tabs.css',
  scoped: true,
})
export class IrTabs {
  @Element() el: HTMLElement;

  /**
   * Array of tab objects containing id and label
   * @type {Tab[]}
   * @default []
   */
  @Prop() tabs: Tab[] = [];

  /**
   * ID of the tab that should be selected initially
   * @type {string}
   * @default undefined
   */
  @Prop() initialTab: string;

  /**
   * Whether the tabs are disabled
   * @type {boolean}
   * @default false
   */
  @Prop() disabled: boolean = false;

  /**
   * Aria label for the tab list
   * @type {string}
   * @default 'Tabs'
   */
  @Prop() ariaLabel: string = 'Tabs';

  @State() _selectedTab: Tab;

  /**
   * Emitted when a tab is selected
   * @event tabChanged
   * @type {CustomEvent<Tab>}
   */
  @Event() tabChanged: EventEmitter<Tab>;

  private activeIndicator: HTMLSpanElement;
  private animationFrameId: number;

  componentWillLoad() {
    const tab = this.tabs?.find(t => t.id === this.initialTab);
    if (tab) {
      this.selectTab(tab);
    } else if (this.tabs?.length > 0) {
      // Select first tab if no initial tab is specified
      this.selectTab(this.tabs[0]);
    }
  }

  // componentDidLoad() {
  //   this.updateActiveIndicator();
  // }

  disconnectedCallback() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private updateActiveIndicator() {
    // if (this.animationFrameId) {
    //   cancelAnimationFrame(this.animationFrameId);
    // }
    // this.animationFrameId = requestAnimationFrame(() => {
    //   const selectedTab = this.el.querySelector(`button.tab[data-state="selected"]`);
    //   if (selectedTab && this.activeIndicator) {
    //     const { left, width } = selectedTab.getBoundingClientRect();
    //     const parentLeft = this.el.getBoundingClientRect().left;
    //     const position = left - parentLeft;
    //     this.activeIndicator.style.width = `${width}px`;
    //     this.activeIndicator.style.transform = `translateX(${position}px)`;
    //   }
    // });
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    requestAnimationFrame(() => {
      const selectedTab = this.el.querySelector(`.tab[data-state="selected"]`);
      if (selectedTab) {
        const { left, width } = selectedTab.getBoundingClientRect();
        const parentLeft = this.el.getBoundingClientRect().left;
        const position = left - parentLeft - this.remSize;
        this.activeIndicator.style.width = `${width - this.remSize}px`;
        this.activeIndicator.style.transform = `translateX(${position}px)`;
      }
    });
  }
  private remSize = (() => {
    const fontSize = getComputedStyle(document.documentElement).fontSize;
    return parseFloat(fontSize);
  })();
  private selectTab(tab: Tab) {
    if (this.disabled) return;

    this._selectedTab = tab;
    this.updateActiveIndicator();
    this.tabChanged.emit(tab);
  }

  private handleKeyDown(event: KeyboardEvent, currentTab: Tab) {
    if (this.disabled) return;

    const currentIndex = this.tabs.findIndex(t => t.id === currentTab.id);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % this.tabs.length;
        break;
      case 'ArrowLeft':
        event.preventDefault();
        nextIndex = currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = this.tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectTab(currentTab);
        return;
      default:
        return;
    }

    const nextTab = this.tabs[nextIndex];
    if (nextTab) {
      this.selectTab(nextTab);
      requestAnimationFrame(() => {
        const tabButton = this.el.querySelector(`button.tab[data-tab-id="${nextTab.id}"]`) as HTMLButtonElement;
        if (tabButton) {
          tabButton.focus();
        }
      });
    }
  }

  render() {
    return (
      <Host role="tablist" aria-label={this.ariaLabel} aria-orientation="horizontal">
        {this.tabs.map(tab => (
          <button
            class="tab"
            key={tab.id}
            type="button"
            data-tab-id={tab.id}
            role="tab"
            tabindex={this._selectedTab?.id === tab.id ? 0 : -1}
            aria-selected={this._selectedTab?.id === tab.id ? 'true' : 'false'}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={this.disabled}
            data-state={this._selectedTab?.id === tab.id ? 'selected' : undefined}
            onClick={() => this.selectTab(tab)}
            onKeyDown={event => this.handleKeyDown(event, tab)}
          >
            {tab.label}
          </button>
        ))}
        <span class="active-indicator" ref={el => (this.activeIndicator = el)}></span>
      </Host>
    );
  }
}
