export interface SelectOption{ label:string; value:string; }
export interface SelectProps{ label?:string; options?: (SelectOption|string)[]; value?:string; onChange?:(e:any)=>void; placeholder?:string; }
export function Select(props: SelectProps): JSX.Element;
