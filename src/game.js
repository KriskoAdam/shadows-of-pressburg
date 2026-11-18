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
 // Gobkit character rigs face local +Z, matching the movement vector.
 const RIG_YAW=0;
 const engine=new B.Engine(canvas,true,{preserveDrawingBuffer:false,stencil:true,adaptToDeviceRatio:true});
 engine.setHardwareScalingLevel(1/(window.devicePixelRatio||1));
 const scene=new B.Scene(engine);
 scene.clearColor=new B.Color4(.48,.56,.59,1);
 scene.collisionsEnabled=true;
 scene.gravity=new B.Vector3(0,-18,0);
 scene.fogMode=B.Scene.FOGMODE_EXP2; scene.fogDensity=.0019;
 scene.fogColor=new B.Color3(.42,.43,.40);
 const camera=new B.FreeCamera('followCamera',new B.Vector3(0,5,9),scene);
 camera.minZ=.2; camera.maxZ=450; camera.fov=.74; camera.inputs.clear();
 const cinematic=new B.DefaultRenderingPipeline('pressburgCinematic',true,scene,[camera]);
 cinematic.fxaaEnabled=true;cinematic.samples=1;
 cinematic.bloomEnabled=true;cinematic.bloomThreshold=.82;cinematic.bloomWeight=matchMedia('(pointer:coarse)').matches ? .08 : .16;cinematic.bloomKernel=48;
 scene.imageProcessingConfiguration.toneMappingEnabled=true;
 scene.imageProcessingConfiguration.toneMappingType=B.ImageProcessingConfiguration.TONEMAPPING_ACES;
 scene.imageProcessingConfiguration.exposure=1.05;scene.imageProcessingConfiguration.contrast=1.12;
 const hemi=new B.HemisphericLight('skyFill',new B.Vector3(0,1,0),scene);
 hemi.intensity=.68; hemi.groundColor=new B.Color3(.24,.20,.16);
 const sun=new B.DirectionalLight('lateSun',new B.Vector3(-.45,-1,.35),scene);
 sun.position=new B.Vector3(65,90,-55); sun.intensity=2.0;
 const shadow=new B.ShadowGenerator(matchMedia('(pointer:coarse)').matches?1024:2048,sun); shadow.useBlurExponentialShadowMap=true; shadow.blurKernel=28; shadow.bias=.0005;
 const mat=(name,color,rough=.9,metal=0)=>{const m=new B.PBRMaterial(name,scene);m.albedoColor=B.Color3.FromHexString(color);m.roughness=rough;m.metallic=metal;return m;};
 const stone=mat('warm limestone','#938575'), pale=mat('aged plaster','#c0ae91'), dark=mat('timber','#49382b'), roof=mat('terracotta','#70483a'), roof2=mat('slate','#454b4d'), road=mat('cobblestone','#55534e'), water=mat('Danube','#263f48',.24,.25), iron=mat('forged iron','#343b3b',.42,.65), gold=mat('aged brass','#b18a4c',.3,.7), cloth=mat('traveller wool','#273d43'), skin=mat('skin','#b98968'), white=mat('linen','#d8cdb7'), red=mat('guard livery','#743b32'), green=mat('merchant green','#53634b'), leather=mat('dark leather','#30251f',.78), steel=mat('tempered steel','#9ba5a4',.24,.82), blue=mat('indigo cloth','#283c55');
 // Procedural tile surfaces replace flat colour blocks with masonry, plaster, roof slate and worn cobbles.
 const texture=(name,base,kind)=>{
   const t=new B.DynamicTexture(name,{width:256,height:256},scene,false),c=t.getContext();
   c.fillStyle=base;c.fillRect(0,0,256,256);
   if(kind==='brick'||kind==='slate'){
     const rows=kind==='brick'?24:30,hh=256/rows;
     for(let y=0;y<rows;y++)for(let x=-1;x<8;x++){
       const ww=kind==='brick'?22:18,xx=x*ww+(y%2)*ww*.5;
       const shade=kind==='brick'?['#9b8d7b','#817666','#aa9a85','#726a61'][Math.floor(Math.random()*4)]:['#555d60','#3b4448','#62696a'][Math.floor(Math.random()*3)];
       c.fillStyle=shade;c.fillRect(xx+1,y*hh+1,ww-2,hh-2);
       c.strokeStyle='#292e30';c.lineWidth=2;c.strokeRect(xx+1,y*hh+1,ww-2,hh-2);
       c.fillStyle='#ffffff12';c.fillRect(xx+3,y*hh+3,ww-6,2);
     }
   } else if(kind==='cobble'){
     for(let y=0;y<256;y+=23)for(let x=0;x<256;x+=34){
       const xx=x+(Math.floor(y/23)%2)*17,shade=['#65625c','#4c4d4a','#777168','#595650'][Math.floor(Math.random()*4)];
       c.fillStyle=shade;c.beginPath();c.roundRect(xx+1,y+1,31,19,5);c.fill();
       c.strokeStyle='#292d2d';c.lineWidth=2;c.stroke();
     }
   } else {
     for(let i=0;i<1800;i++){const x=Math.random()*256,y=Math.random()*256,a=.025+Math.random()*.07;c.fillStyle='rgba(30,22,15,'+a+')';c.fillRect(x,y,1+Math.random()*3,1+Math.random()*3);}
   }
   t.update(false);t.wrapU=t.wrapV=B.Texture.WRAP_ADDRESSMODE;t.uScale=5;t.vScale=5;return t;
 };
 for(const [m,n,b,k] of [[stone,'limestone texture','#938575','brick'],[pale,'plaster texture','#b9a98e','noise'],[roof,'clay roof texture','#70483a','brick'],[roof2,'slate roof texture','#454b4d','slate'],[road,'cobble road texture','#55534e','cobble'],[dark,'oak timber texture','#49382b','noise']]){
   m.albedoTexture=texture(n,b,k);m.albedoColor=B.Color3.White();
 }

 const terrain=mat('worn earth and compacted soil','#756d5d');
 terrain.albedoTexture=texture('subtle worn earth','#756d5d','noise');
 terrain.albedoTexture.uScale=terrain.albedoTexture.vScale=9;
 terrain.albedoColor=B.Color3.White();
  const ground=B.MeshBuilder.CreateGround('city ground',{width:230,height:230,subdivisions:2},scene);ground.position.y=-.15;ground.material=terrain;ground.checkCollisions=true;ground.receiveShadows=true;
 // Start rendering as soon as the base scene exists; later construction errors must not leave a blank canvas.
 let renderFault=null; engine.runRenderLoop(()=>{try{scene.render();}catch(e){renderFault=e;const eb=$('errorBox');if(eb){eb.style.display='block';eb.textContent='Chyba vykresľovania: '+e.message;}}});
 const river=B.MeshBuilder.CreateGround('Danube',{width:110,height:58,subdivisions:32},scene);river.position.set(0,-.20,77);river.material=water;river.isPickable=false;
 const box=(name,pos,scale,material,collide=true)=>{const m=B.MeshBuilder.CreateBox(name,{width:scale[0],height:scale[1],depth:scale[2]},scene);m.position.set(...pos);m.material=material;m.checkCollisions=collide;m.receiveShadows=true;return m;};
 const cyl=(name,pos,diam,height,material)=>{const m=B.MeshBuilder.CreateCylinder(name,{diameter:diam,height,tessellation:12},scene);m.position.set(...pos);m.material=material;m.checkCollisions=true;return m;};
 const roofPeak=(x,z,w,d,y,material)=>{const r=B.MeshBuilder.CreateCylinder('roof ridge',{diameterTop:0,diameterBottom:Math.max(w,d)*1.48,height:Math.max(w,d)*.62,tessellation:4},scene);r.rotation.y=Math.PI/4;r.scaling.x=w/Math.max(w,d);r.scaling.z=d/Math.max(w,d);r.position.set(x,y,z);r.material=material;r.checkCollisions=true;return r;};
 // Modular asset placements for the historic town. Models are generated as GLB files during deployment.
 const housePlacements=[];
 for(let x=-5;x<=5;x++) for(let z=-4;z<=3;z++){
   if(Math.abs(x)<=1&&z>=-1&&z<=1)continue;
   if(z===3&&Math.abs(x)<3)continue;
   const bx=x*17+(Math.sin(x*2+z)*2),bz=z*17+(Math.cos(z*3+x)*1.8);
   if(bz>48)continue;
   const w=11+((x*7+z*11+80)%4),d=10+((x*13-z*5+90)%4),h=9+((Math.abs(x*17+z*13))%9);
   housePlacements.push({x:bx,z:bz,sx:w/10,sy:h/10,sz:d/9});
 }
 const loadAsset=(id)=>B.SceneLoader.LoadAssetContainerAsync("https://cdn.3dassets.dev/assets/"+id+"/v1/","model.glb",scene);
 const cloneAsset=(container,position,scale,name,rotation=0)=>{
   const instance=container.instantiateModelsToScene(n=>name+" "+n,false);
   const group=new B.TransformNode(name+" instance",scene);
   instance.rootNodes.forEach(node=>{node.parent=group;node.setEnabled(true);});
   group.position.copyFrom(position);group.scaling.copyFrom(scale);group.rotation.y=rotation;
   group.getChildMeshes(false).forEach(mesh=>{
     mesh.setEnabled(true);mesh.isVisible=true;mesh.isPickable=false;
     mesh.checkCollisions=false;mesh.receiveShadows=true;shadow.addShadowCaster(mesh);
     if(mesh.material&&mesh.material.getClassName?.()==="PBRMaterial"){mesh.material.environmentIntensity=1;mesh.material.roughness=Math.max(.55,mesh.material.roughness||.7);}
   });
   return group;
 };
 const assetPromise=Promise.all([
   loadAsset("28759"),loadAsset("28760"),
   loadAsset("28738"),loadAsset("28739"),loadAsset("28741"),
   loadAsset("28779"),loadAsset("28726"),
   loadAsset("28724"),loadAsset("28756"),loadAsset("28758"),
   loadAsset("28737"),loadAsset("28719")
 ]).then(([houseMedium,houseLarge,stallRed,stallBlue,stallCream,oakTree,cobble,gatehouse,church,tavern,well,wall])=>{
   // Real-scale CC0 GLBs: all pieces share metre units and +Y-up pivots.
   housePlacements.forEach((p,n)=>{
     const near=(x,z,r)=>Math.hypot(p.x-x,p.z-z)<r;
     if(near(0,-35,13)||near(-35,-13,15)||near(20,-25,13)||near(0,4,12)||near(-48,40,20))return;
     const asset=n%5===0?houseLarge:houseMedium;
     const rot=[0,Math.PI,Math.PI/2,-Math.PI/2][(n*7)%4];
     cloneAsset(asset,new B.Vector3(p.x,0,p.z),new B.Vector3(1,1,1),"Prešporský dom "+n,rot);
     const w=n%5===0?8.6:7.2,d=n%5===0?7:5.8,h=n%5===0?10.3:8.7;
     const hit=B.MeshBuilder.CreateBox("kolízia domu "+n,{width:w,height:h,depth:d},scene);
     hit.position.set(p.x,h/2,p.z);hit.isVisible=false;hit.checkCollisions=true;hit.isPickable=false;
   });
   // Distinct landmarks replace the former giant box-built silhouettes.
   cloneAsset(gatehouse,new B.Vector3(0,0,-35),new B.Vector3(1.8,1.8,1.8),"Michalská brána");
   cloneAsset(church,new B.Vector3(-35,0,-13),new B.Vector3(1.65,1.65,1.65),"Kostol svätého Martina");
   cloneAsset(tavern,new B.Vector3(20,0,-25),new B.Vector3(1.0,1.0,1.0),"Prešporská krčma");
   cloneAsset(well,new B.Vector3(0,0,4),new B.Vector3(1,1,1),"Mestská studňa");
   const stalls=[stallRed,stallBlue,stallCream,stallRed];
   const stallSpots=[[-15,-6],[15,-6],[-15,10],[15,10]];
   stalls.forEach((asset,n)=>cloneAsset(asset,new B.Vector3(stallSpots[n][0],0,stallSpots[n][1]),new B.Vector3(1,1,1),"Trhový stánok "+n));
   for(const [x,z,scale] of [[-69,-12,1],[-64,17,.9],[62,-22,1],[68,18,.95],[48,62,1],[-27,58,1.05]])
     cloneAsset(oakTree,new B.Vector3(x,0,z),new B.Vector3(scale,scale,scale),"Dub "+x+" "+z);
   // Continuous four-metre cobble modules: no floating loose slabs or overlapping giant texture stones.
   for(let x=-16;x<=16;x+=4)for(let z=-12;z<=12;z+=4)
     cloneAsset(cobble,new B.Vector3(x,-.15,z),new B.Vector3(1,1,1),"Dlažba námestia "+x+" "+z);
   for(let lane of [-4,0,4])for(let z=-60;z<=44;z+=4){
     if(Math.abs(z)<=12)continue;
     cloneAsset(cobble,new B.Vector3(lane,-.15,z),new B.Vector3(1,1,1),"Dlažba ulice "+lane+" "+z);
   }
   // Modular defensive wall, with correct four-metre spacing.
   for(let x=-80;x<=80;x+=4){
     cloneAsset(wall,new B.Vector3(x,0,-63),new B.Vector3(1,1,1),"Severný múr "+x);
     cloneAsset(wall,new B.Vector3(x,0,50),new B.Vector3(1,1,1),"Južný múr "+x);
   }
   for(let z=-59;z<=47;z+=4){
     cloneAsset(wall,new B.Vector3(-82,0,z),new B.Vector3(1,1,1),"Západný múr "+z,Math.PI/2);
     cloneAsset(wall,new B.Vector3(82,0,z),new B.Vector3(1,1,1),"Východný múr "+z,Math.PI/2);
   }
   setStatus("Načítané hotové GLB modely mesta, pamiatok, trhu a dlažby.");
 }).catch(err=>{console.error("CC0 GLB loading failed",err);setStatus("Chyba pri načítaní 3D modelov: "+err.message);throw err;});
 // The city, landmarks, streets and market are assembled from real-scale CC0 GLB assets above.
 // Character factory: sculpted silhouette, layered garments, articulated limbs and period equipment.
 function person(name,x,z,coat,scale=1,role='civilian'){
   const root=new B.TransformNode(name,scene);root.position.set(x,0,z);
   const mesh=(n,geo,parent,material,pos=[0,0,0])=>{const o=geo;o.name=n;o.parent=parent;o.position.set(...pos);o.material=material;o.receiveShadows=true;shadow.addShadowCaster(o);return o;};
   const capsule=(n,parent,pos,r,h,material)=>mesh(n,B.MeshBuilder.CreateCapsule(n,{height:h,radius:r,tessellation:14,subdivisions:4},scene),parent,material,pos);
   const sphere=(n,parent,pos,diam,material)=>mesh(n,B.MeshBuilder.CreateSphere(n,{diameter:diam,segments:16},scene),parent,material,pos);
   const boxPart=(n,parent,pos,size,material)=>mesh(n,B.MeshBuilder.CreateBox(n,{width:size[0],height:size[1],depth:size[2]},scene),parent,material,pos);
   const cylinder=(n,parent,pos,top,bottom,height,material)=>mesh(n,B.MeshBuilder.CreateCylinder(n,{diameterTop:top,diameterBottom:bottom,height,tessellation:14},scene),parent,material,pos);
   // Torso and tailored coat layers
   capsule(name+' tailored torso',root,[0,1.48,0],.34,1.28,coat);
   capsule(name+' lower tunic',root,[0,1.02,.015],.34,.82,role==='guard'?red:blue);
   if(role==='guard')boxPart(name+' front breastplate',root,[0,1.49,-.265],[.36,.58,.045],iron);
   boxPart(name+' waist belt',root,[0,1.05,-.015],[.79,.12,.52],leather);
   boxPart(name+' brass belt buckle',root,[0,1.06,-.285],[.13,.15,.045],gold);
   for(let side of [-1,1]){
     const strap=boxPart(name+' diagonal baldric',root,[side*.12,1.49,-.302],[.09,.92,.045],gold);strap.rotation.z=side*.22;
     sphere(name+' shoulder rivet',root,[side*.38,1.83,-.05],.13,role==='guard'?iron:leather);
   }
   // Neck, face, ears, hair and cap
   cylinder(name+' neck',root,[0,2.12,0],.19,.22,.34,skin);
   sphere(name+' head',root,[0,2.43,-.015],.49,skin);
   sphere(name+' hair crown',root,[0,2.59,.055],.51,dark);
   const hairBack=sphere(name+' swept hair back',root,[0,2.43,.12],.48,dark);hairBack.scaling.set(.88,.88,.82);
   for(const side of [-1,1]){
     sphere(name+' ear',root,[side*.235,2.42,-.01],.12,skin);
     sphere(name+' eye white',root,[side*.105,2.46,-.235],.065,white);
     sphere(name+' pupil',root,[side*.105,2.46,-.27],.029,iron);
     const brow=boxPart(name+' eyebrow',root,[side*.105,2.53,-.255],[.12,.035,.035],dark);brow.rotation.z=side*.08;
   }
   const nose=sphere(name+' nose',root,[0,2.37,-.255],.09,skin);nose.scaling.set(.7,1.35,.7);
   const woolCap=sphere(name+' wool cap',root,[0,2.68,.015],.56,role==='guard'?red:dark);woolCap.scaling.set(1,.36,1);
   cylinder(name+' cap crown',root,[0,2.77,.015],.35,.48,.15,role==='guard'?red:dark);
   cylinder(name+' rounded cap brim',root,[0,2.61,-.04],.64,.64,.075,leather);
   // Shoulder joints and animated sleeves
   const armL=new B.TransformNode(name+' left arm pivot',scene);armL.parent=root;armL.position.set(-.43,1.91,0);
   const armR=new B.TransformNode(name+' right arm pivot',scene);armR.parent=root;armR.position.set(.43,1.91,0);
   for(const [side,arm] of [[-1,armL],[1,armR]]){
     capsule(name+' upper sleeve',arm,[0,-.31,0],.145,.73,coat);
     capsule(name+' forearm',arm,[0,-.78,-.015],.115,.48,role==='guard'?red:coat);
     capsule(name+' leather glove',arm,[0,-1.02,-.02],.105,.23,leather);
     if(role==='guard')cylinder(name+' vambrace',arm,[0,-.79,-.02],.24,.24,.28,iron);
   }
   // Separate hip joints and boots allow a readable walk cycle.
   const legL=new B.TransformNode(name+' left leg pivot',scene);legL.parent=root;legL.position.set(-.2,.94,0);
   const legR=new B.TransformNode(name+' right leg pivot',scene);legR.parent=root;legR.position.set(.2,.94,0);
   for(const [side,leg] of [[-1,legL],[1,legR]]){
     capsule(name+' wool breeches',leg,[0,-.34,0],.17,.78,role==='guard'?dark:leather);
     capsule(name+' shin',leg,[0,-.72,-.015],.135,.55,dark);
     const boot=capsule(name+' shaped leather boot',leg,[0,-.94,-.035],.145,.43,leather);boot.scaling.z=1.18;
     if(role==='guard')cylinder(name+' boot cuff',leg,[0,-.82,-.015],.29,.29,.12,iron);
   }
   // Cloak, hood and equipment silhouette
   const cloak=capsule(name+' tailored long coat',root,[0,1.34,.19],.39,1.32,role==='guard'?red:blue);
   cloak.scaling.set(1,.96,.58);
   cloak.rotation.x=-.04;
   if(role==='guard'){
     const shoulderCape=sphere(name+' shoulder mantle',root,[0,1.88,.12],1,red);
     shoulderCape.scaling.set(.49,.19,.29);
   }
   let blade=null;
   if(role!=='civilian'){
     const scabbard=boxPart(name+' sword scabbard',root,[.48,1.02,.19],[.13,.95,.16],leather);scabbard.rotation.z=-.28;
     blade=cylinder(name+' steel sword blade',armR,[0,-.53,-.06],.035,.085,.94,steel);
     boxPart(name+' sword crossguard',armR,[0,-1.01,-.06],[.42,.065,.1],gold);
     cylinder(name+' sword grip',armR,[0,-1.16,-.06],.085,.085,.24,leather);
     sphere(name+' sword pommel',armR,[0,-1.31,-.06],.13,gold);
   }
   if(role==='guard'){
     for(const side of [-1,1]){
       const pauldron=sphere(name+' steel pauldron',root,[side*.43,1.88,0],.43,iron);pauldron.scaling.set(1,.62,1);
       sphere(name+' pauldron rivet',root,[side*.43,1.91,-.21],.09,gold);
     }
     boxPart(name+' heraldic chest plate',root,[0,1.58,-.31],[.24,.32,.06],gold);
   }
   root.getChildMeshes().forEach(m=>m.scaling.scaleInPlace(scale));
   return {root,armL,armR,legL,legR,fallbackMeshes:scene.meshes.filter(m=>m.name.startsWith(name+' ')),phase:Math.random()*6.28,alive:true,weapon:blade};
 }
 const player=person('Matej Varga',0,8,blue,1,'hero');player.root.position.y=0;
 // Collision capsule proxy; visible rig follows proxy
 const collider=B.MeshBuilder.CreateCapsule('player collision',{height:2.2,radius:.42},scene);
 collider.isVisible=false;collider.checkCollisions=true;collider.ellipsoid=new B.Vector3(.48,1.05,.48);collider.ellipsoidOffset=new B.Vector3(0,1.05,0);collider.position.set(0,0,8);
 const anna=person('Anna',-10,-4,green,1,'civilian');const guards=[person('Guard A',10,-18,red,1,'guard'),person('Guard B',-20,14,red,1,'guard'),person('Guard C',26,25,red,1,'guard')];
 const civilians=[person('Merchant',8,7,white,1,'civilian'),person('Citizen',-13,8,green,1,'civilian'),person('Dockworker',20,39,white,1,'civilian'),person('Citizen 2',-4,-14,white,1,'civilian')];
 const allNPC=[anna,...guards,...civilians];
 // Deliberate market-square staging: NPCs must be visible from the initial spawn.
 anna.root.position.set(0,0,22);
 guards[0].root.position.set(-13,0,28);guards[1].root.position.set(13,0,29);guards[2].root.position.set(0,0,39);
 civilians[0].root.position.set(-7,0,17);civilians[1].root.position.set(7,0,18);
 civilians[2].root.position.set(-10,0,34);civilians[3].root.position.set(10,0,35);

 const loadCharacter=(file)=>B.SceneLoader.LoadAssetContainerAsync("https://gobkit.com/freebies/human003/",file,scene);
 const playRigClip=(actor,name,loop=true)=>{
   if(!actor.rigAnimations?.length)return;
   const key=name.toLowerCase();
   const aliases={
     idle:/idle|stand|breath|wait/i,
     walk:/walk|walking|move/i,
     run:/run|sprint|jog/i,
     attack:/attack|slash|sword|combat/i,
     death:/death|die|fall/i
   };
   const chosen=actor.rigAnimations.find(g=>g.name.toLowerCase()===key)
     ||actor.rigAnimations.find(g=>(aliases[key]||new RegExp(key,'i')).test(g.name));
   if(!chosen){if(actor.currentClip)return;const fallback=actor.rigAnimations[0];if(!fallback)return;fallback.start(loop);actor.currentClip=fallback;return;}
   if(actor.currentClip===chosen)return;
   actor.rigAnimations.forEach(g=>g.stop());
   chosen.start(loop);
   actor.currentClip=chosen;
 };
 const characterPromise=Promise.all([
   loadCharacter("PeasantMilitia.glb"),
   loadCharacter("Priestess.glb"),
   loadCharacter("KnightCaptain.glb"),
   loadCharacter("Footman.glb"),
   loadCharacter("Scout.glb")
 ]).then(([heroPack,annaPack,guardPack,footmanPack,scoutPack])=>{
   const attach=(actor,container,label)=>{
     // Keep the known-good articulated fallback visible until the imported rig is measured and validated.
     const instance=container.instantiateModelsToScene(n=>label+" "+n,true);
     // Filter separate miniature preview roots bundled with some character packs.
     const measured=instance.rootNodes.map(node=>{
       node.computeWorldMatrix(true);
       const b=node.getHierarchyBoundingVectors(true);
       return {node,height:b.max.y-b.min.y};
     });
     const largest=Math.max(...measured.map(x=>x.height).filter(Number.isFinite));
     if(!Number.isFinite(largest)||largest<.25||largest>20)throw new Error(label+" invalid source rig bounds: "+largest);
     const validRoots=measured.filter(x=>x.height>=largest*.72&&!/preview|thumbnail|miniature|icon|lod/i.test(x.node.name));
     if(!validRoots.length)validRoots.push(measured.find(x=>x.height===largest));
     const holder=new B.TransformNode(label+" rig root",scene);
     validRoots.forEach(({node})=>{node.parent=holder;node.setEnabled(true);});
     measured.filter(x=>!validRoots.some(v=>v.node===x.node)).forEach(({node})=>node.dispose(false,false));
     holder.parent=actor.root;holder.position.set(0,0,0);holder.rotation.y=0;holder.scaling.set(1,1,1);
     holder.getChildMeshes(false).forEach(m=>{
       m.setEnabled(true);m.isVisible=true;m.isPickable=false;m.checkCollisions=false;
       m.receiveShadows=true;if(!COARSE)shadow.addShadowCaster(m);
     });
     holder.computeWorldMatrix(true);
     let bounds=holder.getHierarchyBoundingVectors(true);
     let height=bounds.max.y-bounds.min.y;
     if(!Number.isFinite(height)||height<.25||height>20)throw new Error(label+" invalid model height: "+height);
     holder.scaling.scaleInPlace(1.82/height);
     holder.computeWorldMatrix(true);
     bounds=holder.getHierarchyBoundingVectors(true);
     holder.position.y-=bounds.min.y;
     holder.computeWorldMatrix(true);
     actor.fallbackMeshes.forEach(m=>{if(actor.weapon&&/sword|scabbard/i.test(m.name)){m.isVisible=true;m.isPickable=false;return;}m.dispose(false,false);});
     actor.visual=holder;actor.rigAnimations=instance.animationGroups;actor.currentClip=null;
     actor.rigHeight=1.82;actor.rigLabel=label;
     playRigClip(actor,"idle",true);
   };
   attach(player,heroPack,"Matej Varga");
   attach(anna,annaPack,"Anna");
   guards.forEach((g,i)=>attach(g,guardPack,"Mestská stráž "+(i+1)));
   civilians.forEach((c,i)=>attach(c,i%2===0?footmanPack:scoutPack,"Obyvateľ "+(i+1)));
   setStatus("Načítaných "+(1+allNPC.length)+" rigovaných postáv v jednotnej mierke.");
 }).catch(err=>{
   console.error("Rigged character models failed",err);
   // Never hide fallback characters when an external model or animation pack fails.
   allNPC.concat([player]).forEach(actor=>{
     if(!actor.visual)scene.meshes.filter(m=>m.name.startsWith(actor.root.name+' ')).forEach(m=>{m.setEnabled(true);m.isVisible=true;m.isPickable=false;});
   });
   setStatus("Používajú sa záložné postavy: "+err.message);
 });

 // Props receive and cast shadows
 shadow.addShadowCaster(collider);ground.receiveShadows=true;
 // UI / state
 let started=false,paused=false,hp=100,alert=0,objective=0,dialogueUntil=0,attackUntil=0,jumpVelocity=0,onGround=true,stealth=false,sprinting=false;
 let yaw=Math.PI, pitch=.12,moveX=0,moveY=0,lookX=0,lookY=0,lastTime=performance.now(),toastUntil=0,combo=0,lastAttack=0,cameraDistance=9.2;
 const toast=t=>{$('toast').textContent=t;toastUntil=performance.now()+2600;};
 const updateUI=()=>{$('hp').style.width=hp+'%';$('alert').textContent='POZORNOSŤ STRÁŽÍ: '+(alert>70?'VYSOKÁ':alert>25?'ZVÝŠENÁ':'NÍZKA');$('objective').textContent=['Nájdi Annu pri rybnom trhu.','Získaj od Anny zapečatený list.','Dostaň sa k mestskému archívu.','Strias prenasledovateľov a unikni.'][objective]||'Kapitola dokončená';};
 updateUI();
 const updateMap=()=>{
   const c=$('miniMap');if(!c)return;const ctx=c.getContext('2d'),w=c.width,h=c.height;
   ctx.clearRect(0,0,w,h);ctx.fillStyle='#17251f';ctx.fillRect(0,0,w,h);
   const px=x=>w/2+x*1.03,py=z=>h/2-z*1.03;
   ctx.fillStyle='#294653';ctx.beginPath();ctx.moveTo(px(-55),py(48));ctx.lineTo(px(55),py(48));ctx.lineTo(px(55),py(106));ctx.lineTo(px(-55),py(106));ctx.closePath();ctx.fill();
   ctx.strokeStyle='#b2a38a';ctx.lineWidth=5;ctx.strokeRect(px(-82),py(-63),164*1.03,105*1.03);
   ctx.strokeStyle='#8e806b';ctx.lineWidth=4;
   for(let z=-52;z<44;z+=17){ctx.beginPath();ctx.moveTo(px(-72),py(z));ctx.lineTo(px(72),py(z));ctx.stroke();}
   for(let x=-68;x<76;x+=17){ctx.beginPath();ctx.moveTo(px(x),py(-58));ctx.lineTo(px(x),py(40));ctx.stroke();}
   ctx.strokeStyle='#d7c7a8';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(px(-18),py(0));ctx.lineTo(px(18),py(0));ctx.moveTo(px(0),py(-48));ctx.lineTo(px(0),py(44));ctx.stroke();
   ctx.fillStyle='#c7a66c';ctx.fillRect(px(-18),py(8),36,26);
   const marker=(x,z,color,r)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(px(x),py(z),r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f1e4c9';ctx.lineWidth=1.5;ctx.stroke();};
   marker(-48,40,'#d6bd8a',6);marker(-35,-13,'#d6bd8a',5);marker(0,-35,'#d6bd8a',5);marker(28,58,'#8bb0bd',4);
   if(anna)marker(anna.root.position.x,anna.root.position.z,'#78c995',4);
   marker(player.root.position.x,player.root.position.z,'#f4e4c4',5);
   ctx.save();ctx.translate(px(player.root.position.x),py(player.root.position.z));ctx.rotate(-player.root.rotation.y);ctx.fillStyle='#fff2ce';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(-5,5);ctx.lineTo(5,5);ctx.closePath();ctx.fill();ctx.restore();
 };
 updateMap();
 // Input: keyboard, pointer lock, touch joystick, touch camera, gamepad
 const keys={};window.addEventListener('keydown',e=>{keys[e.code]=true;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.code==='Escape'&&started)pauseGame();if(e.code==='KeyC')stealth=true;if(e.code==='ShiftLeft'||e.code==='ShiftRight')sprinting=true;});
 window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyC')stealth=false;if(e.code==='ShiftLeft'||e.code==='ShiftRight')sprinting=false;});
 canvas.addEventListener('click',()=>{if(started&&!paused&&document.pointerLockElement!==canvas&&matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.();});
 document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&started&&!paused){yaw+=e.movementX*.0024;pitch=B.Scalar.Clamp(pitch+e.movementY*.0018,-.22,.62);}});
 let joyPointer=null,lookPointer=null,joyOrigin=null,lastLook=null;const lookSensitivity=.0062;
 const stick=$('stick'),nub=$('nub'),stickZone=$('stickZone'),lookZone=$('lookZone');
 stickZone.addEventListener('pointerdown',e=>{if(!started||paused)return;joyPointer=e.pointerId;stickZone.setPointerCapture(e.pointerId);const r=stick.getBoundingClientRect();joyOrigin={x:r.left+r.width/2,y:r.top+r.height/2};moveJoy(e);});
 function moveJoy(e){if(e.pointerId!==joyPointer||!joyOrigin)return;const dx=e.clientX-joyOrigin.x,dy=e.clientY-joyOrigin.y,len=Math.hypot(dx,dy),max=37,k=len>max?max/len:1;moveX=dx/max;moveY=-dy/max;nub.style.transform='translate('+dx*k+'px,'+dy*k+'px)';}
 stickZone.addEventListener('pointermove',moveJoy);const endJoy=e=>{if(e.pointerId===joyPointer){joyPointer=null;moveX=moveY=0;nub.style.transform='';}};stickZone.addEventListener('pointerup',endJoy);stickZone.addEventListener('pointercancel',endJoy);
 lookZone.addEventListener('pointerdown',e=>{if(!started||paused)return;lookPointer=e.pointerId;lastLook={x:e.clientX,y:e.clientY};lookZone.setPointerCapture(e.pointerId);});
 lookZone.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer||!lastLook)return;const dx=e.clientX-lastLook.x,dy=e.clientY-lastLook.y;yaw+=dx*lookSensitivity;pitch=B.Scalar.Clamp(pitch+dy*.0032,-.18,.58);lastLook={x:e.clientX,y:e.clientY};});
 const endLook=e=>{if(e.pointerId===lookPointer){lookPointer=null;lastLook=null;}};lookZone.addEventListener('pointerup',endLook);lookZone.addEventListener('pointercancel',endLook);
 function bindAction(id,fn){const el=$(id);if(!el)return;el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(started&&!paused)fn();});}
 function jump(){if(onGround){jumpVelocity=7.3;onGround=false;}}
 function attack(){const now=performance.now();if(now<attackUntil)return;combo=now-lastAttack<850?(combo%3)+1:1;lastAttack=now;attackUntil=now+820;if(player.visual)playRigClip(player,'attack',false);else player.armR.rotation.x=-1.1-combo*.18;player.armR.rotation.z=combo===2?-.65:.35;setTimeout(()=>{player.armR.rotation.x=0;player.armR.rotation.z=0;if(player.visual&&player.currentClip?.name.toLowerCase().includes('attack'))playRigClip(player,'idle',true);},620);let target=null,best=3.7;for(const g of guards){if(!g.alive)continue;const dist=B.Vector3.Distance(player.root.position,g.root.position);if(dist<best){const to=g.root.position.subtract(player.root.position);const facing=new B.Vector3(Math.sin(player.root.rotation.y),0,Math.cos(player.root.rotation.y));if(B.Vector3.Dot(to.normalize(),facing)>.05){target=g;best=dist;}}}if(target){target.alive=false;if(target.visual)playRigClip(target,'death',false);setTimeout(()=>target.root.setEnabled(false),850);toast(['','Zásah mečom.','Druhý úder komba.','Dokončovací úder.'][combo]);if(objective===3)alert=Math.max(0,alert-25);}else toast('Meč zasvišťal naprázdno.');}
 function interact(){if(B.Vector3.Distance(player.root.position,anna.root.position)<4){if(objective===0){objective=1;toast('Anna: „List je ukrytý. Vezmi si ho.“');}else if(objective===1){objective=2;toast('Získal si zapečatený list. Zamier k archívu.');}else toast('Anna: „Ponáhľaj sa, stráže sú blízko.“');updateUI();return;}if(objective===2&&B.Vector3.Distance(player.root.position,new B.Vector3(0,0,-35))<12){objective=3;toast('Archív je otvorený. Stráže ťa spozorovali!');alert=65;updateUI();return;}toast('V blízkosti nie je nič na preskúmanie.');}
 function climb(){if(!onGround){jumpVelocity=5.8;toast('Výstup');}else{jumpVelocity=5.8;onGround=false;}}
 function dodge(){const dir=new B.Vector3(Math.sin(yaw),0,-Math.cos(yaw));collider.moveWithCollisions(dir.scale(3.8));}
 bindAction('jump',jump);bindAction('attack',attack);bindAction('interact',interact);bindAction('climb',climb);bindAction('dodge',dodge);bindAction('stealth',()=>{stealth=!stealth;toast(stealth?'Plíženie aktivované':'Plíženie vypnuté');});
 const sprintButton=$('sprint');if(sprintButton){sprintButton.addEventListener('pointerdown',e=>{e.preventDefault();sprinting=true;sprintButton.setPointerCapture(e.pointerId);});const stopSprint=()=>sprinting=false;sprintButton.addEventListener('pointerup',stopSprint);sprintButton.addEventListener('pointercancel',stopSprint);sprintButton.addEventListener('lostpointercapture',stopSprint);}
 $('pause').addEventListener('click',pauseGame);$('resume').addEventListener('click',()=>{paused=false;$('pauseScreen').style.display='none';$('pause').style.display='block';lastTime=performance.now();});
 function pauseGame(){if(!started)return;paused=true;$('pauseScreen').style.display='flex';$('pause').style.display='none';if(document.pointerLockElement)document.exitPointerLock();}
 start.addEventListener('click',()=>{
   if(start.disabled)return;
   start.disabled=true;overlay.style.display='none';
   const loading=$('loadingScreen'),bar=$('loadBar'),percent=$('loadPercent'),message=$('loadMessage');
   loading.style.display='flex';
   const phases=['Overujem herný svet…','Pripravujem postavy a výstroj…','Synchronizujem mapu Prešporka…','Dokončujem osvetlenie a tiene…','Misia je pripravená.'];
   let p=0;const timer=setInterval(()=>{
     p=Math.min(100,p+Math.max(5,Math.round((100-p)*.24)));
     bar.style.width=p+'%';percent.textContent=p+' %';message.textContent=phases[Math.min(phases.length-1,Math.floor(p/25))];
     if(p>=100){clearInterval(timer);setTimeout(()=>{loading.style.display='none';started=true;$('pause').style.display='block';toast('Prešporok, rok 1567. Nájdite Annu.');if(matchMedia('(pointer:fine)').matches)canvas.requestPointerLock?.();},250);}
   },110);
 });
 start.disabled=true;start.textContent='NAČÍTAVAM 3D MODELY…';Promise.allSettled([assetPromise,characterPromise]).then(()=>{start.disabled=false;start.textContent='ZAČAŤ HRU';});setStatus('Načítavam 3D modely Prešporka…');$('errorBox').style.display='none';
 // Camera, movement and world simulation
 const vForward=new B.Vector3(),vRight=new B.Vector3();
 function update(dt,t){
   if(!started||paused)return;
   const gp=navigator.getGamepads?.()[0];let ix=moveX,iy=moveY;
   if(keys.KeyW||keys.ArrowUp)iy+=1;if(keys.KeyS||keys.ArrowDown)iy-=1;if(keys.KeyA||keys.ArrowLeft)ix-=1;if(keys.KeyD||keys.ArrowRight)ix+=1;
   if(gp){ix+=gp.axes[0]||0;iy-=gp.axes[1]||0;if(gp.buttons[0]?.pressed)jump();if(gp.buttons[2]?.pressed)attack();if(gp.buttons[1]?.pressed)dodge();if(gp.buttons[3]?.pressed)interact();if(gp.buttons[4]?.pressed)stealth=true;if(gp.buttons[5]?.pressed)sprinting=true;if(gp.buttons[6]?.pressed)climb();if(gp.buttons[7]?.pressed)sprinting=true;yaw+=(gp.axes[2]||0)*dt*2.4;pitch=B.Scalar.Clamp(pitch+(gp.axes[3]||0)*dt*1.4,-.18,.58);}
   if(keys.Space&&!keys._space){jump();keys._space=true;}if(!keys.Space)keys._space=false;if(keys.KeyE){interact();keys.KeyE=false;}if(keys.KeyF){attack();keys.KeyF=false;}if(keys.KeyQ){climb();keys.KeyQ=false;}if(keys.KeyX){dodge();keys.KeyX=false;}
   const mag=Math.hypot(ix,iy);if(mag>1){ix/=mag;iy/=mag;}
   const speed=stealth?1.65:(sprinting||keys.ShiftLeft||keys.ShiftRight?7.8:4.5);
   const forward=new B.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new B.Vector3(-Math.cos(yaw),0,Math.sin(yaw));
   const delta=forward.scale(iy*speed*dt).add(right.scale(ix*speed*dt));
   if(mag>.08){collider.moveWithCollisions(delta);if(player.visual&&t>attackUntil)playRigClip(player,sprinting?'run':'walk',true);player.root.rotation.y=Math.atan2(delta.x,delta.z)+(player.visual?RIG_YAW:Math.PI);player.phase+=dt*(sprinting?11:7);player.legL.rotation.x=Math.sin(player.phase)*.48;player.legR.rotation.x=-Math.sin(player.phase)*.48;player.armL.rotation.x=-Math.sin(player.phase)*.28;player.armR.rotation.x=Math.sin(player.phase)*.28;player.root.position.y+=Math.abs(Math.sin(player.phase*2))*(sprinting ? .055 : .025);}else{if(player.visual&&t>attackUntil)playRigClip(player,'idle',true);player.legL.rotation.x*=.72;player.legR.rotation.x*=.72;player.armL.rotation.x*=.72;player.armR.rotation.x*=.72;player.root.position.y=B.Scalar.Lerp(player.root.position.y,collider.position.y,.22);}
   jumpVelocity-=18*dt;collider.moveWithCollisions(new B.Vector3(0,jumpVelocity*dt,0));if(collider.position.y<=0){collider.position.y=0;jumpVelocity=0;onGround=true;}else onGround=false;
   player.root.position.copyFrom(collider.position);player.root.position.y=collider.position.y;
   // Guards investigate and pursue when visible / noisy
   for(const g of guards){if(!g.alive)continue;const dist=B.Vector3.Distance(g.root.position,player.root.position);if(dist<17&&(!stealth||dist<6)){if(g.visual&&dist>=1.8)playRigClip(g,'walk',true);alert=Math.min(100,alert+dt*(dist<7?28:9));const d=player.root.position.subtract(g.root.position);d.y=0;d.normalize();g.root.position.addInPlace(d.scale(dt*(dist<4?1.8:2.7)));g.root.rotation.y=Math.atan2(d.x,d.z)+(g.visual?RIG_YAW:Math.PI);if(dist<1.8&&t>(g.nextAttackAt||0)){g.nextAttackAt=t+1050;if(g.visual)playRigClip(g,'attack',false);hp=Math.max(0,hp-7);$('hp').style.width=hp+'%';}}else{if(g.visual)playRigClip(g,'idle',true);g.root.position.x+=Math.sin(t*.0003+g.phase)*dt*.25;}}
   if(!gp?.buttons[4]?.pressed&&gp)stealth=false;if(!gp?.buttons[5]?.pressed&&!gp?.buttons[7]?.pressed&&gp)sprinting=false;
   if(alert>0)alert=Math.max(0,alert-dt*(stealth?8:2.4));updateUI();updateMap();
   // Camera behind character; pitch controls elevation
   const distance=cameraDistance, elev=2.65+pitch*5.4;
   const desired=player.root.position.add(new B.Vector3(Math.sin(yaw)*distance,elev,Math.cos(yaw)*distance));
   camera.position=B.Vector3.Lerp(camera.position,desired,1-Math.pow(.0008,dt));
   camera.setTarget(player.root.position.add(new B.Vector3(0,1.58,0)));
   const camOrigin=player.root.position.add(new B.Vector3(0,1.5,0));const camDir=camera.position.subtract(camOrigin).normalize();const camRay=new B.Ray(camOrigin,camDir,cameraDistance+1);const camHit=scene.pickWithRay(camRay,m=>m.checkCollisions&&m!==collider&&!m.name.includes('player'));if(camHit&&camHit.hit&&camHit.distance<cameraDistance)camera.position=B.Vector3.Lerp(camera.position,camOrigin.add(camDir.scale(Math.max(4.6,camHit.distance-.7))),.22);
   if(performance.now()>toastUntil)$('toast').textContent='';
   if(hp<=0){hp=100;alert=0;collider.position.set(0,0,8);toast('Matej sa vrátil na bezpečné miesto.');}
 }
 scene.onBeforeRenderObservable.add(()=>{const now=performance.now(),dt=Math.min(.04,(now-lastTime)/1000);lastTime=now;update(dt,now);});
 // Environment polish: sky gradient, sun disc, subtle particles
 const dust=new B.ParticleSystem('golden dust',420,scene);dust.particleTexture=new B.Texture('https://assets.babylonjs.com/textures/flare.png',scene);dust.emitter=new B.Vector3(0,3,0);dust.minEmitBox=new B.Vector3(-65,0,-55);dust.maxEmitBox=new B.Vector3(65,22,55);dust.color1=new B.Color4(.78,.65,.43,.23);dust.color2=new B.Color4(.55,.62,.63,.12);dust.minSize=.025;dust.maxSize=.08;dust.minLifeTime=5;dust.maxLifeTime=12;dust.emitRate=26;dust.gravity=new B.Vector3(0,.025,0);dust.start();
 for(let i=0;i<8;i++){const x=-28+i*8,z=-24;const flame=B.MeshBuilder.CreateSphere('torch glow',{diameter:.42,segments:8},scene);flame.position.set(x,3.7,z);const fm=new B.StandardMaterial('torch glow mat '+i,scene);fm.emissiveColor=new B.Color3(1,.42,.12);fm.disableLighting=true;flame.material=fm;const light=new B.PointLight('torch light '+i,new B.Vector3(x,3.7,z),scene);light.diffuse=new B.Color3(1,.48,.19);light.intensity=.55;light.range=11;}
 const sky=B.MeshBuilder.CreateSphere('sky dome',{diameter:420,segments:24},scene);sky.isPickable=false;sky.infiniteDistance=true;sky.material=new B.StandardMaterial('sky material',scene);sky.material.backFaceCulling=false;sky.material.disableLighting=true;sky.material.emissiveColor=new B.Color3(.18,.25,.29);sky.material.alpha=.18;
 // Add shadows to all static architecture
 if(!matchMedia('(pointer:coarse)').matches)scene.meshes.forEach(m=>{if(m.checkCollisions&&m!==ground&&m!==collider)shadow.addShadowCaster(m);});
 window.addEventListener('resize',()=>engine.resize());
 window.addEventListener('contextmenu',e=>e.preventDefault());
 setStatus('Svet Prešporka bol úspešne načítaný.');
 window.addEventListener('unhandledrejection',e=>{const eb=$('errorBox');if(eb){eb.style.display='block';eb.textContent='Chyba hry: '+(e.reason?.message||e.reason||'neznáma chyba');}});
} catch(err) {
 console.error(err);setStatus('Chyba 3D enginu: '+err.message);
 const eb=$('errorBox');eb.style.display='block';eb.textContent='3D svet sa nepodarilo dokončiť: '+err.message+' — obnov stránku a skús to znova.';
 if(overlay)overlay.style.display='flex';
}
}
})();