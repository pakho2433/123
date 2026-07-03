/* ---------------- cute red-panda bear character ---------------- */
const player = new THREE.Group();
let boyParts = {};
let furMat, darkMat, creamMat;
function buildBear(){
  furMat  =new THREE.MeshToonMaterial({color:0xd96a3b});   // russet red fur
  darkMat =new THREE.MeshToonMaterial({color:0x53301f});   // dark limbs
  creamMat=new THREE.MeshToonMaterial({color:0xfff1dc});   // cream face/belly
  const noseMat=new THREE.MeshToonMaterial({color:0x2b1a12});
  const blushMat=new THREE.MeshBasicMaterial({color:0xff9d9d});
  const eyeMat=new THREE.MeshBasicMaterial({color:0x1c1410});
  const hiMat=new THREE.MeshBasicMaterial({color:0xffffff});

  /* chubby body */
  const body=new THREE.Mesh(new THREE.SphereGeometry(.62,22,18),furMat);
  body.position.y=.95; body.scale.set(1,.95,.9); body.castShadow=true;
  const belly=new THREE.Mesh(new THREE.SphereGeometry(.45,18,14),creamMat);
  belly.position.set(0,.92,-.24); belly.scale.set(.85,.85,.55);

  /* big round head */
  const head=new THREE.Mesh(new THREE.SphereGeometry(.56,24,20),furMat);
  head.position.y=1.92; head.scale.set(1.05,.95,.95); head.castShadow=true;

  /* cream eye patches + muzzle */
  const patchGeo=new THREE.SphereGeometry(.17,12,10);
  const pL=new THREE.Mesh(patchGeo,creamMat); pL.position.set(-.22,1.98,-.44); pL.scale.set(1,1.25,.5);
  const pR=pL.clone(); pR.position.x=.22;
  const muzzle=new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),creamMat);
  muzzle.position.set(0,1.78,-.46); muzzle.scale.set(1.05,.8,.7);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.085,10,8),noseMat);
  nose.position.set(0,1.86,-.62); nose.scale.set(1.2,.85,.8);

  /* big sparkly eyes */
  const eGeo=new THREE.SphereGeometry(.085,12,10);
  const eL=new THREE.Mesh(eGeo,eyeMat); eL.position.set(-.21,2.0,-.5);
  const eR=eL.clone(); eR.position.x=.21;
  const hGeo=new THREE.SphereGeometry(.032,8,8);
  const hL=new THREE.Mesh(hGeo,hiMat); hL.position.set(-.185,2.035,-.565);
  const hR=hL.clone(); hR.position.x=.235;

  /* blush cheeks */
  const cL=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),blushMat); cL.position.set(-.34,1.82,-.4); cL.scale.z=.35;
  const cR=cL.clone(); cR.position.x=.34;

  /* round ears with cream inner */
  const earL=new THREE.Mesh(new THREE.SphereGeometry(.19,14,12),furMat); earL.position.set(-.4,2.42,-.05);
  const earR=earL.clone(); earR.position.x=.4;
  const eiL=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),creamMat); eiL.position.set(-.4,2.43,-.15); eiL.scale.z=.5;
  const eiR=eiL.clone(); eiR.position.x=.4;

  /* stubby arms & legs */
  const armGeo=typeof THREE.CapsuleGeometry==='function'
    ? new THREE.CapsuleGeometry(.13,.3,6,10)
    : new THREE.CylinderGeometry(.13,.13,.5,10);
  const aL=new THREE.Mesh(armGeo,darkMat); aL.position.set(-.6,1.05,0); aL.castShadow=true;
  const aR=aL.clone(); aR.position.x=.6;
  const legGeo=new THREE.CylinderGeometry(.15,.16,.42,10);
  const lL=new THREE.Mesh(legGeo,darkMat); lL.position.set(-.24,.32,0); lL.castShadow=true;
  const lR=lL.clone(); lR.position.x=.24;
  const fGeo=new THREE.SphereGeometry(.15,10,8);
  const fL=new THREE.Mesh(fGeo,creamMat); fL.position.set(-.24,.12,-.06); fL.scale.set(1,.6,1.25);
  const fR=fL.clone(); fR.position.x=.24;

  /* ringed red-panda tail */
  const tail=new THREE.Group();
  for(let i=0;i<5;i++){
    const seg=new THREE.Mesh(new THREE.SphereGeometry(.2-.015*i,12,10), i%2===0?furMat:creamMat);
    seg.position.set(0,.05*i,.2+.24*i);
    tail.add(seg);
  }
  tail.position.set(0,.85,.35); tail.rotation.x=-.5;

  /* whiskers for cat power (hidden) */
  const whMat=new THREE.MeshBasicMaterial({color:0xffffff});
  const whGeo=new THREE.CylinderGeometry(.008,.008,.42,4);
  const whiskers=new THREE.Group();
  for(const s of [-1,1]) for(const dy of [-.03,.03]){
    const w=new THREE.Mesh(whGeo,whMat);
    w.rotation.z=Math.PI/2; w.rotation.y=s*.25;
    w.position.set(s*.32,1.8+dy,-.5);
    whiskers.add(w);
  }
  whiskers.visible=false;

  /* wings (hidden by default) */
  const wingMat=new THREE.MeshToonMaterial({color:0xfff3c9, transparent:true, opacity:.92, side:THREE.DoubleSide});
  const wingShape=new THREE.Shape();
  wingShape.moveTo(0,0); wingShape.quadraticCurveTo(1.1,.7,1.5,.15);
  wingShape.quadraticCurveTo(1.0,.05,.9,-.25); wingShape.quadraticCurveTo(.45,-.15,0,0);
  const wingGeo=new THREE.ShapeGeometry(wingShape);
  const wL=new THREE.Mesh(wingGeo,wingMat); wL.position.set(-.25,1.35,.4); wL.rotation.y=Math.PI*.85; wL.visible=false;
  const wR=new THREE.Mesh(wingGeo,wingMat); wR.position.set(.25,1.35,.4); wR.rotation.y=Math.PI*.15; wR.visible=false;

  player.add(body,belly,head,pL,pR,muzzle,nose,eL,eR,hL,hR,cL,cR,earL,earR,eiL,eiR,
             aL,aR,lL,lR,fL,fR,tail,whiskers,wL,wR);
  boyParts={armL:aL,armR:aR,legL:lL,legR:lR,earL,earR,tail,whiskers,wingL:wL,wingR:wR,head,body};
}
buildBear();
scene.add(player);

