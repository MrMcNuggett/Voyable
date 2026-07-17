import React from "react";
export function EmptyState({icon,title,description,actionLabel,onAction}){
return React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:10,
padding:"48px 32px",fontFamily:"var(--font-sans)"}},
icon&&React.createElement("div",{style:{width:64,height:64,borderRadius:"var(--radius-full)",background:"var(--accent-primary-subtle)",
display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent-primary)",marginBottom:6}},icon),
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"var(--text-xl)",color:"var(--text-primary)"}},title),
description&&React.createElement("div",{style:{fontSize:"var(--text-sm)",color:"var(--text-secondary)",maxWidth:320}},description),
actionLabel&&React.createElement("button",{onClick:onAction,style:{marginTop:8,height:44,padding:"0 22px",borderRadius:"var(--radius-full)",
border:"none",cursor:"pointer",fontWeight:600,fontSize:"var(--text-sm)",background:"var(--accent-primary)",color:"var(--text-on-accent)"}},actionLabel));
}
