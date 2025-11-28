import type WaButton from '@awesome.me/webawesome/dist/components/button/button';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
export type NativeButton = WaButton;

@Component({
  tag: 'ir-custom-button',
  styleUrls: ['ir-custom-button.css', '../../../global/app.css'],
  shadow: false,
})
export class IrCustomButton {
  @Prop() link: boolean;
  @Prop({ reflect: true }) iconBtn: boolean;
  /** The button's theme variant. Defaults to `neutral` if not within another element with a variant. */
  @Prop() variant: NativeButton['variant'];

  /** The button's visual appearance. */
  @Prop() appearance: NativeButton['appearance'];

  /** The button's size. */
  @Prop() size: NativeButton['size'] = 'small';

  /** Draws the button with a caret. Used to indicate that the button triggers a dropdown menu or similar behavior. */
  @Prop() withCaret: NativeButton['withCaret'];

  /** Disables the button. Does not apply to link buttons. */
  @Prop() disabled: NativeButton['disabled'];

  /** Draws the button in a loading state. */
  @Prop() loading: NativeButton['loading'];

  /** Draws a pill-style button with rounded edges. */
  @Prop() pill: NativeButton['pill'];

  /**
   * The type of button. Note that the default value is `button` instead of `submit`, which is opposite of how native
   * `<button>` elements behave. When the type is `submit`, the button will submit the surrounding form.
   */
  @Prop() type: NativeButton['type'] = 'button';

  /**
   * The name of the button, submitted as a name/value pair with form data, but only when this button is the submitter.
   * This attribute is ignored when `href` is present.
   */
  @Prop() name: NativeButton['name'];

  /**
   * The value of the button, submitted as a pair with the button's name as part of the form data, but only when this
   * button is the submitter. This attribute is ignored when `href` is present.
   */
  @Prop() value: NativeButton['value'];

  /** When set, the underlying button will be rendered as an `<a>` with this `href` instead of a `<button>`. */
  @Prop() href: NativeButton['href'];

  /** Tells the browser where to open the link. Only used when `href` is present. */
  @Prop() target: NativeButton['target'];

  /** When using `href`, this attribute will map to the underlying link's `rel` attribute. */
  @Prop() rel: NativeButton['rel'];

  /** Tells the browser to download the linked file as this filename. Only used when `href` is present. */
  @Prop() download: NativeButton['download'];

  /**
   * The "form owner" to associate the button with. If omitted, the closest containing form will be used instead. The
   * value of this attribute must be an id of a form in the same document or shadow root as the button.
   */
  @Prop() form: NativeButton['form'];

  /** Used to override the form owner's `action` attribute. */
  @Prop() formAction: NativeButton['formAction'];

  /** Used to override the form owner's `enctype` attribute.  */
  @Prop() formEnctype: NativeButton['formEnctype'];

  /** Used to override the form owner's `method` attribute.  */
  @Prop() formMethod: NativeButton['formMethod'];

  /** Used to override the form owner's `novalidate` attribute. */
  @Prop() formNoValidate: NativeButton['formNoValidate'];

  /** Used to override the form owner's `target` attribute. */
  @Prop() formTarget: NativeButton['formTarget'];

  @Event() clickHandler: EventEmitter<MouseEvent>;

  private buttonEl: NativeButton;

  componentDidLoad() {
    this.buttonEl.addEventListener('click', this.handleButtonClick);
  }

  disconnectedCallback() {
    this.buttonEl.removeEventListener('click', this.handleButtonClick);
  }

  private handleButtonClick = (e: MouseEvent) => {
    this.clickHandler.emit(e);
  };

  render() {
    return (
      <Host>
        <wa-button
          ref={el => (this.buttonEl = el)}
          /* core button props */
          type={this.type}
          size={this.size}
          class={`ir__custom-button ${this.iconBtn ? '--icon' : ''} ${this.link ? '--link' : ''}`}
          disabled={this.disabled}
          appearance={this.link ? 'plain' : this.appearance}
          loading={this.loading}
          with-caret={this.withCaret}
          variant={this.link ? 'brand' : this.variant}
          pill={this.pill}
          /* link-related props */
          href={this.href}
          target={this.target}
          rel={this.rel}
          download={this.download}
          /* form-related props */
          name={this.name}
          value={this.value}
          form={this.form}
          form-action={this.formAction}
          form-enctype={this.formEnctype}
          form-method={this.formMethod}
          form-no-validate={this.formNoValidate}
          form-target={this.formTarget}
        >
          <slot slot="start" name="start"></slot>
          <slot></slot>
          <slot slot="end" name="end"></slot>
        </wa-button>
      </Host>
    );
  }
}
