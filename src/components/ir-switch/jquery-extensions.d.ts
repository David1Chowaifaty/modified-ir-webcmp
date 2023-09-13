interface JQueryBootstrapSwitchOptions {
  onText?: string;
  offText?: string;
  state?: boolean;
  size?: string | 'mini' | 'small' | 'normal' | 'large';
  animate?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  indeterminate?: boolean;
  inverse?: boolean;
  radioAllOff?: boolean;
  onColor?: string | 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'default';
  offColor?: string | 'primary' | 'info' | 'success' | 'warning' | 'danger' | 'default';
  onClass?: string;
  offClass?: string;
  labelText?: string;
  handleWidth?: string | 'auto';
  labelWidth?: string | 'auto';
  baseClass?: string;
  wrapperClass?: string | any;
}

interface JQuery<TElement = HTMLElement> {
  bootstrapSwitch(options?: JQueryBootstrapSwitchOptions): JQuery<TElement>;
}
