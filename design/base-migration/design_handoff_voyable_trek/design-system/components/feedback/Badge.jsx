import React from "react";
const map={neutral:{bg:"var(--surface-sunken)",fg:"var(--text-secondary)"},primary:{bg:"var(--accent-primary-subtle)",fg:"var(--petrol-700)"},
success:{bg:"var(--state-success-subtle)",fg:"var(--success-700)"},warning:{bg:"var(--state-warning-subtle)",fg:"var(--amber-700)"},error:{bg:"var(--state-error-subtle)",fg:"var(--error-500)"}};
export function Badge({children,tone="neutral"}){
const c=map[tone]||map.neutral;
return React.createElement("span",{style:{display:"inline-flex",alignItems:"center",padding:"4px 12px",borderRadius:"var(--radius-full)",
fontFamily:"var(--font-sans)",fontSize:"var(--text-xs)",fontWeight:600,background:c.bg,color:c.fg}},children);
}
