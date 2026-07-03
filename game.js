/* =====================================================================
   GAME STATE
===================================================================== */
const G = {
  running:false, name:'', lives:5, qIndex:0,
  pos:new THREE.Vector3(0,3,0), vel:new THREE.Vector3(),
  onGround:false, groundedPlat:null, checkpoint:new THREE.Vector3(0,0,0),
  facing:0, startTime:0, wrongCount:0,
  power:null, powerEnd:0, powerCooldown:0, jumpsUsed:0,
  falling:false, fallPenalty:false, won:false, dead:false, camY:5,
};
const GRAVITY=26, JUMP_V=13.5, SPEED=8.5;
const keys={};

addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  keys[e.code]=true;
});
addEventListener('keyup',e=>keys[e.code]=false);
function powerInput(e){
  if(!G.running) return;
  if(e && e.target && e.target.closest && e.target.closest('.card, #mobileControls')) return;
  tryPower();
}
addEventListener('pointerdown',powerInput);
addEventListener('keydown',e=>{ if(e.code==='KeyP') powerInput(e); });

/* touch controls for phones and tablets */
function bindHoldButton(button,key){
  const press=e=>{
    e.preventDefault(); e.stopPropagation();
    keys[key]=true; button.classList.add('active');
    if(button.setPointerCapture) button.setPointerCapture(e.pointerId);
  };
  const release=e=>{
    if(e){ e.preventDefault(); e.stopPropagation(); }
    keys[key]=false; button.classList.remove('active');
  };
  button.addEventListener('pointerdown',press);
  button.addEventListener('pointerup',release);
  button.addEventListener('pointercancel',release);
  button.addEventListener('lostpointercapture',release);
}
document.querySelectorAll('[data-key]').forEach(btn=>bindHoldButton(btn,btn.dataset.key));
document.getElementById('mobilePower').addEventListener('pointerdown',e=>{
  e.preventDefault(); e.stopPropagation(); tryPower();
});

/* ---------------- level layout ---------------- */
const LEVEL_RISE=3.1;
function buildLevel(){
  /* base star */
  const base=addStarPlatform(0,0,0,0xffe08a,{type:'base'});
  base.r=2.6;
  G.checkpoint.set(0,0,0);
  spawnQuestion(0);
}
function spawnQuestion(i){
  G.qIndex=i;
  const q=QUESTIONS[i];
  const order=[0,1,2].sort(()=>Math.random()-.5);
  const offsets=[-5,0,5];
  const origin=G.checkpoint;
  const targetY=origin.y+LEVEL_RISE;
  order.forEach((ansIdx,slot)=>{
    const x=origin.x+offsets[slot];
    const z=origin.z+(slot===1?-0.8:0.4);
    addStarPlatform(x,targetY,z,starColors[slot],
      {type:'answer', correct:ansIdx===q.c, text:q.a[ansIdx]});
  });
  document.getElementById('qNum').textContent=`第 ${i+1} / ${QUESTIONS.length} 題`;
  document.getElementById('qText').textContent=q.q;
  document.getElementById('progress').innerHTML=`⭐ 進度 ${i} / ${QUESTIONS.length}`;
}

/* ---------------- power-ups ---------------- */
const POWERS=[
  {id:'wings', name:'🪽 天使翅膀', desc:'跳得高、慢慢飄落'},
  {id:'giant', name:'💪 變大巨人', desc:'身體變大、彈跳力加強'},
  {id:'cat',   name:'🐱 變身小貓', desc:'可以二段跳！'},
];
function tryPower(){
  const now=performance.now()/1000;
  if(G.power) return;
  if(now<G.powerCooldown){ showToast('法寶充電中…','#aab6ff'); return; }
  const p=POWERS[Math.floor(Math.random()*POWERS.length)];
  G.power=p.id; G.powerEnd=now+60;
  applyPowerVisual(p.id,true);
  showToast(p.name+'！','#9dffc4');
  burst(G.pos.x,G.pos.y+1.5,G.pos.z,0x9dffc4,30);
}
function endPower(){
  applyPowerVisual(G.power,false);
  G.power=null;
  G.powerCooldown=performance.now()/1000+8;
}
function applyPowerVisual(id,on){
  if(id==='wings'){ boyParts.wingL.visible=on; boyParts.wingR.visible=on; }
  if(id==='cat'){ boyParts.whiskers.visible=on;
    furMat.color.set(on?0x9aa3bd:0xd96a3b); }
  if(id==='giant'){ /* scale handled in update */ }
  if(!on) player.scale.set(1,1,1);
}
function powerLabel(){
  const now=performance.now()/1000;
  if(G.power){
    const p=POWERS.find(p=>p.id===G.power);
    return `<span id="powerStatus">${p.name} 剩 ${Math.ceil(G.powerEnd-now)} 秒</span>`;
  }
  if(now<G.powerCooldown) return `<span id="powerStatus" style="color:#aab">充電中… ${Math.ceil(G.powerCooldown-now)} 秒</span>`;
  return `<span id="powerStatus">點擊滑鼠啟動</span>`;
}

