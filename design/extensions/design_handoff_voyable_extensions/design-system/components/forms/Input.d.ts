export interface InputProps{
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export function Input(props: InputProps): JSX.Element;
