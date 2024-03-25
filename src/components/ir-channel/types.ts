export interface IModalCause {
  cause: string;
  action: () => Promise<any>;
  title: string;
  message: string;
  main_color: 'primary' | 'danger';
}
