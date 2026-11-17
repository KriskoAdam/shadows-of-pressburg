(() => {
'use strict';
const $ = id => document.getElementById(id);
const status = $('loadStatus'), start = $('start'), overlay = $('overlay');
const canvas = $('renderCanvas');
const setStatus = s => { if(status) status.textContent=s; };
if (!window.BABYLON) {
  const s=document.createElement('script');
  s.src='https://cdn.babylonjs.com/babylon.js';
  s.onload=boot; s.onerror=()=>setStatus('Nepodarilo sa načítať 3D engine. Skontroluj internetové pripojenie.');
  document.head.appendChild(s);
} else boot();

function boot(){
try {
 const B=window.BABYLON;
 const engine=new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,adaptToDeviceRatio:true});
 engine.setHardwareScalingLevel(Math.min(1.5,1/Math.min(window.devicePixelRatio||1,1.5)));
 const scene=new B.Scene(engine);
 scene.clearColor=new B.Color4(.055,.075,.09,1);
 scene.collisionsEnabled=true;
 scene.gravity=new B.Vector3(0,-18,0);
 scene.fogMode=B.Scene.FOGMODE_EXP2; scene.fogDensity=.0038;
 scene.fogColor=new B.Color3(.30,.34,.34);
 const camera=new B.FreeCamera('followCamera',new B.Vector3(0,5,-9),scene);
 camera.minZ=.1; camera.maxZ=450; camera.fov=.82; camera.inputs.clear();
 const hemi=new B.HemisphericLight('skyFill',new B.Vector3(0,1,0),scene);
 hemi.intensity=.72; hemi.groundColor=new B.Color3(.24,.20,.16);
 const sun=new B.DirectionalLight('lateSun',new B.Vector3(-.45,-1,.35),scene);
 sun.position=new B.Vector3(65,90,-55); sun.intensity=2.1;
 const shadow=new B.ShadowGenerator(2048,sun); shadow.useBlurExponentialShadowMap=true; shadow.blurKernel=24; shadow.bias=.0005;
 const mat=(name,color,rough=.9,metal=0)=>{const m=new B.PBRMaterial(name,scene);m.albedoColor=B.Color3.FromHexString(color);m.roughness=rough;m.metallic=metal;return m;};
 const stone=mat('warm limestone','#938575'), pale=mat('aged plaster','#c0ae91'), dark=mat('timber','#49382b'), roof=mat('terracotta','#70483a'), roof2=mat('slate','#454b4d'), road=mat('cobblestone','#55534e'), water=mat('Danube','#263f48',.24,.25), iron=mat('iron','#343b3b',.42,.65), gold=mat('brass','#b18a4c',.3,.7), cloth=mat('traveller wool','#273d43'), skin=mat('skin','#b98968'), white=mat('linen','#d8cdb7'), red=mat('guard livery','#743b32'), green=mat('merchant green','#53634b');
 const ground=B.MeshBuilder.CreateGround('city ground',{width:230,height:230,subdivisions:2},scene);ground.position.y=-.15;ground.material=road;ground.checkCollisions=true;ground.receiveShadows=true;
 const river=B.MeshBuilder.CreateGround('Danube',{width:90,height:48},scene);river.position.set(0,-.11,73);river.material=water;
 const box=(name,pos,scale,material,collide=true)=>{const m=B.MeshBuilder.CreateBox(name,{width:scale[0],height:scale[1],depth:scale[2]},scene);m.position.set(...pos);m.material=material;m.checkCollisions=collide;m.receiveShadows=true;return m;};
 const cyl=(name,pos,diam,height,material)=>{const m=B.MeshBuilder.CreateCylinder(name,{diameter:diam,height,tessellation:12},scene);m.position.set(...pos);m.material=material;m.checkCollisions=true;return m;};
 const roofPeak=(x,z,w,d,y,material)=>{const r=B.MeshBuilder.CreateCylinder('roof ridge',{diameterTop:0,diameterBottom:Math.max(w,d)*1.48,height:Math.max(w,d)*.62,tessellation:4},scene);r.rotation.y=Math.PI/4;r.scaling.x=w/Math.max(w,d);r.scaling.z=d/Math.max(w,d);r.position.set(x,y,z);r.material=material;r.checkCollisions=true;return r;};
 // Medieval street grid and varied rooflines
 for(let x=-5;x<=5;x++) for(let z=-4;z<=3;z++){
   if(Math.abs(x)<=1&&z>=-1&&z<=1) continue;
   if(z===3&&Math.abs(x)<3) continue;
   const bx=x*17+(Math.sin(x*2+z)*2), bz=z*17+(Math.cos(z*3+x)*1.8);
   if(bz>48) continue;
   const w=11+((x*7+z*11+80)%4), d=10+((x*13-z*5+90)%4), h=9+((Math.abs(x*17+z*13))%9);
   const body=box('merchant house',[bx,h/2,bz],[w,h,d],(x+z)%3===0?pale:stone);
   const roofmat=(x+z)%2?roof:roof2;
   const r=B.MeshBuilder.CreateBox('pitched roof',{width:w+1.2,height:1.1,depth:d+1.2},scene);r.position.set(bx,h+.35,bz);r.rotation.z=.08;r.material=roofmat;r.checkCollisions=true;
   // timber framing and facade details
   for(let side of [-1,1]){
     const frontZ=bz+side*(d/2+.04);
     for(let yy=2.2;yy<h-1;yy+=3.0) for(let xx=-w/2+2;xx<w/2-1;xx+=3.2){
       const win=box('deep window',[bx+xx,yy,frontZ],[1.15,1.55,.12],dark,false);
       const pane=box('window shadow',[bx+xx,yy,frontZ+side*.08],[.78,1.16,.05],iron,false);
       box('window sill',[bx+xx,yy-.88,frontZ+side*.12],[1.35,.13,.28],pale,false);
     }
     box('timber beam',[bx,h*.55,frontZ],[w,.16,.18],dark,false);
     box('timber upright',[bx-w*.38,h*.5,frontZ],[.16,h*.9,.18],dark,false);
     box('timber upright',[bx+w*.38,h*.5,frontZ],[.16,h*.9,.18],dark,false);
   }
   // chimney
   box('chimney',[bx+w*.25,h+1.8,bz-d*.2],[1.1,3.1,1.1],stone);
 }
 // Broad market square, paving, fountain
 box('market paving',[0,.015,0],[37,.08,31],pale,false);
 cyl('market fountain base',[0,.5,2],4.4,1,stone);
 cyl('fountain basin',[0,1.05,2],3.4,.35,gold);
 cyl('fountain column',[0,2,2],.65,1.8,stone);
 const fountainWater=cyl('fountain water',[0,2.95,2],1.5,.08,water);
 // St Michael's Gate landmark
 box('Michael gate tower',[0,12,-35],[11,24,10],stone);
 box('gate passage',[0,3,-29.8],[5.8,6,1.1],dark,false);
 box('gate upper ledge',[0,24.5,-35],[13,1,12],pale);
 const gateRoof=roofPeak(0,-35,13,12,29,roof);
 for(let i=-1;i<=1;i++) box('gate slit window',[i*2.7,17,-29.8],[.65,2.8,.2],dark,false);
 // St Martin cathedral and tower
 box('cathedral nave',[-35,8,-13],[34,16,17],pale);
 const naveRoof=roofPeak(-35,-13,36,19,18,roof2);
 box('cathedral transept',[-35,10,-13],[13,20,22],stone);
 box('cathedral tower',[-48,18,-13],[8,36,9],stone);
 roofPeak(-48,-13,9,9,40,roof2);
 for(let y=6;y<28;y+=5) box('cathedral lancet',[-43.85,y,-13],[.15,2.8,1.1],dark,false);
 // Castle on hill
 const hill=B.MeshBuilder.CreateSphere('castle hill',{diameter:1,segments:24},scene);hill.scaling.set(30,10,23);hill.position.set(-48,5,40);hill.material=mat('hill grass','#39493c');hill.checkCollisions=true;
 box('Pressburg castle',[ -48,18,40],[31,22,24],pale);
 for(const [x,z] of [[-63,29],[-33,29],[-63,51],[-33,51]]){box('castle tower',[x,25,z],[7,29,7],stone);roofPeak(x,z,8,8,42,roof2);}
 box('castle inner keep',[-48,32,40],[13,12,12],stone);
 // Docks and boats
 for(let i=0;i<4;i++){box('dock plank',[22+i*2,.1,47],[1.8,.35,18],dark,false);}
 const boat=box('merchant barge',[28,.15,58],[7,.65,16],dark,false);boat.rotation.y=.12;
 box('mast',[28,5,58],[.25,10,.25],dark,false);
 // lamps, banners and street clutter
 for(let x=-4;x<=4;x++)for(let z=-3;z<=2;z++){
   if((x+z)%2===0){const px=x*17+7,pz=z*17+6;if(pz<43){cyl('lamp post',[px,2.3,pz],.16,4.6,iron);box('lantern',[px,4.5,pz],[.65,.75,.65],gold,false);}}
 }
 for(let i=0;i<12;i++){const x=-23+(i%6)*9,z=-17+Math.floor(i/6)*8;box('market stall canopy',[x,3,z],[5,.25,4],i%2?red:green,false);box('market stall table',[x,1.5,z],[4.6,.5,3.6],dark,false);}
 // Character factory with articulated simple rig
 function person(name,x,z,coat,scale=1){
   const root=new B.TransformNode(name,scene);root.position.set(x,0,z);
   const part=(n,p,s,m)=>{const o=B.MeshBuilder.CreateBox(n,{width:s[0],height:s[1],depth:s[2]},scene);o.parent=root;o.position.set(...p);o.material=m;return o;};
   const torso=part(name+' coat',[0,1.42,0],[.72,1.05,.4],coat);
   const head=B.MeshBuilder.CreateSphere(name+' head',{diameter:.48,segments:12},scene);head.parent=root;head.position.y=2.25;head.material=skin;
   const hat=part(name+' cap',[0,2.53,0],[.58,.16,.58],dark);
   const armL=part(name+' arm L',[-.48,1.48,0],[.22,.86,.24],coat),armR=part(name+' arm R',[.48,1.48,0],[.22,.86,.24],coat);
   armL.setPivotPoint(new B.Vector3(0,.36,0));armR.setPivotPoint(new B.Vector3(0,.36,0));
   const legL=part(name+' leg L',[-.2,.52,0],[.27,1,.3],dark),legR=part(name+' leg R',[.2,.52,0],[.27,1,.3],dark);
   legL.setPivotPoint(new B.Vector3(0,.42,0));legR.setPivotPoint(new B.Vector3(0,.42,0));
   [torso,head,hat,armL,armR,legL,legR].forEach(m=>shadow.addShadowCaster(m));
   return {root,armL,armR,legL,legR,phase:Math.random()*6.28,alive:true};
 }
 const player=person('Matej Varga',0,8,cloth,1);player.root.position.y=0;
 // Collision capsule proxy; visible rig follows proxy
 const collider=B.MeshBuilder.CreateCapsule('player collision',{height:2.2,radius:.42},scene);
 collider.isVisible=false;collider.checkCollisions=true;collider.ellipsoid=new B.Vector3(.48,1.05,.48);collider.ellipsoidOffset=new B.Vector3(0,1.05,0);collider.position.set(0,0,8);
 const anna=person('Anna',-10,-4,green);const guards=[person('Guard A',10,-18,red),person('Guard B',-20,14,red),person('Guard C',26,25,red)];
 const civilians=[person('Merchant',8,7,white),person('Citizen',-13,8,green),person('Dockworker',20,39,white),person('Citizen 2',-4,-14,white)];
 const allNPC=[anna,...guards,...civilians];
 // Props receive and cast shadows
 shadow.addShadowCaster(collider);ground.receiveShadows=true;
 // UI / state
 let started=false,paused=false,hp=100,alert=0,objective=0,dialogueUntil=0,attackUntil=0,jumpVelocity=0,onGround=true,stealth=false,sprinting=false;
 let yaw=Math.PI, pitch=.12,moveX=0,moveY=0,lookX=0,lookY=0,lastTime=performance.now(),toastUntil=0;
 const toast=t=>{$('toast').textContent=t;toastUntil=performance.now()+2600;};
 const updateUI=()=>{$('hp').style.width=hp+'%';$('alert').textContent='POZORNOSŤ STRÁŽÍ: '+(alert>70?'VYSOKÁ':alert>25?'ZVÝŠENÁ':'NÍZKA');$('objective').textContent=['Nájdi Annu pri rybnom trhu.','Získaj od Anny zapečatený list.','Dostaň sa k mestskému archívu.','Strias prenasledovateľov a unikni.'][objective]||'Kapitola dokončená';};
 updateUI();
 // Input: keyboard, pointer lock, touch joystick, touch camera, gamepad
 const keys={};window.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&started)pauseGame();if(e.code==='KeyC')stealth=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight')sprinting=true;});
 window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyC')stealth=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')sprinting=false;});
 canvas.addEventListener('click',()=>{if(started&&!paused&&document.pointerLockElement!==canvas&&matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.();});
 document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&started&&!paused){yaw+=e.movementX*.0024;pitch=B.Scalar.Clamp(pitch+e.movementY*.0018,-.22,.62);}});
 let joyPointer=null,lookPointer=null,joyOrigin=null,lastLook=null;
 const stick=$('stick'),nub=$('nub'),stickZone=$('stickZone'),lookZone=$('lookZone');
 stickZone.addEventListener('pointerdown',e=>{if(!started||paused)return;joyPointer=e.pointerId;stickZone.setPointerCapture(e.pointerId);const r=stick.getBoundingClientRect();joyOrigin={x:r.left+r.width/2,y:r.top+r.height/2};moveJoy(e);});
 function moveJoy(e){if(e.pointerId!==joyPointer||!joyOrigin)return;const dx=e.clientX-joyOrigin.x,dy=e.clientY-joyOrigin.y,len=Math.hypot(dx,dy),max=37,k=len>max?max/len:1;moveX=dx/max;moveY=-dy/max;nub.style.transform='translate('+dx*k+'px,'+dy*k+'px)';}
 stickZone.addEventListener('pointermove',moveJoy);const endJoy=e=>{if(e.pointerId===joyPointer){joyPointer=null;moveX=moveY=0;nub.style.transform='';}};stickZone.addEventListener('pointerup',endJoy);stickZone.addEventListener('pointercancel',endJoy);
 lookZone.addEventListener('pointerdown',e=>{if(!started||paused)return;lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};lookZone.setPointerCapture(e.pointerId);});
 lookZone.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer||!lastLook)return;const dx=e.clientX-lastLook.x,dy=e.clientY-lastLook.y;yaw+=dx*.008;pitch=B.Scalar.Clamp(pitch+dy*.004,-.22,.62);lastLook={x:e.clientX,y:e.clientY};});
 const endLook=e=>{if(e.pointerId===lookPointer){lookPointer=null;lastLook=null;}};lookZone.addEventListener('pointerup',endLook);lookZone.addEventListener('pointercancel',endLook);
 function bindAction(id,fn){const el=$(id);if(!el)return;el.addEventListener('pointerdown',e=>{e.preventDefault();if(started&&!paused)fn();});}
 function jump(){if(onGround){jumpVelocity=7.3;onGround=false;}}
 function attack(){if(performance.now()<attackUntil)return;attackUntil=performance.now()+560;player.armR.rotation.x=-1.6;setTimeout(()=>player.armR.rotation.x=0,180);let hit=false;for(const g of guards){if(g.alive&&B.Vector3.Distance(player.root.position,g.root.position)<3.2){g.alive=false;g.root.setEnabled(false);hit=true;}}if(hit){toast('Strážnik zneškodnený.');if(objective===3)alert=Math.max(0,alert-25);}else toast('Útok minul cieľ.');}
 function interact(){if(B.Vector3.Distance(player.root.position,anna.root.position)<4){if(objective===0){objective=1;toast('Anna: „List je ukrytý. Vezmi si ho.“');}else if(objective===1){objective=2;toast('Získal si zapečatený list. Zamier k archívu.');}else toast('Anna: „Ponáhľaj sa, stráže sú blízko.“');updateUI();return;}if(objective===2&&B.Vector3.Distance(player.root.position,new B.Vector3(0,0,-35))<12){objective=3;toast('Archív je otvorený. Stráže ťa spozorovali!');alert=65;updateUI();return;}toast('V blízkosti nie je nič na preskúmanie.');}
 function climb(){if(!onGround){jumpVelocity=5.8;toast('Výstup');}else{jumpVelocity=5.8;onGround=false;}}
 function dodge(){const dir=new B.Vector3(Math.sin(yaw),0,Math.cos(yaw));collider.moveWithCollisions(dir.scale(-3.8));}
 bindAction('jump',jump);bindAction('attack',attack);bindAction('interact',interact);bindAction('climb',climb);bindAction('dodge',dodge);bindAction('stealth',()=>{stealth=!stealth;toast(stealth?'Plíženie aktivované':'Plíženie vypnuté');});
 $('pause').addEventListener('click',pauseGame);$('resume').addEventListener('click',()=>{paused=false;$('pauseScreen').style.display='none';$('pause').style.display='block';lastTime=performance.now();});
 function pauseGame(){if(!started)return;paused=true;$('pauseScreen').style.display='flex';$('pause').style.display='none';if(document.pointerLockElement)document.exitPointerLock();}
 start.addEventListener('click',()=>{if(start.disabled)return;started=true;overlay.style.display='none';$('pause').style.display='block';toast('Prešporok, rok 1567. Nájdite Annu.');if(matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.();});
 start.disabled=false;start.textContent='ZAČAŤ HRU';setStatus('3D svet je pripravený.');$('errorBox').style.display='none';
 // Camera, movement and world simulation
 const vForward=new B.Vector3(),vRight=new B.Vector3();
 function update(dt,t){
   if(!started||paused)return;
   const gp=navigator.getGamepads?.()[0];let ix=moveX,iy=moveY;
   if(keys.KeyW||keys.ArrowUp)iy+=1;if(keys.KeyS||keys.ArrowDown)iy-=1;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
   if(gp){ix+=gp.axes[0]||0;iy-=gp.axes[1]||0;if(gp.buttons[0]?.pressed)jump();}
   if(keys.Space)jump();if(keys.KeyE){interact();keys.KeyE=false;}if(keys.KeyF){attack();keys.KeyF=false;}if(keys.KeyQ){climb();keys.KeyQ=false;}if(keys.KeyX){dodge();keys.KeyX=false;}
   const mag=Math.hypot(ix,iy);if(mag>1){ix/=mag;iy/=mag;}
   const speed=stealth?2.0:(sprinting||keys.ShiftLeft||keys.ShiftRight?7.1:4.25);
   const forward=new B.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new B.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
   const delta=forward.scale(iy*speed*dt).add(right.scale(ix*speed*dt));
   if(mag>.08){collider.moveWithCollisions(delta);player.root.rotation.y=Math.atan2(delta.x,delta.z);player.phase+=dt*(sprinting?13:8);player.legL.rotation.x=Math.sin(player.phase)*.65;player.legR.rotation.x=-Math.sin(player.phase)*.65;player.armL.rotation.x=-Math.sin(player.phase)*.45;player.armR.rotation.x=Math.sin(player.phase)*.45;}else{player.legL.rotation.x*=.8;player.legR.rotation.x*=.8;player.armL.rotation.x*=.8;player.armR.rotation.x*=.8;}
   jumpVelocity-=18*dt;collider.moveWithCollisions(new B.Vector3(0,jumpVelocity*dt,0));if(collider.position.y<=0){collider.position.y=0;jumpVelocity=0;onGround=true;}else onGround=false;
   player.root.position.copyFrom(collider.position);player.root.position.y=collider.position.y;
   // Guards investigate and pursue when visible / noisy
   for(const g of guards){if(!g.alive)continue;const dist=B.Vector3.Distance(g.root.position,player.root.position);if(dist<17&&(!stealth||dist<6)){alert=Math.min(100,alert+dt*(dist<7?28:9));const d=player.root.position.subtract(g.root.position);d.y=0;d.normalize();g.root.position.addInPlace(d.scale(dt*(dist<4?1.8:2.7)));g.root.rotation.y=Math.atan2(d.x,d.z);if(dist<1.8&&t%900<dt*1000){hp=Math.max(0,hp-7);$('hp').style.width=hp+'%';}}else{g.root.position.x+=Math.sin(t*.0003+g.phase)*dt*.25;}}
   if(alert>0)alert=Math.max(0,alert-dt*(stealth?8:2.4));updateUI();
   // Camera behind character; pitch controls elevation
   const distance=7.8, elev=2.8+pitch*5;
   const desired=player.root.position.add(new B.Vector3(-Math.sin(yaw)*distance,elev,-Math.cos(yaw)*distance));
   camera.position=B.Vector3.Lerp(camera.position,desired,1-Math.pow(.0008,dt));
   camera.setTarget(player.root.position.add(new B.Vector3(0,1.65,0)));
   if(performance.now()>toastUntil)$('toast').textContent='';
   if(hp<=0){hp=100;alert=0;collider.position.set(0,0,8);toast('Matej sa vrátil na bezpečné miesto.');}
 }
 scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),dt=Math.min(.04,(now-lastTime)/1000);lastTime=now;update(dt,now);});
 // Environment polish: sky gradient, sun disc, subtle particles
 const sky=B.MeshBuilder.CreateSphere('sky dome',{diameter:420,segments:24},scene);sky.isPickable=false;sky.infiniteDistance=true;sky.material=new B.StandardMaterial('sky material',scene);sky.material.backFaceCulling=false;sky.material.disableLighting=true;sky.material.emissiveColor=new B.Color3(.18,.25,.29);sky.material.alpha=.18;
 // Add shadows to all static architecture
 scene.meshes.forEach(m=>{if(m.checkCollisions&&m!==ground&&m!==collider)shadow.addShadowCaster(m);});
 engine.runRenderLoop(()=>{if(!engine.isDisposed())scene.render();});
 window.addEventListener('resize',()=>engine.resize());
 window.addEventListener('contextmenu',e=>e.preventDefault());
 setStatus('Svet Prešporka bol úspešne načítaný.');
} catch(err) {
 console.error(err);setStatus('Chyba 3D enginu: '+err.message);
 const eb=$('errorBox');eb.style.display='block';eb.textContent=String(err.stack||err);
}
}
})();