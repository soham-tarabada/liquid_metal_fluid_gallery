import sys, numpy as np
from PIL import Image

def read_hdr(path):
    f=open(path,'rb')
    if not f.readline().strip().startswith(b'#?'): raise ValueError('not radiance')
    while f.readline().strip()!=b'': pass
    d=f.readline().strip().split(); h,w=int(d[1]),int(d[3])
    data=np.zeros((h,w,4),dtype=np.uint8)
    for y in range(h):
        hd=f.read(4)
        if hd[0]==2 and hd[1]==2 and ((hd[2]<<8)|hd[3])==w:
            for c in range(4):
                x=0
                while x<w:
                    b=f.read(1)[0]
                    if b>128: data[y,x:x+b-128,c]=f.read(1)[0]; x+=b-128
                    else: data[y,x:x+b,c]=np.frombuffer(f.read(b),dtype=np.uint8); x+=b
        else:
            row=np.frombuffer(hd+f.read(w*4-4),dtype=np.uint8).reshape(w,4); data[y]=row
    e=data[:,:,3].astype(np.int32)
    scale=np.where(e==0,0.0,np.ldexp(1.0,e-136))
    return (data[:,:,:3].astype(np.float32)*scale[:,:,None])

HERO=[(-0.82,0.12,0.0,0.64),(0.74,-0.08,0.22,0.56),(0.06,0.58,-0.26,0.44),
      (-0.18,-0.62,0.14,0.40),(1.16,0.62,-0.30,0.31),(-1.24,-0.44,-0.18,0.28)]

SMOOTHNESS=0.68; CAM_D=4.2; FOCAL=2.2; MAX_DIST=14.0
EPS=0.0022; EDGE=0.02; STEPS=140
ENV_I=1.05; TINT=np.array([0xee,0xf1,0xf6],np.float32)/255
FRES_TINT=np.array([0x7d,0x9b,0xff],np.float32)/255
FRES_POW=4.2; LIGHT=np.array([0.55,0.78,0.62],np.float32); LIGHT_I=1.35; SPEC=190.0
IDLE_MOTION=0.24; IDLE_SPEED=0.85

def posed(time):
    t=time*IDLE_SPEED; out=[]
    for i,(bx,by,bz,r) in enumerate(HERO):
        x=bx+(np.sin(t*0.53+i*1.7)*0.6+np.sin(t*0.31+i*4.1)*0.4)*IDLE_MOTION
        y=by+(np.cos(t*0.47+i*2.3)*0.6+np.cos(t*0.29+i*5.3)*0.4)*IDLE_MOTION
        z=bz+np.sin(t*0.61+i*3.1)*0.5*IDLE_MOTION
        out.append((x,y,z,r))
    return np.array(out,np.float32)

def smin(a,b,k):
    h=np.clip(0.5+0.5*(b-a)/k,0.0,1.0)
    return b+(a-b)*h-k*h*(1.0-h)

def scene_sdf(p,balls):
    d=np.linalg.norm(p-balls[0,:3],axis=-1)-balls[0,3]
    for i in range(1,len(balls)):
        d=smin(d,np.linalg.norm(p-balls[i,:3],axis=-1)-balls[i,3],SMOOTHNESS)
    return d

def normal(p,balls):
    h=EPS*2.0*0.5773
    o=np.array([[h,-h,-h],[-h,-h,h],[-h,h,-h],[h,h,h]],np.float32)
    s=np.array([[1,-1,-1],[-1,-1,1],[-1,1,-1],[1,1,1]],np.float32)
    n=np.zeros_like(p)
    for k in range(4):
        n+=s[k]*scene_sdf(p+o[k],balls)[...,None]
    return n/np.maximum(np.linalg.norm(n,axis=-1,keepdims=True),1e-9)