/* ---------------- HUD helpers ---------------- */
function renderLives(){
  document.getElementById('lives').textContent='❤️'.repeat(G.lives)+'🖤'.repeat(5-G.lives);
}
let toastTimer=null;
function showToast(text,color){
  const t=document.getElementById('toast');
  t.textContent=text; t.style.color=color;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),1400);
}

/* ---------------- landing logic ---------------- */
function onLand(p){
  G.jumpsUsed=0;
  if(p.type==='base' && G.fallPenalty) G.fallPenalty=false;
  if(p.type==='answer' && !p.handled){
    p.handled=true;
    if(p.correct){
      burst(p.x,p.y+1,p.z,0xffe27a,34);
      showToast('答啱喇！✨','#ffe27a');
      G.checkpoint.set(p.x,p.y,p.z);
      /* remove sibling answer stars of this question */
      platforms.filter(o=>o.type==='answer'&&!o.broken&&o!==p).forEach(removePlatform);
      p.type='base';
      if(G.qIndex+1<QUESTIONS.length){ spawnQuestion(G.qIndex+1); }
      else {
        buildCastle(p.x,p.y+LEVEL_RISE,p.z);
        document.getElementById('qNum').textContent='全部答啱！';
        document.getElementById('qText').textContent='🏰 跳上天空書之城堡啦！';
        document.getElementById('progress').innerHTML=`⭐ 進度 ${QUESTIONS.length} / ${QUESTIONS.length}`;
      }
    } else {
      G.wrongCount++;
      showToast('答錯咗！💫','#ff8a8a');
      burst(p.x,p.y+1,p.z,0xff6b6b,30);
      removePlatform(p);
      G.groundedPlat=null; G.onGround=false;
      loseLife();
      G.fallPenalty=true; // already charged for the wrong answer; do not charge again while falling
    }
  }
  if(p.type==='castle' && !G.won){ win(); }
}
function loseLife(){
  G.lives--;
  renderLives();
  if(G.lives<=0){ gameOver(false); }
}
function respawn(){
  G.pos.copy(G.checkpoint); G.pos.y+=2;
  G.vel.set(0,0,0);
}

/* ---------------- end / results ---------------- */
function fmtTime(s){ const m=Math.floor(s/60), ss=Math.floor(s%60); return `${m}分${ss}秒`; }
function buildResult(won){
  const t=fmtTime((performance.now()-G.startTime)/1000);
  const answered = won ? QUESTIONS.length : G.qIndex;
  return {
    time:t, answered,
    text:`玩家：${G.name}
遊戲：星空跳跳問答（熊抱青春記）
結果：${won?'成功到達書之城堡 🏰':'挑戰失敗'}
完成題目：${answered} / ${QUESTIONS.length}
剩餘生命：${G.lives} / 5
答錯次數：${G.wrongCount}
用時：${t}
日期：${new Date().toLocaleString('zh-HK')}`
  };
}
function showEnd(won){
  const r=buildResult(won);
  document.getElementById('endTitle').textContent = won?'🏰 恭喜到達書之城堡！':'💫 挑戰失敗…';
  document.getElementById('resultBody').innerHTML =
    `玩家：<b>${G.name}</b><br>完成題目：<b>${r.answered} / ${QUESTIONS.length}</b><br>剩餘生命：<b>${G.lives} ❤️</b>　答錯：<b>${G.wrongCount}</b> 次<br>用時：<b>${r.time}</b>`;
  const mail=`mailto:yuetki1999@gmail.com?subject=${encodeURIComponent('星空跳跳問答成績 - '+G.name)}&body=${encodeURIComponent(r.text)}`;
  document.getElementById('mailLink').href=mail;
  document.getElementById('endScreen').classList.remove('hidden');
}
function win(){ G.won=true; G.running=false; burst(castle.position.x,castle.position.y+5,castle.position.z,0xffe27a,60); setTimeout(()=>showEnd(true),900); }
function gameOver(){ G.dead=true; G.running=false; setTimeout(()=>showEnd(false),700); }
