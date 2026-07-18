import React from "react";
const sizeMap={sm:{h:36,px:14,fs:"var(--text-sm)"},md:{h:44,px:20,fs:"var(--text-base)"},lg:{h:52,px:26,fs:"var(--text-lg)"}};
const variantMap={
primary:{bg:"var(--accent-primary)",fg:"var(--text-on-accent)",border:"transparent",hoverBg:"var(--accent-primary-hover)"},
secondary:{bg:"var(--accent-secondary)",fg:"var(--ink-900)",border:"transparent",hoverBg:"var(--accent-secondary-hover)"},
outline:{bg:"transparent",fg:"var(--text-primary)",border:"var(--border-default)",hoverBg:"var(--surface-sunken)"},
ghost:{bg:"transparent",fg:"var(--text-primary)",border:"transparent",hoverBg:"var(--surface-sunken)"},
};
export function Button({variant="primary",size="md",disabled=false,icon=null,iconPosition="left",children,onClick,style,...rest}){
const s=sizeMap[size]||sizeMap.md;const v=variantMap[variant]||variantMap.primary;
const [hover,setHover]=React.useState(false);
return React.createElement("button",{"data-slot":"button","data-variant":variant,"data-size":size,disabled,onClick,
onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),
style:{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,height:s.h,padding:`0 ${s.px}px`,
fontFamily:"var(--font-sans)",fontWeight:600,fontSize:s.fs,color:v.fg,background:disabled?"var(--ink-200)":(hover?v.hoverBg:v.bg),
border:v.border==="transparent"?"none":`1.5px solid ${v.border}`,borderRadius:"var(--radius-full)",cursor:disabled?"not-allowed":"pointer",
opacity:disabled?0.6:1,transition:"background var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
transform:hover&&!disabled?"translateY(-1px)":"none",whiteSpace:"nowrap",...style},...rest},
icon&&iconPosition==="left"?icon:null,children,icon&&iconPosition==="right"?icon:null);
}
