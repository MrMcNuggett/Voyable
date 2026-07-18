export interface TextareaProps{ label?:string; placeholder?:string; rows?:number; value?:string; onChange?:(e:any)=>void; error?:string; }
export function Textarea(props: TextareaProps): JSX.Element;
