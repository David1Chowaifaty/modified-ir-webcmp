type SyncConfig<T> = {
  key: keyof T; // State property name
  param: string; // URL param name
  defaultValue?: any;
  replace?: boolean; // true = replaceState (default), false = pushState
};

export class UrlParamSync<T extends object> {
  private component: T;
  private configs: SyncConfig<T>[];
  private originalDisconnected?: () => void;
  private originalRender?: () => any;
  private restoreFns: { push?: Function; replace?: Function } = {};

  constructor(component: T, configs: SyncConfig<T>[]) {
    this.component = component;
    this.configs = configs;

    // Initialize state from URL
    this.applyUrlToState();

    // Listen for browser navigation
    window.addEventListener('popstate', this.applyUrlToState);

    // Patch pushState/replaceState to detect external URL changes
    this.patchHistory();

    // Patch render to auto-sync state → URL
    this.patchRender();

    // Ensure cleanup
    this.patchDisconnected();
  }

  // --- State <-> URL ---
  private applyUrlToState = () => {
    this.configs.forEach(({ key, param, defaultValue }) => {
      const raw = this.getParam(param);
      let val: any = defaultValue;

      if (raw !== null) {
        try {
          val = JSON.parse(decodeURIComponent(raw));
        } catch {
          val = raw; // fallback: plain string
        }
      }

      (this.component as any)[key] = val;
    });
  };

  private getParam(param: string): string | null {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }

  private setParam(param: string, value: any, replace = true) {
    const url = new URL(window.location.href);

    if (value === undefined || value === null || value === '') {
      url.searchParams.delete(param);
    } else {
      const encoded = encodeURIComponent(JSON.stringify(value));
      url.searchParams.set(param, encoded);
    }

    if (replace) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  }

  private updateAll() {
    this.configs.forEach(({ key, param, replace }) => {
      const value = (this.component as any)[key];
      this.setParam(param, value, replace ?? true);
    });
  }

  // --- Lifecycle Patching ---
  private patchRender() {
    const self = this;
    this.originalRender = (this.component as any).render;
    (this.component as any).render = function () {
      self.updateAll();
      return self.originalRender?.apply(this, arguments);
    };
  }

  private patchDisconnected() {
    const self = this;
    this.originalDisconnected = (this.component as any).disconnectedCallback;
    (this.component as any).disconnectedCallback = function () {
      window.removeEventListener('popstate', self.applyUrlToState);
      self.restoreHistory();
      self.originalDisconnected?.apply(this, arguments);
    };
  }

  // --- History Patching ---
  private patchHistory() {
    if (!this.restoreFns.push) {
      this.restoreFns.push = history.pushState;
      this.restoreFns.replace = history.replaceState;

      const apply = this.applyUrlToState;

      history.pushState = function (...args) {
        const ret = (this.restoreFns.push as any).apply(history, args);
        apply();
        return ret;
      }.bind(this);

      history.replaceState = function (...args) {
        const ret = (this.restoreFns.replace as any).apply(history, args);
        apply();
        return ret;
      }.bind(this);
    }
  }

  private restoreHistory() {
    if (this.restoreFns.push) {
      history.pushState = this.restoreFns.push as any;
      history.replaceState = this.restoreFns.replace as any;
      this.restoreFns = {};
    }
  }
}
