'use strict';
window.FinalChallenge=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const data=()=>profile().final;
 const dialog=document.createElement('dialog');dialog.id='finalDialog';dialog.className='final-dialog';document.body.append(dialog);
 dialog.addEventListener('close',()=>{ForcesLab.stop();stopAudio();});
 $('#mapView').insertAdjacentHTML('beforeend','<div id="finalMap" hidden></div>');
 const art=q=>`<img class="final-art" src="assets/forces/${esc(q.art)}.svg" alt="" draggable="false">`;
 const correct=(q,a)=>q.type==='sentence'?a?.value?.length===q.parts.length&&a.value.every((v,i)=>v===i):a?.value?.length===1&&a.value[0]===q.answer;
 function score(r){const rows=Array.from({length:7},()=>({science:0,english:0,help:0}));FINAL.forms[r.form].forEach((q,i)=>{const a=r.answers[i];if(correct(q,a))rows[q.chapter-1][q.domain]++;if(a?.help&&Object.values(a.help).some(Boolean))rows[q.chapter-1].help++;});return {rows,science:rows.reduce((n,r)=>n+r.science,0),english:rows.reduce((n,r)=>n+r.english,0)};}
 function render(){
  const d=data(),last=d.attempts.at(-1),s=last?score(last):null;
  $('#finalMap').innerHTML=`<section class="final-hero"><div><p class="eyebrow">YOUR WHOLE-BOOK CHALLENGE</p><h2>Final Science Challenge<small>全册科学挑战</small></h2><p>Seven chapters. One curious scientist.<br>Use your evidence. Explain your thinking.</p><p class="zh">七章均衡考核，先独立作答，交卷后看讲评。科学理解与英语表达分别记录。</p><div class="button-row"><button class="primary" id="finalStart">${d.draft?'Continue my challenge':'Begin a challenge'}<small>${d.draft?`继续第 ${Math.min(d.draft.index+1,28)} / 28 题`:'开始挑战 · 28题分两场'}</small> ↗</button>${last?'<button class="secondary" id="finalReport">My learning report<small>查看学习报告</small></button>':''}</div></div><div class="final-emblem"><img src="assets/golden-frog.webp" alt="Golden Frog expedition buddy"><span>${d.earned?'FIELD SCIENTIST ✦':'THINK · TEST · EXPLAIN'}</span></div></section><div class="final-info-grid"><article><b>14 + 14</b><h3>Take a break<small>两场各14题，随时暂停</small></h3><p>No countdown. Closing saves your draft.<small>没有倒计时，关闭后保留当前选项与已交答案。</small></p></article><article><b>21 + 7</b><h3>Two learning lenses<small>21题科学，7题英语</small></h3><p>English errors do not lower your science score.<small>英语拼接错误不会再次扣科学分。</small></p></article><article><b>▷ / 中文</b><h3>Help stays available<small>配音与中文帮助随时可用</small></h3><p>Help is noted, without a score penalty.<small>记录辅助使用，不扣分；这是一份学习反馈。</small></p></article></div><section class="final-rules"><h3>Before you begin<small>开始前</small></h3><p>We recommend finishing the seven chapters and the Great Island Expedition first. You may also take this as a starting-point check.<small>建议先完成七章与毕业探险；也可提前尝试，了解已有基础。</small></p><p>Each “Submit answer” locks that first answer. Explanations appear after all 28 questions. Use “I don’t know yet” when needed.<small>每次提交锁定首次答案；28题全部完成后统一讲评。不确定可选“暂时不会”。</small></p><p>Retakes alternate between two forms with changed examples or data. Some core rules return.<small>复测交替使用两套题，换情境或数据，部分核心规则会再次出现。</small></p><button class="text-button" id="finalReviewFirst">↺ Visit the Great Island Expedition · 先去毕业复习</button></section>${s?`<section class="final-last"><p class="eyebrow">LATEST FINISHED ATTEMPT</p><h3>Science ${s.science}/21 · English ${s.english}/7</h3><p>${d.earned?'✦ Field scientist badge earned · 已获得科学研究员徽章':'The report will help you choose your next practice. · 根据报告选择下一项练习。'}</p></section>`:''}`;
  $('#finalStart').onclick=start;$('#finalReport')?.addEventListener('click',()=>report(d.attempts.length-1));$('#finalReviewFirst').onclick=()=>Animals.selectChapter(8);
  for(const id of ['baseView','journalView']){
   $$('#'+id+' .final-shelf').forEach(n=>n.remove());
   $('#'+id).insertAdjacentHTML('beforeend',`<section class="final-shelf"><p class="eyebrow">GRADUATION GALLERY</p><h2>My learning journey<small class="title-zh">全册学习档案</small></h2><p>${profile().expedition.completed.length}/7 review stations · ${d.attempts.length} saved assessments<small>已完成复习站 · 保留最近8次完整考核</small></p>${d.earned?'<p class="achievement">✦ Field Scientist · 科学研究员徽章（科学题至少17/21，首次获得后保留）</p>':''}<button class="secondary" data-final-home>Final challenge & reports<small>期末挑战与学习报告</small> ↗</button></section>`);
  }
  $$('[data-final-home]').forEach(b=>b.onclick=()=>Animals.selectChapter(9));
 }
 function chrome(title,zh,body){
  if(narration.parentElement===dialog)document.body.append(narration);
  dialog.innerHTML=`<div class="lesson-header"><div><p class="eyebrow">FINAL SCIENCE CHALLENGE</p><h2>${esc(title)}<small class="title-zh">${esc(zh)}</small></h2></div><button id="finalClose" class="icon-btn" aria-label="Close and save / 关闭保存">✕</button></div><div class="final-body">${body}</div>`;
  $('#finalClose').onclick=()=>{save();dialog.close();};
  if(!dialog.open)dialog.showModal();if(!narration.hidden)mountNarration();
 }
 function start(){
  stopAudio();if(!data().draft){data().draft={form:data().nextForm,index:0,answers:[],started:new Date().toISOString(),current:{value:[],help:{}}};save();}
  if(data().draft.paused)breakScreen();else draw();
 }
 function chart(q){
  if(q.listening)return ''; 
  if(q.chart){const c=q.chart,max=Math.max(...c.values);return `<figure class="final-chart"><figcaption>${esc(c.unit)}</figcaption>${c.labels.map((l,i)=>`<div><strong>${esc(l)}</strong><span class="chart-track"><i style="width:${c.values[i]/max*100}%"></i></span><b>${c.values[i]}</b></div>`).join('')}<small>Starts at zero · 数值从零起</small></figure>`;}
  if(q.diagram==='layers')return `<div class="rock-layers" role="img" aria-label="Upper layer ${esc(q.layerLabels[0])}; lower layer ${esc(q.layerLabels[1])}"><div>Upper · 上层<small>${esc(q.layerLabels[0])}</small></div><div>Lower · 下层<small>${esc(q.layerLabels[1])}</small></div></div>`;
  if(q.diagram==='poles')return `<div class="exam-poles">${ForcesLab.svg('poles',{pole:q.pole},false)}</div>`;
  return art(q);
 }
 function draw(){
  const d=data().draft;if(!d)return;const q=FINAL.forms[d.form][d.index];if(!q)return finish();
  const a=d.current||(d.current={value:[],help:{}});a.help||={};
  const order=q.type==='sentence'?q.parts.map((_,i)=>i).sort((a,b)=>((a*7+d.index*3)%q.parts.length)-((b*7+d.index*3)%q.parts.length)):[];
  if(order.length>1&&order.every((v,i)=>v===i))order.reverse();
  chrome(`Question ${d.index+1} of 28`,`第 ${d.index<14?1:2} 场 · Chapter ${q.chapter} · ${q.domain==='science'?'科学理解':'英语表达'}`,`<div class="exam-progress"><i style="width:${d.index/28*100}%"></i></div><div class="exam-question"><p class="eyebrow">${esc(FINAL.chapters[q.chapter-1])}</p><h3>${esc(q.en)}</h3><details class="translation" data-help="zh" ${a.help.zh?'open':''}><summary>中文帮助</summary><p>${esc(q.zh)}${q.translation?'<br>'+esc(q.translation):''}</p>${q.listening?'<p>'+esc(q.spokenzh)+'</p>':''}</details><div class="listen-actions"><button id="examListen" class="listen">▷ Listen<small>${q.listening?'听位置指令':'听题目'}</small></button><button id="examSlow" class="text-button">▷ Slower<small>慢速重听</small></button></div>${q.listening?`<details class="translation" data-help="transcript" ${a.help.transcript?'open':''}><summary>Show spoken instruction · 查看听力文字</summary><p>${esc(q.spoken)}</p></details>`:''}${chart(q)}${q.type==='sentence'?`<div class="sentence-result">${a.value.length?a.value.map((idx,i)=>`<button class="sentence-piece" data-exam-remove="${i}">${esc(q.parts[idx])} ×</button>`).join(''):'<span>Your sentence · 你的句子</span>'}</div><div class="phrase-bank">${order.map(i=>`<button class="chip" data-exam-token="${i}" ${a.value.includes(i)?'disabled':''}>${esc(q.parts[i])}</button>`).join('')}</div>`:`<div class="exam-options ${q.listening?'position-answer-board':''}">${q.listening?'<img src="assets/motion/tree.svg" alt="Tree reference / 树参照物">':''}${q.options.map((o,i)=>`<button class="choice ${a.value.includes(i)?'selected':''}" data-exam-choice="${i}" aria-pressed="${a.value.includes(i)}"><span class="option-marker">${String.fromCharCode(65+i)}</span>${q.listening&&a.value.includes(i)?'▣ ':''}${esc(o)}</button>`).join('')}</div>`}</div><p id="examFeedback" role="status" aria-live="polite"></p><div class="exam-actions"><button class="text-button" id="examPause">Save & pause<small>保存并暂停</small></button><button class="secondary" id="examSkip">I don’t know yet<small>暂时不会 · 记录后继续</small></button><button class="primary" id="examSubmit">Submit answer<small>提交并锁定本题答案</small> ↗</button></div>`);
  $('#examListen').onclick=()=>listen(q,a,1);$('#examSlow').onclick=()=>listen(q,a,.85);
  dialog.querySelectorAll('[data-help]').forEach(el=>el.addEventListener('toggle',()=>{if(el.open){a.help[el.dataset.help]=true;save();}}));
  dialog.querySelectorAll('[data-exam-choice]').forEach(b=>b.onclick=()=>{a.value=[+b.dataset.examChoice];save();draw();});
  dialog.querySelectorAll('[data-exam-token]').forEach(b=>b.onclick=()=>{const i=+b.dataset.examToken;if(!a.value.includes(i))a.value.push(i);save();draw();});
  dialog.querySelectorAll('[data-exam-remove]').forEach(b=>b.onclick=()=>{a.value.splice(+b.dataset.examRemove,1);save();draw();});
  const expected=d.index;$('#examSubmit').onclick=()=>submit(expected,false);$('#examSkip').onclick=()=>submit(expected,true);
  $('#examPause').onclick=()=>{stopAudio();save();dialog.close();window.render();};
 }
 function listen(q,a,rate){a.help.audio=true;save();speak(q.id,rate);}
 function submit(expected,skipped){
  const d=data().draft;if(!d||d.index!==expected)return;
  const q=FINAL.forms[d.form][d.index],a=d.current||{value:[],help:{}};
  if(!skipped&&a.value.length!==(q.type==='sentence'?q.parts.length:1)){$('#examFeedback').textContent='Complete your choice or use “I don’t know yet”. 请完成选择，或点“暂时不会”。';return;}
  stopAudio();d.answers.push({value:skipped?[]:[...a.value],help:{...a.help},skipped});d.index++;delete d.current;
  if(d.index===28){finish();return;}
  if(d.index===14){d.paused=true;save();window.render();breakScreen();return;}
  save();draw();dialog.scrollTop=0;
 }
 function breakScreen(){
  chrome('Part one is saved','第一场已保存',`<div class="exam-break"><img src="assets/golden-frog.webp" alt="Golden Frog"><h3>14 questions recorded.<small>前14题已经锁定保存</small></h3><p>Take a stretch break. The next 14 questions include observations and explanations.<small>伸展休息一下，后14题继续观察与解释。完成后一起看讲评。</small></p><div class="button-row"><button class="primary" id="examPartTwo">Begin part two<small>开始第二场</small> ↗</button><button class="secondary" id="examRest">Come back later<small>稍后继续</small></button></div></div>`);
  $('#examPartTwo').onclick=()=>{data().draft.paused=false;save();draw();dialog.scrollTop=0;};$('#examRest').onclick=()=>{dialog.close();window.render();};
 }
 function finish(){
  const d=data().draft;if(!d||d.index!==28)return;
  const r=JSON.parse(JSON.stringify(d));r.finished=new Date().toISOString();delete r.current;
  data().attempts.push(r);if(data().attempts.length>8)data().attempts.shift();data().nextForm=1-d.form;
  if(score(r).science>=17)data().earned=true;
  data().draft=null;save();window.render();report(data().attempts.length-1);
 }
 function answerText(q,a){if(a?.skipped)return 'Not sure yet · 暂时不会';return (a?.value||[]).map(i=>q.type==='sentence'?q.parts[i]:q.options[i]).join(' ');}
 function helpText(a){const h=a?.help||{};return [h.audio?'Audio 配音':'',h.zh?'Chinese 中文':'',h.transcript?'Transcript 听力文字':''].filter(Boolean).join(' · ')||'No help opened · 未打开辅助';}
 function report(index){
  stopAudio();const r=data().attempts[index];if(!r)return;const s=score(r),qs=FINAL.forms[r.form],prev=data().attempts[index-1];
  chrome('My learning report','我的全册学习报告',`<p class="eyebrow">FORM ${r.form===0?'A':'B'} · ${esc(new Date(r.finished).toLocaleDateString())}</p><div class="score-cards"><article><b>${s.science}<small>/21</small></b><h3>Science understanding<small>科学理解与操作推理</small></h3></article><article><b>${s.english}<small>/7</small></b><h3>English expression<small>英语句子表达</small></h3></article></div><p>${s.science>=17?'✦ Field scientist · 本次科学题达到研究员徽章标准':'Keep investigating · 跟着下方建议，继续补上还不熟的概念。'}</p>${prev?`<p>Previous: Science ${score(prev).science}/21 · English ${score(prev).english}/7<small>上次成绩供观察进步；两套题情境不同，结果是学习参考。</small></p>`:''}<p>Listening and Chinese help do not reduce either score. This is a learning check, not a standardized test.<small>配音和中文帮助不扣分；本报告用于伴学反馈，不是标准化考试等级。</small></p><div class="chapter-report">${s.rows.map((row,i)=>`<article><p class="eyebrow">CHAPTER ${i+1}</p><h3>${esc(FINAL.chapters[i])}<small>${esc(FINAL.chapterszh[i])}</small></h3><p>Science ${row.science}/3 · English ${row.english}/1</p><p>${row.science===3?'✓ These science items are secure.':'↺ Revisit the evidence and try a new example.'}<small>${row.science===3?'本次科学题全部答对，试着向家人解释。':'回看证据，练习下方未掌握的知识点。'}</small></p><small>Help used on ${row.help}/4 questions · 辅助使用记录</small><button class="secondary" data-chapter-practice="${i+1}">Practice this chapter<small>回到本章练习</small> ↗</button></article>`).join('')}</div><h3>Question by question<small>逐题讲评 · 首次答案保留</small></h3><div class="exam-explanations">${qs.map((q,i)=>`<details class="exam-explanation" ${correct(q,r.answers[i])?'':'open'}><summary>${correct(q,r.answers[i])?'✓':'↺'} ${i+1}. ${esc(q.en)}</summary><p>${esc(q.zh)}</p>${q.listening?'<p>'+esc(q.spoken)+'</p>':''}${q.chart||q.diagram?chart(q):''}<p><strong>Your first answer · 首次答案</strong><br>${esc(answerText(q,r.answers[i]))}</p><p class="answer-explanation">${esc(q.explanation)}<small>${esc(q.explanationzh)}</small></p><small>${esc(helpText(r.answers[i]))}</small><div class="button-row"><button class="text-button" data-explain-audio="${q.id}">▷ Listen to explanation<small>听讲解</small></button><button class="text-button" data-target="${i}">Practice this idea<small>练这个知识点</small> ↗</button></div></details>`).join('')}</div><div class="share-card"><p class="eyebrow">TALK TOGETHER · OPTIONAL</p><p>Choose one answer. Explain the evidence to a partner. What could you test next?<small>选一道题向家人解释证据，接下来还可以测试什么？无需录音，不影响成绩。</small></p></div><div class="button-row"><button class="primary" id="reportDaily">My next practice<small>根据结果安排复习</small></button><button id="reportDownload" class="secondary">Save report<small>下载文字学习报告</small></button><button id="reportReview" class="secondary">Review together<small>进入毕业探险</small></button><button id="reportRetake" class="primary">${data().draft?'Resume saved attempt':'Try the other form'}<small>${data().draft?'继续尚未完成的考核':'换一套题再挑战 · 原报告保留'}</small> ↗</button></div><div class="attempt-history"><h3>Saved attempts<small>最近8次完整记录</small></h3>${data().attempts.map((a,i)=>`<button class="text-button" data-attempt="${i}" ${i===index?'disabled':''}>${i+1} · Form ${a.form?'B':'A'} · ${score(a).science}/21 + ${score(a).english}/7</button>`).join('')}</div>`);
  dialog.querySelectorAll('[data-explain-audio]').forEach(b=>b.onclick=()=>speak(b.dataset.explainAudio+'-explain'));
  dialog.querySelectorAll('[data-chapter-practice]').forEach(b=>b.onclick=()=>{const ch=+b.dataset.chapterPractice;const weak=qs.find((q,i)=>q.chapter===ch&&!correct(q,r.answers[i]));practice(ch,weak?.mission||0);});
  dialog.querySelectorAll('[data-target]').forEach(b=>b.onclick=()=>{const q=qs[+b.dataset.target];practice(q.chapter,q.mission);});
  dialog.querySelectorAll('[data-attempt]').forEach(b=>b.onclick=()=>report(+b.dataset.attempt));
  $('#reportDaily').onclick=()=>{dialog.close();Learning.open('plan');};
  $('#reportReview').onclick=()=>{dialog.close();Animals.selectChapter(8);};$('#reportRetake').onclick=start;
  $('#reportDownload').onclick=()=>{
   const text=['Golden Frog Science Island · Learning report',`Form ${r.form?'B':'A'} · ${r.finished}`,`Science ${s.science}/21 · English ${s.english}/7`,...s.rows.map((row,i)=>`${i+1}. ${FINAL.chapters[i]} / ${FINAL.chapterszh[i]}: Science ${row.science}/3; English ${row.english}/1`),...qs.map((q,i)=>`\n${i+1}. ${q.en}\n${q.zh}\nFirst answer: ${answerText(q,r.answers[i])}\n${correct(q,r.answers[i])?'Correct':'Review'}: ${q.explanation}\n${q.explanationzh}\n${helpText(r.answers[i])}`)].join('\n');
   const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='science-learning-report.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  dialog.scrollTop=0;
 }
 function practice(ch,idx){dialog.close();Animals.selectChapter(ch);if(ch===1){openLevel(Math.min(idx,profile().completed.length,5));return;}const mods=[null,null,Animals,Earth,Fossils,Resources,Motion,Forces],keys=['','','animals','earth','fossils','resources','motion','forces'];const n=profile()[keys[ch]].completed.length;mods[ch].open(Math.min(idx,n));}
 return {render,start,report,score,correct};
})();
render();
