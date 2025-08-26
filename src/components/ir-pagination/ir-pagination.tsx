import { Component, Host, Prop, Event, EventEmitter, Watch, h, Fragment } from '@stencil/core';

/**
 * Interface for pagination range display
 */
export interface PaginationRange {
  /** Starting index (0-based) */
  from: number;
  /** Ending index (0-based) */
  to: number;
}

/**
 * Event data emitted when page changes
 */
export interface PaginationChangeEvent {
  /** New current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page size */
  pageSize?: number;
}

@Component({
  tag: 'ir-pagination',
  styleUrl: 'ir-pagination.css',
  scoped: true,
})
export class IrPagination {
  /**
   * Total number of pages available
   */
  @Prop() pages: number = 0;

  /**
   * List of all page size
   */
  @Prop() pageSizes: number[];
  /**
   * Enables a dropdown for changing the number of items displayed per page.
   *
   * When set to `true`, users can select a page size from the `pageSizes` array.
   *
   * **Note:** This prop requires the `pageSizes` prop to be defined with one or more numeric values.
   * If `pageSizes` is empty or undefined, the page size selector will not be displayed.
   *
   * @default false
   */
  @Prop() allowPageSizeChange: boolean;

  /**
   * Total number of records/items
   */
  @Prop() total: number = 0;

  /**
   * Current active page number (1-based)
   */
  @Prop() currentPage: number = 1;

  /**
   * Range of items currently being displayed
   */
  @Prop() showing: PaginationRange = { from: 0, to: 0 };

  /**
   * Whether to show total records count
   */
  @Prop() showTotalRecords: boolean = true;

  /**
   * Label for the record type (e.g., 'items', 'tasks', 'records')
   */
  @Prop() recordLabel: string = '';

  /**
   * Whether the pagination is disabled
   */
  @Prop() disabled: boolean = false;

  /**
   * Page size for calculations
   */
  @Prop() pageSize: number = 10;

  /**
   * Emitted when the current page changes
   */
  @Event() pageChange: EventEmitter<PaginationChangeEvent>;
  /**
   * Emitted when the page size changes
   */
  @Event() pageSizeChange: EventEmitter<PaginationChangeEvent>;

  /**
   * Emitted when the first page is requested
   */
  @Event() firstPage: EventEmitter<PaginationChangeEvent>;

  /**
   * Emitted when the last page is requested
   */
  @Event() lastPage: EventEmitter<PaginationChangeEvent>;

  /**
   * Emitted when the previous page is requested
   */
  @Event() previousPage: EventEmitter<PaginationChangeEvent>;

  /**
   * Emitted when the next page is requested
   */
  @Event() nextPage: EventEmitter<PaginationChangeEvent>;

  /**
   * Watch for changes to currentPage prop
   */
  @Watch('currentPage')
  validateCurrentPage(newValue: number) {
    if (newValue < 1) {
      console.warn('currentPage must be greater than 0');
    }
    if (newValue > this.pages) {
      console.warn('currentPage cannot be greater than total pages');
    }
  }

  /**
   * Watch for changes to pages prop
   */
  @Watch('pages')
  validatePages(newValue: number) {
    if (newValue < 0) {
      console.warn('pages must be greater than or equal to 0');
    }
  }

  /**
   * Renders the item range display text
   * @returns Formatted string showing current range and total
   */
  private renderItemRange(): string {
    if (!this.showTotalRecords) {
      return '';
    }

    const from = Math.max(this.showing.from, 1);
    const to = Math.min(this.showing.to, this.total);

    return `${'View'} ${from} - ${to} ${'of'} ${this.total} ${this.recordLabel}`;
  }

