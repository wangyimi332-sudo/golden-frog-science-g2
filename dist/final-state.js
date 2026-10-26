'use strict';
window.validateFinal=function(x){
 const empty=()=>({draft:null,attempts:[],nextForm:0,earned:false});if(x===undefined)return empty();
 const bad=()=>{throw Error('期末挑战存档内容无效');};
 if(!x||typeof x!=='object'||Array.isArray(x)||!Array.isArray(x.attempts)||x.attempts.length>8||![0,1].includes(x.nextForm)||typeof x.earned!=='boolean')bad();
 function run(r,finished){
  if(!r||![0,1].includes(r.form)||!Number.isInteger(r.index)||r.index<0||r.index>28||!Array.isArray(r.answers)||r.answers.length>28||r.answers.length!==r.index||typeof r.started!=='string'||r.started.length>40)bad();
  if(finished&&(r.index!==28||typeof r.finished!=='string'||r.finished.length>40))bad();
  if(r.paused!==undefined&&typeof r.paused!=='boolean')bad();
  if(r.help!==undefined&&(!r.help||typeof r.help!=='object'||Array.isArray(r.help)))bad();
  const validHelp=h=>{if(!h||typeof h!=='object'||Array.isArray(h)||Object.keys(h).some(k=>!['zh','transcript','audio'].includes(k))||Object.values(h).some(v=>typeof v!=='boolean'))bad();};
  if(r.help)validHelp(r.help);
  function answer(a,q,submitted=false){
   if(!a||typeof a!=='object'||Array.isArray(a)||!Array.isArray(a.value))bad();
   const max=q.type==='sentence'?q.parts.length:q.options.length;
   if(new Set(a.value).size!==a.value.length||a.value.some(v=>!Number.isInteger(v)||v<0||v>=max)||a.value.length>(q.type==='sentence'?max:1))bad();
   if(a.help)validHelp(a.help);
   if(a.skipped!==undefined&&typeof a.skipped!=='boolean')bad();
   if(submitted&&(a.skipped?a.value.length!==0:a.value.length!==(q.type==='sentence'?max:1)))bad();
  }
  r.answers.forEach((a,i)=>answer(a,window.FINAL.forms[r.form][i],true));
  if(r.current!==undefined){if(r.index===28)bad();answer(r.current,window.FINAL.forms[r.form][r.index]);}
  return JSON.parse(JSON.stringify(r));
 }
 return {draft:x.draft===null?null:run(x.draft,false),attempts:x.attempts.map(r=>run(r,true)),nextForm:x.nextForm,earned:x.earned};
};
