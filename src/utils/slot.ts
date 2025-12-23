/**
 * SlotManager - A reusable service for managing slot state in Stencil components
 *
 * Usage:
 * 1. Create an instance in your component
 * 2. Initialize in componentWillLoad()
 * 3. Setup observers in componentDidLoad()
 * 4. Cleanup in disconnectedCallback()
 * 5. Check slot state using hasSlot()
 */
export class SlotManager {
  private slotState = new Map<string, boolean>();
  private slotObserver: MutationObserver | null = null;
  private isInitialized = false;

  constructor(private readonly hostElement: HTMLElement, private readonly slotNames: readonly string[], private readonly onStateChange?: () => void) {}

  /**
   * Initialize the slot state. Call this in componentWillLoad()
   */
  initialize(): void {
    this.updateSlotState();
    this.isInitialized = true;
  }

  /**
   * Setup slot listeners and observers. Call this in componentDidLoad()
   */
  setupListeners(): void {
    if (!this.isInitialized) {
      console.warn('SlotManager: initialize() must be called before setupListeners()');
      return;
    }

    // Listen to slotchange events
    this.hostElement.addEventListener('slotchange', this.handleSlotChange);

    // Use MutationObserver as a fallback for browsers that don't fire slotchange reliably
    this.slotObserver = new MutationObserver(this.handleSlotChange);
    this.slotObserver.observe(this.hostElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
  }

  /**
   * Remove all listeners and cleanup. Call this in disconnectedCallback()
   */
  destroy(): void {
    this.hostElement.removeEventListener('slotchange', this.handleSlotChange);
    this.slotObserver?.disconnect();
    this.slotObserver = null;
    this.slotState.clear();
    this.isInitialized = false;
  }

  /**
   * Check if a specific slot has content
   */
  hasSlot(name: string): boolean {
    return this.slotState.get(name) ?? false;
  }

  /**
   * Get all slot states as a Map
   */
  getSlotState(): ReadonlyMap<string, boolean> {
    return this.slotState;
  }

  /**
   * Get all slot names that have content
   */
  getActiveSlots(): string[] {
    return Array.from(this.slotState.entries())
      .filter(([_, hasContent]) => hasContent)
      .map(([name]) => name);
  }

  /**
   * Manually trigger a slot state update
   */
  refresh(): void {
    this.updateSlotState();
  }

  private handleSlotChange = (): void => {
    this.updateSlotState();
    this.onStateChange?.();
  };

  private updateSlotState(): void {
    const newState = new Map<string, boolean>();

    this.slotNames.forEach(name => {
      newState.set(name, this.checkSlotHasContent(name));
    });

    this.slotState = newState;
  }

  private checkSlotHasContent(name: string): boolean {
    return Array.from(this.hostElement.children).some(child => child.getAttribute('slot') === name);
  }
}

/**
 * Convenience function to create a SlotManager with automatic lifecycle management
 * Returns helper methods that can be called directly in lifecycle hooks
 */
export function createSlotManager(hostElement: HTMLElement, slotNames: readonly string[], onStateChange?: () => void) {
  const manager = new SlotManager(hostElement, slotNames, onStateChange);

  return {
    manager,
    // Lifecycle hooks
    initialize: () => manager.initialize(),
    setupListeners: () => manager.setupListeners(),
    destroy: () => manager.destroy(),
    // Query methods
    hasSlot: (name: string) => manager.hasSlot(name),
    getSlotState: () => manager.getSlotState(),
    getActiveSlots: () => manager.getActiveSlots(),
    refresh: () => manager.refresh(),
  };
}
