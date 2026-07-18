import React from "react";
export function PricingCard({tier,price,period,description,features=[],featured=false,ctaLabel="Choose plan"}){
return React.createElement("div",{style:{width:260,padding:"28px 24px",borderRadius:"var(--radius-xl)",
background:featured?"var(--accent-primary)":"var(--surface-raised)",border:featured?"none":"1px solid var(--border-subtle)",
boxShadow:featured?"var(--shadow-lg)":"var(--shadow-sm)",fontFamily:"var(--font-sans)",display:"flex",flexDirection:"column",gap:16}},
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"var(--text-lg)",color:featured?"var(--stone-50)":"var(--text-primary)"}},tier),
React.createElement("div",{style:{display:"flex",alignItems:"baseline",gap:4}},
React.createElement("span",{style:{fontFamily:"var(--font-display)",fontWeight:800,fontSize:"var(--text-4xl)",color:featured?"var(--stone-50)":"var(--text-primary)"}},price),
period&&React.createElement("span",{style:{fontSize:"var(--text-sm)",color:featured?"var(--stone-100)":"var(--text-muted)"}},period)),
React.createElement("div",{style:{fontSize:"var(--text-sm)",color:featured?"var(--stone-100)":"var(--text-secondary)"}},description),
React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10,marginTop:4}},
features.map((f,i)=>React.createElement("div",{key:i,style:{display:"flex",gap:8,alignItems:"center",fontSize:"var(--text-sm)",color:featured?"var(--stone-50)":"var(--text-primary)"}},
React.createElement("span",{style:{color:featured?"var(--stone-50)":"var(--accent-route)"}},"✓"),f))),
React.createElement("button",{style:{marginTop:8,height:44,borderRadius:"var(--radius-full)",border:"none",cursor:"pointer",fontWeight:600,fontSize:"var(--text-sm)",
background:featured?"var(--surface-raised)":"var(--accent-primary)",color:featured?"var(--accent-primary)":"var(--text-on-accent)"}},ctaLabel));
}
