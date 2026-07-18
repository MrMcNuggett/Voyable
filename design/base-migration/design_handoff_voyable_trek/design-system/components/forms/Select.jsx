import React from "react";
export function Select({label,options=[],value,onChange,placeholder="Select..."}){
const [focus,setFocus]=React.useState(false);
return React.createElement("label",{style:{display:"flex",flexDirection:"column",gap:6,fontFamily:"var(--font-sans)"}},
label&&React.createElement("span",{style:{fontSize:"var(--text-sm)",fontWeight:600,color:"var(--text-secondary)"}},label),
React.createElement("div",{style:{position:"relative"}},
React.createElement("select",{value,onChange,onFocus:()=>setFocus(true),onBlur:()=>setFocus(false),
style:{width:"100%",appearance:"none",height:46,padding:"0 36px 0 14px",background:"var(--surface-raised)",
border:`1.5px solid ${focus?"var(--accent-primary)":"var(--border-default)"}`,borderRadius:"var(--radius-md)",
fontSize:"var(--text-base)",fontFamily:"var(--font-sans)",color:"var(--text-primary)",outline:"none",cursor:"pointer"}},
React.createElement("option",{value:"",disabled:true,hidden:true},placeholder),
options.map((o,i)=>React.createElement("option",{key:i,value:o.value||o},o.label||o))),
React.createElement("span",{style:{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"var(--text-muted)",fontSize:11}},"▾")));
}