  /**
   * Handles page change and emits appropriate events
   * @param newPage - The new page number to navigate to
   * @param eventType - The type of navigation event
   */
  private handlePageChange(newPage: number, eventType: 'first' | 'previous' | 'next' | 'last' | 'direct' = 'direct') {
    if (this.disabled || newPage < 1 || newPage > this.pages || newPage === this.currentPage) {
      return;
    }

    const eventData: PaginationChangeEvent = {
      currentPage: newPage,
      totalPages: this.pages,
      pageSize: this.pageSize,
    };

    // Emit specific event type
    switch (eventType) {
      case 'first':
        this.firstPage.emit(eventData);
        break;
      case 'previous':
        this.previousPage.emit(eventData);
        break;
      case 'next':
        this.nextPage.emit(eventData);
        break;
      case 'last':
        this.lastPage.emit(eventData);
        break;
    }

    // Always emit the general page change event
    this.pageChange.emit(eventData);
  }
  /**
   * Handles page change and emits appropriate events
   * @param newPage - The new page number to navigate to
   * @param eventType - The type of navigation event
   */
  private handlePageSizeChange(newPageSize: number) {
    const eventData: PaginationChangeEvent = {
      currentPage: this.currentPage,
      totalPages: this.pages,
      pageSize: newPageSize,
    };
    // Emit specific event type
    this.pageSizeChange.emit(eventData);
  }

  /**
   * Checks if the component should be rendered
   * @returns True if pagination should be shown
   */
  private shouldRender(): boolean {
    return this.pages > 0 && this.total > 0;
  }

  render() {
    if (!this.shouldRender()) {
      return null;
    }

    const isFirstPage = this.currentPage === 1;
    const isLastPage = this.currentPage === this.pages;

    return (
      <Host
        class={{
          'd-flex flex-column flex-md-row align-items-center justify-content-between pagination-container': true,
          'disabled': this.disabled,
        }}
        role="navigation"
        aria-label="Pagination Navigation"
      >
        {this.showTotalRecords && (
          <p class="m-0 mb-1 mb-md-0 pagination-info" aria-live="polite">
            {this.renderItemRange()}
          </p>
        )}
        <div class={'d-flex align-items-center buttons-container'}>
          {this.allowPageSizeChange && this.pageSizes && (
            <ir-select
              selectedValue={String(this.pageSize)}
              data={this.pageSizes.map(size => ({
                text: `${size} ${this.recordLabel}`,
                value: String(size),
              }))}
              showFirstOption={false}
              style={{ margin: '0 0.5rem' }}
              onSelectChange={e => this.handlePageSizeChange(Number(e.detail))}
            ></ir-select>
          )}
          {this.pages > 1 && (
            <Fragment>
              <ir-button
                size="sm"
                btn_disabled={isFirstPage || this.disabled}
                onClickHandler={() => this.handlePageChange(1, 'first')}
                icon_name="angles_left"
                style={{ '--icon-size': '0.875rem' }}
                aria-label="Go to first page"
              ></ir-button>
              <ir-button
                size="sm"
                btn_disabled={isFirstPage || this.disabled}
                onClickHandler={() => this.handlePageChange(this.currentPage - 1, 'previous')}
                icon_name="angle_left"
                style={{ '--icon-size': '0.875rem' }}
                aria-label="Go to previous page"
              ></ir-button>
              <ir-select
                selectedValue={this.currentPage.toString()}
                showFirstOption={false}
                onSelectChange={e => this.handlePageChange(+e.detail, 'direct')}
                data={Array.from(Array(this.pages), (_, i) => i + 1).map(i => ({
                  text: i.toString(),
                  value: i.toString(),
                }))}
                aria-label={`Current page ${this.currentPage} of ${this.pages}`}
                disabled={this.disabled}
              ></ir-select>
              <ir-button
                size="sm"
                btn_disabled={isLastPage || this.disabled}
                onClickHandler={() => this.handlePageChange(this.currentPage + 1, 'next')}
                icon_name="angle_right"
                style={{ '--icon-size': '0.875rem' }}
                aria-label="Go to next page"
              ></ir-button>
              <ir-button
                size="sm"
                btn_disabled={isLastPage || this.disabled}
                onClickHandler={() => this.handlePageChange(this.pages, 'last')}
                icon_name="angles_right"
                style={{ '--icon-size': '0.875rem' }}
                aria-label="Go to last page"
              ></ir-button>
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}
