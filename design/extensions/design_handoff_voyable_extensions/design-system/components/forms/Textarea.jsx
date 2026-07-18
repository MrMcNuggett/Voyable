import React from "react";
export function Textarea({label,placeholder,rows=4,value,onChange,error,...rest}){
const [focus,setFocus]=React.useState(false);
return React.createElement("label",{style:{display:"flex",flexDirection:"column",gap:6,fontFamily:"var(--font-sans)"}},
label&&React.createElement("span",{style:{fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text-secondary)"}},label),
React.createElement("textarea",{placeholder,rows,value,onChange,onFocus:()=>setFocus(true),onBlur:()=>setFocus(false),
style:{padding:"12px 14px",background:"var(--surface-raised)",border:`1.5px solid ${error?"var(--state-error)":focus?"var(--accent-primary)":"var(--border-default)"}`,
borderRadius:"var(--radius-md)",fontSize:"var(--text-base)",fontFamily:"var(--font-sans)",color:"var(--text-primary)",outline:"none",resize:"vertical",
boxShadow:focus?"0 0 0 3px var(--accent-primary-subtle)":"none",transition:"border-color var(--dur-fast)"},...rest}),
error&&React.createElement("span",{style:{fontSize:"var(--text-xs)",color:"var(--state-error)"}},error));
}
