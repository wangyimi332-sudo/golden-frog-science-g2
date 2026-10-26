'use strict';
window.ForcesLab=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let context,osc,gain,timer,serial=0;
 function stop(){serial++;clearTimeout(timer);if(osc){try{osc.stop();osc.disconnect();}catch{}osc=null;}if(gain){gain.disconnect();gain=null;}}
 async function tone(hz,amp){
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return false;
  context??=new C();await context.resume();if(context.state!=='running')return false;
  if(hz===0)return true;
  osc=context.createOscillator();gain=context.createGain();osc.type='sine';osc.frequency.value=hz;
  gain.gain.setValueAtTime(0,context.currentTime);gain.gain.linearRampToValueAtTime(amp,context.currentTime+.04);
  gain.gain.setValueAtTime(amp,context.currentTime+.8);gain.gain.linearRampToValueAtTime(0,context.currentTime+.95);
  osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+1);return true;
 }
 function svg(kind,t,done=false){
  const wrap=body=>`<svg viewBox="0 0 460 220" role="img" aria-label="${esc(t?.en||'Select a setting')} · simplified model"><defs><marker id="labArrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="#b97748"/></marker></defs>${body}</svg>`;
  const txt=(x,y,text)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#365744" font-family="sans-serif" font-size="14">${esc(text)}</text>`;
  const arrow=(x,y,a,b)=>`<path d="M${x} ${y}L${a} ${b}" stroke="#b97748" stroke-width="4" marker-end="url(#labArrow)"/>`;
  const box=(x,y)=>`<g transform="translate(${x} ${y})"><rect x="-16" y="-25" width="32" height="25" rx="4" fill="#f5d883" stroke="#776d48" stroke-width="2"/><path d="M0-24V0" stroke="#a78f54"/></g>`;
  t=t||{};
  if(kind==='shoot'){const left=t.light==='left',x=left?75:385,bend=done?(left?160:300):230;return wrap(`<path d="M199 155H261L252 200H208Z" fill="#d0ac7c" stroke="#8b815e"/><path d="M230 157Q230 102 ${bend} 70" stroke="#6d9363" stroke-width="8" fill="none"/><ellipse cx="${bend-15}" cy="83" rx="24" ry="10" fill="#9bb77c"/><circle cx="${x}" cy="55" r="23" fill="#efd67c"/><path d="M${x} 87V149" stroke="#8a967b" stroke-width="5"/>${txt(230,25,'Same water and soil · direction of light changes')}${txt(230,218,'Growth takes time · 生长需要时间')}`);}
  if(kind==='ramp'){const start=t.length===2?225:70,end=385,cy=done?80:175,cx=done?end:start;return wrap(`<path d="M${start} 180L385 85V180Z" fill="#e2d8b6" stroke="#7c8661" stroke-width="3"/>${box(cx,cy)}${txt(225,210,`Ramp ${t.length||'?'} m · height 1 m`)}${done?arrow(cx-65,cy+10,cx-25,cy-5):''}${txt(125,48,t.force?`Force: ${t.force} units`:'Choose a ramp')}`);}
  if(kind==='lever'){const x=t.arm===1?165:75;return wrap(`<path d="M230 130L207 174H253Z" fill="#9dab83"/><path d="M45 120H395" stroke="#927e56" stroke-width="12" stroke-linecap="round"/>${box(320,113)}${arrow(x,48,x,103)}${txt(230,199,'FULCRUM · 支点')}${txt(120,30,t.force?`Push: ${t.force} units`:'Choose a push point')}`);}
  if(kind==='wheel'){return wrap(`<path d="M40 174H420" stroke="#9ca88d" stroke-width="3"/><g transform="translate(${done?305:125} 145)">${box(0,0)}${t.force===2?'<circle cx="-13" cy="18" r="10" fill="#618970"/><circle cx="13" cy="18" r="10" fill="#618970"/>':''}</g>${arrow(195,110,245,110)}${txt(230,38,t.force?`Steady pull: ${t.force} units`:'Select box or cart')}${txt(230,207,'Same load · same level track')}`);}
  if(kind==='gravity'||kind==='drop'){const supported=kind==='gravity'&&t.support,cy=done&&!supported?173:57;return wrap(`<path d="M45 192H415" stroke="#879f70" stroke-width="5"/>${supported?'<path d="M175 79H285" stroke="#99845c" stroke-width="9"/>':''}<circle cx="230" cy="${cy}" r="${t.mass===3?19:13}" fill="#e7be60" stroke="#8f744b" stroke-width="2"/>${arrow(276,82,276,151)}${txt(330,117,'gravity')}${txt(230,28,kind==='drop'?'1 m · no air resistance':'Support and gravity')}`);}
  if(kind==='globe'){const right=t.side==='right';return wrap(`<circle cx="230" cy="120" r="67" fill="#bbdcd4" stroke="#6d9d87" stroke-width="3"/><path d="M181 99Q220 60 240 110T275 153" fill="none" stroke="#8bb586" stroke-width="22"/><circle cx="230" cy="120" r="4" fill="#365744"/><circle cx="${right?323:230}" cy="${right?120:28}" r="9" fill="#d9ac51"/>${right?arrow(310,120,250,120):arrow(230,42,230,101)}${txt(230,211,'Toward Earth’s center')}`);}
  if(kind==='toss'){const cy=[125,45,125][t.phase??0],cx=[130,230,330][t.phase??0];return wrap(`<path d="M95 180Q230-90 365 180" fill="none" stroke="#a6bda0" stroke-width="3" stroke-dasharray="5 7"/><circle cx="${cx}" cy="${cy}" r="13" fill="#edc96c"/>${arrow(cx+28,cy-12,cx+28,cy+45)}${txt(230,211,'Gravity points down at every moment')}`);}
  const magnet=(x,y,left='S',right='N')=>`<g transform="translate(${x} ${y})"><rect width="68" height="34" rx="5" fill="${left==='S'?'#be6e5f':'#6a9fa1'}"/><path d="M34 0H63Q68 0 68 5V29Q68 34 63 34H34Z" fill="${right==='S'?'#be6e5f':'#6a9fa1'}"/><text x="17" y="23" fill="white" text-anchor="middle" font-size="17">${left}</text><text x="51" y="23" fill="white" text-anchor="middle" font-size="17">${right}</text></g>`;
  if(kind==='poles'){const x=done?(t.pole==='S'?210:340):285;return wrap(`${magnet(100,90)}${magnet(x,90,t.pole||'?',t.pole==='S'?'N':'S')}${done?arrow(250,149,t.pole==='S'?195:330,149):''}${txt(230,40,'Compare the facing poles')}${txt(230,205,t.pole?`N faces ${t.pole}`:'Turn the right magnet')}`);}
  if(['materials','gap','magtest'].includes(kind)){const x=done&&t.attract?188:t.gap===4?383:290;return wrap(`${magnet(95,95)}${kind==='gap'&&t.gap===1?'<path d="M210 62V166" stroke="#c9bc8a" stroke-width="7"/>':''}${kind==='magtest'?`<path d="M180 130H${180+(t.value||1)*45}" stroke="#a78f54" stroke-width="3"/>${txt(275,160,`${t.value||'?'} cm`)}`:`<rect x="${x}" y="97" width="25" height="28" rx="4" fill="#c4bda3" stroke="#827e69"/>`}${txt(230,37,t.en||'Select a material')}${txt(230,204,'Classroom model · 教学模型')}`);}
  if(kind==='sound'){const hz=t.hz||0,amp=t.gain?Math.round(t.gain*360):0;let d='M35 110';for(let x=35;x<=425;x+=3)d+=`L${x} ${110+amp*Math.sin((x-35)*(hz===440?.105:hz===220?.052:.08))}`;return wrap(`<path d="M35 110H425" stroke="#d2dcc6"/><path class="lab-wave" d="${d}" fill="none" stroke="#648d73" stroke-width="4"/>${txt(230,40,hz?`${hz} vibrations / second`:'Source stopped')}${txt(230,194,'Wave drawing is slowed · 振动示意已放慢')}`);}
  return wrap(txt(230,110,'Choose a setting · 选择设置'));
 }
 function records(s,a){return `<section class="lab-records"><p class="eyebrow">YOUR TEST RECORDS · 试验记录</p>${(a.order||a.seen||[]).map(id=>{const t=s.trials.find(t=>t.id===id);return t?`<p><strong>${esc(t.en)}</strong><br>${esc(t.result)}<small>${esc(t.resultzh)}</small></p>`:''}).join('')||'<p>No completed trial yet. <small>还没有完成的试验。</small></p>'}</section>`;}
 function html(s,a){const last=s.trials.find(t=>t.id===a.order?.at(-1));return `<section class="forces-lab"><p class="eyebrow">SIMPLIFIED TEACHING MODEL · 简化教学模型</p><div class="lab-stage">${svg(s.kind,last,!!last)}</div><div class="lab-controls">${s.trials.map(t=>`<button class="secondary" data-lab="${t.id}">${a.seen?.includes(t.id)?'✓ ':''}${esc(t.en)}<small>${esc(t.zh)} · Test 测试</small></button>`).join('')}</div><p class="lab-status" role="status" aria-live="polite">${s.kind==='sound'?'Tap a setting to play. Keep device volume comfortable. · 点击试听，保持舒适音量。':'Tap a setting, watch, then compare the records. · 点击设置，观察并比较记录。'}</p>${s.kind==='sound'?'<button class="text-button" data-visual>Use the visual model without sound · 无声观察模型</button>':''}${records(s,a)}<div class="button-row">${(a.seen||[]).map(id=>`<button class="text-button" data-lab-read="${id}">▷ Read result ${+id+1}<small>听结果</small></button>`).join('')}</div></section>`;}
 function bind(host,s,a,record,read){
  let visual=false;const status=()=>host.querySelector('.lab-status');
  host.querySelector('[data-visual]')?.addEventListener('click',e=>{visual=!visual;e.currentTarget.textContent=visual?'Visual mode on · 无声观察已开启':'Use the visual model without sound · 无声观察模型';});
  host.querySelectorAll('[data-lab-read]').forEach(b=>b.onclick=()=>{stop();read(b.dataset.labRead);});
  host.querySelectorAll('[data-lab]').forEach(b=>b.onclick=async()=>{
   stopAudio();stop();const token=serial,t=s.trials.find(t=>t.id===b.dataset.lab);
   const buttons=[...host.querySelectorAll('button:not([id$="Close"])')];buttons.forEach(b=>b.disabled=true);
   status().textContent='Testing… · 正在测试';host.querySelector('.lab-stage').innerHTML=svg(s.kind,t,false);
   let heard=true;
   if(s.kind==='sound'&&!visual){try{heard=await tone(t.hz,t.gain);}catch{heard=false;}}
   if(token!==serial)return;
   if(!heard){buttons.forEach(b=>b.disabled=false);status().textContent='Sound could not start. Retry or choose the visual model. 声音未能启动，可重试或选择无声模型。';return;}
   host.querySelector('.lab-stage').classList.add('testing');
   timer=setTimeout(()=>{if(token!==serial||!host.open)return;host.querySelector('.lab-stage').innerHTML=svg(s.kind,t,true);record(t.id);},s.kind==='sound'?1100:window.matchMedia('(prefers-reduced-motion: reduce)').matches?50:800);
  });
 }
 return {html,bind,records,svg,stop};
})();
