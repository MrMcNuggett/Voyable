import React from "react";
export function TripCard({title,subtitle,duration,coverColor="var(--olive-100)",badge,onClick}){
const [hover,setHover]=React.useState(false);
return React.createElement("div",{onClick,onMouseEnter:()=>setHover(true),onMouseLeave:()=>setHover(false),
style:{width:280,borderRadius:"var(--radius-xl)",overflow:"hidden",background:"var(--surface-raised)",border:"1px solid var(--border-subtle)",
boxShadow:hover?"var(--shadow-lg)":"var(--shadow-sm)",transform:hover?"translateY(-3px)":"none",transition:"all var(--dur-normal) var(--ease-out)",cursor:"pointer",fontFamily:"var(--font-sans)"}},
React.createElement("div",{style:{height:150,background:coverColor,position:"relative",display:"flex",alignItems:"flex-end",padding:14}},
badge&&React.createElement("span",{style:{position:"absolute",top:12,left:12,background:"var(--surface-raised)",color:"var(--text-primary)",
fontSize:"var(--text-xs)",fontWeight:600,padding:"4px 10px",borderRadius:"var(--radius-full)"}},badge)),
React.createElement("div",{style:{padding:"16px 18px 18px"}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"var(--text-xl)",color:"var(--text-primary)",marginBottom:4}},title),
React.createElement("div",{style:{fontSize:"var(--text-sm)",color:"var(--text-secondary)"}},subtitle),
duration&&React.createElement("div",{style:{fontSize:"var(--text-xs)",color:"var(--text-muted)",marginTop:8,fontFamily:"var(--font-mono)"}},duration)));
}
