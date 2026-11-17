import trimesh, numpy as np, os, math
OUT="assets"
os.makedirs(OUT,exist_ok=True)
C={'plaster':[190,164,126,255],'stone':[132,124,108,255],'timber':[67,43,29,255],'roof':[105,49,39,255],'roof2':[73,76,74,255],'glass':[45,68,75,255],'iron':[48,53,52,255],'gold':[174,135,69,255],'leaf':[67,91,54,255],'leaf2':[88,105,57,255],'trunk':[79,53,34,255],'cloth':[62,83,101,255],'skin':[181,132,99,255],'leather':[65,43,31,255]}
def paint(m,c): m.visual.vertex_colors=np.tile(np.array(c,dtype=np.uint8),(len(m.vertices),1)); return m
def box(e,p,c):
 m=trimesh.creation.box(extents=e);m.apply_translation(p);return paint(m,C[c])
def cyl(r,h,p,c,n=12):
 m=trimesh.creation.cylinder(radius=r,height=h,sections=n);m.apply_translation(p);return paint(m,C[c])
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
p=[box((4.8,.22,3.4),(0,1.35,0),'timber'),box((4.5,.18,3.1),(0,1.65,0),'gold')]
for x in [-2,2]:
 for z in [-1.3,1.3]: p.append(cyl(.09,3.2,(x,2.95,z),'timber'))
p.append(box((5.3,.25,4.0),(0,4.6,0),'roof'))
for x in np.linspace(-2.2,2.2,6): p.append(box((.32,.26,4.05),(x,4.75,0),'gold'))
export("market_stall",p)
# Tree with trunk and clustered foliage
p=[cyl(.32,4.8,(0,2.4,0),'trunk',10)]
for pos,r,c in [((0,5,0),2.1,'leaf'),((-1.1,4.5,.3),1.5,'leaf2'),((1.15,4.7,-.2),1.55,'leaf'),((0,6.2,.2),1.55,'leaf2'),((-.3,5.6,-1),1.25,'leaf')]: p.append(sphere(r,pos,c))
export("pressburg_tree",p)
# Barrels and handcart
p=[cyl(.48,1.2,(0,.65,0),'timber',16)]
for y in [.2,.55,1.0]: p.append(cyl(.51,.07,(0,y,0),'iron',16))
export("oak_barrel",p)
p=[box((2.5,.35,1.5),(0,1,0),'timber'),box((2.3,.5,1.3),(0,1.4,0),'plaster'),box((2.8,.16,.16),(0,.7,0),'iron')]
for x in [-1.25,1.25]:
 w=trimesh.creation.torus(major_radius=.65,minor_radius=.09,major_sections=16,minor_sections=6);w.apply_transform(trimesh.transformations.rotation_matrix(math.pi/2,[0,0,1]));w.apply_translation([x,.8,0]);p.append(paint(w,C['timber']))
 p.append(cyl(.13,.3,(x,.8,0),'iron'))
for z in [-.55,.55]: p.append(box((.12,.7,.12),(0,1.8,z),'timber'))
export("wooden_cart",p)