/* ---------------- star platforms ---------------- */
function makeStarShape(outer,inner){
  const s=new THREE.Shape();
  for(let i=0;i<10;i++){
    const r=i%2===0?outer:inner, a=i/10*Math.PI*2-Math.PI/2;
    const x=Math.cos(a)*r, y=Math.sin(a)*r;
    i===0?s.moveTo(x,y):s.lineTo(x,y);
  }
  s.closePath(); return s;
}
const starGeo = new THREE.ExtrudeGeometry(makeStarShape(2.1,.95),{depth:.5,bevelEnabled:true,bevelSize:.16,bevelThickness:.16,bevelSegments:2});
starGeo.rotateX(-Math.PI/2);

function makeLabelSprite(text, color){
  const cv=document.createElement('canvas'); cv.width=512; cv.height=140;
  const ctx=cv.getContext('2d');
  ctx.font='bold 58px "PingFang TC","Microsoft JhengHei",sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  const w=Math.min(490, ctx.measureText(text).width+56);
  ctx.fillStyle='rgba(15,15,60,.78)';
  roundRect(ctx,(512-w)/2,18,w,104,34); ctx.fill();
  ctx.strokeStyle=color; ctx.lineWidth=5; roundRect(ctx,(512-w)/2,18,w,104,34); ctx.stroke();
  ctx.fillStyle='#ffffff'; ctx.fillText(text,256,72);
  const tex=new THREE.CanvasTexture(cv); tex.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex, transparent:true, depthWrite:false}));
  sp.scale.set(6.4,1.75,1);
  return sp;
}
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

const starColors=[0xffd75e,0xff9ecb,0x8fd3ff];
let platforms=[];          // {mesh,x,y,z,r,type,correct,label,glow,broken}
function addStarPlatform(x,y,z,color,opts={}){
  const mat=new THREE.MeshToonMaterial({color, emissive:color, emissiveIntensity:.32});
  const mesh=new THREE.Mesh(starGeo,mat);
  mesh.position.set(x,y,z); mesh.receiveShadow=true; mesh.castShadow=true;
  scene.add(mesh);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlowTexture('#'+new THREE.Color(color).getHexString()),transparent:true,opacity:.5,depthWrite:false}));
  glow.scale.set(8.5,8.5,1); glow.position.set(x,y+.2,z); scene.add(glow);
  const p={mesh,glow,x,y,z,r:2.3,type:opts.type||'plain',correct:!!opts.correct,broken:false,label:null,baseY:y};
  if(opts.text){
    const sp=makeLabelSprite(opts.text,'#'+new THREE.Color(color).getHexString());
    sp.position.set(x,y+2.5,z); scene.add(sp); p.label=sp;
  }
  platforms.push(p);
  return p;
}
function removePlatform(p){
  scene.remove(p.mesh); scene.remove(p.glow);
  if(p.label) scene.remove(p.label);
  p.broken=true;
}

