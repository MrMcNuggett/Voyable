import React from "react";
export function Tabs({items=[],active,onChange}){
return React.createElement("div",{style:{display:"flex",gap:4,padding:4,background:"var(--surface-sunken)",borderRadius:"var(--radius-full)",width:"fit-content",fontFamily:"var(--font-sans)"}},
items.map((it,i)=>{const isActive=(active??0)===i;
return React.createElement("button",{key:i,onClick:()=>onChange&&onChange(i),
style:{border:"none",cursor:"pointer",padding:"8px 18px",borderRadius:"var(--radius-full)",fontSize:"var(--text-sm)",fontWeight:600,
background:isActive?"var(--surface-raised)":"transparent",color:isActive?"var(--text-primary)":"var(--text-muted)",
boxShadow:isActive?"var(--shadow-sm)":"none",transition:"all var(--dur-fast)"}},it);}));
}
