import React from "react";
function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}
function startWeekday(y,m){return new Date(y,m,1).getDay();}
const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
export function DatePicker({startDate=null,endDate=null,onChange,month=new Date().getMonth(),year=new Date().getFullYear()}){
const [m,setM]=React.useState(month);const [y,setY]=React.useState(year);
const [start,setStart]=React.useState(startDate);const [end,setEnd]=React.useState(endDate);
const total=daysInMonth(y,m);const offset=startWeekday(y,m);
const cells=[...Array(offset).fill(null),...Array(total).keys()].map(d=>d===null?null:d+1);
function pick(day){const d=new Date(y,m,day);
if(!start||(start&&end)){setStart(d);setEnd(null);onChange&&onChange({start:d,end:null});}
else{if(d<start){setStart(d);setEnd(null);}else{setEnd(d);onChange&&onChange({start,end:d});}}}
function inRange(day){if(!start)return false;const d=new Date(y,m,day).getTime();
if(end)return d>=Math.min(start.getTime(),end.getTime())&&d<=Math.max(start.getTime(),end.getTime());
return d===start.getTime();}
function isEdge(day){if(!start)return false;const d=new Date(y,m,day).getTime();return d===start.getTime()||(end&&d===end.getTime());}
return React.createElement("div",{style:{fontFamily:"var(--font-sans)",background:"var(--surface-raised)",border:"1px solid var(--border-subtle)",
borderRadius:"var(--radius-lg)",padding:20,width:300,boxShadow:"var(--shadow-md)"}},
React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
React.createElement("button",{onClick:()=>setM(m===0?(setY(y-1),11):m-1),style:{border:"none",background:"none",cursor:"pointer",fontSize:16,color:"var(--text-secondary)"}},"‹"),
React.createElement("span",{style:{fontFamily:"var(--font-display)",fontWeight:700,fontSize:"var(--text-base)",color:"var(--text-primary)"}},MONTHS[m]+" "+y),
React.createElement("button",{onClick:()=>setM(m===11?(setY(y+1),0):m+1),style:{border:"none",background:"none",cursor:"pointer",fontSize:16,color:"var(--text-secondary)"}},"›")),
React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,fontSize:11,color:"var(--text-muted)",marginBottom:6,fontWeight:600}},
["S","M","T","W","T","F","S"].map((d,i)=>React.createElement("div",{key:i,style:{textAlign:"center"}},d))),
React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}},
cells.map((day,i)=>day===null?React.createElement("div",{key:i}):
React.createElement("div",{key:i,onClick:()=>pick(day),
style:{textAlign:"center",padding:"7px 0",fontSize:"var(--text-sm)",cursor:"pointer",borderRadius:isEdge(day)?"var(--radius-full)":"6px",
background:isEdge(day)?"var(--accent-primary)":inRange(day)?"var(--accent-primary-subtle)":"transparent",
color:isEdge(day)?"var(--text-on-accent)":"var(--text-primary)",transition:"background var(--dur-fast)"}},day))));
}
