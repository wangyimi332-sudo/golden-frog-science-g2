'use strict';
window.validateLearning=function(x){
 const fresh=()=>({stats:{},levels:{},drafts:{},favorites:[],family:{},bench:{},day:null,history:[]});if(x===undefined)return fresh();
 const fail=()=>{throw Error('学习计划与成长档案格式无效');},obj=v=>v&&typeof v==='object'&&!Array.isArray(v),keys=LEARN.cards.map(c=>c.id).concat(LEARN.sentences.map(c=>c.id)),date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!isNaN(Date.parse(v+'T12:00:00')),text=v=>typeof v==='string'&&v.length<=1200;
 if(!obj(x))fail();for(const k of ['stats','levels','drafts','family','bench'])if(!obj(x[k]))fail();
 for(const [id,s] of Object.entries(x.stats)){if(!keys.includes(id)||!obj(s)||!Number.isInteger(s.streak)||s.streak<0||s.streak>4||!date(s.last)||!date(s.due)||!Number.isInteger(s.runs)||s.runs<1||s.runs>100000||typeof s.first!=='boolean'||typeof s.lastOk!=='boolean'||![0,1].includes(s.variant))fail();}
 for(const [id,n] of Object.entries(x.levels))if(!LEARN.sentences.some(s=>s.id===id)||!Number.isInteger(n)||n<0||n>3)fail();
 for(const [id,d] of Object.entries(x.drafts)){if(!keys.includes(id)||!obj(d)||![0,1,2].includes(d.stage)||![0,1].includes(d.variant)||typeof d.wrong!=='boolean'||typeof d.help!=='boolean'||!Array.isArray(d.tokens)||new Set(d.tokens).size!==d.tokens.length||d.tokens.some(n=>!Number.isInteger(n)||n<0||n>=(LEARN.sentences.find(s=>s.id===id)?.parts.length||0))||!(d.selected===null||[0,1].includes(d.selected)))fail();}
 const favs=keys.concat(LEARN.cards.map((_,i)=>'w'+i));if(!Array.isArray(x.favorites)||x.favorites.length>42||new Set(x.favorites).size!==x.favorites.length||x.favorites.some(id=>!favs.includes(id)))fail();
 for(const [id,f] of Object.entries(x.family)){if(!LEARN.family.some(s=>s.id===id)||!obj(f)||!['observation','evidence','explanation','parent'].every(k=>text(f[k]))||!(f.done===null||date(f.done)))fail();if(f.done&&(!f.observation.trim()||!f.explanation.trim()))fail();}
 for(const [id,b] of Object.entries(x.bench)){if(!['greenhouse','materials','transport','sound','poles','volume'].includes(id)||!obj(b)||!text(b.prediction)||!text(b.note))fail();for(const k of ['seen','order'])if(!Array.isArray(b[k])||b[k].length>3||new Set(b[k]).size!==b[k].length||b[k].some(i=>!['0','1',...(id==='materials'?['2']:[])].includes(i)))fail();}
 if(x.day!==null&&(!obj(x.day)||!date(x.day.date)||!Array.isArray(x.day.ids)||x.day.ids.length!==3||new Set(x.day.ids).size!==3||x.day.ids.some(id=>!keys.includes(id))||!Array.isArray(x.day.done)||new Set(x.day.done).size!==x.day.done.length||x.day.done.some(id=>!x.day.ids.includes(id))))fail();
 if(x.day?.assessment!==undefined&&(typeof x.day.assessment!=='string'||x.day.assessment.length>40))fail();
 if(!Array.isArray(x.history)||x.history.length>100)fail();for(const h of x.history)if(!obj(h)||!keys.includes(h.id)||!date(h.date)||typeof h.ok!=='boolean'||typeof h.help!=='boolean'||![0,1,2].includes(h.stage))fail();
 return JSON.parse(JSON.stringify(x));
};
