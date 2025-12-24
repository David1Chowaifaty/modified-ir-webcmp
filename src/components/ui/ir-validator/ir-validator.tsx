import { Component, Element, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import type { ZodTypeAny } from 'zod';

type ValidatableChild = (HTMLElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement) & {
  value?: unknown;
};

@Component({
  tag: 'ir-validator',
  styleUrl: 'ir-validator.css',
  shadow: true,
})
export class IrValidator {
  @Element() el: HTMLIrValidatorElement;

  /** Zod schema used to validate the child control's value. */
  @Prop() schema!: ZodTypeAny;
  @Prop() value: any;

  @Prop() showErrorMessage: boolean;

  /** Enables automatic validation on every value change. */
  @Prop({ reflect: true }) autovalidate?: boolean;

  /** Optional form id. Falls back to the closest ancestor form when omitted. */
  @Prop() form?: string;

  /** Event names (space/comma separated) dispatched when the child value changes. */
  @Prop({ attribute: 'value-event' }) valueEvent: string = 'input input-change value-change select-change';

  /** Event names (space/comma separated) dispatched when the child loses focus. */
  @Prop({ attribute: 'blur-event' }) blurEvent: string = 'blur input-blur select-blur';

  /** Debounce delay (ms) before running validation for autovalidated changes. */
  @Prop({ attribute: 'validation-debounce' }) validationDebounce: number = 200;

  /** Emits whenever the validation state toggles. */
  @Event({ eventName: 'irValidationChange' }) validationChange!: EventEmitter<{ valid: boolean; value: unknown }>;

  /** Emits whenever the tracked value changes. */
  @Event({ eventName: 'irValueChange' }) valueChange!: EventEmitter<{ value: unknown }>;

  @State() private isValid = true;
  @State() private autoValidateActive = false;
  @State() private errorMessage: string = '';

  private childEl?: ValidatableChild;
  private formEl?: HTMLFormElement | null;
  private slotEl?: HTMLSlotElement;
  private currentValue: unknown;
  private hasInteracted = false;
  private validationTimer?: ReturnType<typeof setTimeout>;
  private valueEventsBound: string[] = [];
  private blurEventsBound: string[] = [];

  componentWillLoad() {
    if (!this.schema) {
      throw new Error('<ir-validator> requires a `schema` prop.');
    }
    this.syncAutovalidateFlag(this.autovalidate);
  }

  componentDidLoad() {
    this.slotEl = this.el.shadowRoot?.querySelector('slot') as HTMLSlotElement;
    this.slotEl?.addEventListener('slotchange', this.handleSlotChange);
    this.initializeChildReference();
    this.attachFormListener();
  }

  disconnectedCallback() {
    this.teardownChildListeners();
    this.detachFormListener();
    this.slotEl?.removeEventListener('slotchange', this.handleSlotChange);
    this.clearValidationTimer();
  }

  @Watch('schema')
  protected handleSchemaChange() {
    if (this.autoValidateActive && this.hasInteracted) {
      this.flushValidation();
    }
  }

  @Watch('autovalidate')
  protected handleAutoValidatePropChange(next?: boolean) {
    this.syncAutovalidateFlag(next);
    if (this.autoValidateActive) {
      this.flushValidation();
    }
  }

  @Watch('form')
  protected handleFormPropChange() {
    this.detachFormListener();
    this.attachFormListener();
  }

  @Watch('valueEvent')
  protected handleValueEventChange(newValue: string, oldValue: string) {
    if (newValue === oldValue) return;
    this.rebindChildListeners();
  }

  @Watch('blurEvent')
  protected handleBlurEventChange(newValue: string, oldValue: string) {
    if (newValue === oldValue) return;
    this.rebindChildListeners();
  }

  private syncAutovalidateFlag(next?: boolean) {
    this.autoValidateActive = JSON.parse(String(next ?? false));
  }

  private parseEvents(spec?: string) {
    if (!spec) return [];
    return spec
      .split(/[\s,]+/)
      .map(token => token.trim())
      .filter(Boolean);
  }

  @Watch('value')
  protected handleValuePropChange(next: unknown, previous: unknown) {
    if (Object.is(next, previous)) return;
    // keep the tracked value in sync with external changes without emitting another change event
    this.updateValue(next, { suppressValidation: true, emitChange: false });
    if (this.autoValidateActive && this.hasInteracted) {
      this.flushValidation();
    }
  }

  private handleSlotChange = () => {
    this.initializeChildReference();
  };

  private initializeChildReference() {
    const child = this.pickSingleChild();
    if (child === this.childEl) return;

    this.teardownChildListeners();
    if (!child) return;

    this.childEl = child;
    this.hasInteracted = false;
    this.registerChildListeners();

    const initialValue = this.readValueFromChild();
    this.updateValue(initialValue, { suppressValidation: !this.autoValidateActive, emitChange: true });
    if (!this.autoValidateActive) {
      this.updateAriaValidity(this.isValid);
    }
  }

  private pickSingleChild(): ValidatableChild | undefined {
    const slotChildren = this.slotEl?.assignedElements({ flatten: true }) ?? Array.from(this.el.children);
    const elements = slotChildren.filter(node => node.nodeType === Node.ELEMENT_NODE) as ValidatableChild[];

    if (elements.length === 0) {
      console.warn('<ir-validator> requires exactly one child element but found none.');
      return undefined;
    }

    if (elements.length > 1) {
      console.warn(`<ir-validator> requires exactly one child element but found ${elements.length}. Using the first.`);
    }

    return elements[0];
  }

  private registerChildListeners() {
    if (!this.childEl) return;

    this.unbindChildListeners();

    this.valueEventsBound = this.parseEvents(this.valueEvent);
    this.blurEventsBound = this.parseEvents(this.blurEvent);

    this.valueEventsBound.forEach(eventName => this.childEl!.addEventListener(eventName, this.handleValueEvent as EventListener));
    this.blurEventsBound.forEach(eventName => this.childEl!.addEventListener(eventName, this.handleBlurEvent as EventListener));
  }

  private unbindChildListeners() {
    if (!this.childEl) return;
    this.valueEventsBound.forEach(eventName => this.childEl!.removeEventListener(eventName, this.handleValueEvent as EventListener));
    this.blurEventsBound.forEach(eventName => this.childEl!.removeEventListener(eventName, this.handleBlurEvent as EventListener));
    this.valueEventsBound = [];
    this.blurEventsBound = [];
  }

  private teardownChildListeners() {
    if (this.childEl) {
      this.unbindChildListeners();
      this.childEl = undefined;
    }
    this.clearValidationTimer();
  }

  private rebindChildListeners() {
    if (!this.childEl) return;
    this.registerChildListeners();
  }

  private handleValueEvent = (event: Event) => {
    if (!this.childEl) return;
    const nextValue = this.extractEventValue(event);
    this.hasInteracted = true;
    this.updateValue(nextValue);
  };

  private handleBlurEvent = () => {
    if (!this.childEl) return;
    this.hasInteracted = true;
    if (this.autoValidateActive) {
      this.flushValidation();
    }
  };

  private extractEventValue(event: Event) {
    if ('detail' in event && event['detail'] && typeof event['detail'] === 'object' && 'value' in (event as CustomEvent).detail) {
      return (event as CustomEvent<{ value: unknown }>).detail.value;
    }

    const target = event.target as ValidatableChild;
    if (target && 'value' in target) {
      return target.value;
    }

    return this.readValueFromChild();
  }

  private readValueFromChild() {
    if (this.value !== undefined) {
      return this.value;
    }
    if (!this.childEl) return undefined;
    if ('value' in this.childEl) {
      return this.childEl.value;
    }
    return this.childEl.getAttribute?.('value');
  }

  private updateValue(nextValue: unknown, options: { suppressValidation?: boolean; emitChange?: boolean } = {}) {
    const previous = this.currentValue;
    this.currentValue = nextValue;

    if (options.emitChange !== false && !Object.is(previous, nextValue)) {
      this.valueChange.emit({ value: this.currentValue });
    }

    if (!options.suppressValidation && this.autoValidateActive && this.hasInteracted) {
      this.scheduleValidation();
    }
  }

  private validateCurrentValue(forceDisplay = false) {
    if (!this.schema) return true;
    const value = this.currentValue ?? this.readValueFromChild();
    this.currentValue = value;
    const result = this.schema.safeParse(value);
    const nextValidity = result.success;
    const previousValidity = this.isValid;
    this.isValid = nextValidity;

    if (!result.success) {
      this.errorMessage = result.error.issues[0]?.message ?? '';
    } else {
      this.errorMessage = '';
    }

    const shouldDisplay = forceDisplay || (this.autoValidateActive && this.hasInteracted);
    if (shouldDisplay) {
      this.updateAriaValidity(nextValidity);
      if (previousValidity !== nextValidity) {
        this.emitValidationChange();
      }
    }

    return nextValidity;
  }

  private updateAriaValidity(valid: boolean) {
    if (!this.childEl) return;
    if (valid) {
      this.childEl.removeAttribute('aria-invalid');
    } else {
      this.childEl.setAttribute('aria-invalid', 'true');
    }
  }

  private emitValidationChange() {
    this.validationChange.emit({ valid: this.isValid, value: this.currentValue });
  }

  private attachFormListener() {
    this.formEl = this.resolveFormRef();
    this.formEl?.addEventListener('submit', this.handleFormSubmit, true);
  }

  private detachFormListener() {
    this.formEl?.removeEventListener('submit', this.handleFormSubmit, true);
    this.formEl = undefined;
  }

  private resolveFormRef(): HTMLFormElement | null {
    if (typeof document !== 'undefined' && this.form) {
      const provided = document.getElementById(this.form);
      if (provided && provided instanceof HTMLFormElement) {
        return provided;
      }
    }
    return this.el.closest('form');
  }

  private handleFormSubmit = () => {
    this.hasInteracted = true;
    const valid = this.flushValidation();
    if (!valid && !this.autoValidateActive) {
      this.autoValidateActive = true;
    }
  };

  private scheduleValidation(immediate = false) {
    this.clearValidationTimer();
    const delay = Number(this.validationDebounce);
    if (immediate || !isFinite(delay) || delay <= 0) {
      return this.validateCurrentValue(true);
    }

    this.validationTimer = setTimeout(() => {
      this.validationTimer = undefined;
      this.validateCurrentValue(true);
    }, delay);

    return this.isValid;
  }

  private flushValidation() {
    return this.scheduleValidation(true);
  }

  private clearValidationTimer() {
    if (this.validationTimer !== undefined) {
      clearTimeout(this.validationTimer);
      this.validationTimer = undefined;
    }
  }

  render() {
    return (
      <Host>
        <slot></slot>
        {!this.isValid && this.showErrorMessage && (
          <span part="error-message" class="error-message">
            {this.errorMessage}
          </span>
        )}
      </Host>
    );
  }
}