def sample_env(env,d):
    H,W,_=env.shape
    u=np.arctan2(d[...,2],d[...,0])*(0.5/np.pi)+0.5
    v=np.arcsin(np.clip(d[...,1],-1,1))/np.pi+0.5
    x=u*(W-1); y=v*(H-1)
    x0=np.floor(x).astype(np.int32); y0=np.floor(y).astype(np.int32)
    x1=(x0+1)%W; y1=np.clip(y0+1,0,H-1)
    fx=(x-x0)[...,None]; fy=(y-y0)[...,None]
    x0=x0%W
    return (env[y0,x0]*(1-fx)*(1-fy)+env[y0,x1]*fx*(1-fy)+
            env[y1,x0]*(1-fx)*fy+env[y1,x1]*fx*fy)

def aces(x):
    return np.clip((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0)

def render(env,balls,W,H):
    ys,xs=np.mgrid[0:H,0:W]
    ndc_x=((xs+0.5)/W*2-1)*(W/H); ndc_y=(1-(ys+0.5)/H*2)
    rd=np.stack([ndc_x,ndc_y,np.full_like(ndc_x,-FOCAL)],axis=-1).astype(np.float32)
    rd/=np.linalg.norm(rd,axis=-1,keepdims=True)
    ro=np.array([0,0,CAM_D],np.float32)

    t=np.zeros((H,W),np.float32); nearest=np.full((H,W),1e9,np.float32)
    hit=np.zeros((H,W),bool); active=np.ones((H,W),bool)

    for _ in range(STEPS):
        if not active.any(): break
        p=ro+rd[active]*t[active][...,None]
        d=scene_sdf(p,balls)
        na=nearest[active]; nearest[active]=np.minimum(na,d)
        h=d<EPS
        idx=np.where(active)
        hit[idx[0][h],idx[1][h]]=True
        t[active]=t[active]+d
        still=(~h)&(t[active]<=MAX_DIST)
        new=np.zeros_like(active); new[idx[0][still],idx[1][still]]=True
        active=new

    out=np.zeros((H,W,4),np.float32)
    miss=~hit
    cov=1.0-np.clip((nearest[miss]-0.0)/EDGE,0,1)
    cov=cov*cov*(3-2*cov)
    out[miss,:3]=FRES_TINT*LIGHT_I; out[miss,3]=cov

    if hit.any():
        p=ro+rd[hit]*t[hit][...,None]
        n=normal(p,balls); v=-rd[hit]
        refl=rd[hit]-2*np.sum(n*rd[hit],axis=-1,keepdims=True)*n
        envc=sample_env(env,refl)*ENV_I
        ndv=np.clip(np.sum(n*v,axis=-1),0,1)
        fres=0.08+(1-0.08)*np.power(np.clip(1-ndv,0,1),FRES_POW)
        L=LIGHT/np.linalg.norm(LIGHT); hw=L+v
        hw/=np.maximum(np.linalg.norm(hw,axis=-1,keepdims=True),1e-9)
        spec=np.power(np.clip(np.sum(n*hw,axis=-1),0,1),SPEC)
        col=envc*TINT+FRES_TINT*fres[...,None]+spec[...,None]*LIGHT_I
        out[hit,:3]=col; out[hit,3]=1.0

    rgb=aces(out[...,:3])
    rgba=np.concatenate([rgb,out[...,3:4]],axis=-1)
    return np.clip(rgba,0,1).astype(np.float32)

if __name__=='__main__':
    hdr=sys.argv[1]; dst=sys.argv[2]
    W=int(sys.argv[3]); H=int(sys.argv[4]); time=float(sys.argv[5])
    env=read_hdr(hdr)
    balls=posed(time)
    from PIL import ImageFilter
    supersample=2
    big=render(env,balls,W*supersample,H*supersample)
    arr=(big*255).astype(np.uint8)
    img_full=Image.fromarray(arr,'RGBA')
    img_full=img_full.filter(ImageFilter.GaussianBlur(radius=1.1*supersample*0.5))
    img_full=img_full.resize((W,H),Image.LANCZOS)
    img=np.array(img_full)
    alpha=img[...,3].astype(np.float32)/255
    print(f"pose t={time}  coverage={100*(alpha>0.5).mean():.1f}%  mean_lum={img[...,:3].mean():.1f}")
    Image.fromarray(img,'RGBA').save(dst,'WEBP',quality=88,method=6)
