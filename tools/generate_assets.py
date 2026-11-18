import trimesh, numpy as np, os, math
OUT="assets"
os.makedirs(OUT,exist_ok=True)
C={'plaster':[190,164,126,255],'stone':[132,124,108,255],'timber':[67,43,29,255],'roof':[105,49,39,255],'roof2':[73,76,74,255],'glass':[45,68,75,255],'iron':[48,53,52,255],'gold':[174,135,69,255],'leaf':[67,91,54,255],'leaf2':[88,105,57,255],'trunk':[79,53,34,255],'cloth':[62,83,101,255],'skin':[181,132,99,255],'leather':[65,43,31,255]}
def paint(m,c): m.visual.vertex_colors=np.tile(np.array(c,dtype=np.uint8),(len(m.vertices),1)); return m
def box(e,p,c):
 m=trimesh.creation.box(extents=e);m.apply_translation(p);return paint(m,C[c])
def cyl(r,h,p,c,n=12):
 m=trimesh.creation.cylinder(radius=r,height=h,sections=n)
 m.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[1,0,0]))
 m.apply_translation(p);return paint(m,C[c])
def sphere(r,p,c):
 m=trimesh.creation.icosphere(subdivisions=2,radius=r);m.apply_translation(p);return paint(m,C[c])
def export(name,parts):
 mesh=trimesh.util.concatenate(parts)
 mesh.merge_vertices(); mesh.remove_unreferenced_vertices()
 s=trimesh.Scene(); s.add_geometry(mesh,node_name=name,geom_name=name)
 s.export(os.path.join(OUT,name+".glb"))
# Pressburg half-timber merchant house, dimensions approx 10x11x9m
p=[box((9.2,7.2,8.4),(0,3.6,0),'plaster'),box((9.55,.3,8.7),(0,.2,0),'stone')]
for z in [-4.27,4.27]:
 for x in [-4.35,-2.2,0,2.2,4.35]: p.append(box((.22,7.1,.18),(x,3.65,z),'timber'))
 for y in [1.1,3.5,5.8,7.05]: p.append(box((9.45,.2,.2),(0,y,z),'timber'))
 for x in [-2.65,2.65]:
  p += [box((1.45,1.85,.14),(x,4.55,z),'timber'),box((1.08,1.48,.07),(x,4.55,z+(.09 if z>0 else -.09)),'glass')]
  for dx in [-.58,.58]: p.append(box((.25,1.65,.16),(x+dx,4.55,z),'timber'))
  p.append(box((1.6,.18,.24),(x,3.55,z),'stone'))
p += [box((1.65,2.8,.25),(0,1.55,-4.38),'timber'),box((1.25,2.45,.08),(0,1.4,-4.53),'leather'),box((1.95,.22,.28),(0,3.02,-4.42),'stone')]
for side in [-1,1]:
 m=box((10.1,.32,5.25),(0,8.35,side*2.25),'roof')
 m.apply_transform(trimesh.transformations.rotation_matrix(side*math.radians(32),[1,0,0],point=[0,8.35,side*2.25]));p.append(m)
p.append(box((10.25,.35,.42),(0,9.65,0),'timber'))
for x in [-3.5,3.5]: p += [box((.9,2.2,.9),(x,9.9,1.6),'stone'),box((1.1,.22,1.1),(x,11.05,1.6),'timber')]
export("pressburg_house",p)
# Market stall with timber legs and canvas roof
p=[box((4.8,.22,3.4),(0,.92,0),'timber'),box((4.5,.18,3.1),(0,1.08,0),'gold')]
for x in [-2,2]:
 for z in [-1.3,1.3]: p.append(cyl(.09,4.6,(x,2.3,z),'timber'))
p.append(box((5.3,.25,4.0),(0,4.6,0),'roof'))
for x in np.linspace(-2.2,2.2,6): p.append(box((.32,.26,4.05),(x,4.75,0),'gold'))
export("market_stall",p)
# Tree with trunk and clustered foliage
p=[cyl(.32,4.8,(0,2.4,0),'trunk',10)]
for pos,r,c in [((0,5,0),2.1,'leaf'),((-1.1,4.5,.3),1.5,'leaf2'),((1.15,4.7,-.2),1.55,'leaf'),((0,6.2,.2),1.55,'leaf2'),((-.3,5.6,-1),1.25,'leaf')]: p.append(sphere(r,pos,c))
export("pressburg_tree",p)
# Barrels and handcart
p=[cyl(.34,.88,(0,.47,0),'timber',24)]
for y in [.18,.47,.76]: p.append(cyl(.355,.035,(0,y,0),'iron',24))
for a in np.linspace(0,2*math.pi,20,endpoint=False):
 x,z=.342*math.cos(a),.342*math.sin(a)
 stave=box((.045,.84,.028),(x,.47,z),'timber')
 stave.apply_transform(trimesh.transformations.rotation_matrix(a,[0,1,0],point=[x,.47,z]))
 p.append(stave)
export("oak_barrel",p)
p=[box((2.5,.35,1.5),(0,1,0),'timber'),box((2.3,.5,1.3),(0,1.4,0),'plaster'),box((2.8,.16,.16),(0,.7,0),'iron')]
for x in [-1.25,1.25]:
 w=trimesh.creation.torus(major_radius=.65,minor_radius=.09,major_sections=16,minor_sections=6);w.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,1,0]));w.apply_translation([x,.8,0]);p.append(paint(w,C['timber']))
 p.append(cyl(.13,.3,(x,.8,0),'iron'))
for z in [-.55,.55]: p.append(box((.12,.7,.12),(0,1.8,z),'timber'))
export("wooden_cart",p)


