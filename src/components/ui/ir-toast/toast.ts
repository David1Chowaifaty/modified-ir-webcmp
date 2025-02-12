export type TPositions = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type TToastType = 'success' | 'error' | 'custom';

interface IBaseToast {
  position?: TPositions;
  description: string;
  title?: string;
  duration?: number;
  style?: Partial<CSSStyleDeclaration>;
}

interface IToastCallback {
  callback: () => void;
}

interface IToastButtonDetails {
  button_title: string;
  button_icon?: HTMLElement;
}

interface ICustomToast extends IBaseToast {
  type: 'custom';
  body: HTMLElement;
}

interface IDefaultToast extends IBaseToast {
  type: Exclude<TToastType, 'custom'>;
}

type IToastWithButton = IToastCallback & IToastButtonDetails;

export type IToast = (ICustomToast & Partial<IToastWithButton>) | (IDefaultToast & Partial<IToastWithButton>);
