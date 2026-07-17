import React from "react";
export function Checkbox({label,checked=false,onChange}){
return React.createElement("label",{style:{display:"inline-flex",alignItems:"center",gap:10,cursor:"pointer",fontFamily:"var(--font-sans)"}},
React.createElement("span",{onClick:()=>onChange&&onChange(!checked),
style:{width:20,height:20,borderRadius:6,border:`1.5px solid ${checked?"var(--accent-primary)":"var(--border-default)"}`,
background:checked?"var(--accent-primary)":"var(--surface-raised)",display:"flex",alignItems:"center",justifyContent:"center",
transition:"all var(--dur-fast)",flexShrink:0}},
checked&&React.createElement("svg",{width:12,height:12,viewBox:"0 0 12 12",fill:"none"},
React.createElement("path",{d:"M2 6l3 3 5-6",stroke:"var(--stone-50)",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round"}))),
React.createElement("span",{style:{fontSize:"var(--text-base)",color:"var(--text-primary)"}},label));
}
