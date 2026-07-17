import React from "react";
export function Input({label,placeholder,icon=null,error,value,onChange,type="text",...rest}){
const [focus,setFocus]=React.useState(false);
return React.createElement("label",{style:{display:"flex",flexDirection:"column",gap:6,fontFamily:"var(--font-sans)"}},
label&&React.createElement("span",{style:{fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text-secondary)"}},label),
React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8,height:46,padding:"0 14px",
background:"var(--surface-raised)",border:`1.5px solid ${error?"var(--state-error)":focus?"var(--accent-primary)":"var(--border-default)"}`,
borderRadius:"var(--radius-md)",boxShadow:focus?"0 0 0 3px var(--accent-primary-subtle)":"none",transition:"border-color var(--dur-fast), box-shadow var(--dur-fast)"}},
icon,
React.createElement("input",{type,placeholder,value,onChange,onFocus:()=>setFocus(true),onBlur:()=>setFocus(false),
style:{border:"none",outline:"none",background:"transparent",flex:1,fontSize:"var(--text-base)",fontFamily:"var(--font-sans)",color:"var(--text-primary)"},...rest})),
error&&React.createElement("span",{style:{fontSize:"var(--text-xs)",color:"var(--state-error)"}},error));
}