/* ---------------- book castle ---------------- */
const castle=new THREE.Group();
function buildCastle(x,landingY,z){
  const y=landingY-1.3;
  castle.position.set(x,y,z);
  const bookColors=[0xd35d6e,0x5b8def,0x67c587,0xf2b134,0x9a6fd0];
  let h=0;
  for(let i=0;i<5;i++){
    const w=11-i*1.5;
    const book=new THREE.Mesh(new THREE.BoxGeometry(w,1.3,7-i*.7),
      new THREE.MeshToonMaterial({color:bookColors[i]}));
    book.position.y=h+.65; book.rotation.y=(Math.random()-.5)*.25;
    book.castShadow=true; book.receiveShadow=true;
    const pages=new THREE.Mesh(new THREE.BoxGeometry(w*.94,1.0,(7-i*.7)*.9),
      new THREE.MeshToonMaterial({color:0xfff6e0}));
    pages.position.copy(book.position); pages.position.x+=.15;
    castle.add(book,pages);
    h+=1.3;
  }
  /* towers */
  for(const sx of [-3.3,3.3]){
    const tw=new THREE.Mesh(new THREE.CylinderGeometry(1,1.15,4.4,12),
      new THREE.MeshToonMaterial({color:0xe8e2ff}));
    tw.position.set(sx,h+2.2,0); tw.castShadow=true;
    const roof=new THREE.Mesh(new THREE.ConeGeometry(1.4,2,12),
      new THREE.MeshToonMaterial({color:0xff6f9c}));
    roof.position.set(sx,h+5.4,0);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(.9,.55),
      new THREE.MeshBasicMaterial({color:0xffe27a,side:THREE.DoubleSide}));
    fl.position.set(sx+.45,h+6.1,0);
    castle.add(tw,roof,fl);
  }
  /* centre keep */
  const keep=new THREE.Mesh(new THREE.BoxGeometry(3.6,3.4,3),
    new THREE.MeshToonMaterial({color:0xf6efff}));
  keep.position.y=h+1.7;
  const kroof=new THREE.Mesh(new THREE.ConeGeometry(2.7,2.4,4),
    new THREE.MeshToonMaterial({color:0x7d90ff}));
  kroof.position.y=h+4.6; kroof.rotation.y=Math.PI/4;
  const door=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.3,16,1,false,0,Math.PI),
    new THREE.MeshToonMaterial({color:0x8a5a2b}));
  door.rotation.set(Math.PI/2,0,0); door.position.set(0,h+.9,-1.55);
  castle.add(keep,kroof,door);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlowTexture('#cbb3ff'),transparent:true,opacity:.55,depthWrite:false}));
  glow.scale.set(30,30,1); glow.position.y=h+2; castle.add(glow);
  scene.add(castle);
  /* landing pad platform record */
  platforms.push({mesh:null,glow:null,x,y:landingY,z,r:5.5,type:'castle',correct:false,broken:false,label:null,baseY:landingY,isBox:true});
}

/* ---------------- particles (sparkle burst) ---------------- */
const bursts=[];
function burst(x,y,z,color,count=26){
  const g=new THREE.BufferGeometry();
  const pos=new Float32Array(count*3), vel=[];
  for(let i=0;i<count;i++){
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    vel.push(new THREE.Vector3((Math.random()-.5)*6,Math.random()*6+2,(Math.random()-.5)*6));
  }
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.PointsMaterial({color,size:.28,transparent:true,opacity:1});
  const pts=new THREE.Points(g,m); scene.add(pts);
  bursts.push({pts,vel,life:1});
}
function updateBursts(dt){
  for(let i=bursts.length-1;i>=0;i--){
    const b=bursts[i]; b.life-=dt;
    const arr=b.pts.geometry.attributes.position.array;
    for(let j=0;j<b.vel.length;j++){
      b.vel[j].y-=9*dt;
      arr[j*3]+=b.vel[j].x*dt; arr[j*3+1]+=b.vel[j].y*dt; arr[j*3+2]+=b.vel[j].z*dt;
    }
    b.pts.geometry.attributes.position.needsUpdate=true;
    b.pts.material.opacity=Math.max(0,b.life);
    if(b.life<=0){ scene.remove(b.pts); bursts.splice(i,1); }
  }
}
