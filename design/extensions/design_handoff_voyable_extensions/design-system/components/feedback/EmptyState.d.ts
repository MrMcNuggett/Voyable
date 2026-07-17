export interface EmptyStateProps{ icon?: React.ReactNode; title:string; description?:string; actionLabel?:string; onAction?:()=>void; }
export function EmptyState(props: EmptyStateProps): JSX.Element;
