export class ReloadInterceptor {
  private isActive = false;
  private readonly onIntercept: () => void;

  /**
   * @param onIntercept
   *   Called whenever a reload is intercepted (F5/Ctrl+R or beforeunload).
   * @param autoActivate
   *   If true, will immediately attach listeners.
   */
  constructor(options: { onIntercept?: () => void; autoActivate: boolean }) {
    this.onIntercept = options.onIntercept ?? (() => {});
    if (options.autoActivate) {
      this.activate();
    }
  }

  /** Begin intercepting reloads & navigations */
  public activate(): void {
    if (this.isActive) return;
    window.addEventListener('beforeunload', this.handleBeforeUnload, { capture: true });
    this.isActive = true;
  }

  /** Stop intercepting reloads & navigations */
  public deactivate(): void {
    if (!this.isActive) return;
    window.removeEventListener('beforeunload', this.handleBeforeUnload, { capture: true });
    this.isActive = false;
  }

  /** Native “Are you sure you want to leave?” dialog */
  private handleBeforeUnload = (e: BeforeUnloadEvent): void => {
    this.onIntercept();
    e.preventDefault();
    e.returnValue = '';
  };
}
