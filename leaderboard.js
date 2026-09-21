/* Wordlight classroom leaderboard. The learning game remains browser-local. */
(() => {
  'use strict';
  const ENDPOINT='https://script.google.com/macros/s/AKfycbxu1LNp_AdqEuQPkjLyTx7Cts1R52Ez7SVn38Uk2Z2ko-_hovtK5D0_aRKOO247j70Y/exec';
  const KEY='wordlight_cloud_queue_2g3_v1', IDKEY='wordlight_cloud_ids_2g3_v1';
  const uuid=()=>crypto.randomUUID?crypto.randomUUID():Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}};
  let queue=read(KEY,[]),ids=read(IDKEY,{}),sending=false,lastError='',session=null,cardTimer,requestVersion=0,lastFocus;
  let lastTick=performance.now(),storageError=false;
  const dialog=document.getElementById('rankDialog'),content=document.getElementById('rankContent'),status=document.getElementById('rankStatus');
  const identity=p=>JSON.stringify([p.className.trim().normalize('NFKC').toUpperCase(),p.index?String(Number(p.index)):p.name.trim().normalize('NFKC').toLowerCase()]);
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const time=s=>`${Math.floor(s/60)}分${s%60}秒`;
  const percent=n=>n==null?'—':`${n}%`;
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(queue));storageError=false;return true}catch{storageError=true;updateStatus();return false}}
  function current(){
    const p=state.profile;if(!p.name||!p.className)return null;
    const key=identity(p);
    if(!state.cloud||state.cloud.identity!==key){state.cloud={identity:key,runId:uuid()};save()}
    return {profile:{...p},runId:state.cloud.runId,identity:key};
  }
  function updateStatus(){
    const key=state.profile.name?identity(state.profile):'',n=queue.filter(e=>identity(e.profile)===key).length;
    const text=storageError?'本机空间不足，请保持页面打开并重试同步。':sending?'正在同步学习记录…':n?`有${n}条记录待同步${lastError?'，请检查网络后重试。':'。'}`:ids[key]?'学习记录已同步':'完成学习后自动同步记录';
    document.querySelectorAll('[data-cloud-status]').forEach(el=>{el.textContent=text;el.dataset.pending=String(!!n||storageError)});
  }
  function paused(){return document.hidden||dialog.open||Array.from(document.querySelectorAll('.modal')).some(el=>!el.classList.contains('hidden'))||!!document.getElementById('splash')||!document.getElementById('storyOverlay').classList.contains('hidden');}
  function tick(){const now=performance.now(),delta=Math.min(2,(now-lastTick)/1000);lastTick=now;if(session&&!paused())session.seconds+=delta;}
  setInterval(tick,500);
  document.addEventListener('visibilitychange',()=>{tick();lastTick=performance.now();if(document.hidden)flushCards()});
  function begin(stage){leave();const c=current();if(c)session={...c,stage,seconds:0,words:new Set()};lastTick=performance.now();}
  function enqueue(payload){queue=read(KEY,queue);const event={action:'submit',eventId:uuid(),...payload};if(!queue.some(e=>e.eventId===event.eventId))queue.push(event);persist();updateStatus();void drain();}
  function flushCards(){
    clearTimeout(cardTimer);if(!session||session.stage!=='cards'||!session.words.size)return;
    tick();const seconds=Math.min(14400,Math.floor(session.seconds));session.seconds-=seconds;
    enqueue({eventId:session.pendingId,profile:session.profile,runId:session.runId,stage:'cards',words:[...session.words],seconds});session.words.clear();session.pendingId=null;
    try{localStorage.removeItem('wordlight_pending_cards_2g3_v1')}catch{}
  }
  function card(word){
    if(!session||session.stage!=='cards')begin('cards');if(!session)return;
    session.pendingId ||= uuid();session.words.add(word);tick();
    // Persist the unfinished batch before navigating away or losing the tab.
    try{localStorage.setItem('wordlight_pending_cards_2g3_v1',JSON.stringify({eventId:session.pendingId,profile:session.profile,runId:session.runId,stage:'cards',words:[...session.words],seconds:Math.min(14400,Math.floor(session.seconds))}))}catch{storageError=true;updateStatus()}
    clearTimeout(cardTimer);if(session.words.size>=6)flushCards();else cardTimer=setTimeout(flushCards,6000);
  }
  function leave(){tick();flushCards();session=null;}
  function round(stage,qs){
    if(!session||session.stage!==stage)return;
    tick();const s=session;session=null;
    enqueue({profile:s.profile,runId:s.runId,stage,seconds:Math.min(14400,Math.round(s.seconds)),answers:qs.map(q=>({word:q.word.w,firstCorrect:q.firstCorrect===true,finalCorrect:q.finalCorrect===true}))});
  }
  async function call(params,payload){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
    try{
      const url=ENDPOINT+(params?'?'+new URLSearchParams(params):'');
      const response=await fetch(url,{method:payload?'POST':'GET',...(payload?{headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}:{}),credentials:'omit',cache:'no-store',redirect:'follow',signal:controller.signal});
      if(!response.ok)throw new Error('连接暂时不可用');
      let data;try{data=await response.json()}catch{throw new Error('服务未返回成绩数据，请联系老师检查部署权限。')}
      if(!data.ok)throw new Error(data.error||'同步失败');return data;
    }finally{clearTimeout(timer)}
  }
  async function drain(){
    if(sending||!navigator.onLine)return; sending=true;updateStatus();
    try{
      // One request at a time; immutable event IDs make retries idempotent.
      queue=read(KEY,queue);while(queue.length){const event=queue[0];const result=await call(null,event);if(result.eventId!==event.eventId)throw new Error('未收到保存确认');
        ids[identity(event.profile)]=result.studentId;
        try{localStorage.setItem(IDKEY,JSON.stringify(ids))}catch{}
        queue=read(KEY,queue).filter(e=>e.eventId!==event.eventId);persist();lastError='';
      }
    }catch(err){lastError=err.message||'网络暂时不可用'}
    finally{sending=false;updateStatus()}
  }
  function row(r,mine){return `<tr${mine?' class="rank-me"':''}><td><span class="rank-number">${r.rank}</span></td><td><strong>${escape(r.name)}</strong>${mine?'<small>我</small>':''}<span class="rank-class">${escape(r.className)}</span></td><td><b>${r.score}</b></td><td class="rank-stars">${r.stars==null?'—':`<span aria-hidden="true">★</span> ${r.stars}`}</td><td>${r.passed} / ${r.totalStages}</td><td>${percent(r.accuracy)}</td><td>${time(r.bestSeconds)}</td></tr>`}
  async function refresh(){
    const version=++requestVersion;status.textContent='正在读取排行榜…';document.getElementById('rankRefresh').disabled=true;
    try{
      flushCards();await drain();const p=state.profile,key=p.name?identity(p):'',scope=document.getElementById('rankScope').value;
      let myId=ids[key]||'';if(key&&!myId&&crypto.subtle){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));myId=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('').slice(0,24)}
      const data=await call({action:'leaderboard',className:scope==='class'?p.className:'',studentId:myId});
      if(version!==requestVersion||!dialog.open)return;
      const me=data.me,top=data.top10;
      content.innerHTML=top.length?`<div class="rank-table-wrap" tabindex="0" aria-label="排行榜，可左右滑动"><table class="rank-table"><thead><tr><th>名次</th><th>冒险者</th><th>综合积分</th><th>累计星星</th><th>通过关卡</th><th>首次准确率</th><th>最佳用时</th></tr></thead><tbody>${top.map(r=>row(r,r.studentId===me?.studentId)).join('')}</tbody></table></div>`:'<div class="rank-empty">词光榜等待第一位冒险者！<p>翻看词语卡或完成一局答题，就能开始累积积分。</p></div>';
      document.getElementById('rankMine').innerHTML=me?`<strong>我的排名：第 ${me.rank} 名</strong><span>${me.score} 分${me.stars==null?'':` · ★ ${me.stars} 颗星（奖励 ${me.starBonus} 分）`} · 通过 ${me.passed}/6 关 · 首次准确率 ${percent(me.accuracy)}</span>`:'<strong>我的排名：暂未上榜</strong><span>完成学习后同步记录，即可查看排名。</span>';
      document.getElementById('rankRules').textContent=data.maxScore===1100?'显示前10名；自己的排名始终单独显示。满分1100分＝基础积分1000分＋星星奖励分100分。五个答题关各最多20颗星计分，每颗加1分；超过上限的星星仍会累计显示。每关最佳成绩保留，时间不影响排名。星星按已同步的完整答题局统计。':'显示前10名；自己的排名始终单独显示。当前服务仍按原有1000分排名，老师更新后会显示累计星星并启用1100分制。';
      status.textContent=`${scope==='class'?'本班':'全部班级'}共 ${data.totalStudents} 位冒险者 · 更新于 ${new Date(data.updatedAt).toLocaleTimeString('zh-SG',{hour:'2-digit',minute:'2-digit'})}`;
    }catch(err){if(version!==requestVersion)return;status.textContent='排行榜暂时无法连接，请稍后点击刷新。';content.innerHTML='<div class="rank-empty">暂时无法读取云端排名。<p>你的本机进度不受影响，待上传的成绩会保留并重试。</p></div>';document.getElementById('rankMine').textContent='连接恢复后显示我的排名。'}
    finally{if(version===requestVersion)document.getElementById('rankRefresh').disabled=false;updateStatus()}
  }
  function open(){lastFocus=document.activeElement;tick();dialog.showModal();document.getElementById('rankClose').focus();void refresh()}
  function close(){dialog.close();lastTick=performance.now();lastFocus?.focus()}
  document.getElementById('rankBtn').onclick=open;document.getElementById('resultRankBtn').onclick=open;
  document.getElementById('rankClose').onclick=close;dialog.addEventListener('cancel',()=>{lastTick=performance.now()});
  document.getElementById('rankRefresh').onclick=refresh;document.getElementById('rankScope').onchange=refresh;
  dialog.addEventListener('keydown',e=>{if(e.key==='Tab'){const nodes=Array.from(dialog.querySelectorAll('button,select,[tabindex="0"]')).filter(x=>!x.disabled);if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus()}}});
  window.addEventListener('storage',e=>{if(e.key===KEY){queue=read(KEY,queue);updateStatus()}});
  window.addEventListener('online',()=>void drain());window.addEventListener('pagehide',flushCards);
  setInterval(()=>{if(queue.length&&!document.hidden)void drain()},30000);
  const recovered=read('wordlight_pending_cards_2g3_v1',null);
  if(recovered?.words?.length){enqueue(recovered);try{localStorage.removeItem('wordlight_pending_cards_2g3_v1')}catch{}}
  window.WordlightCloud={begin,card,round,leave,open,drain};updateStatus();if(queue.length)void drain();
})();
