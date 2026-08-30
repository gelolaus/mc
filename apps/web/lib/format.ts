const tz='Asia/Manila'; export const date=(value:string)=>new Intl.DateTimeFormat('en-US',{dateStyle:'long',timeZone:tz}).format(new Date(value));
export const duration=(seconds:number|null, long=false)=>{if(seconds===null)return 'Status unavailable';let s=Math.max(0,seconds);const d=Math.floor(s/86400);s%=86400;const h=Math.floor(s/3600);s%=3600;const m=Math.floor(s/60);return long?`${d}d ${h}h ${m}m`:`${d}D ${h}H`;};
export const relative=(value:string)=>{const d=Math.floor((Date.now()-new Date(value).getTime())/86400000);return d<=0?'Joined today':d===1?'Joined yesterday':`Joined ${d} days ago`;};

