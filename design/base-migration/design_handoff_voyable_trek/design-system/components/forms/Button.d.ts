export interface ButtonProps{
  variant?: "primary"|"secondary"|"outline"|"ghost";
  size?: "sm"|"md"|"lg";
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left"|"right";
  children?: React.ReactNode;
  onClick?: () => void;
}
export function Button(props: ButtonProps): JSX.Element;
