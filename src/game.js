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
 engine.setHardwareScalingLevel(matchMedia('(pointer:coarse)').matches?Math.max(1,Math.min(1.5,(window.devicePixelRatio||1)/1.35)):Math.min(1.15,1/Math.min(window.devicePixelRatio||1,1.15)));
 const scene=new B.Scene(engine);
 scene.clearColor=new B.Color4(.48,.56,.59,1);
 scene.collisionsEnabled=true;
 scene.gravity=new B.Vector3(0,-18,0);
 scene.fogMode=B.Scene.FOGMODE_EXP2; scene.fogDensity=.0019;
 scene.fogColor=new B.Color3(.42,.43,.40);
 const camera=new B.FreeCamera('followCamera',new B.Vector3(0,5,-9),scene);
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

 const ground=B.MeshBuilder.CreateGround('city ground',{width:230,height:230,subdivisions:2},scene);ground.position.y=-.15;ground.material=road;ground.checkCollisions=true;ground.receiveShadows=true;
 // Start rendering as soon as the base scene exists; later construction errors must not leave a blank canvas.
 let renderFault=null; engine.runRenderLoop(()=>{try{scene.render();}catch(e){renderFault=e;const eb=$('errorBox');if(eb){eb.style.display='block';eb.textContent='Chyba vykresľovania: '+e.message;}}});
 const river=B.MeshBuilder.CreateGround('Danube',{width:110,height:58,subdivisions:32},scene);river.position.set(0,-.11,77);river.material=water;river.isPickable=false;
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
   const roofRise=Math.min(3.1,d*.27),roofHalf=d*.56;
   const roofA=B.MeshBuilder.CreateBox('front pitched roof',{width:w+1.5,height:.42,depth:roofHalf},scene);
   roofA.position.set(bx,h+roofRise*.48,bz-d*.25);roofA.rotation.x=-Math.atan2(roofRise,roofHalf);roofA.material=roofmat;roofA.checkCollisions=true;roofA.receiveShadows=true;
   const roofB=B.MeshBuilder.CreateBox('rear pitched roof',{width:w+1.5,height:.42,depth:roofHalf},scene);
   roofB.position.set(bx,h+roofRise*.48,bz+d*.25);roofB.rotation.x=Math.atan2(roofRise,roofHalf);roofB.material=roofmat;roofB.checkCollisions=true;roofB.receiveShadows=true;
   box('roof ridge timber',[bx,h+roofRise,bz],[w+1.7,.24,.28],dark,false);
   for(const sideZ of [-1,1])box('carved roof eave',[bx,h+.2,bz+sideZ*(d/2+.55)],[w+1.8,.28,.3],dark,false);
   // timber framing and facade details
   for(let side of [-1,1]){
     const frontZ=bz+side*(d/2+.04);
     for(let yy=2.2;yy<h-1;yy+=3.0) for(let xx=-w/2+2;xx<w/2-1;xx+=3.2){
       const win=box('deep window',[bx+xx,yy,frontZ],[1.15,1.55,.12],dark,false);
       const pane=box('window shadow',[bx+xx,yy,frontZ+side*.08],[.78,1.16,.05],iron,false);
       box('window sill',[bx+xx,yy-.88,frontZ+side*.12],[1.35,.13,.28],pale,false);
       for(const sx of [-1,1])box('stone window jamb',[bx+xx+sx*.57,yy,frontZ+side*.12],[.13,1.7,.18],pale,false);
       box('stone window lintel',[bx+xx,yy+.84,frontZ+side*.12],[1.32,.14,.2],pale,false);
       box('window crossbar vertical',[bx+xx,yy,frontZ+side*.16],[.055,1.08,.05],gold,false);
       box('window crossbar horizontal',[bx+xx,yy,frontZ+side*.17],[.82,.055,.05],gold,false);
       for(const sx of [-1,1])box('wooden shutter',[bx+xx+sx*.72,yy,frontZ+side*.18],[.25,1.2,.12],dark,false);
     }
     box('timber beam',[bx,h*.55,frontZ],[w,.16,.18],dark,false);
     box('timber upright',[bx-w*.38,h*.5,frontZ],[.16,h*.9,.18],dark,false);
     box('timber upright',[bx+w*.38,h*.5,frontZ],[.16,h*.9,.18],dark,false);
   }
   // chimney
   box('chimney',[bx+w*.25,h+1.8,bz-d*.2],[1.1,3.1,1.1],stone);
   box('front entrance',[bx,h*.48,bz+d/2+.12],[1.65,2.9,.22],dark,false);box('door arch lintel',[bx,h*.48+1.52,bz+d/2+.18],[2.05,.2,.28],pale,false);
   if((x+z)%2===0){box('wooden balcony floor',[bx,h*.52,bz-d/2-.75],[w*.62,.2,1.4],dark,false);box('balcony rail',[bx,h*.52+.62,bz-d/2-1.35],[w*.62,.12,.12],iron,false);for(let j=-2;j<=2;j++)box('balcony baluster',[bx+j*w*.12,h*.52+.32,bz-d/2-1.35],[.07,.6,.07],iron,false);}
   for(let j=-1;j<=1;j++){box('roof dormer',[bx+j*w*.25,h+1.5,bz-d*.28],[1.3,1.3,1.2],pale,false);box('dormer window',[bx+j*w*.25,h+1.55,bz-d*.28-.62],[.62,.72,.08],dark,false);}
 }
 // Main thoroughfares, lanes and a fortified river crossing
 const roadNorth=B.MeshBuilder.CreateGround('north south processional street',{width:9,height:125},scene);roadNorth.position.set(0,.025,-8);roadNorth.material=road;roadNorth.checkCollisions=false;
 const roadWest=B.MeshBuilder.CreateGround('west market street',{width:130,height:8},scene);roadWest.position.set(-3,.026,-17);roadWest.material=road;
 const roadEast=B.MeshBuilder.CreateGround('east market street',{width:125,height:8},scene);roadEast.position.set(5,.027,22);roadEast.material=road;
 // Medieval stone bridge over the Danube with parapets and repeated piers
 const bridge=box('Danube stone bridge',[0,2.2,76],[12,1.2,64],stone);bridge.checkCollisions=true;
 box('bridge parapet left',[-5.7,3.2,76],[.65,1.5,64],pale);box('bridge parapet right',[5.7,3.2,76],[.65,1.5,64],pale);
 for(let z=48;z<=104;z+=14){cyl('bridge pier',[0,1,z],2.8,4,stone);for(let x of [-4.4,4.4])box('bridge lantern plinth',[x,4,z],[.5,1.2,.5],dark);}
 // Outer defensive wall and gate towers define a traversable historic city silhouette
 for(let x=-82;x<=82;x+=8){box('north city curtain wall',[x,5,-63],[7.8,10,2.6],stone);if(x%24===0){box('north wall merlon',[x,10.8,-63],[1.5,1.8,3.1],pale);}}
 for(let z=-58;z<=42;z+=8){box('west city curtain wall',[-82,5,z],[2.6,10,7.8],stone);box('east city curtain wall',[82,5,z],[2.6,10,7.8],stone);}
 for(const [x,z] of [[-82,-63],[82,-63],[-82,42],[82,42]]){cyl('round defensive bastion',[x,8,z],10,16,stone);roofPeak(x,z,10,10,17,roof2);}
 // Broad market square, paving, fountain
 for(let i=0;i<130;i++){const x=-17+Math.random()*34,z=-14+Math.random()*28;const p=box('hand-laid market cobble',[x,.075,z],[.65+Math.random()*.55,.09,.42+Math.random()*.45],i%4===0?stone:road,false);p.rotation.y=Math.random()*Math.PI;}
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
 const crane=box('harbour crane post',[39,5,43],[.65,10,.65],dark);box('harbour crane arm',[39,9.8,43],[.6,.6,9],dark);box('crane counterweight',[39,8,39],[2,1.5,2],stone);cyl('crane pulley',[39,8.7,47],.8,.35,iron);for(let i=0;i<6;i++){box('cargo crate',[18+i*2.2,.8,39+(i%2)*2],[1.5,1.5,1.5],dark);}
 for(let i=0;i<4;i++){box('dock plank',[22+i*2,.1,47],[1.8,.35,18],dark,false);}
 const boat=box('merchant barge',[28,.15,58],[7,.65,16],dark,false);boat.rotation.y=.12;
 box('mast',[28,5,58],[.25,10,.25],dark,false);
 // Vegetation and street dressing break the repeated block pattern.
 const treeMat=mat('olive foliage','#465b3e'), trunkMat=mat('aged tree bark','#493729');
 for(const [tx,tz,sz] of [[-70,-12,1.3],[-67,16,1.1],[-61,27,1.25],[61,-22,1.4],[67,18,1.1],[57,34,1.3],[-28,58,1.4],[46,63,1.2]]){
   cyl('old tree trunk',[tx,2.2*sz,tz],.65*sz,4.4*sz,trunkMat);
   for(const [ox,oy,oz,scale] of [[0,5,0,3.2],[-1.1,4.3,.3,2.4],[1.1,4.5,-.4,2.5],[0,6.1,.2,2.4]]){
     const crown=B.MeshBuilder.CreateSphere('leaf canopy',{diameter:scale*sz,segments:7},scene);
     crown.position.set(tx+ox*sz,oy*sz,tz+oz*sz);crown.material=treeMat;crown.checkCollisions=true;crown.receiveShadows=true;shadow.addShadowCaster(crown);
   }
 }
 for(let i=0;i<22;i++){
   const px=-55+(i*37%110),pz=-48+(i*23%96);
   if(Math.abs(px)<22&&Math.abs(pz)<24)continue;
   const barrel=cyl('street barrel',[px,.55,pz],.85,1.1,dark);
   for(let y of [.25,.82])cyl('barrel iron hoop',[px,y,pz],.9,.09,iron);
   if(i%3===0){box('wooden handcart bed',[px+1,.65,pz+1],[2.3,.25,1.4],dark,false);for(let side of [-1,1])cyl('cart wheel',[px+1+side*1.1,.65,pz+1.7],1.05,.18,leather);}
 }
 // lamps, banners and street clutter
 for(let x=-4;x<=4;x++)for(let z=-3;z<=2;z++){
   if((x+z)%2===0){const px=x*17+7,pz=z*17+6;if(pz<43){cyl('lamp post',[px,2.3,pz],.16,4.6,iron);box('lantern',[px,4.5,pz],[.65,.75,.65],gold,false);}}
 }
 for(let i=0;i<12;i++){const x=-23+(i%6)*9,z=-17+Math.floor(i/6)*8;box('market stall canopy',[x,3,z],[5,.25,4],i%2?red:green,false);box('market stall table',[x,1.5,z],[4.6,.5,3.6],dark,false);}
 // Character factory: sculpted silhouette, layered garments, articulated limbs and period equipment.
 function person(name,x,z,coat,scale=1,role='civilian'){
   const root=new B.TransformNode(name,scene);root.position.set(x,0,z);
   const mesh=(n,geo,parent,material,pos=[0,0,0])=>{const o=geo;o.name=n;o.parent=parent;o.position.set(...pos);o.material=material;o.receiveShadows=true;shadow.addShadowCaster(o);return o;};
   const capsule=(n,parent,pos,r,h,material)=>mesh(n,B.MeshBuilder.CreateCapsule(n,{height:h,radius:r,tessellation:14,subdivisions:4},scene),parent,material,pos);
   const sphere=(n,parent,pos,diam,material)=>mesh(n,B.MeshBuilder.CreateSphere(n,{diameter:diam,segments:16},scene),parent,material,pos);
   const boxPart=(n,parent,pos,size,material)=>mesh(n,B.MeshBuilder.CreateBox(n,{width:size[0],height:size[1],depth:size[2]},scene),parent,material,pos);
   const cylinder=(n,parent,pos,top,bottom,height,material)=>mesh(n,B.MeshBuilder.CreateCylinder(n,{diameterTop:top,diameterBottom:bottom,height,tessellation:14},scene),parent,material,pos);
   // Torso and tailored coat layers
   cylinder(name+' shaped torso',root,[0,1.48,0],.48,.78,1.18,coat);
   cylinder(name+' lower tunic',root,[0,.99,.015],.62,.76,.42,role==='guard'?red:blue);
   boxPart(name+' front leather jerkin',root,[0,1.48,-.265],[.43,.78,.055],role==='guard'?iron:leather);
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
   boxPart(name+' hair back',root,[0,2.39,.205],[.43,.43,.22],dark);
   for(const side of [-1,1]){
     sphere(name+' ear',root,[side*.235,2.42,-.01],.12,skin);
     sphere(name+' eye white',root,[side*.105,2.46,-.235],.065,white);
     sphere(name+' pupil',root,[side*.105,2.46,-.27],.029,iron);
     const brow=boxPart(name+' eyebrow',root,[side*.105,2.53,-.255],[.12,.035,.035],dark);brow.rotation.z=side*.08;
   }
   const nose=sphere(name+' nose',root,[0,2.37,-.255],.09,skin);nose.scaling.set(.7,1.35,.7);
   boxPart(name+' wool cap',root,[0,2.68,.015],[.58,.17,.58],role==='guard'?red:dark);
   cylinder(name+' cap crown',root,[0,2.77,.015],.35,.48,.15,role==='guard'?red:dark);
   boxPart(name+' cap brim',root,[0,2.61,-.08],[.68,.055,.66],leather);
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
     const boot=boxPart(name+' tall boot',leg,[0,-.96,-.075],[.29,.27,.48],leather);boot.rotation.x=-.08;
     boxPart(name+' boot cuff',leg,[0,-.82,-.015],[.3,.12,.3],role==='guard'?iron:dark);
   }
   // Cloak, hood and equipment silhouette
   const cloak=boxPart(name+' heavy travelling cloak',root,[0,1.31,.27],[.77,1.2,.17],role==='guard'?red:blue);cloak.rotation.x=-.08;
   sphere(name+' hood',root,[0,2.46,.18],.59,leather).scaling.set(1,1,.78);
   boxPart(name+' shoulder cape',root,[0,1.9,.16],[.9,.23,.4],role==='guard'?red:blue);
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
   return {root,armL,armR,legL,legR,phase:Math.random()*6.28,alive:true,weapon:blade};
 }
 const player=person('Matej Varga',0,8,blue,1,'hero');player.root.position.y=0;
 // Collision capsule proxy; visible rig follows proxy
 const collider=B.MeshBuilder.CreateCapsule('player collision',{height:2.2,radius:.42},scene);
 collider.isVisible=false;collider.checkCollisions=true;collider.ellipsoid=new B.Vector3(.48,1.05,.48);collider.ellipsoidOffset=new B.Vector3(0,1.05,0);collider.position.set(0,0,8);
 const anna=person('Anna',-10,-4,green,1,'civilian');const guards=[person('Guard A',10,-18,red,1,'guard'),person('Guard B',-20,14,red,1,'guard'),person('Guard C',26,25,red,1,'guard')];
 const civilians=[person('Merchant',8,7,white,1,'civilian'),person('Citizen',-13,8,green,1,'civilian'),person('Dockworker',20,39,white,1,'civilian'),person('Citizen 2',-4,-14,white,1,'civilian')];
 const allNPC=[anna,...guards,...civilians];
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
 function attack(){const now=performance.now();if(now<attackUntil)return;combo=now-lastAttack<850?(combo%3)+1:1;lastAttack=now;attackUntil=now+420;player.armR.rotation.x=-1.1-combo*.18;player.armR.rotation.z=combo===2?-.65:.35;setTimeout(()=>{player.armR.rotation.x=0;player.armR.rotation.z=0;},230);let target=null,best=3.7;for(const g of guards){if(!g.alive)continue;const dist=B.Vector3.Distance(player.root.position,g.root.position);if(dist<best){const to=g.root.position.subtract(player.root.position);const facing=new B.Vector3(Math.sin(player.root.rotation.y),0,Math.cos(player.root.rotation.y));if(B.Vector3.Dot(to.normalize(),facing)>.05){target=g;best=dist;}}}if(target){target.alive=false;target.root.setEnabled(false);toast(['','Zásah mečom.','Druhý úder komba.','Dokončovací úder.'][combo]);if(objective===3)alert=Math.max(0,alert-25);}else toast('Meč zasvišťal naprázdno.');}
 function interact(){if(B.Vector3.Distance(player.root.position,anna.root.position)<4){if(objective===0){objective=1;toast('Anna: „List je ukrytý. Vezmi si ho.“');}else if(objective===1){objective=2;toast('Získal si zapečatený list. Zamier k archívu.');}else toast('Anna: „Ponáhľaj sa, stráže sú blízko.“');updateUI();return;}if(objective===2&&B.Vector3.Distance(player.root.position,new B.Vector3(0,0,-35))<12){objective=3;toast('Archív je otvorený. Stráže ťa spozorovali!');alert=65;updateUI();return;}toast('V blízkosti nie je nič na preskúmanie.');}
 function climb(){if(!onGround){jumpVelocity=5.8;toast('Výstup');}else{jumpVelocity=5.8;onGround=false;}}
 function dodge(){const dir=new B.Vector3(Math.sin(yaw),0,Math.cos(yaw));collider.moveWithCollisions(dir.scale(-3.8));}
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
 start.disabled=false;start.textContent='ZAČAŤ HRU';setStatus('3D svet je pripravený.');$('errorBox').style.display='none';
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
   const forward=new B.Vector3(Math.sin(yaw),0,Math.cos(yaw)),right=new B.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
   const delta=forward.scale(iy*speed*dt).add(right.scale(ix*speed*dt));
   if(mag>.08){collider.moveWithCollisions(delta);player.root.rotation.y=Math.atan2(delta.x,delta.z)+Math.PI;player.phase+=dt*(sprinting?11:7);player.legL.rotation.x=Math.sin(player.phase)*.48;player.legR.rotation.x=-Math.sin(player.phase)*.48;player.armL.rotation.x=-Math.sin(player.phase)*.28;player.armR.rotation.x=Math.sin(player.phase)*.28;player.root.position.y+=Math.abs(Math.sin(player.phase*2))*(sprinting ? .055 : .025);}else{player.legL.rotation.x*=.72;player.legR.rotation.x*=.72;player.armL.rotation.x*=.72;player.armR.rotation.x*=.72;player.root.position.y=B.Scalar.Lerp(player.root.position.y,collider.position.y,.22);}
   jumpVelocity-=18*dt;collider.moveWithCollisions(new B.Vector3(0,jumpVelocity*dt,0));if(collider.position.y<=0){collider.position.y=0;jumpVelocity=0;onGround=true;}else onGround=false;
   player.root.position.copyFrom(collider.position);player.root.position.y=collider.position.y;
   // Guards investigate and pursue when visible / noisy
   for(const g of guards){if(!g.alive)continue;const dist=B.Vector3.Distance(g.root.position,player.root.position);if(dist<17&&(!stealth||dist<6)){alert=Math.min(100,alert+dt*(dist<7?28:9));const d=player.root.position.subtract(g.root.position);d.y=0;d.normalize();g.root.position.addInPlace(d.scale(dt*(dist<4?1.8:2.7)));g.root.rotation.y=Math.atan2(d.x,d.z);if(dist<1.8&&t%900<dt*1000){hp=Math.max(0,hp-7);$('hp').style.width=hp+'%';}}else{g.root.position.x+=Math.sin(t*.0003+g.phase)*dt*.25;}}
   if(!gp?.buttons[4]?.pressed&&gp)stealth=false;if(!gp?.buttons[5]?.pressed&&!gp?.buttons[7]?.pressed&&gp)sprinting=false;
   if(alert>0)alert=Math.max(0,alert-dt*(stealth?8:2.4));updateUI();updateMap();
   // Camera behind character; pitch controls elevation
   const distance=cameraDistance, elev=2.65+pitch*5.4;
   const desired=player.root.position.add(new B.Vector3(-Math.sin(yaw)*distance,elev,-Math.cos(yaw)*distance));
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