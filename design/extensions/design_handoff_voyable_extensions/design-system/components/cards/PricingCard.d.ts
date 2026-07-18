export interface PricingCardProps{ tier:string; price:string; period?:string; description?:string; features?:string[]; featured?:boolean; ctaLabel?:string; }
export function PricingCard(props: PricingCardProps): JSX.Element;
