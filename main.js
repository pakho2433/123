/* =====================================================================
   MAIN LOOP
===================================================================== */
let last=performance.now();
let animT=0;
function loop(){
  requestAnimationFrame(loop);
  const now=performance.now();
  const dt=Math.min(.033,(now-last)/1000); last=now;
  const t=now/1000;
  animT+=dt;
  bgStars.material.uniforms.t.value=t;
  clouds.forEach(c=>{ c.position.x+=c.userData.speed*dt; if(c.position.x>70)c.position.x=-70; });
  platforms.forEach(p=>{ if(p.mesh){ p.mesh.position.y=p.baseY+Math.sin(t*1.4+p.x)*0.18; p.y=p.mesh.position.y;
    if(p.glow)p.glow.position.y=p.y+.2; if(p.label)p.label.position.y=p.y+2.5; }});
  updateBursts(dt);

  if(G.running){
    /* powers */
    if(G.power && t>G.powerEnd) endPower();
    const isWings=G.power==='wings', isGiant=G.power==='giant', isCat=G.power==='cat';
    const targetScale=isGiant?1.7:1;
    player.scale.lerp(new THREE.Vector3(targetScale,targetScale,targetScale),.12);

    /* movement */
    const mv=new THREE.Vector3();
    if(keys['ArrowLeft'])mv.x-=1;
    if(keys['ArrowRight'])mv.x+=1;
    if(keys['ArrowUp'])mv.z-=1;
    if(keys['ArrowDown'])mv.z+=1;
    if(mv.lengthSq()>0){ mv.normalize(); G.facing=Math.atan2(mv.x,mv.z); }
    const spd=SPEED*(isGiant?1.1:1);
    G.vel.x=mv.x*spd; G.vel.z=mv.z*spd;

    /* jump */
    const maxJumps=isCat?2:1;
    if(keys['Space'] && !G.jumpLock){
      if(G.onGround || G.jumpsUsed<maxJumps){
        const jv=JUMP_V*(isWings?1.25:1)*(isGiant?1.2:1);
        G.vel.y=jv; G.onGround=false; G.jumpsUsed++;
        burst(G.pos.x,G.pos.y+.2,G.pos.z,0xbfe0ff,10);
      }
      G.jumpLock=true;
    }
    if(!keys['Space']) G.jumpLock=false;

    /* gravity */
    let g=GRAVITY;
    if(isWings && G.vel.y<0) g=GRAVITY*.35;   /* glide */
    G.vel.y-=g*dt;
    if(isWings) G.vel.y=Math.max(G.vel.y,-6);

    const prevY=G.pos.y;
    G.pos.addScaledVector(G.vel,dt);

    /* platform collision (landing from above) */
    G.onGround=false;
    if(G.vel.y<=0){
      for(const p of platforms){
        if(p.broken) continue;
        const dx=G.pos.x-p.x, dz=G.pos.z-p.z;
        if(dx*dx+dz*dz > p.r*p.r) continue;
        const top=p.y+(p.isBox?0:.4);
        if(prevY>=top-.05 && G.pos.y<=top){
          G.pos.y=top; G.vel.y=0; G.onGround=true; G.groundedPlat=p;
          onLand(p);
          break;
        }
      }
    }
    if(G.onGround) G.jumpsUsed=0;

    /* fell too far? */
    if(G.pos.y < G.checkpoint.y-14 && !G.won && !G.dead){
      if(!G.fallPenalty){ G.fallPenalty=true; loseLife(); showToast('跌落嚟喇！','#ff8a8a'); }
      if(G.pos.y < G.checkpoint.y-22){ respawn(); G.fallPenalty=false; }
    }

    /* boy animation */
    player.position.copy(G.pos);
    player.rotation.y += (G.facing-player.rotation.y)*.2;
    const moving=mv.lengthSq()>0 && G.onGround;
    const swing=moving?Math.sin(animT*11)*.7:0;
    boyParts.armL.rotation.x=swing; boyParts.armR.rotation.x=-swing;
    boyParts.legL.rotation.x=-swing*.8; boyParts.legR.rotation.x=swing*.8;
    if(!G.onGround){ boyParts.armL.rotation.x=-2.4; boyParts.armR.rotation.x=-2.4; }
    if(boyParts.wingL.visible){
      const f=Math.sin(animT*14)*.5;
      boyParts.wingL.rotation.z=f*.4; boyParts.wingR.rotation.z=-f*.4;
    }
    boyParts.tail.rotation.z=Math.sin(animT*4)*.3;

    /* HUD power line */
    document.querySelector('#powerBox .hudbox').innerHTML='🖱️ 法寶：'+powerLabel();
  }

  /* camera follow */
  G.camY += (G.pos.y+4.5-G.camY)*.06;
  const camTarget=new THREE.Vector3(G.pos.x*.6, G.camY, G.pos.z+13);
  camera.position.lerp(camTarget,.08);
  camera.lookAt(G.pos.x*.6, G.pos.y+2, G.pos.z);
  warm.position.set(G.pos.x,G.pos.y+3,G.pos.z+2);
  moonLight.target=player;

  renderer.render(scene,camera);
}
loop();

/* ---------------- start ---------------- */
document.getElementById('startBtn').addEventListener('click',startGame);
document.getElementById('nameInput').addEventListener('keydown',e=>{ if(e.key==='Enter') startGame(); });
function startGame(){
  const name=document.getElementById('nameInput').value.trim();
  if(!name){ document.getElementById('nameInput').placeholder='要先輸入名字呀！'; return; }
  G.name=name;
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('hud').style.display='block';
  document.getElementById('playerTag').textContent='🐻 '+name;
  renderLives();
  buildLevel();
  G.pos.set(0,2,0); G.vel.set(0,0,0);
  G.startTime=performance.now();
  G.running=true;
}