# Landmark and street-prop pack for the 1567 Pressburg district.
# All models are authored in metres, Y-up, with vertex-colour materials.
def arch_block(parts, x, y, z, sx, sy, sz, colour='stone', angle=0):
    m=box((sx,sy,sz),(x,y,z),colour)
    if angle:
        m.apply_transform(trimesh.transformations.rotation_matrix(angle,[0,0,1],point=[x,y,z]))
    parts.append(m)

# Michalska Gate: open passage, twin defensive towers, crenellations and roof.
p=[]
p += [box((3.2,8.2,4.8),(-4.1,4.1,0),'stone'),box((3.2,8.2,4.8),(4.1,4.1,0),'stone'),
      box((5.2,1.0,4.8),(0,8.0,0),'timber'),box((12.0,.65,6.2),(0,8.8,0),'roof2')]
for x in [-4.1,4.1]:
    p += [box((3.8,.45,5.2),(x,8.45,0),'gold')]
    for z in [-1.7,0,1.7]:
        p.append(box((.72,.8,.72),(x,9.45,z),'stone'))
    p.append(box((3.6,.25,5.0),(x,10.0,0),'roof2'))
p += [box((1.2,6.6,.35),(0,3.3,-2.42),'timber'),
      box((1.0,5.8,.18),(0,3.2,-2.62),'leather')]
for y in [1.2,2.2,3.2,4.2,5.2]:
    p.append(box((1.0,.09,.10),(0,y,-2.74),'gold'))
export("michalska_gate",p)

# St Martin's inspired medieval church silhouette with nave, transept and bell tower.
p=[box((13,8,20),(0,4,0),'stone'),box((14,.35,21),(0,.3,0),'timber')]
for z in [-10.2,10.2]:
    p.append(box((14,.3,.35),(0,7.8,z),'timber'))
for side in [-1,1]:
    roofm=box((14,.38,11),(0,8.2,side*4.5),'roof2')
    roofm.apply_transform(trimesh.transformations.rotation_matrix(side*math.radians(34),[1,0,0],point=[0,8.2,side*4.5]))
    p.append(roofm)
# Bell tower
p += [box((5,16,5),(-3,8, -6),'stone'),box((5.5,.4,5.5),(-3,16.2,-6),'timber'),
      box((6,.5,6),(-3,16.6,-6),'roof2')]
for x in [-5,-1]:
    p.append(box((.5,2,.35),(x,13,-3.42),'glass'))
# Buttresses and stained-glass windows
for z in [-7,0,7]:
    for x in [-6.65,6.65]:
        p.append(box((.65,5,.9),(x,3.1,z),'stone'))
for x in [-4,0,4]:
    p += [box((1.0,2.3,.18),(x,4.7,-10.15),'glass'),
          box((1.2,.18,.25),(x,3.45,-10.25),'gold')]
export("st_martin_church",p)

# Merchant tavern with projecting sign and chimney.
p=[box((10,7,9),(0,3.5,0),'plaster'),box((10.5,.3,9.5),(0,.2,0),'stone')]
for z in [-4.55,4.55]:
    for x in [-4.7,-2.3,0,2.3,4.7]:
        p.append(box((.22,7,.22),(x,3.6,z),'timber'))
    for y in [1,3.5,6.8]: p.append(box((10,.22,.24),(0,y,z),'timber'))
for side in [-1,1]:
    m=box((11,.38,5.8),(0,7.2,side*2.5),'roof')
    m.apply_transform(trimesh.transformations.rotation_matrix(side*math.radians(32),[1,0,0],point=[0,7.2,side*2.5]));p.append(m)
p += [box((2.2,1.4,.28),(0,5.0,-4.75),'timber'),
      box((1.8,.95,.12),(0,5.0,-4.93),'gold'),
      box((1.1,2.2,1.1),(3.8,8.6,1.7),'stone'),
      box((1.4,.25,1.4),(3.8,9.75,1.7),'roof2')]
export("pressburg_tavern",p)

# Public stone well with timber canopy and hanging pulley.
p=[]
for i in range(12):
    a=2*math.pi*i/12
    x,z=1.15*math.cos(a),1.15*math.sin(a)
    b=box((.62,.72,.58),(x,.38,z),'stone')
    b.apply_transform(trimesh.transformations.rotation_matrix(-a,[0,1,0],point=[x,.38,z]));p.append(b)
for x in [-1.45,1.45]:
    p.append(box((.18,3.6,.18),(x,2.0,0),'timber'))
p += [box((3.5,.18,2.8),(0,3.85,0),'timber'),
      box((3.8,.22,3.0),(0,4.05,0),'roof'),
      cyl(.06,2.4,(0,2.7,0),'iron',10)]
export("town_well",p)

# Defensive wall segment with walkway, parapet and merlons.
p=[box((4.0,3.8,.9),(0,1.9,0),'stone'),
   box((4.2,.25,1.25),(0,3.95,0),'timber'),
   box((4.2,.25,.22),(0,4.25,-.48),'stone')]
for x in [-1.6,-.8,0,.8,1.6]:
    p.append(box((.48,.8,.95),(x,4.45,0),'stone'))
export("city_wall_segment",p)

# Individually modelled cobble tile, with bevelled irregular stone blocks.
p=[]
for row in range(5):
    for col in range(5):
        x=-1.6+col*.8+(row%2)*.18
        z=-1.6+row*.8
        stone_m=trimesh.creation.box(extents=(.68,.10,.62))
        stone_m.apply_translation((x,.02+((row*7+col*3)%3)*.006,z))
        stone_m=paint(stone_m,C[['stone','plaster','roof2'][((row*3+col*5)%3)]])
        p.append(stone_m)
export("cobble_tile",p)
