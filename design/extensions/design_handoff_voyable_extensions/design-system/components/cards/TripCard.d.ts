export interface TripCardProps{ title:string; subtitle?:string; duration?:string; coverColor?:string; badge?:string; onClick?:()=>void; }
export function TripCard(props: TripCardProps): JSX.Element;
