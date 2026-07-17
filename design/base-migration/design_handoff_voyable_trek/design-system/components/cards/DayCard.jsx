import React from "react";
export function DayCard({day,place,note,isLast=false,transportIcon}){
return React.createElement("div",{style:{display:"flex",gap:16,fontFamily:"var(--font-sans)"}},
React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",width:24}},
React.createElement("div",{style:{width:12,height:12,borderRadius:"50%",background:"var(--accent-route)",flexShrink:0}}),
!isLast&&React.createElement("div",{style:{width:2,flex:1,background:"var(--amber-100)",marginTop:2}})),
React.createElement("div",{style:{paddingBottom:isLast?0:24,flex:1}},
React.createElement("div",{style:{fontFamily:"var(--font-mono)",fontSize:"var(--text-xs)",color:"var(--accent-route)",fontWeight:600,marginBottom:2}},"DAY "+String(day).padStart(2,"0")),
React.createElement("div",{style:{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"var(--text-lg)",color:"var(--text-primary)"}},place),
note&&React.createElement("div",{style:{fontSize:"var(--text-sm)",color:"var(--text-secondary)",marginTop:2}},note)));
}
