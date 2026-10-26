'use strict';
window.Motion = (() => {
 const {missions,tiers}=window.CH6;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const img=(art,alt='',cls='')=>`<img class="motion-art ${cls}" src="assets/motion/${esc(art)}.svg" alt="${esc(alt)}" draggable="false">`;
 const bilingual=(en,zh)=>`${esc(en)}<small>${esc(zh)}</small>`;
 let chapter=6,active=0,focused=null,lastProfile=state.active;
 const data=()=>profile().motion;
 const draft=()=>data().drafts[missions[active].id];
 const answer=()=>{const d=draft();return d.answers[d.step]||(d.answers[d.step]={});};
 const mission=()=>missions[active];
 const task=()=>mission().steps[draft().step];
 const persist=()=>save();
 const dirty=()=>{answer().checked=false;persist();};
 const dialog=document.createElement('dialog');dialog.id='motionDialog';dialog.className='motion-dialog';document.body.append(dialog);
 dialog.addEventListener('close',()=>{cancelModel();stopAudio();focused=null;});
 
 document.querySelector('#mapView').insertAdjacentHTML('beforeend','<div id="motionMap" hidden></div>');

 function render(){
  if(lastProfile!==state.active){lastProfile=state.active;chapter=profile().completed.length===6?2:1;}
  const n=data().completed.length;
  const next=missions[Math.min(n,19)],resume=data().drafts[next.id];
  $('#motionMap').innerHTML=`<div class="cove-hero"><div class="cove-intro"><p class="eyebrow">CHAPTER 06 · PHYSICAL SCIENCE</p><h2>Welcome to Motion Harbor.<small>欢迎来到运动港湾</small></h2><p>Place, measure, test, and deliver.<br>Build a story you can explain.</p><p class="zh">摆放、测量和试验，把科学样本安全送到研究站。</p><button class="primary" id="motionContinue">${n===20?'Revisit the exhibition':resume?'Continue my discovery':'Begin the expedition'} <small>${n===20?'重温展览':resume?'继续我的发现':'开始运动探险'}</small> ↗</button></div><div class="cove-scene" aria-label="运动港湾示意图"><svg viewBox="0 0 480 265" aria-hidden="true"><path d="M12 204Q45 60 165 78Q213 10 323 75Q446 67 470 183Q416 279 265 243Q81 282 20 204Z" fill="#b7cf95"/><path d="M295 109Q424 68 435 157T307 215Q256 162 295 109Z" fill="#93c9c1"/><path d="M80 202Q98 115 187 146T287 137" fill="none" stroke="#f7e6b1" stroke-width="18" stroke-linecap="round"/><path d="M80 202Q98 115 187 146T287 137" fill="none" stroke="#af9b6b" stroke-width="2" stroke-dasharray="2 8"/><g fill="#69916a"><path d="m105 122 29-75 29 75Z"/><path d="m201 101 26-68 26 68Z"/><path d="m362 80 19-58 19 58Z"/></g><path d="M60 224H130V188L95 162 60 188Z" fill="#f8edcf" stroke="#897953" stroke-width="3"/><path d="m53 188 42-34 42 34" fill="none" stroke="#897953" stroke-width="7"/></svg>${img('cart','Cart','cove-rabbit')}${img('flag','Flag','cove-butterfly')}${img('ruler','Ruler','cove-frog')}<span class="cove-caption">MOTION FIELD STATION · 运动研究站</span></div><div class="cove-progress"><b>${n}<span>/20</span></b><small>discoveries<br>研究发现</small><div><i style="width:${n/20*100}%"></i></div></div></div>
  <div class="spiral-heading"><div><p class="eyebrow">A LITTLE DEEPER, EACH TIME</p><h3>Your research trail <small>每次重访，多想一步</small></h3></div><span>Observe → Compare → Transfer → Explain<br><small>观察 → 比较 → 迁移 → 综合解释</small></span></div>
  <div class="research-trail">${tiers.map((t,k)=>`<section class="trail-tier"><div class="tier-caption"><span class="tier-number">${k+1}</span><div><h3>${esc(t.en)}</h3><p>${esc(t.zh)} · ${t.range}</p></div></div><div class="mission-grid">${missions.slice(k*4,k*4+4).map((m,j)=>{const i=k*4+j,done=i<n,locked=i>n,d=data().drafts[m.id];return `<button class="mission-tile ${done?'done':locked?'locked':'ready'}" data-motion="${i}" ${locked?'disabled':''}><span class="mission-number">${String(i+1).padStart(2,'0')} <em>${done?'✓':locked?'○':'↗'}</em></span>${img(m.art,'')}<strong>${esc(m.en)}</strong><small>${esc(m.zh)}</small><span class="mission-status">${done?'Recorded · 已记录':locked?'Follow the trail · 顺序解锁':d?'In progress · 可继续':'Ready to explore · 可以探索'}</span><span class="mission-skill">${esc(m.skill)}</span></button>`}).join('')}</div></section>`).join('')}</div>`;
  $('#motionContinue').onclick=()=>n===20?showWork(19):open(n);
  $$('[data-motion]').forEach(b=>b.onclick=()=>open(+b.dataset.motion));
  $('#baseView').insertAdjacentHTML('beforeend',shelf('base'));
  $('#journalView').insertAdjacentHTML('beforeend',shelf('journal'));
  $$('[data-motion-work]').forEach(b=>b.onclick=()=>showWork(+b.dataset.motionWork));
  $$('[data-motion-go]').forEach(b=>b.onclick=()=>{window.Animals.selectChapter(6);render();open(Math.min(n,19));});
  // Rendering chapter selection alone must not duplicate the appended research shelves.
  for(const id of ['baseView','journalView']){const nodes=$$('#'+id+' .motion-shelf');nodes.slice(0,-1).forEach(n=>n.remove());}
 }
 function shelf(where){
  const done=data().completed;
  return `<section class="motion-shelf"><div class="section-heading"><p class="eyebrow">MOTION HARBOR RESEARCH STATION</p><h2>${where==='base'?'A home for your findings':'Your motion field notes'}<small class="title-zh">${where==='base'?'你的研究成果在这里安家':'运动研究手册'}</small></h2><p>Return to your evidence, timelines, and exhibition.<br>回看分类依据、试验记录与展览；研究功能随学习开放。</p></div>${done.length?`<div class="work-grid">${done.map(i=>`<button class="work-tile" data-motion-work="${i}">${img(missions[i].art,'')}<span><strong>${esc(missions[i].artifact)}</strong><small>${esc(missions[i].artifactzh)} · ${data().shared.includes(i)?'✓ Shared 已交流':'Saved 已保存'}</small></span><b>↗</b></button>`).join('')}</div>`:'<div class="empty-research"><p>Your first rock record starts with a clue.<small>完成运动港湾关卡，这里就会留下你的研究作品。</small></p></div>'}<button class="secondary" data-motion-go>Continue motion research <small>继续运动研究</small> ↗</button></section>`;
 }
 function open(i){
  if(!Number.isInteger(i)||i<0||i>=20||i>data().completed.length)return;
  active=i;focused=null;stopAudio();
  if(!data().drafts[mission().id])data().drafts[mission().id]={step:0,answers:{}};
  persist();draw();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 }
 function shuffleIndices(length){let arr=Array.from({length},(_,i)=>i);let seed=(active+7)*97+draft().step*31;for(let i=arr.length-1;i>0;i--){seed=(seed*16807)%2147483647;let j=seed%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}if(length>1&&arr.every((v,i)=>v===i))[arr[0],arr[1]]=[arr[1],arr[0]];return arr;}
 function translated(en,zh,open=false){return `<p>${esc(en)}</p><details class="translation" ${open?'open':''}><summary>中文提示</summary><p>${esc(zh)}</p></details>`;}
 function chrome(content){
  const m=mission(),d=draft();
  if(narration.parentElement===dialog)document.body.append(narration);
  dialog.innerHTML=`<div class="lesson-header"><div><p class="eyebrow">MOTION HARBOR · ${String(active+1).padStart(2,'0')} / 20 · LEVEL ${m.tier}</p><h2>${esc(m.en)}<small class="title-zh">${esc(m.zh)}</small></h2></div><button class="icon-btn" id="motionClose" aria-label="Close and save / 关闭并保存">✕</button></div>${content}`;
  if(!narration.hidden)mountNarration();
  $('#motionClose').onclick=()=>{persist();dialog.close();};
 }
 function draw(){
  cancelModel();
  const m=mission(),d=draft(),s=task(),a=answer(),early=m.tier===1&&profile().mode==='guided';
  chrome(`<div class="motion-body"><div class="mission-steps" aria-label="Task progress">${m.steps.map((x,i)=>`<span class="${i===d.step?'current':i<d.step?'past':''}">${i<d.step?'✓':i+1} ${i===d.step?esc(x.type==='sentence'?'Explain':x.type==='camo'?'Investigate':'Explore'):''}</span>`).join('')}<small>Step ${d.step+1}/${m.steps.length} · 进度已保存</small></div>
  ${d.step===0?`<div class="field-brief">${img(m.art,'')}<div>${translated(m.intro,m.introzh,early)}</div><button class="listen" id="motionIntro">▷ Intro <small>听任务</small></button></div>`:''}
  ${s.recall?`<div class="recall-ribbon">↺ ${esc(s.recall)}</div>`:''}
  <div class="motion-task-title"><div><h3>${esc(s.en)}</h3><details class="translation" ${early?'open':''}><summary>中文提示</summary><p>${esc(s.zh)}</p></details></div><div class="listen-actions"><button class="listen" id="motionListen">▷ Listen <small>听题目与选项</small></button><button class="text-button" id="motionSlow">▷ Slower <small>慢速重听</small></button></div></div>
  <div id="motionActivity">${s.illustration?`<div class="reference-model">${img(s.illustration,'Labeled skeleton model')}<p>REFERENCE MODEL · 参照模型<br>Head → chest → limbs · 头部→胸部→肢体</p></div>`:''}${s.record?`<div class="evidence-record">${esc(s.record)}${!s.recordAudio?'<button class="text-button" id="motionSourceReplay">▷ Listen to the record · 重听背景记录</button>':''}${s.recordAudio?'<button class="text-button" id="motionRecordListen">▷ Listen to the evidence · 听背景记录</button>':''}</div>`:''}${activity(s,a)}</div>
  ${s.items?.some(it=>it.clue)?`<div class="evidence-audio"><p>Listen to a record <small>听证据卡</small></p>${s.items.filter(it=>it.clue).map(it=>`<button class="secondary" data-evidence-audio="${esc(it.id)}">▷ ${esc(it.en)}<small>${esc(it.zh)}</small></button>`).join('')}</div>`:''}<div class="support-row"><button id="motionHint" class="text-button">◇ Show a clue <small>查看线索</small></button><span>${esc(m.skill)} · ${esc(m.skillzh)}</span></div><div id="motionClue" class="hint-panel" ${a.hint?'':'hidden'}>${esc(s.hint)}</div>
  <p id="motionFeedback" role="status" aria-live="polite" class="feedback">${a.checked?'✓ Step complete. Choose Next step below. 这一步已完成，请点下方“下一步”。':''}</p>
  <div class="lesson-bottom"><div><span class="source-note">G2 · Chapter 6 · pp. ${esc(m.page)} · Original companion activity</span><div class="small-actions">${d.step?'<button id="motionBack" class="text-button">← Back · 上一步</button>':''}<button id="motionReset" class="text-button">Reset this step · 重做这一步</button></div></div><button class="primary" id="motionCheck">${a.checked?(d.step===m.steps.length-1?'Save my finding · 保存发现 ✦':'Next step · 下一步 ↗'):'Check my work · 检查结果'}</button></div></div>`);
  $('#motionIntro')?.addEventListener('click',()=>speak(m.id+'-intro'));
  $('#motionListen').onclick=()=>speak(m.id+'-step'+d.step);
  $('#motionSourceReplay')?.addEventListener('click',()=>speak(m.id+'-intro'));
  $('#motionSlow').onclick=()=>speak(m.id+'-step'+d.step,.85);
  $('#motionRecordListen')?.addEventListener('click',()=>speak(m.id+'-record'+d.step));
  dialog.querySelectorAll('[data-evidence-audio]').forEach(b=>b.onclick=()=>speak(m.id+'-clue'+d.step+'-'+b.dataset.evidenceAudio));
  $('#motionHint').onclick=()=>{a.hint=true;persist();$('#motionClue').hidden=false;};
  $('#motionReset').onclick=()=>{stopAudio();d.answers[d.step]={};focused=null;persist();draw();};
  $('#motionBack')?.addEventListener('click',()=>{stopAudio();d.step--;focused=null;persist();draw();dialog.scrollTop=0;});
  $('#motionCheck').onclick=check;
  bindActivity(s,a);
 }
 function activity(s,a){
  if(['place','measure','run'].includes(s.type))return modelHTML(s,a);
  if(s.type==='imprint'){const pressed=(a.seen||[]).includes('press'),lifted=(a.seen||[]).includes('lift');return `<div class="imprint-model"><p>MODEL · 印痕模型</p><div class="clay-surface ${pressed?'pressed':''}">${img(lifted?'shell-print':'shell',lifted?'Shell impression':'Shell above clay')}</div><p>${lifted?'A shape remains in the clay. · 软泥留下形状。':pressed?'The shell is pressed into the clay. · 贝壳已压入软泥。':'Soft clay is ready. · 软泥已准备好。'}</p><div class="button-row"><button class="secondary" data-print="press" ${pressed?'disabled':''}>1 · Press shell <small>按压贝壳</small></button><button class="secondary" data-print="lift" ${!pressed||lifted?'disabled':''}>2 · Lift shell <small>拿开贝壳</small></button></div></div>`;}
  if(s.type==='survey')return `<p class="interaction-help">Inspect every record before explaining. <small>先查看每份记录，再作解释；已查看 ${(a.seen||[]).length}/${s.items.length}。</small></p><div class="field-records">${s.items.map(it=>`<section>${img(it.art,it.en)}<button class="secondary" data-inspect="${it.id}">${(a.seen||[]).includes(it.id)?'✓ ':''}${esc(it.en)}<small>${esc(it.zh)}</small></button>${(a.seen||[]).includes(it.id)?translated(it.clue,it.cluezh,true):'<p>Tap to inspect · 点击调查</p>'}</section>`).join('')}</div>`;

  if(s.type==='lab')return `<p class="interaction-help">EXAMPLE MODEL · 示例模型，不是真实计时实验<br><small>Equal soil volume · Matching cups · 100 mL added · Read at 1 minute<br>相同土量与杯子 · 加水100毫升 · 1分钟后读数</small></p><div class="soil-lab">${s.items.map(it=>`<section><h4>Sample ${it.id}<small>土样 ${it.id}</small></h4>${img('lab','Soil column model')}<div class="water-gauge"><i style="height:${(a.seen||[]).includes(it.id)?it.value:0}%"></i></div><p>${(a.seen||[]).includes(it.id)?it.value+' mL collected · 流出水量':'No reading yet · 等待读数'}</p><button class="secondary" data-run-sample="${it.id}">${(a.seen||[]).includes(it.id)?'Replay model · 重看模型':'Run model · 运行模型'}</button></section>`).join('')}</div>`;
  if(s.type==='sort')return `<p class="interaction-help">① Select a sample or record. ② Tap its group.<small>先选卡片，再点分组；可随时重新放置。</small></p><div class="sorting-layout"><div class="specimen-grid">${s.items.map(it=>`<article class="specimen ${focused===it.id?'selected':''}"><button class="specimen-pick" data-pick="${it.id}" aria-pressed="${focused===it.id}">${img(it.art,'')}<strong>${esc(it.en)}</strong><small>${esc(it.zh)}</small><span class="assigned">${a.placed?.[it.id]?esc(s.groups.find(g=>g.id===a.placed[it.id]).en):'Choose a group · 待分组'}</span></button><button data-clue="${it.id}" class="clue-button" aria-expanded="${(a.opened||[]).includes(it.id)}">${(a.seen||[]).includes(it.id)?'✓':'⌕'} Sample / record clue <small>查看线索</small></button>${focused===it.id?`<div class="quick-bins">${s.groups.map(g=>`<button data-quick-bin="${g.id}">${esc(g.en)}<small>${esc(g.zh)}</small></button>`).join('')}</div>`:''}${(a.opened||[]).includes(it.id)?`<div class="specimen-clue">${translated(it.clue,it.cluezh)}</div>`:''}</article>`).join('')}</div><div class="sorting-bins" aria-label="Groups">${s.groups.map(g=>`<button class="sorting-bin" data-bin="${g.id}"><strong>${esc(g.en)}</strong><small>${esc(g.zh)}</small><span>${s.items.filter(it=>a.placed?.[it.id]===g.id).map(it=>esc(it.en)).join(' · ')||'Tap to place · 点此放置'}</span></button>`).join('')}</div></div>`;
  if(s.type==='order')return `<p class="interaction-help">Tap the cards in order. Tap a placed card to remove it.<small>依次点卡片；点已放入的卡片可以撤回。</small></p><div class="order-bank">${shuffleIndices(s.items.length).map(i=>{const it=s.items[i];return `<button data-order="${it.id}" class="order-card" ${(a.order||[]).includes(it.id)?'disabled':''}>${img(it.art,'')}<strong>${esc(it.en)}</strong><small>${esc(it.zh)}</small><span>${esc(it.clue)}</span></button>`}).join('')}</div><div class="timeline">${s.items.map((_,i)=>{const it=s.items.find(x=>x.id===(a.order||[])[i]);return `<button data-unsort="${i}" class="timeline-slot" ${it?'':'disabled'}><b>${i+1}</b>${it?`${img(it.art,'')}<span>${esc(it.en)}</span>`:'<span>Place a stage<br><small>放入阶段</small></span>'}</button>`}).join('')}</div>`;
  if(s.type==='choice'||s.type==='multi'||s.type==='compare')return `${s.art?`<div class="evidence-art">${img(s.art,s.art)}<p>Observation card · 观察卡${s.art==='penguin'?'<br>Record: this penguin can swim.<br><small>记录：这只企鹅会游泳。</small>':''}</p></div>`:''}${s.type==='compare'?`<div class="compare-board"><p>Model · same drawing scale · 示意模型，同绘图比例</p>${s.items.map((it,i)=>`<div>${img(it.art,it.en,i===0?'scale-cub':'scale-adult')}<strong>${esc(it.en)}</strong></div>`).join('')}</div>`:''}<p class="interaction-help">${s.type==='choice'?'Choose one explanation. <small>选择一个解释</small>':`Choose ${s.min} statements. <small>选择 ${s.min} 条说法</small>`}</p><div class="motion-options">${s.options.map((o,i)=>`<button data-option="${i}" class="choice ${(a.selected||[]).includes(i)?'selected':''}" aria-pressed="${(a.selected||[]).includes(i)}"><span class="option-marker">${(a.selected||[]).includes(i)?'✓':String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div>`;
  if(s.type==='sentence')return `<div class="sentence-scene">${img(mission().art,'')}<p>Turn your evidence into a sentence.<small>把证据组织成一句解释。</small></p></div><div class="sentence-result" aria-label="Your sentence">${(a.tokens||[]).length?(a.tokens||[]).map((idx,i)=>`<button class="sentence-piece" data-untoken="${i}">${esc(s.parts[idx])} <small>×</small></button>`).join(''):'<span>Tap phrases below to build your explanation.<small>点选下方短语，组成解释。</small></span>'}</div><div class="phrase-bank">${shuffleIndices(s.parts.length).map(i=>`<button class="chip" data-token="${i}" ${(a.tokens||[]).includes(i)?'disabled':''}>${esc(s.parts[i])}</button>`).join('')}</div><details class="translation"><summary>中文意思</summary><p>${esc(s.translation)}</p></details>`;
  if(s.type==='camo')return `<div class="prediction-box"><p><strong>My prediction · 我的预测</strong><br>Which background might make the green insect harder to notice?</p><div class="button-row">${[['green','Green · 绿色'],['brown','Brown · 棕色'],['unsure','Not sure · 不确定']].map(([v,t])=>`<button data-predict="${v}" class="secondary ${a.prediction===v?'selected':''}" aria-pressed="${a.prediction===v}" ${(a.views||[]).length?'disabled':''}>${t}</button>`).join('')}</div><small>Predictions are not scored. 预测不按对错扣分。</small></div><div class="camo-stage ${a.bg==='brown'?'brown':'green'} ${a.hint?'outlined':''}"><span class="model-label">PICTURE MODEL · 图像模型</span>${a.prediction?img('leaf-insect','Same green leaf insect, same size and position'):'<p>Make a prediction to begin.<br>先预测，再开始比较。</p>'}<span class="model-caption">Same insect · Same size · Same position<br>相同昆虫、大小与位置</span></div><div class="camo-controls">${[['green','Green background','绿色背景'],['brown','Brown background','棕色背景']].map(([v,en,zh])=>`<button class="secondary ${a.bg===v?'selected':''}" data-background="${v}" ${a.prediction?'':'disabled'}>${(a.views||[]).includes(v)?'✓ ':''}${bilingual(en,zh)}</button>`).join('')}</div><p class="zh">Look for differences in contrast. 查看线索可显示昆虫轮廓。已观察 ${(a.views||[]).length}/2 个背景。</p>`;
  if(s.type==='population')return `<div class="population-key">Two separate study areas. All rabbit cards show the same species.<small>两个分隔的研究区域；所有兔卡均标注为同一物种。</small></div><div class="population-map">${[['A',[0,1,2,3,4,5]],['B',[6,7]]].map(([area,ids])=>`<section><h4>Area ${area}<small>${area} 研究区</small></h4><div>${ids.map(i=>{const art=[0,2,4,6,7].includes(i)?'rabbit':i===5?'turtle':'bird';return `<button data-pop="${i}" class="population-motion ${(a.selected||[]).includes(i)?'selected':''}" aria-pressed="${(a.selected||[]).includes(i)}">${img(art,art)}<span>${art==='rabbit'?'Rabbit · 同种兔':art==='bird'?'Bird · 鸟':'Tortoise · 陆龟'}</span><b>${(a.selected||[]).includes(i)?'✓':'＋'}</b></button>`}).join('')}</div></section>`).join('')}</div>`;
  return '';
 }
 function bindActivity(s,a){
  bindModel(s,a);
  dialog.querySelectorAll('[data-print], [data-inspect]').forEach(b=>b.onclick=()=>{const id=b.dataset.print||b.dataset.inspect;if(id==='lift'&&!(a.seen||[]).includes('press'))return;a.seen=[...new Set([...(a.seen||[]),id])];dirty();draw();});
  dialog.querySelectorAll('[data-run-sample]').forEach(b=>b.onclick=()=>{a.seen=[...new Set([...(a.seen||[]),b.dataset.runSample])];dirty();draw();});
  dialog.querySelectorAll('[data-pick]').forEach(b=>b.onclick=()=>{focused=b.dataset.pick;draw();});
  dialog.querySelectorAll('[data-clue]').forEach(b=>b.onclick=()=>{const id=b.dataset.clue;a.seen=[...new Set([...(a.seen||[]),id])];a.opened=(a.opened||[]).includes(id)?a.opened.filter(x=>x!==id):[...(a.opened||[]),id];persist();draw();});
  dialog.querySelectorAll('[data-bin], [data-quick-bin]').forEach(b=>b.onclick=()=>{if(!focused)return feedbackLocal('First select a card. 先选择一张卡片。');a.placed={...(a.placed||{}),[focused]:(b.dataset.bin||b.dataset.quickBin)};focused=null;dirty();draw();});
  dialog.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>{a.order=[...(a.order||[]),b.dataset.order];dirty();draw();});
  dialog.querySelectorAll('[data-unsort]').forEach(b=>b.onclick=()=>{a.order.splice(+b.dataset.unsort,1);dirty();draw();});
  dialog.querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{const i=+b.dataset.option;a.selected=s.type==='choice'?[i]:(a.selected||[]).includes(i)?a.selected.filter(x=>x!==i):[...(a.selected||[]),i];dirty();draw();});
  dialog.querySelectorAll('[data-token]').forEach(b=>b.onclick=()=>{a.tokens=[...(a.tokens||[]),+b.dataset.token];dirty();draw();});
  dialog.querySelectorAll('[data-untoken]').forEach(b=>b.onclick=()=>{a.tokens.splice(+b.dataset.untoken,1);dirty();draw();});
  dialog.querySelectorAll('[data-predict]').forEach(b=>b.onclick=()=>{a.prediction=b.dataset.predict;dirty();draw();});
  dialog.querySelectorAll('[data-background]').forEach(b=>b.onclick=()=>{a.bg=b.dataset.background;a.views=[...new Set([...(a.views||[]),a.bg])];dirty();draw();});
  dialog.querySelectorAll('[data-pop]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pop;a.selected=(a.selected||[]).includes(i)?a.selected.filter(x=>x!==i):[...(a.selected||[]),i];dirty();draw();});
  if(s.type==='camo')$('#motionHint').onclick=()=>{a.hint=true;persist();draw();};
 }
 function evaluate(s,a,m=mission()){
  if(s.type==='place'){if(a.selected?.[0]!==s.target)return s.hint;}else if(s.type==='measure'){if(!(a.seen||[]).includes('measured'))return s.hint;}else if(s.type==='run'){if(s.required.some(i=>!(a.seen||[]).includes(String(i))))return s.hint;if(s.accepted&&!s.accepted.some(i=>(a.seen||[]).includes(String(i))))return 'Try a plan that stops in the 18–22 unit target zone. 请试验能停在18–22单位目标区的方案。';}else if(s.type==='imprint'||s.type==='survey'){if(s.items.some(it=>!(a.seen||[]).includes(it.id)))return s.hint;}else if(s.type==='lab'){if(s.items.some(it=>!(a.seen||[]).includes(it.id)))return s.hint;}else if(s.type==='sort'){
   if(s.items.some(it=>!a.placed?.[it.id]))return 'Place every card before checking. 请先给每张卡片分组。';
   const wrong=s.items.find(it=>a.placed[it.id]!==it.to);if(wrong)return `${wrong.en}: ${wrong.clue} ${wrong.cluezh}`;
  }else if(s.type==='order'){
   if(a.order?.length!==s.items.length)return 'Place every stage first. 请先排列所有阶段。';
   if(s.items.some((it,i)=>a.order[i]!==it.id))return s.hint;
  }else if(s.type==='choice'){
   if(!a.selected?.length)return 'Choose an explanation first. 请先选择一个解释。';
   if(a.selected.length!==1||a.selected[0]!==s.answer)return s.hint;
  }else if(s.type==='multi'||s.type==='compare'){
   if(a.selected?.length!==s.min)return `Choose exactly ${s.min} statements. 请选 ${s.min} 条说法。`;
   if(a.selected.some(i=>!s.answers.includes(i)))return s.hint;
  }else if(s.type==='sentence'){
   if(a.tokens?.length!==s.parts.length)return 'Use all the phrase blocks. 请用上所有短语块。';
   if(a.tokens.some((v,i)=>v!==i))return 'Listen to the meaning, then check the order. Start with the subject or “First”. 先找主语或 First，再检查顺序；可以查看线索。';
  }else if(s.type==='camo'){
   if(!a.prediction)return 'Make any prediction. “Not sure” is welcome. 先预测，也可以选“不确定”。';
   if(!['green','brown'].every(x=>(a.views||[]).includes(x)))return 'View both backgrounds before comparing. 比较前请查看两种背景。';
  }else if(s.type==='population'){
   if(!a.selected?.length)return 'Select motion on the map first. 请先在地图中选择动物。';
   if(a.selected.length!==3||![0,2,4].every(i=>a.selected.includes(i)))return s.hint;
  }
  return '';
 }
 function feedbackLocal(text,bad=true){$('#motionFeedback').textContent=text;$('#motionFeedback').classList.toggle('bad',bad);$('#motionFeedback').scrollIntoView({block:'nearest'});}
 function check(){
  const s=task(),a=answer(),d=draft(),m=mission(),error=evaluate(s,a);
  if(error){a.checked=false;persist();feedbackLocal(error);return;}
  if(d.step===m.steps.length-1){a.checked=true;persist();finish();speak(m.id+'-sentence');return;}
  if(!a.checked){a.checked=true;persist();$('#motionCheck').textContent='Next step · 下一步 ↗';feedbackLocal('✓ Your evidence fits. This step is complete — tap Next step below. 这一步答对了，请点下方“下一步”。',false);$('#motionCheck').focus({preventScroll:true});return;}
  if(d.step<m.steps.length-1){stopAudio();d.step++;focused=null;persist();draw();dialog.scrollTop=0;return;}
  finish();
 }
 function finish(){
  const m=mission(),d=draft();
  for(let i=0;i<m.steps.length;i++)if(evaluate(m.steps[i],d.answers[i]||{},m)){d.step=i;persist();draw();feedbackLocal('Complete this part before saving the finding. 保存发现前请完成这一部分。');return;}
  const first=!data().completed.includes(active);
  if(first){if(active!==data().completed.length)return;data().completed.push(active);}
  data().works[m.id]=JSON.parse(JSON.stringify(d));delete data().drafts[m.id];persist();window.render();
  showWork(active,first);dialog.scrollTop=0;
 }
 function recordHTML(m,d){
  if(!d)return '<p>This record is not available. Revisit the mission to create it.<br>此记录尚不可用，重温任务即可创建。</p>';
  return m.steps.map((s,i)=>{const a=d.answers[i]||{};let body='';
   if(s.type==='place')body=`<p>Completed placement · 已完成摆放<br>${esc(m.steps.at(-1).parts.join(' '))}</p>`;
   else if(s.type==='measure')body='<p>Zero aligned to START · Route A: 6 model units · Route B: 9 model units<br>零点对齐起点，A长6模型单位，B长9模型单位。</p>';
   else if(s.type==='run')body=`<table class="motion-record"><thead><tr><th>Trial 试验</th><th>Distance 路程</th><th>Model time 模型用时</th></tr></thead><tbody>${(a.seen||[]).map(id=>{const t=s.trials[+id];return `<tr><td>${esc(t.en)}</td><td>${t.distance} units</td><td>${t.time} s</td></tr>`}).join('')}</tbody></table>`;
   else if(s.type==='imprint')body=`${img('shell-print','Model impression')}<p>Model impression · 今天制作的印痕模型，不是古代化石。</p>`;
   else if(s.type==='survey')body=s.items.map(it=>`<p><strong>${esc(it.en)}</strong><br>${esc(it.clue)}<br><small>${esc(it.cluezh)}</small></p>`).join('');
   else if(s.type==='lab')body='<p>Example model · Equal conditions · 100 mL added · 1 minute<br>Sample A: 60 mL · Sample B: 35 mL · Sample C: 10 mL<br><small>示例模型，相同条件；下方收集水量记录。</small></p>';
   else if(s.type==='sort')body=`<div class="saved-sort">${s.groups.map(g=>`<div><strong>${esc(g.en)}</strong>${s.items.filter(it=>a.placed?.[it.id]===g.id).map(it=>`<span>${img(it.art,'')}${esc(it.en)}</span>`).join('')}</div>`).join('')}</div>`;
   else if(s.type==='order')body=`<div class="saved-timeline">${(a.order||[]).map(id=>{const it=s.items.find(x=>x.id===id);return it?`<div>${img(it.art,'')}<strong>${esc(it.en)}</strong><small>${esc(it.clue)}</small></div>`:''}).join('<b>→</b>')}</div>`;
   else if(s.type==='sentence')body=`<blockquote>${s.parts.map(esc).join(' ')}<small>${esc(s.translation)}</small></blockquote>`;
   else if(s.type==='camo')body=`<p>Prediction: ${esc(a.prediction)} · Viewed: ${(a.views||[]).map(esc).join(' + ')}<br><small>预测保留；比较时昆虫大小与位置不变。</small></p><div class="mini-camo"><div class="green">${img('leaf-insect','Green background')}</div><div class="brown">${img('leaf-insect','Brown background')}</div></div>`;
   else if(s.type==='population')body='<p>Area A · 3 rabbits of the same species<br><small>A 区：3 只同种兔</small></p>';
   else body=`<ul>${(a.selected||[]).map(idx=>`<li>${esc(s.options[idx])}</li>`).join('')}</ul>`;
   return `<section class="saved-evidence"><p class="eyebrow">${i+1} · ${esc(s.type==='sentence'?'MY EXPLANATION':'MY EVIDENCE')}</p>${body}</section>`;
  }).join('');
 }
 function showWork(i,first=false){
  if(!data().completed.includes(i))return;
  active=i;stopAudio();const m=mission(),d=data().works[m.id];
  chrome(`<div class="motion-body"><div class="finding-header">${img(m.art,'')}<div><p class="eyebrow">${first?'NEW FINDING · +30 POINTS':'SAVED FIELD RECORD'}</p><h3>${esc(m.artifact)}<small class="title-zh">${esc(m.artifactzh)}</small></h3><p>✓ Do · 操作完成　✓ Explain · 解释完成</p></div></div>${translated(m.fact,m.factzh)}<button class="listen" id="motionFact">▷ Listen to the science <small>听科学解释</small></button>${recordHTML(m,d)}<div class="share-card"><p class="eyebrow">TALK TOGETHER · OPTIONAL</p><p>${esc(m.share)}<small>${esc(m.sharezh)}</small></p><button class="secondary" id="motionShared" aria-pressed="${data().shared.includes(i)}">${data().shared.includes(i)?'✓ We shared our ideas · 已交流':'We shared our ideas · 标记已交流'}</button><small>Self check · 自评；无需录音，不影响通关。</small></div><div class="button-row"><button class="secondary" id="motionRevisit">Revisit & edit <small>重温并更新</small></button><button class="secondary" id="motionHome">My research base <small>研究基地</small></button>${i<19?'<button class="primary" id="motionNext">Next discovery <small>下一项发现</small> ↗</button>':'<button class="primary" id="motionEnd">Chapter complete <small>回到港湾</small> ✦</button>'}</div></div>`);
  $('#motionFact').onclick=()=>speak(m.id+'-fact');
  $('#motionShared').onclick=()=>{if(!data().shared.includes(i))data().shared.push(i);persist();window.render();showWork(i);};
  $('#motionRevisit').onclick=()=>{data().drafts[m.id]={step:0,answers:{}};persist();open(i);};
  $('#motionHome').onclick=()=>{dialog.close();switchTab('base');};
  $('#motionNext')?.addEventListener('click',()=>open(i+1));
  $('#motionEnd')?.addEventListener('click',()=>{dialog.close();window.Animals.selectChapter(6);render();});
  window.Learning?.addNext(dialog,6);
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 }

 let modelFrame=0,modelRunning=false,modelPaused=false,modelElapsed=0,modelLast=0;
 function cancelModel(){cancelAnimationFrame(modelFrame);modelFrame=0;modelRunning=false;modelPaused=false;}
 function modelHTML(s,a){
  if(s.type==='place')return `<p class="interaction-help">Fixed screen view · 固定画面视角<br><small>Tap a cell to place the sample. 点格子放置样本。</small></p><div class="position-grid">${Array.from({length:9},(_,i)=>`<button data-cell="${i}" ${(active===3?[3,5].includes(i):i===4)?'disabled':''} aria-pressed="${a.selected?.[0]===i}" aria-label="${active===3?['Top left','Top center','Top right','Tree reference','Between tree and station','Station reference','Bottom left','Bottom center','Bottom right'][i]:['Top left','Above tree','Top right','Left of tree','Tree reference','Right of tree','Bottom left','Below tree','Bottom right'][i]}">${active===3&&i===3?img('tree','Tree reference'):active===3&&i===5?img('station','Station reference'):active!==3&&i===4?img('tree','Tree reference'):(a.selected?.[0]===i?img('box','Sample parcel'):'＋')}<small>${active===3?['↖','Above 上方','↗','Tree 树','Between 中间','Station 研究站','↙','Below 下方','↘'][i]:['↖','Above 上方','↗','Left 左侧','Tree 参照树','Right 右侧','↙','Below 下方','↘'][i]}</small></button>`).join('')}</div>`;
  if(s.type==='measure')return `<p class="interaction-help">MODEL SCALE · 模型刻度，非屏幕实际厘米</p><svg class="ruler-model" viewBox="0 0 440 180" role="img" aria-label="Route A is 6 model units, route B is 9"><path d="M50 40h210M50 75h315" stroke="#8ba878" stroke-width="10"/><text x="10" y="43">A</text><text x="10" y="79">B</text><text x="30" y="20">START</text><path d="M50 25v135" stroke="#9d7d52" stroke-dasharray="4 4"/><g transform="translate(${a.selected?.[0]===1?15:a.selected?.[0]===2?85:50},110)"><rect width="350" height="45" rx="4" fill="#ecdfb9"/>${Array.from({length:11},(_,i)=>`<path d="M${i*35} 0v12" stroke="#576f50"/><text x="${i*35}" y="31" text-anchor="middle">${i}</text>`).join('')}</g></svg><div class="button-row">${s.options.map((o,i)=>`<button class="secondary ${a.selected?.[0]===i?'selected':''}" data-ruler="${i}">${esc(o)}</button>`).join('')}</div><button class="primary" id="motionMeasure">Measure · 读取长度</button><p id="measureReading" role="status">${(a.seen||[]).includes('measured')?'A = 6 units; B = 9 units · 模型单位':''}</p>`;
  const seen=a.seen||[],last=a.order?.at(-1),t=s.trials[+(last??0)],target=!!s.accepted;
  return `${active===8?'<p class="interaction-help">Worker at the left · 工人固定在左侧，比较箱子向远处和向工人移动。</p>':''}<p class="model-note">REPLAYABLE MODEL · 可重复模型 · Playback ×2<br><small>Model time is shown below. Your tapping speed does not affect results.<br>下方显示模型时间；点击速度不影响结果。运行结束后自动保存记录。</small></p><div class="trial-settings">${s.trials.map((it,i)=>`<button class="secondary ${a.selected?.[0]===i?'selected':''}" data-trial="${i}" aria-pressed="${a.selected?.[0]===i}">${seen.includes(String(i))?'✓ ':''}${esc(it.en)}<small>${esc(it.zh)}</small></button>`).join('')}</div><svg class="motion-stage" viewBox="0 0 400 190" role="img" aria-label="Cart motion relative to a fixed start flag"><path id="motionTrack" d="M25 130H365" fill="none" stroke="#c8ceac" stroke-width="12"/><path id="motionTarget" d="M25 130H365" fill="none" stroke="#b1c98b" stroke-width="22" opacity="${target?1:0}" stroke-dasharray="0 10000"/><path d="M25 130V65l34 14-34 14" fill="#dcc57f" stroke="#687b58" stroke-width="3"/><text x="12" y="157" font-size="12">FLAG 0</text><text x="270" y="177" font-size="11">30 route units 路线单位</text><g id="motionCart" transform="translate(25 130)"><rect x="-17" y="-24" width="34" height="19" rx="4" fill="#88a985" stroke="#47674e" stroke-width="2"/><path d="M-9-24v-12H9v12" fill="#d2b388" stroke="#47674e" stroke-width="2"/><circle cx="-10" cy="-3" r="5" fill="#4e6550"/><circle cx="10" cy="-3" r="5" fill="#4e6550"/></g></svg><p class="trial-reading" id="motionReading" role="status">Choose a setting, then Run. 选择方案，再点运行。${target?'<br>Target: 18–22 route units · 接收区18–22路线单位':''}</p><div class="button-row"><button class="primary" id="motionRun">Run / replay · 运行或重播</button><button class="secondary" id="motionPause" disabled>Pause · 暂停</button></div><div class="trial-log"><h4>Saved trial records <small>已保存试验记录 · ${seen.length}/${s.trials.length}</small></h4>${seen.length?`<table class="motion-record"><thead><tr><th>Trial 试验</th><th>Distance 路程</th><th>Time 用时</th></tr></thead><tbody>${seen.map(id=>{const it=s.trials[+id];return `<tr><td>${esc(it.en)}</td><td>${it.distance} units${it.mode==='rotate'?'<small>center / 中心</small>':''}</td><td>${it.time} s</td></tr>`}).join('')}</tbody></table>`:'<p>No completed trial yet. 还没有完成的试验。</p>'}</div>`;
 }
 function modelHeading(path,units){const len=path.getTotalLength(),v=len*Math.max(0,Math.min(30,units))/30;const p=path.getPointAtLength(Math.max(0,v-.1)),q=path.getPointAtLength(Math.min(len,v+.1));return Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI;}
 function bindModel(s,a){
  if(s.type==='place')dialog.querySelectorAll('[data-cell]').forEach(b=>b.onclick=()=>{a.selected=[+b.dataset.cell];dirty();draw();});
  if(s.type==='measure'){
   dialog.querySelectorAll('[data-ruler]').forEach(b=>b.onclick=()=>{a.selected=[+b.dataset.ruler];a.seen=[];dirty();draw();});
   $('#motionMeasure').onclick=()=>{if(a.selected?.[0]!==0){$('#measureReading').textContent='Align zero with START first. 先把零点对齐起点。';return;}a.seen=['measured'];dirty();draw();};
  }
  if(s.type!=='run')return;
  if(a.order?.length){
   const previous=s.trials[+a.order.at(-1)],path=$('#motionTrack'),turn=previous.mode==='turn';path.setAttribute('d',turn?'M25 130H175V45H365':'M25 130H365');const len=path.getTotalLength();
   const units=previous.mode==='return'||previous.mode==='rotate'?0:previous.mode==='left'?(previous.start??30)-previous.distance:(previous.start??0)+previous.distance;
   const pt=path.getPointAtLength(len*Math.min(30,Math.max(0,units))/30);$('#motionCart').setAttribute('transform',`translate(${pt.x} ${pt.y}) rotate(${modelHeading(path,units)})`);
   $('#motionTarget').setAttribute('d',path.getAttribute('d'));$('#motionTarget').setAttribute('stroke-dasharray',`0 ${len*.6} ${len*4/30} ${len}`);
   $('#motionReading').textContent=`Last completed · 上次完成: ${previous.en} · ${previous.distance} units / ${previous.time} model s`;
  }
  dialog.querySelectorAll('[data-trial]').forEach(b=>b.onclick=()=>{if(modelRunning)return;a.selected=[+b.dataset.trial];dirty();draw();});
  $('#motionRun').onclick=()=>{
   if(modelRunning)return;
   if(a.selected?.length!==1){$('#motionReading').textContent='Choose a setting first. 请先选方案。';return;}
   const idx=a.selected[0],it=s.trials[idx],path=$('#motionTrack'),cart=$('#motionCart'),reading=$('#motionReading');
   const turned=it.mode==='turn';path.setAttribute('d',turned?'M25 130H175V45H365':'M25 130H365');const len=path.getTotalLength();
   $('#motionTarget').setAttribute('d',path.getAttribute('d'));$('#motionTarget').setAttribute('stroke-dasharray',`0 ${len*.6} ${len*4/30} ${len}`);
   modelRunning=true;modelPaused=false;modelElapsed=0;modelLast=0;
   $('#motionRun').disabled=true;$('#motionPause').disabled=false;$('#motionCheck').disabled=true;dialog.querySelectorAll('[data-trial]').forEach(b=>b.disabled=true);
   const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
   function frame(now){
    if(!modelRunning||!dialog.open)return;
    if(modelLast&&!modelPaused)modelElapsed+=Math.min(now-modelLast,100);modelLast=now;
    const p=reduce?1:Math.min(1,modelElapsed/(it.time*500));
    const eased=it.mode==='accelerate'?p*p:it.mode==='decelerate'?2*p-p*p:p;
    let units=it.mode==='return'?(p<=.5?it.distance*p:it.distance*(1-p)):it.mode==='left'?(it.start??30)-it.distance*eased:(it.start??0)+it.distance*eased;
    const pt=path.getPointAtLength(len*Math.max(0,Math.min(30,units))/30);let angle=it.mode==='rotate'?p*360:modelHeading(path,units);
    cart.setAttribute('transform',`translate(${pt.x} ${pt.y}) rotate(${angle})`);
    reading.textContent=`${it.en} · Model time ${(it.time*p).toFixed(1)} s · Distance ${(it.distance*(it.mode==='return'?p:eased)).toFixed(1)} units${modelPaused?' · PAUSED 暂停':''}`;
    if(p<1){modelFrame=requestAnimationFrame(frame);return;}
    modelRunning=false;modelFrame=0;a.seen=[...new Set([...(a.seen||[]),String(idx)])];a.order=[...(a.order||[]).filter(x=>x!==String(idx)),String(idx)];dirty();draw();
    $('#motionReading').textContent=`✓ ${it.en}: ${it.distance} units in ${it.time} model s. Record saved · 记录已保存${s.accepted?(s.accepted.includes(idx)?' · Inside target ✓ 已进入接收区':' · Outside target 目标区外'):''}`;
   }
   modelFrame=requestAnimationFrame(frame);
  };
  $('#motionPause').onclick=()=>{modelPaused=!modelPaused;$('#motionPause').textContent=modelPaused?'Resume · 继续':'Pause · 暂停';};
 }

 return {render,open,showWork,evaluate,go:()=>{window.Animals.selectChapter(6);render();open(Math.min(data().completed.length,19));}};
})();
render();
