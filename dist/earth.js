'use strict';
window.Earth = (() => {
 const {missions,tiers}=window.CH3;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const img=(art,alt='',cls='')=>`<img class="earth-art ${cls}" src="assets/earth/${esc(art)}.svg" alt="${esc(alt)}" draggable="false">`;
 const bilingual=(en,zh)=>`${esc(en)}<small>${esc(zh)}</small>`;
 let chapter=3,active=0,focused=null,lastProfile=state.active;
 const data=()=>profile().earth;
 const draft=()=>data().drafts[missions[active].id];
 const answer=()=>{const d=draft();return d.answers[d.step]||(d.answers[d.step]={});};
 const mission=()=>missions[active];
 const task=()=>mission().steps[draft().step];
 const persist=()=>save();
 const dirty=()=>{answer().checked=false;persist();};
 const dialog=document.createElement('dialog');dialog.id='earthDialog';dialog.className='earth-dialog';document.body.append(dialog);
 dialog.addEventListener('close',()=>{stopAudio();focused=null;});
 
 document.querySelector('#mapView').insertAdjacentHTML('beforeend','<div id="earthMap" hidden></div>');

 function render(){
  if(lastProfile!==state.active){lastProfile=state.active;chapter=profile().completed.length===6?2:1;}
  const n=data().completed.length;
  const next=missions[Math.min(n,11)],resume=data().drafts[next.id];
  $('#earthMap').innerHTML=`<div class="cove-hero"><div class="cove-intro"><p class="eyebrow">CHAPTER 03 · EARTH SCIENCE</p><h2>Welcome to Rock Valley.<small>欢迎来到岩石山谷</small></h2><p>Read the rocks. Test the soil.<br>Build a story you can explain.</p><p class="zh">观察岩石，比较土壤，让每一次选择都有依据。</p><button class="primary" id="earthContinue">${n===12?'Revisit the exhibition':resume?'Continue my discovery':'Begin the expedition'} <small>${n===12?'重温展览':resume?'继续我的发现':'开始地球材料探险'}</small> ↗</button></div><div class="cove-scene" aria-label="岩石山谷示意图"><svg viewBox="0 0 480 265" aria-hidden="true"><path d="M12 204Q45 60 165 78Q213 10 323 75Q446 67 470 183Q416 279 265 243Q81 282 12 204Z" fill="#b7cf95"/><path d="M295 109Q424 68 435 157T307 215Q256 162 295 109Z" fill="#93c9c1"/><path d="M80 202Q98 115 187 146T287 137" fill="none" stroke="#f7e6b1" stroke-width="18" stroke-linecap="round"/><path d="M80 202Q98 115 187 146T287 137" fill="none" stroke="#af9b6b" stroke-width="2" stroke-dasharray="2 8"/><g fill="#69916a"><path d="m105 122 29-75 29 75Z"/><path d="m201 101 26-68 26 68Z"/><path d="m362 80 23-58 23 58Z"/></g><path d="M60 224H130V188L95 162 60 188Z" fill="#f8edcf" stroke="#897953" stroke-width="3"/><path d="m53 188 42-34 42 34" fill="none" stroke="#897953" stroke-width="7"/></svg>${img('rock-a','Rock sample','cove-rabbit')}${img('granite','Granite','cove-butterfly')}${img('lab','Soil test','cove-frog')}<span class="cove-caption">EARTH MATERIALS LAB · 地球材料研究站</span></div><div class="cove-progress"><b>${n}<span>/12</span></b><small>discoveries<br>研究发现</small><div><i style="width:${n/12*100}%"></i></div></div></div>
  <div class="spiral-heading"><div><p class="eyebrow">A LITTLE DEEPER, EACH TIME</p><h3>Your research trail <small>每次重访，多想一步</small></h3></div><span>Observe → Compare → Transfer → Explain<br><small>观察 → 比较 → 迁移 → 综合解释</small></span></div>
  <div class="research-trail">${tiers.map((t,k)=>`<section class="trail-tier"><div class="tier-caption"><span class="tier-number">${k+1}</span><div><h3>${esc(t.en)}</h3><p>${esc(t.zh)} · ${t.range}</p></div></div><div class="mission-grid">${missions.slice(k*3,k*3+3).map((m,j)=>{const i=k*3+j,done=i<n,locked=i>n,d=data().drafts[m.id];return `<button class="mission-tile ${done?'done':locked?'locked':'ready'}" data-earth="${i}" ${locked?'disabled':''}><span class="mission-number">${String(i+1).padStart(2,'0')} <em>${done?'✓':locked?'○':'↗'}</em></span>${img(m.art,'')}<strong>${esc(m.en)}</strong><small>${esc(m.zh)}</small><span class="mission-status">${done?'Recorded · 已记录':locked?'Follow the trail · 顺序解锁':d?'In progress · 可继续':'Ready to explore · 可以探索'}</span><span class="mission-skill">${esc(m.skill)}</span></button>`}).join('')}</div></section>`).join('')}</div>`;
  $('#earthContinue').onclick=()=>n===12?showWork(11):open(n);
  $$('[data-earth]').forEach(b=>b.onclick=()=>open(+b.dataset.earth));
  $('#baseView').insertAdjacentHTML('beforeend',shelf('base'));
  $('#journalView').insertAdjacentHTML('beforeend',shelf('journal'));
  $$('[data-earth-work]').forEach(b=>b.onclick=()=>showWork(+b.dataset.earthWork));
  $$('[data-earth-go]').forEach(b=>b.onclick=()=>{window.Animals.selectChapter(3);render();open(Math.min(n,11));});
  // Rendering chapter selection alone must not duplicate the appended research shelves.
  for(const id of ['baseView','journalView']){const nodes=$$('#'+id+' .earth-shelf');nodes.slice(0,-1).forEach(n=>n.remove());}
 }
 function shelf(where){
  const done=data().completed;
  return `<section class="earth-shelf"><div class="section-heading"><p class="eyebrow">ROCK VALLEY RESEARCH STATION</p><h2>${where==='base'?'A home for your findings':'Your earth field notes'}<small class="title-zh">${where==='base'?'你的研究成果在这里安家':'地球材料研究手册'}</small></h2><p>Return to your evidence, timelines, and exhibition.<br>回看分类依据、试验记录与展览；研究功能随学习开放。</p></div>${done.length?`<div class="work-grid">${done.map(i=>`<button class="work-tile" data-earth-work="${i}">${img(missions[i].art,'')}<span><strong>${esc(missions[i].artifact)}</strong><small>${esc(missions[i].artifactzh)} · ${data().shared.includes(i)?'✓ Shared 已交流':'Saved 已保存'}</small></span><b>↗</b></button>`).join('')}</div>`:'<div class="empty-research"><p>Your first rock record starts with a clue.<small>完成岩石山谷关卡，这里就会留下你的研究作品。</small></p></div>'}<button class="secondary" data-earth-go>Continue earth research <small>继续地球材料研究</small> ↗</button></section>`;
 }
 function open(i){
  if(!Number.isInteger(i)||i<0||i>=12||i>data().completed.length)return;
  active=i;focused=null;stopAudio();
  if(!data().drafts[mission().id])data().drafts[mission().id]={step:0,answers:{}};
  persist();draw();if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 }
 function shuffleIndices(length){let arr=Array.from({length},(_,i)=>i);let seed=(active+7)*97+draft().step*31;for(let i=arr.length-1;i>0;i--){seed=(seed*16807)%2147483647;let j=seed%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];}if(length>1&&arr.every((v,i)=>v===i))[arr[0],arr[1]]=[arr[1],arr[0]];return arr;}
 function translated(en,zh,open=false){return `<p>${esc(en)}</p><details class="translation" ${open?'open':''}><summary>中文提示</summary><p>${esc(zh)}</p></details>`;}
 function chrome(content){
  const m=mission(),d=draft();
  if(narration.parentElement===dialog)document.body.append(narration);
  dialog.innerHTML=`<div class="lesson-header"><div><p class="eyebrow">ROCK VALLEY · ${String(active+1).padStart(2,'0')} / 12 · LEVEL ${m.tier}</p><h2>${esc(m.en)}<small class="title-zh">${esc(m.zh)}</small></h2></div><button class="icon-btn" id="earthClose" aria-label="Close and save / 关闭并保存">✕</button></div>${content}`;
  if(!narration.hidden)mountNarration();
  $('#earthClose').onclick=()=>{persist();dialog.close();};
 }
 function draw(){
  const m=mission(),d=draft(),s=task(),a=answer(),early=m.tier===1&&profile().mode==='guided';
  chrome(`<div class="earth-body"><div class="mission-steps" aria-label="Task progress">${m.steps.map((x,i)=>`<span class="${i===d.step?'current':i<d.step?'past':''}">${i<d.step?'✓':i+1} ${i===d.step?esc(x.type==='sentence'?'Explain':x.type==='camo'?'Investigate':'Explore'):''}</span>`).join('')}<small>Step ${d.step+1}/${m.steps.length} · 进度已保存</small></div>
  ${d.step===0?`<div class="field-brief">${img(m.art,'')}<div>${translated(m.intro,m.introzh,early)}</div><button class="listen" id="earthIntro">▷ Intro <small>听任务</small></button></div>`:''}
  ${s.recall?`<div class="recall-ribbon">↺ ${esc(s.recall)}</div>`:''}
  <div class="earth-task-title"><div><h3>${esc(s.en)}</h3><details class="translation" ${early?'open':''}><summary>中文提示</summary><p>${esc(s.zh)}</p></details></div><button class="listen" id="earthListen">▷ Listen <small>听指令</small></button></div>
  <div id="earthActivity">${active===0&&d.step===0?`<div class="rock-observation">${['a','b','c'].map(x=>`<figure>${img('rock-'+x,'Rock '+x.toUpperCase())}<figcaption>Rock ${x.toUpperCase()}</figcaption></figure>`).join('')}</div>`:''}${s.record?`<div class="evidence-record">${esc(s.record)}</div>`:''}${activity(s,a)}</div>
  <div class="support-row"><button id="earthHint" class="text-button">◇ Show a clue <small>查看线索</small></button><span>${esc(m.skill)} · ${esc(m.skillzh)}</span></div><div id="earthClue" class="hint-panel" ${a.hint?'':'hidden'}>${esc(s.hint)}</div>
  <p id="earthFeedback" role="status" aria-live="polite" class="feedback">${a.checked?'✓ Step complete. Choose Next step below. 这一步已完成，请点下方“下一步”。':''}</p>
  <div class="lesson-bottom"><div><span class="source-note">G2 · Chapter 3 · pp. ${esc(m.page)} · Original companion activity</span><div class="small-actions">${d.step?'<button id="earthBack" class="text-button">← Back · 上一步</button>':''}<button id="earthReset" class="text-button">Reset this step · 重做这一步</button></div></div><button class="primary" id="earthCheck">${a.checked?(d.step===m.steps.length-1?'Save my finding · 保存发现 ✦':'Next step · 下一步 ↗'):'Check my work · 检查结果'}</button></div></div>`);
  $('#earthIntro')?.addEventListener('click',()=>speak(m.id+'-intro'));
  $('#earthListen').onclick=()=>speak(m.id+'-step'+d.step);
  $('#earthHint').onclick=()=>{a.hint=true;persist();$('#earthClue').hidden=false;};
  $('#earthReset').onclick=()=>{d.answers[d.step]={};focused=null;persist();draw();};
  $('#earthBack')?.addEventListener('click',()=>{d.step--;focused=null;persist();draw();dialog.scrollTop=0;});
  $('#earthCheck').onclick=check;
  bindActivity(s,a);
 }
 function activity(s,a){
  if(s.type==='lab')return `<p class="interaction-help">EXAMPLE MODEL · 示例模型，不是真实计时实验<br><small>Equal soil volume · Matching cups · 100 mL added · Read at 1 minute<br>相同土量与杯子 · 加水100毫升 · 1分钟后读数</small></p><div class="soil-lab">${s.items.map(it=>`<section><h4>Sample ${it.id}<small>土样 ${it.id}</small></h4>${img('lab','Soil column model')}<div class="water-gauge"><i style="height:${(a.seen||[]).includes(it.id)?it.value:0}%"></i></div><p>${(a.seen||[]).includes(it.id)?it.value+' mL collected · 流出水量':'No reading yet · 等待读数'}</p><button class="secondary" data-run-sample="${it.id}">${(a.seen||[]).includes(it.id)?'Replay model · 重看模型':'Run model · 运行模型'}</button></section>`).join('')}</div>`;
  if(s.type==='sort')return `<p class="interaction-help">① Select a sample or record. ② Tap its group.<small>先选卡片，再点分组；可随时重新放置。</small></p><div class="sorting-layout"><div class="specimen-grid">${s.items.map(it=>`<article class="specimen ${focused===it.id?'selected':''}"><button class="specimen-pick" data-pick="${it.id}" aria-pressed="${focused===it.id}">${img(it.art,'')}<strong>${esc(it.en)}</strong><small>${esc(it.zh)}</small><span class="assigned">${a.placed?.[it.id]?esc(s.groups.find(g=>g.id===a.placed[it.id]).en):'Choose a group · 待分组'}</span></button><button data-clue="${it.id}" class="clue-button" aria-expanded="${(a.opened||[]).includes(it.id)}">${(a.seen||[]).includes(it.id)?'✓':'⌕'} Sample / record clue <small>查看线索</small></button>${focused===it.id?`<div class="quick-bins">${s.groups.map(g=>`<button data-quick-bin="${g.id}">${esc(g.en)}<small>${esc(g.zh)}</small></button>`).join('')}</div>`:''}${(a.opened||[]).includes(it.id)?`<div class="specimen-clue">${translated(it.clue,it.cluezh)}</div>`:''}</article>`).join('')}</div><div class="sorting-bins" aria-label="Groups">${s.groups.map(g=>`<button class="sorting-bin" data-bin="${g.id}"><strong>${esc(g.en)}</strong><small>${esc(g.zh)}</small><span>${s.items.filter(it=>a.placed?.[it.id]===g.id).map(it=>esc(it.en)).join(' · ')||'Tap to place · 点此放置'}</span></button>`).join('')}</div></div>`;
  if(s.type==='order')return `<p class="interaction-help">Tap the cards in order. Tap a placed card to remove it.<small>依次点卡片；点已放入的卡片可以撤回。</small></p><div class="order-bank">${shuffleIndices(s.items.length).map(i=>{const it=s.items[i];return `<button data-order="${it.id}" class="order-card" ${(a.order||[]).includes(it.id)?'disabled':''}>${img(it.art,'')}<strong>${esc(it.en)}</strong><small>${esc(it.zh)}</small><span>${esc(it.clue)}</span></button>`}).join('')}</div><div class="timeline">${s.items.map((_,i)=>{const it=s.items.find(x=>x.id===(a.order||[])[i]);return `<button data-unsort="${i}" class="timeline-slot" ${it?'':'disabled'}><b>${i+1}</b>${it?`${img(it.art,'')}<span>${esc(it.en)}</span>`:'<span>Place a stage<br><small>放入阶段</small></span>'}</button>`}).join('')}</div>`;
  if(s.type==='choice'||s.type==='multi'||s.type==='compare')return `${s.art?`<div class="evidence-art">${img(s.art,s.art)}<p>Observation card · 观察卡${s.art==='penguin'?'<br>Record: this penguin can swim.<br><small>记录：这只企鹅会游泳。</small>':''}</p></div>`:''}${s.type==='compare'?`<div class="compare-board"><p>Model · same drawing scale · 示意模型，同绘图比例</p>${s.items.map((it,i)=>`<div>${img(it.art,it.en,i===0?'scale-cub':'scale-adult')}<strong>${esc(it.en)}</strong></div>`).join('')}</div>`:''}<p class="interaction-help">${s.type==='choice'?'Choose one explanation. <small>选择一个解释</small>':`Choose ${s.min} statements. <small>选择 ${s.min} 条说法</small>`}</p><div class="earth-options">${s.options.map((o,i)=>`<button data-option="${i}" class="choice ${(a.selected||[]).includes(i)?'selected':''}" aria-pressed="${(a.selected||[]).includes(i)}"><span class="option-marker">${(a.selected||[]).includes(i)?'✓':String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div>`;
  if(s.type==='sentence')return `<div class="sentence-scene">${img(mission().art,'')}<p>Turn your evidence into a sentence.<small>把证据组织成一句解释。</small></p></div><div class="sentence-result" aria-label="Your sentence">${(a.tokens||[]).length?(a.tokens||[]).map((idx,i)=>`<button class="sentence-piece" data-untoken="${i}">${esc(s.parts[idx])} <small>×</small></button>`).join(''):'<span>Tap phrases below to build your explanation.<small>点选下方短语，组成解释。</small></span>'}</div><div class="phrase-bank">${shuffleIndices(s.parts.length).map(i=>`<button class="chip" data-token="${i}" ${(a.tokens||[]).includes(i)?'disabled':''}>${esc(s.parts[i])}</button>`).join('')}</div><details class="translation"><summary>中文意思</summary><p>${esc(s.translation)}</p></details>`;
  if(s.type==='camo')return `<div class="prediction-box"><p><strong>My prediction · 我的预测</strong><br>Which background might make the green insect harder to notice?</p><div class="button-row">${[['green','Green · 绿色'],['brown','Brown · 棕色'],['unsure','Not sure · 不确定']].map(([v,t])=>`<button data-predict="${v}" class="secondary ${a.prediction===v?'selected':''}" aria-pressed="${a.prediction===v}" ${(a.views||[]).length?'disabled':''}>${t}</button>`).join('')}</div><small>Predictions are not scored. 预测不按对错扣分。</small></div><div class="camo-stage ${a.bg==='brown'?'brown':'green'} ${a.hint?'outlined':''}"><span class="model-label">PICTURE MODEL · 图像模型</span>${a.prediction?img('leaf-insect','Same green leaf insect, same size and position'):'<p>Make a prediction to begin.<br>先预测，再开始比较。</p>'}<span class="model-caption">Same insect · Same size · Same position<br>相同昆虫、大小与位置</span></div><div class="camo-controls">${[['green','Green background','绿色背景'],['brown','Brown background','棕色背景']].map(([v,en,zh])=>`<button class="secondary ${a.bg===v?'selected':''}" data-background="${v}" ${a.prediction?'':'disabled'}>${(a.views||[]).includes(v)?'✓ ':''}${bilingual(en,zh)}</button>`).join('')}</div><p class="zh">Look for differences in contrast. 查看线索可显示昆虫轮廓。已观察 ${(a.views||[]).length}/2 个背景。</p>`;
  if(s.type==='population')return `<div class="population-key">Two separate study areas. All rabbit cards show the same species.<small>两个分隔的研究区域；所有兔卡均标注为同一物种。</small></div><div class="population-map">${[['A',[0,1,2,3,4,5]],['B',[6,7]]].map(([area,ids])=>`<section><h4>Area ${area}<small>${area} 研究区</small></h4><div>${ids.map(i=>{const art=[0,2,4,6,7].includes(i)?'rabbit':i===5?'turtle':'bird';return `<button data-pop="${i}" class="population-earth ${(a.selected||[]).includes(i)?'selected':''}" aria-pressed="${(a.selected||[]).includes(i)}">${img(art,art)}<span>${art==='rabbit'?'Rabbit · 同种兔':art==='bird'?'Bird · 鸟':'Tortoise · 陆龟'}</span><b>${(a.selected||[]).includes(i)?'✓':'＋'}</b></button>`}).join('')}</div></section>`).join('')}</div>`;
  return '';
 }
 function bindActivity(s,a){
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
  if(s.type==='camo')$('#earthHint').onclick=()=>{a.hint=true;persist();draw();};
 }
 function evaluate(s,a,m=mission()){
  if(s.type==='lab'){if(s.items.some(it=>!(a.seen||[]).includes(it.id)))return s.hint;}else if(s.type==='sort'){
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
   if(!a.selected?.length)return 'Select earth on the map first. 请先在地图中选择动物。';
   if(a.selected.length!==3||![0,2,4].every(i=>a.selected.includes(i)))return s.hint;
  }
  return '';
 }
 function feedbackLocal(text,bad=true){$('#earthFeedback').textContent=text;$('#earthFeedback').classList.toggle('bad',bad);$('#earthFeedback').scrollIntoView({block:'nearest'});}
 function check(){
  const s=task(),a=answer(),d=draft(),m=mission(),error=evaluate(s,a);
  if(error){a.checked=false;persist();feedbackLocal(error);return;}
  if(d.step===m.steps.length-1){a.checked=true;persist();finish();speak(m.id+'-sentence');return;}
  if(!a.checked){a.checked=true;persist();$('#earthCheck').textContent='Next step · 下一步 ↗';feedbackLocal('✓ Your evidence fits. This step is complete — tap Next step below. 这一步答对了，请点下方“下一步”。',false);$('#earthCheck').focus({preventScroll:true});return;}
  if(d.step<m.steps.length-1){d.step++;focused=null;persist();draw();dialog.scrollTop=0;return;}
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
   if(s.type==='lab')body='<p>Example model · Equal conditions · 100 mL added · 1 minute<br>Sample A: 60 mL · Sample B: 35 mL · Sample C: 10 mL<br><small>示例模型，相同条件；下方收集水量记录。</small></p>';
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
  chrome(`<div class="earth-body"><div class="finding-header">${img(m.art,'')}<div><p class="eyebrow">${first?'NEW FINDING · +30 POINTS':'SAVED FIELD RECORD'}</p><h3>${esc(m.artifact)}<small class="title-zh">${esc(m.artifactzh)}</small></h3><p>✓ Do · 操作完成　✓ Explain · 解释完成</p></div></div>${translated(m.fact,m.factzh)}<button class="listen" id="earthFact">▷ Listen to the science <small>听科学解释</small></button>${recordHTML(m,d)}<div class="share-card"><p class="eyebrow">TALK TOGETHER · OPTIONAL</p><p>${esc(m.share)}<small>${esc(m.sharezh)}</small></p><button class="secondary" id="earthShared" aria-pressed="${data().shared.includes(i)}">${data().shared.includes(i)?'✓ We shared our ideas · 已交流':'We shared our ideas · 标记已交流'}</button><small>Self check · 自评；无需录音，不影响通关。</small></div><div class="button-row"><button class="secondary" id="earthRevisit">Revisit & edit <small>重温并更新</small></button><button class="secondary" id="earthHome">My research base <small>研究基地</small></button>${i<11?'<button class="primary" id="earthNext">Next discovery <small>下一项发现</small> ↗</button>':'<button class="primary" id="earthEnd">Chapter complete <small>回到海湾</small> ✦</button>'}</div></div>`);
  $('#earthFact').onclick=()=>speak(m.id+'-fact');
  $('#earthShared').onclick=()=>{if(!data().shared.includes(i))data().shared.push(i);persist();window.render();showWork(i);};
  $('#earthRevisit').onclick=()=>{data().drafts[m.id]={step:0,answers:{}};persist();open(i);};
  $('#earthHome').onclick=()=>{dialog.close();switchTab('base');};
  $('#earthNext')?.addEventListener('click',()=>open(i+1));
  $('#earthEnd')?.addEventListener('click',()=>{dialog.close();window.Animals.selectChapter(3);render();});
  window.Learning?.addNext(dialog,3);
  if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 }
 return {render,open,showWork,evaluate,go:()=>{window.Animals.selectChapter(3);render();open(Math.min(data().completed.length,11));}};
})();
render();
