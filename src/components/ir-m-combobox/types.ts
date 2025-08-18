export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  html_content?: string;
}

export type ComboboxType = 'select' | 'editable' | 'multiselect';
export type DataMode = 'static' | 'external';
