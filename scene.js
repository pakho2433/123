/* =====================================================================
   星空跳跳問答 —— 《熊抱青春記》(Turning Red) 中文版故事問題
   如需修改題目，直接編輯下面 QUESTIONS 陣列即可。
===================================================================== */
const QUESTIONS = [
  { q:"主角美美一激動，就會變成咩動物？", a:["小紅熊貓","大棕熊","老虎"], c:0 },
  { q:"故事發生喺邊一個城市？", a:["紐約","多倫多","香港"], c:1 },
  { q:"美美屋企負責打理嘅係咩地方？", a:["餐廳","書店","家族宗祠"], c:2 },
  { q:"美美同朋友最最喜愛嘅樂隊叫咩名？", a:["4*Town","星星樂團","紅月天團"], c:0 },
  { q:"美美嘅媽媽叫咩名？", a:["阿花","阿明","阿珍"], c:1 },
  { q:"變身嘅能力係邊個傳落嚟㗎？", a:["鄰居婆婆","學校老師","祖先新怡"], c:2 },
  { q:"美美想冷靜落嚟、控制變身，佢會諗起邊個？", a:["佢嘅好朋友","電視卡通","雪糕"], c:0 },
  { q:"封印紅熊貓嘅儀式，要喺咩夜晚舉行？", a:["流星雨之夜","紅月（血月）之夜","除夕夜"], c:1 },
  { q:"同學仔畀錢影相、買畫，係想見到咩？", a:["美美跳舞","美美唱歌","可愛嘅紅熊貓"], c:2 },
  { q:"故事最後，美美點樣對待自己嘅紅熊貓？", a:["接受佢，同佢做朋友","永遠封印佢","送畀動物園"], c:0 },
];

/* ---------------- basic setup ---------------- */
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x141450, 40, 160);
const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, .1, 400);

function resize(){ renderer.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize',resize); resize();

/* ---------------- sky ---------------- */
{
  const skyGeo = new THREE.SphereGeometry(200,32,20);
  const skyMat = new THREE.ShaderMaterial({
    side:THREE.BackSide,
    uniforms:{},
    vertexShader:`varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec3 vP;
      void main(){
        float h = normalize(vP).y*.5+.5;
        vec3 bottom = vec3(.16,.10,.34);
        vec3 mid    = vec3(.07,.07,.24);
        vec3 top    = vec3(.02,.02,.10);
        vec3 col = mix(bottom, mid, smoothstep(0.,.5,h));
        col = mix(col, top, smoothstep(.5,1.,h));
        gl_FragColor = vec4(col,1.);
      }`
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  scene.add(sky);
}

/* background twinkling stars */
let bgStars;
{
  const n=700, pos=new Float32Array(n*3), ph=new Float32Array(n);
  for(let i=0;i<n;i++){
    const r=120+Math.random()*70, t=Math.random()*Math.PI*2, u=Math.random()*2-1;
    pos[i*3]=r*Math.sqrt(1-u*u)*Math.cos(t); pos[i*3+1]=Math.abs(r*u)*0.9+2; pos[i*3+2]=r*Math.sqrt(1-u*u)*Math.sin(t);
    ph[i]=Math.random()*Math.PI*2;
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setAttribute('ph',new THREE.BufferAttribute(ph,1));
  const m=new THREE.ShaderMaterial({
    transparent:true, depthWrite:false,
    uniforms:{t:{value:0}},
    vertexShader:`attribute float ph; uniform float t; varying float vA;
      void main(){ vA=.4+.6*abs(sin(t*1.5+ph));
      vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=140./-mv.z*(1.+.6*sin(ph*7.)); gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`varying float vA;
      void main(){ float d=length(gl_PointCoord-.5); if(d>.5) discard;
      gl_FragColor=vec4(1.,.97,.85, vA*smoothstep(.5,.05,d)); }`
  });
  bgStars=new THREE.Points(g,m); scene.add(bgStars);
}

/* moon */
{
  const moon=new THREE.Mesh(new THREE.SphereGeometry(9,32,24),
    new THREE.MeshBasicMaterial({color:0xfff6d8}));
  moon.position.set(-70,70,-110); scene.add(moon);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({
    map:makeGlowTexture('#fff2c0'), transparent:true, opacity:.7, depthWrite:false}));
  glow.scale.set(46,46,1); glow.position.copy(moon.position); scene.add(glow);
}

function makeGlowTexture(color){
  const cv=document.createElement('canvas'); cv.width=cv.height=128;
  const ctx=cv.getContext('2d');
  const g=ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,color); g.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(cv);
}

/* lights */
const amb = new THREE.AmbientLight(0x8888cc,.65); scene.add(amb);
const moonLight = new THREE.DirectionalLight(0xcdd8ff,1.0);
moonLight.position.set(-30,60,20); moonLight.castShadow=true;
moonLight.shadow.mapSize.set(1024,1024);
moonLight.shadow.camera.left=-30; moonLight.shadow.camera.right=30;
moonLight.shadow.camera.top=30; moonLight.shadow.camera.bottom=-30;
scene.add(moonLight);
const warm = new THREE.PointLight(0xffc477,.6,40); scene.add(warm);

/* soft drifting clouds */
const clouds=[];
{
  const cmat=new THREE.MeshLambertMaterial({color:0xbdc7ff, transparent:true, opacity:.28});
  for(let i=0;i<14;i++){
    const grp=new THREE.Group();
    const k=2+Math.floor(Math.random()*3);
    for(let j=0;j<k;j++){
      const s=new THREE.Mesh(new THREE.SphereGeometry(2+Math.random()*2.4,10,8),cmat);
      s.position.set(j*2.6-k, Math.random()*.8, Math.random()*1.4); s.scale.y=.55;
      grp.add(s);
    }
    grp.position.set((Math.random()-.5)*120, 4+Math.random()*70, -20-Math.random()*70);
    grp.userData.speed=.4+Math.random()*.7;
    clouds.push(grp); scene.add(grp);
  }
}
